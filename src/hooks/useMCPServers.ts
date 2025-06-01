
import { useState, useEffect } from 'react';
import { mcpRegistrationService } from '../services/mcpRegistrationService';

interface MCPServerConfig {
  id: string;
  name: string;
  endpoint: string;
  capabilities: Array<{
    name: string;
    description?: string;
    parameters?: Record<string, any>;
  }>;
  isExternal: boolean;
  package?: string;
  version?: string;
  configData?: Record<string, string>;
  status: 'connected' | 'disconnected' | 'error';
}

export const useMCPServers = () => {
  const [servers, setServers] = useState<MCPServerConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load servers on mount
  useEffect(() => {
    refreshServers();
  }, []);

  const refreshServers = () => {
    try {
      const currentServers = mcpRegistrationService.getServers();
      setServers(currentServers);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load servers');
    }
  };

  const registerServer = async (config: Omit<MCPServerConfig, 'status'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const success = await mcpRegistrationService.registerExternalServer(config);
      if (success) {
        refreshServers();
        return true;
      } else {
        setError('Failed to register server');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const unregisterServer = (serverId: string) => {
    try {
      const success = mcpRegistrationService.unregisterServer(serverId);
      if (success) {
        refreshServers();
        return true;
      } else {
        setError('Failed to unregister server');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unregistration failed');
      return false;
    }
  };

  const getServersByCapability = (capabilityName: string) => {
    return mcpRegistrationService.getServersByCapability(capabilityName);
  };

  const getAvailableCapabilities = () => {
    return mcpRegistrationService.getAvailableCapabilities();
  };

  const routeCapabilityRequest = async (
    capabilityName: string, 
    payload: any, 
    preferredServerId?: string
  ) => {
    try {
      return await mcpRegistrationService.routeCapabilityRequest(
        capabilityName, 
        payload, 
        preferredServerId
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request routing failed');
      throw err;
    }
  };

  const updateServerStatus = async (serverId: string) => {
    await mcpRegistrationService.updateServerStatus(serverId);
    refreshServers();
  };

  const exportConfiguration = () => {
    return mcpRegistrationService.exportConfiguration();
  };

  const importConfiguration = async (config: any) => {
    setLoading(true);
    try {
      const success = await mcpRegistrationService.importConfiguration(config);
      if (success) {
        refreshServers();
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    servers,
    loading,
    error,
    refreshServers,
    registerServer,
    unregisterServer,
    getServersByCapability,
    getAvailableCapabilities,
    routeCapabilityRequest,
    updateServerStatus,
    exportConfiguration,
    importConfiguration
  };
};
