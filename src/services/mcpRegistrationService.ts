
interface MCPCapability {
  name: string;
  description?: string;
  parameters?: Record<string, any>;
}

interface MCPServerConfig {
  id: string;
  name: string;
  endpoint: string;
  capabilities: MCPCapability[];
  isExternal: boolean;
  package?: string;
  version?: string;
  configData?: Record<string, string>;
  status: 'connected' | 'disconnected' | 'error';
}

class MCPRegistrationService {
  private servers: Map<string, MCPServerConfig> = new Map();
  private capabilities: Map<string, string[]> = new Map(); // capability -> server IDs

  /**
   * Register an external MCP server
   */
  async registerExternalServer(config: Omit<MCPServerConfig, 'status'>): Promise<boolean> {
    try {
      // Test connection to the server
      const isConnected = await this.testServerConnection(config.endpoint);
      
      const serverConfig: MCPServerConfig = {
        ...config,
        status: isConnected ? 'connected' : 'error'
      };

      this.servers.set(config.id, serverConfig);

      // Register capabilities
      config.capabilities.forEach(cap => {
        const existingServers = this.capabilities.get(cap.name) || [];
        this.capabilities.set(cap.name, [...existingServers, config.id]);
      });

      console.log(`External MCP server registered: ${config.name} (${config.id})`);
      return true;
    } catch (error) {
      console.error(`Failed to register MCP server ${config.name}:`, error);
      return false;
    }
  }

  /**
   * Unregister an MCP server
   */
  unregisterServer(serverId: string): boolean {
    const server = this.servers.get(serverId);
    if (!server) return false;

    // Remove capabilities
    server.capabilities.forEach(cap => {
      const serverIds = this.capabilities.get(cap.name) || [];
      const updated = serverIds.filter(id => id !== serverId);
      if (updated.length === 0) {
        this.capabilities.delete(cap.name);
      } else {
        this.capabilities.set(cap.name, updated);
      }
    });

    this.servers.delete(serverId);
    console.log(`MCP server unregistered: ${serverId}`);
    return true;
  }

  /**
   * Get all registered servers
   */
  getServers(): MCPServerConfig[] {
    return Array.from(this.servers.values());
  }

  /**
   * Get servers by capability
   */
  getServersByCapability(capabilityName: string): MCPServerConfig[] {
    const serverIds = this.capabilities.get(capabilityName) || [];
    return serverIds
      .map(id => this.servers.get(id))
      .filter((server): server is MCPServerConfig => server !== undefined);
  }

  /**
   * Get server by ID
   */
  getServer(serverId: string): MCPServerConfig | undefined {
    return this.servers.get(serverId);
  }

  /**
   * Test connection to an MCP server
   */
  private async testServerConnection(endpoint: string): Promise<boolean> {
    try {
      const response = await fetch(`${endpoint}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      return response.ok;
    } catch (error) {
      console.warn(`Connection test failed for ${endpoint}:`, error);
      return false;
    }
  }

  /**
   * Update server status
   */
  async updateServerStatus(serverId: string): Promise<void> {
    const server = this.servers.get(serverId);
    if (!server) return;

    const isConnected = await this.testServerConnection(server.endpoint);
    server.status = isConnected ? 'connected' : 'error';
  }

  /**
   * Get all available capabilities
   */
  getAvailableCapabilities(): string[] {
    return Array.from(this.capabilities.keys());
  }

  /**
   * Route a capability request to the appropriate server
   */
  async routeCapabilityRequest(
    capabilityName: string, 
    payload: any, 
    preferredServerId?: string
  ): Promise<any> {
    let targetServer: MCPServerConfig | undefined;

    if (preferredServerId) {
      targetServer = this.servers.get(preferredServerId);
    }

    if (!targetServer) {
      const availableServers = this.getServersByCapability(capabilityName);
      const connectedServers = availableServers.filter(s => s.status === 'connected');
      
      if (connectedServers.length === 0) {
        throw new Error(`No connected servers available for capability: ${capabilityName}`);
      }

      // Use the first available connected server
      targetServer = connectedServers[0];
    }

    if (!targetServer || targetServer.status !== 'connected') {
      throw new Error(`Server not available for capability: ${capabilityName}`);
    }

    // Make the request to the external server
    try {
      const response = await fetch(`${targetServer.endpoint}/capability/${capabilityName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-MCP-Server-ID': targetServer.id,
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error routing to server ${targetServer.id}:`, error);
      // Mark server as having an error
      targetServer.status = 'error';
      throw error;
    }
  }

  /**
   * Validate MCP server configuration
   */
  validateServerConfig(config: Partial<MCPServerConfig>): string[] {
    const errors: string[] = [];

    if (!config.id) errors.push('Server ID is required');
    if (!config.name) errors.push('Server name is required');
    if (!config.endpoint) errors.push('Server endpoint is required');
    if (!config.capabilities || config.capabilities.length === 0) {
      errors.push('At least one capability must be specified');
    }

    // Validate endpoint URL
    if (config.endpoint) {
      try {
        new URL(config.endpoint);
      } catch {
        errors.push('Invalid endpoint URL format');
      }
    }

    return errors;
  }

  /**
   * Export configuration for backup/sharing
   */
  exportConfiguration(): any {
    return {
      servers: Array.from(this.servers.entries()).map(([id, config]) => ({
        id,
        ...config,
        configData: undefined // Don't export sensitive config data
      })),
      capabilities: Array.from(this.capabilities.entries()),
      exportDate: new Date().toISOString()
    };
  }

  /**
   * Import configuration from backup
   */
  async importConfiguration(config: any): Promise<boolean> {
    try {
      if (config.servers) {
        for (const serverConfig of config.servers) {
          if (this.validateServerConfig(serverConfig).length === 0) {
            await this.registerExternalServer(serverConfig);
          }
        }
      }
      return true;
    } catch (error) {
      console.error('Failed to import configuration:', error);
      return false;
    }
  }
}

// Singleton instance
export const mcpRegistrationService = new MCPRegistrationService();
export default mcpRegistrationService;
