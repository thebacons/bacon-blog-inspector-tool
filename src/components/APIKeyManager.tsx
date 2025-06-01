
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Key, 
  Eye, 
  EyeOff, 
  Save, 
  Check, 
  AlertCircle, 
  ExternalLink,
  Trash2,
  Plus
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface APIKeyConfig {
  id: string;
  provider: string;
  displayName: string;
  keyName: string;
  value: string;
  isActive: boolean;
  isValid?: boolean;
  lastValidated?: string;
  documentationUrl?: string;
}

const SUPPORTED_PROVIDERS = [
  {
    id: 'google',
    name: 'Google (Gemini)',
    keyName: 'GOOGLE_API_KEY',
    documentationUrl: 'https://aistudio.google.com/app/apikey',
    description: 'Google Gemini AI models',
    currentlySupported: true
  },
  {
    id: 'openai',
    name: 'OpenAI',
    keyName: 'OPENAI_API_KEY',
    documentationUrl: 'https://platform.openai.com/api-keys',
    description: 'GPT-4, GPT-3.5, and other OpenAI models',
    currentlySupported: false
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    keyName: 'ANTHROPIC_API_KEY',
    documentationUrl: 'https://console.anthropic.com/',
    description: 'Claude 3 and other Anthropic models',
    currentlySupported: false
  },
  {
    id: 'grok',
    name: 'Grok (X.AI)',
    keyName: 'GROK_API_KEY',
    documentationUrl: 'https://docs.x.ai/',
    description: 'Grok AI models by X.AI',
    currentlySupported: false
  },
  {
    id: 'meta',
    name: 'Meta (Llama)',
    keyName: 'META_API_KEY',
    documentationUrl: 'https://developers.facebook.com/docs/llama-api/',
    description: 'Llama models by Meta',
    currentlySupported: false
  },
  {
    id: 'ollama',
    name: 'Ollama',
    keyName: 'OLLAMA_ENDPOINT',
    documentationUrl: 'https://ollama.ai/docs',
    description: 'Local Ollama server endpoint',
    currentlySupported: false
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    keyName: 'HUGGINGFACE_API_KEY',
    documentationUrl: 'https://huggingface.co/settings/tokens',
    description: 'Hugging Face Inference API',
    currentlySupported: false
  }
];

