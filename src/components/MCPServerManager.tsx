
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Server, 
  Settings, 
  Download, 
  CheckCircle, 
  Circle, 
  ExternalLink,
  Star,
  Shield,
  Zap,
  Database,
  Globe,
  FileText,
  Calendar,
  Image,
  MessageSquare,
  BarChart3,
  Users
} from 'lucide-react';

interface MCPServer {
  id: string;
  name: string;
  package: string;
  description: string;
  category: 'content' | 'data' | 'media' | 'productivity' | 'communication' | 'analytics';
  capabilities: string[];
  version: string;
  author: string;
  rating: number;
  downloads: number;
  isOfficial: boolean;
  isEnabled: boolean;
  requiresAuth: boolean;
  configFields?: Array<{
    name: string;
    type: 'text' | 'password' | 'url' | 'select';
    required: boolean;
    options?: string[];
  }>;
  documentation?: string;
  repository?: string;
}

const AVAILABLE_SERVERS: MCPServer[] = [
  {
    id: 'obsidian',
    name: 'Obsidian',
    package: '@modelcontextprotocol/server-obsidian',
    description: 'Connect to Obsidian vaults for note-taking and knowledge management',
    category: 'content',
    capabilities: ['note-management', 'knowledge-graph', 'markdown-processing'],
    version: '1.0.0',
    author: 'Anthropic',
    rating: 4.8,
    downloads: 15420,
    isOfficial: true,
    isEnabled: false,
    requiresAuth: true,
    configFields: [
      { name: 'vaultPath', type: 'text', required: true },
      { name: 'apiKey', type: 'password', required: true }
    ],
    documentation: 'https://docs.anthropic.com/mcp/servers/obsidian',
    repository: 'https://github.com/anthropics/mcp-obsidian'
  },
  {
    id: 'notion',
    name: 'Notion',
    package: '@modelcontextprotocol/server-notion',
    description: 'Integrate with Notion for content management and database operations',
    category: 'content',
    capabilities: ['database-access', 'page-creation', 'content-sync'],
    version: '1.2.1',
    author: 'Anthropic',
    rating: 4.7,
    downloads: 12850,
    isOfficial: true,
    isEnabled: false,
    requiresAuth: true,
    configFields: [
      { name: 'notionToken', type: 'password', required: true },
      { name: 'databaseId', type: 'text', required: false }
    ]
  },
  {
    id: 'github',
    name: 'GitHub',
    package: '@modelcontextprotocol/server-github',
    description: 'Access GitHub repositories, issues, and code examples',
    category: 'data',
    capabilities: ['repo-access', 'issue-management', 'code-search'],
    version: '1.1.5',
    author: 'Anthropic',
    rating: 4.9,
    downloads: 23100,
    isOfficial: true,
    isEnabled: false,
    requiresAuth: true,
    configFields: [
      { name: 'githubToken', type: 'password', required: true },
      { name: 'defaultRepo', type: 'text', required: false }
    ]
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    package: '@modelcontextprotocol/server-google-drive',
    description: 'Access and manage files in Google Drive',
    category: 'data',
    capabilities: ['file-access', 'document-sync', 'collaboration'],
    version: '1.0.8',
    author: 'Anthropic',
    rating: 4.6,
    downloads: 9820,
    isOfficial: true,
    isEnabled: false,
    requiresAuth: true,
    configFields: [
      { name: 'clientId', type: 'text', required: true },
      { name: 'clientSecret', type: 'password', required: true }
    ]
  },
  {
    id: 'puppeteer',
    name: 'Puppeteer',
    package: '@modelcontextprotocol/server-puppeteer',
    description: 'Web scraping and screenshot capabilities',
    category: 'media',
    capabilities: ['web-scraping', 'screenshot', 'pdf-generation'],
    version: '2.0.3',
    author: 'Anthropic',
    rating: 4.5,
    downloads: 7650,
    isOfficial: true,
    isEnabled: false,
    requiresAuth: false
  },
  {
    id: 'youtube',
    name: 'YouTube',
    package: 'mcp-server-youtube',
    description: 'YouTube content integration and video analysis',
    category: 'media',
    capabilities: ['video-search', 'transcript-access', 'channel-info'],
    version: '0.8.2',
    author: 'Community',
    rating: 4.3,
    downloads: 5420,
    isOfficial: false,
    isEnabled: false,
    requiresAuth: true,
    configFields: [
      { name: 'youtubeApiKey', type: 'password', required: true }
    ]
  },
  {
    id: 'slack',
    name: 'Slack',
    package: '@modelcontextprotocol/server-slack',
    description: 'Team communication and channel management',
    category: 'communication',
    capabilities: ['message-sending', 'channel-access', 'user-management'],
    version: '1.1.0',
    author: 'Anthropic',
    rating: 4.7,
    downloads: 11200,
    isOfficial: true,
    isEnabled: false,
    requiresAuth: true,
    configFields: [
      { name: 'slackToken', type: 'password', required: true },
      { name: 'defaultChannel', type: 'text', required: false }
    ]
  },
  {
    id: 'todoist',
    name: 'Todoist',
    package: 'mcp-server-todoist',
    description: 'Task management and project organization',
    category: 'productivity',
    capabilities: ['task-creation', 'project-sync', 'deadline-tracking'],
    version: '0.9.1',
    author: 'Community',
    rating: 4.4,
    downloads: 3850,
    isOfficial: false,
    isEnabled: false,
    requiresAuth: true,
    configFields: [
      { name: 'todoistToken', type: 'password', required: true }
    ]
  }
];