const APIKeyManager = () => {
  const [apiKeys, setApiKeys] = useState<APIKeyConfig[]>([]);
  const [showKeys, setShowKeys] = useState<{[key: string]: boolean}>({});
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [newKeyValue, setNewKeyValue] = useState('');
  const { toast } = useToast();

  // Load API keys from localStorage on mount
  useEffect(() => {
    const storedKeys = localStorage.getItem('api_keys');
    if (storedKeys) {
      try {
        const parsed = JSON.parse(storedKeys);
        setApiKeys(parsed);
      } catch (error) {
        console.error('Failed to parse stored API keys:', error);
      }
    } else {
      // Initialize with Google key if it exists in environment
      const googleKey = import.meta.env.VITE_GOOGLE_API_KEY;
      if (googleKey) {
        const initialKeys: APIKeyConfig[] = [{
          id: 'google',
          provider: 'google',
          displayName: 'Google (Gemini)',
          keyName: 'GOOGLE_API_KEY',
          value: googleKey,
          isActive: true,
          isValid: true
        }];
        setApiKeys(initialKeys);
        localStorage.setItem('api_keys', JSON.stringify(initialKeys));
      }
    }
  }, []);

  const saveAPIKeys = (keys: APIKeyConfig[]) => {
    localStorage.setItem('api_keys', JSON.stringify(keys));
    setApiKeys(keys);
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const updateAPIKey = (keyId: string, value: string) => {
    const updatedKeys = apiKeys.map(key => 
      key.id === keyId 
        ? { ...key, value, lastValidated: new Date().toISOString() }
        : key
    );
    saveAPIKeys(updatedKeys);
    setEditingKey(null);
    setNewKeyValue('');
    
    toast({
      title: "API Key Updated",
      description: `${apiKeys.find(k => k.id === keyId)?.displayName} API key has been saved.`,
    });
  };

  const addAPIKey = (providerId: string) => {
    const provider = SUPPORTED_PROVIDERS.find(p => p.id === providerId);
    if (!provider) return;

    const newKey: APIKeyConfig = {
      id: providerId,
      provider: providerId,
      displayName: provider.name,
      keyName: provider.keyName,
      value: '',
      isActive: false,
      isValid: false
    };

    const updatedKeys = [...apiKeys, newKey];
    saveAPIKeys(updatedKeys);
    setEditingKey(providerId);
  };

  const removeAPIKey = (keyId: string) => {
    const updatedKeys = apiKeys.filter(key => key.id !== keyId);
    saveAPIKeys(updatedKeys);
    
    toast({
      title: "API Key Removed",
      description: `API key has been deleted.`,
    });
  };

  const toggleKeyActive = (keyId: string) => {
    const updatedKeys = apiKeys.map(key => 
      key.id === keyId ? { ...key, isActive: !key.isActive } : key
    );
    saveAPIKeys(updatedKeys);
  };

  const getProviderStatus = (providerId: string) => {
    const provider = SUPPORTED_PROVIDERS.find(p => p.id === providerId);
    const hasKey = apiKeys.some(k => k.provider === providerId && k.value);
    
    if (provider?.currentlySupported) {
      return hasKey ? 'configured' : 'available';
    }
    return 'coming-soon';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>API Key Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="current" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="current">Current Keys</TabsTrigger>
              <TabsTrigger value="providers">Available Providers</TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="space-y-4">
              {apiKeys.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No API keys configured yet.</p>
                  <p className="text-sm">Add your first API key to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {apiKeys.map((key) => (
                    <Card key={key.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div>
                              <h3 className="font-semibold">{key.displayName}</h3>
                              <p className="text-sm text-gray-600">{key.keyName}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getProviderStatus(key.provider) === 'configured' && (
                              <Badge variant="default" className="text-green-600">
                                <Check className="h-3 w-3 mr-1" />
                                Configured
                              </Badge>
                            )}
                            <Switch
                              checked={key.isActive}
                              onCheckedChange={() => toggleKeyActive(key.id)}
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          {editingKey === key.id ? (
                            <div className="flex space-x-2">
                              <Input
                                type="password"
                                placeholder="Enter API key"
                                value={newKeyValue}
                                onChange={(e) => setNewKeyValue(e.target.value)}
                                className="flex-1"
                              />
                              <Button 
                                onClick={() => updateAPIKey(key.id, newKeyValue)}
                                disabled={!newKeyValue.trim()}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  setEditingKey(null);
                                  setNewKeyValue('');
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <Input
                                type={showKeys[key.id] ? "text" : "password"}
                                value={key.value}
                                readOnly
                                className="flex-1"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleKeyVisibility(key.id)}
                              >
                                {showKeys[key.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingKey(key.id);
                                  setNewKeyValue(key.value);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeAPIKey(key.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="providers" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SUPPORTED_PROVIDERS.map((provider) => {
                  const status = getProviderStatus(provider.id);
                  const hasKey = apiKeys.some(k => k.provider === provider.id);
                  
                  return (
                    <Card key={provider.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{provider.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{provider.description}</p>
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            {status === 'configured' && (
                              <Badge variant="default">Configured</Badge>
                            )}
                            {status === 'available' && (
                              <Badge variant="outline">Available</Badge>
                            )}
                            {status === 'coming-soon' && (
                              <Badge variant="secondary">Coming Soon</Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(provider.documentationUrl, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Get Key
                          </Button>
                          
                          {provider.currentlySupported && !hasKey && (
                            <Button
                              size="sm"
                              onClick={() => addAPIKey(provider.id)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add Key
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Future Provider Notice */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-blue-500" />
            <span>Future Provider Support</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Support for OpenAI, Anthropic, Grok, Meta, Ollama, and Hugging Face providers will be added in upcoming releases. 
            You can already add your API keys in preparation for these integrations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default APIKeyManager;