const CATEGORY_ICONS = {
  content: FileText,
  data: Database,
  media: Image,
  productivity: Calendar,
  communication: MessageSquare,
  analytics: BarChart3
};

const MCPServerManager = () => {
  const [servers, setServers] = useState<MCPServer[]>(AVAILABLE_SERVERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [configuring, setConfiguring] = useState<string | null>(null);

  const filteredServers = servers.filter(server => {
    const matchesSearch = server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         server.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         server.capabilities.some(cap => cap.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || server.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const enabledServers = servers.filter(server => server.isEnabled);
  const categories = ['all', ...Array.from(new Set(servers.map(s => s.category)))];

  const toggleServer = (serverId: string) => {
    const server = servers.find(s => s.id === serverId);
    if (server?.requiresAuth && !server.isEnabled) {
      setConfiguring(serverId);
    } else {
      setServers(prev => prev.map(s => 
        s.id === serverId ? { ...s, isEnabled: !s.isEnabled } : s
      ));
    }
  };

  const handleServerConfig = (serverId: string, config: Record<string, string>) => {
    setServers(prev => prev.map(s => 
      s.id === serverId ? { ...s, isEnabled: true } : s
    ));
    setConfiguring(null);
    
    // Here you would typically save the config and register the server
    console.log(`Configuring server ${serverId} with:`, config);
  };

  const getCategoryIcon = (category: string) => {
    const IconComponent = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS];
    return IconComponent ? <IconComponent className="h-4 w-4" /> : <Server className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Server className="h-5 w-5" />
            <span>MCP Server Manager</span>
            <Badge variant="secondary">{enabledServers.length} active</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="marketplace" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
              <TabsTrigger value="enabled">Enabled ({enabledServers.length})</TabsTrigger>
              <TabsTrigger value="custom">Custom Servers</TabsTrigger>
            </TabsList>

            <TabsContent value="marketplace" className="space-y-4">
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search MCP servers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="capitalize"
                    >
                      {category !== 'all' && getCategoryIcon(category)}
                      <span className={category !== 'all' ? 'ml-1' : ''}>{category}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Server Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredServers.map((server) => (
                  <ServerCard 
                    key={server.id} 
                    server={server} 
                    onToggle={toggleServer}
                    onConfigure={setConfiguring}
                  />
                ))}
              </div>

              {filteredServers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Server className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No servers found matching your criteria.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="enabled" className="space-y-4">
              <div className="space-y-4">
                {enabledServers.map((server) => (
                  <EnabledServerCard 
                    key={server.id} 
                    server={server} 
                    onToggle={toggleServer}
                  />
                ))}
                
                {enabledServers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Server className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No servers enabled yet. Browse the marketplace to get started!</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <CustomServerSection />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Configuration Modal */}
      {configuring && (
        <ServerConfigModal
          server={servers.find(s => s.id === configuring)!}
          onSave={handleServerConfig}
          onCancel={() => setConfiguring(null)}
        />
      )}
    </div>
  );
};

// Server Card Component
const ServerCard: React.FC<{
  server: MCPServer;
  onToggle: (id: string) => void;
  onConfigure: (id: string) => void;
}> = ({ server, onToggle, onConfigure }) => {
  const CategoryIcon = CATEGORY_ICONS[server.category];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <CategoryIcon className="h-4 w-4" />
            <div>
              <h3 className="font-semibold text-sm">{server.name}</h3>
              <p className="text-xs text-gray-500">{server.package}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {server.isOfficial && (
              <Badge variant="default" className="text-xs">Official</Badge>
            )}
            <Switch
              checked={server.isEnabled}
              onCheckedChange={() => onToggle(server.id)}
              size="sm"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <p className="text-sm text-gray-600 line-clamp-2">{server.description}</p>
        
        <div className="flex flex-wrap gap-1">
          {server.capabilities.slice(0, 3).map(cap => (
            <Badge key={cap} variant="outline" className="text-xs">
              {cap}
            </Badge>
          ))}
          {server.capabilities.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{server.capabilities.length - 3} more
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{server.rating}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Download className="h-3 w-3" />
              <span>{server.downloads.toLocaleString()}</span>
            </div>
          </div>
          <span>v{server.version}</span>
        </div>

        {server.requiresAuth && !server.isEnabled && (
          <div className="flex items-center space-x-1 text-xs text-amber-600">
            <Shield className="h-3 w-3" />
            <span>Requires configuration</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Enabled Server Card Component
const EnabledServerCard: React.FC<{
  server: MCPServer;
  onToggle: (id: string) => void;
}> = ({ server, onToggle }) => {
  const CategoryIcon = CATEGORY_ICONS[server.category];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CategoryIcon className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold">{server.name}</h3>
              <p className="text-sm text-gray-600">{server.capabilities.join(', ')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-green-600">Active</Badge>
            <Button size="sm" variant="outline">
              <Settings className="h-4 w-4" />
            </Button>
            <Switch
              checked={server.isEnabled}
              onCheckedChange={() => onToggle(server.id)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Custom Server Section Component
const CustomServerSection: React.FC = () => {
  const [customUrl, setCustomUrl] = useState('');

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Custom MCP Server</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Server Endpoint URL</label>
            <Input
              placeholder="https://your-server.com/mcp"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
            />
          </div>
          <Button disabled={!customUrl}>
            <Zap className="h-4 w-4 mr-2" />
            Connect Server
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Development Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• Custom servers must implement the MCP protocol specification</p>
            <p>• Ensure your server exposes capabilities via the standard MCP interface</p>
            <p>• Test connectivity before adding to production workflows</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Server Config Modal Component
const ServerConfigModal: React.FC<{
  server: MCPServer;
  onSave: (serverId: string, config: Record<string, string>) => void;
  onCancel: () => void;
}> = ({ server, onSave, onCancel }) => {
  const [config, setConfig] = useState<Record<string, string>>({});

  const handleSave = () => {
    onSave(server.id, config);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>Configure {server.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {server.configFields?.map(field => (
            <div key={field.name} className="space-y-2">
              <label className="text-sm font-medium capitalize">
                {field.name.replace(/([A-Z])/g, ' $1').toLowerCase()}
                {field.required && <span className="text-red-500">*</span>}
              </label>
              <Input
                type={field.type === 'password' ? 'password' : 'text'}
                placeholder={`Enter ${field.name}`}
                value={config[field.name] || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, [field.name]: e.target.value }))}
              />
            </div>
          ))}
          
          <div className="flex space-x-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              Enable Server
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MCPServerManager;
