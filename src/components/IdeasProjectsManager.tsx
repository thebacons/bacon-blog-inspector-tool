
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  Lightbulb, 
  FolderOpen, 
  CheckSquare, 
  ShoppingCart, 
  Plus,
  Search,
  Clock,
  DollarSign,
  AlertTriangle
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  estimatedHours: number;
  priority: 'low' | 'medium' | 'high';
}

interface BOMItem {
  id: string;
  name: string;
  quantity: number;
  estimatedCost: number;
  category: 'material' | 'tool' | 'component' | 'service';
  source?: string;
  urgent?: boolean;
}

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'idea' | 'planning' | 'active' | 'completed' | 'paused';
  category: string;
  tasks: Task[];
  billOfMaterials: BOMItem[];
  estimatedBudget: number;
  createdDate: string;
  lastUpdated: string;
}

interface Idea {
  id: string;
  title: string;
  description: string;
  category: string;
  matchedProjects: string[];
  generatedTasks: Task[];
  generatedBOM: BOMItem[];
  aiAnalysis: {
    feasibility: 'low' | 'medium' | 'high';
    complexity: 'simple' | 'moderate' | 'complex';
    estimatedCost: number;
    timeframe: string;
    requiredSkills: string[];
    recommendations: string[];
  };
  createdDate: string;
}

const IdeasProjectsManager = () => {
  const [newIdea, setNewIdea] = useState('');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Load existing projects - this would integrate with your backend
    loadExistingProjects();
  }, []);

  const loadExistingProjects = async () => {
    // Mock existing projects
    const mockProjects: Project[] = [
      {
        id: '1',
        title: 'Smart Home Automation',
        description: 'Automate lighting and temperature control',
        status: 'active',
        category: 'Technology',
        tasks: [
          {
            id: '1-1',
            title: 'Research smart switches',
            description: 'Compare different smart switch brands and compatibility',
            status: 'completed',
            estimatedHours: 4,
            priority: 'medium'
          },
          {
            id: '1-2',
            title: 'Install smart thermostat',
            description: 'Replace existing thermostat with smart model',
            status: 'in-progress',
            estimatedHours: 6,
            priority: 'high'
          }
        ],
        billOfMaterials: [
          {
            id: 'bom-1',
            name: 'Smart Thermostat',
            quantity: 1,
            estimatedCost: 250,
            category: 'component',
            source: 'Amazon'
          },
          {
            id: 'bom-2',
            name: 'Smart Light Switches',
            quantity: 8,
            estimatedCost: 35,
            category: 'component',
            source: 'Home Depot'
          }
        ],
        estimatedBudget: 530,
        createdDate: '2024-05-15',
        lastUpdated: '2024-06-01'
      }
    ];
    setProjects(mockProjects);
  };

  const analyzeIdea = async () => {
    if (!newIdea.trim()) return;

    setAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const analyzedIdea: Idea = {
        id: Date.now().toString(),
        title: extractIdeaTitle(newIdea),
        description: newIdea,
        category: determineCategory(newIdea),
        matchedProjects: findMatchingProjects(newIdea),
        generatedTasks: generateTasks(newIdea),
        generatedBOM: generateBOM(newIdea),
        aiAnalysis: {
          feasibility: 'high',
          complexity: 'moderate',
          estimatedCost: 150,
          timeframe: '2-3 weeks',
          requiredSkills: ['Basic electronics', 'Programming'],
          recommendations: [
            'Start with a simple prototype',
            'Research existing solutions first',
            'Consider modular approach for easier testing'
          ]
        },
        createdDate: new Date().toISOString()
      };

      setIdeas(prev => [analyzedIdea, ...prev]);
      setNewIdea('');
      setAnalyzing(false);
    }, 2000);
  };

  const extractIdeaTitle = (description: string): string => {
    // Simple title extraction - in real implementation, this would use AI
    const words = description.split(' ').slice(0, 6);
    return words.join(' ') + (description.split(' ').length > 6 ? '...' : '');
  };

  const determineCategory = (description: string): string => {
    // Simple categorization - in real implementation, this would use AI
    const techKeywords = ['app', 'software', 'code', 'automation', 'smart'];
    const homeKeywords = ['home', 'garden', 'diy', 'repair', 'build'];
    
    const lowerDesc = description.toLowerCase();
    if (techKeywords.some(keyword => lowerDesc.includes(keyword))) return 'Technology';
    if (homeKeywords.some(keyword => lowerDesc.includes(keyword))) return 'Home & Garden';
    return 'General';
  };

  const findMatchingProjects = (description: string): string[] => {
    // Find projects that might be related to this idea
    return projects
      .filter(project => 
        project.title.toLowerCase().includes(description.toLowerCase().split(' ')[0]) ||
        project.category === determineCategory(description)
      )
      .map(project => project.id);
  };

  const generateTasks = (description: string): Task[] => {
    // Mock task generation - in real implementation, this would use AI
    return [
      {
        id: `task-${Date.now()}-1`,
        title: 'Research and Planning',
        description: 'Gather requirements and research existing solutions',
        status: 'pending',
        estimatedHours: 8,
        priority: 'high'
      },
      {
        id: `task-${Date.now()}-2`,
        title: 'Prototype Development',
        description: 'Create a basic working prototype',
        status: 'pending',
        estimatedHours: 16,
        priority: 'medium'
      },
      {
        id: `task-${Date.now()}-3`,
        title: 'Testing and Refinement',
        description: 'Test functionality and make improvements',
        status: 'pending',
        estimatedHours: 12,
        priority: 'medium'
      }
    ];
  };

  const generateBOM = (description: string): BOMItem[] => {
    // Mock BOM generation - in real implementation, this would use AI
    return [
      {
        id: `bom-${Date.now()}-1`,
        name: 'Development Board',
        quantity: 1,
        estimatedCost: 25,
        category: 'component',
        source: 'Amazon'
      },
      {
        id: `bom-${Date.now()}-2`,
        name: 'Sensors Kit',
        quantity: 1,
        estimatedCost: 35,
        category: 'component',
        source: 'Adafruit'
      },
      {
        id: `bom-${Date.now()}-3`,
        name: 'Jumper Wires',
        quantity: 1,
        estimatedCost: 8,
        category: 'material',
        source: 'Local Electronics Store'
      }
    ];
  };

  const promoteIdeaToProject = (idea: Idea) => {
    const newProject: Project = {
      id: Date.now().toString(),
      title: idea.title,
      description: idea.description,
      status: 'planning',
      category: idea.category,
      tasks: idea.generatedTasks,
      billOfMaterials: idea.generatedBOM,
      estimatedBudget: idea.aiAnalysis.estimatedCost,
      createdDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    setProjects(prev => [newProject, ...prev]);
    setIdeas(prev => prev.filter(i => i.id !== idea.id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': case 'active': return 'bg-blue-500';
      case 'planning': return 'bg-yellow-500';
      case 'paused': return 'bg-gray-500';
      default: return 'bg-purple-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const filteredIdeas = ideas.filter(idea => 
    idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    idea.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProjects = projects.filter(project => 
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Idea Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <span>New Idea Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Describe your idea... (e.g., 'Create a smart garden watering system using sensors and automation')"
              value={newIdea}
              onChange={(e) => setNewIdea(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <Button 
            onClick={analyzeIdea}
            disabled={analyzing || !newIdea.trim()}
            className="w-full"
          >
            {analyzing ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Analyzing Idea...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Lightbulb className="h-4 w-4" />
                <span>Analyze Idea</span>
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search ideas and projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Ideas Section */}
      {filteredIdeas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5" />
                <span>Recent Ideas</span>
                <Badge variant="secondary">{filteredIdeas.length}</Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredIdeas.map((idea) => (
                <div key={idea.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{idea.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{idea.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline">{idea.category}</Badge>
                        <Badge variant={idea.aiAnalysis.feasibility === 'high' ? 'default' : 'secondary'}>
                          {idea.aiAnalysis.feasibility} feasibility
                        </Badge>
                        <Badge variant="outline">${idea.aiAnalysis.estimatedCost}</Badge>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => promoteIdeaToProject(idea)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Create Project
                    </Button>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Generated Tasks */}
                    <div>
                      <h4 className="font-medium mb-2 flex items-center space-x-1">
                        <CheckSquare className="h-4 w-4" />
                        <span>Suggested Tasks ({idea.generatedTasks.length})</span>
                      </h4>
                      <div className="space-y-2">
                        {idea.generatedTasks.slice(0, 3).map((task) => (
                          <div key={task.id} className="text-sm p-2 bg-gray-50 rounded">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{task.title}</span>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span className="text-xs">{task.estimatedHours}h</span>
                                <AlertTriangle className={`h-3 w-3 ${getPriorityColor(task.priority)}`} />
                              </div>
                            </div>
                            <p className="text-gray-600 mt-1">{task.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bill of Materials */}
                    <div>
                      <h4 className="font-medium mb-2 flex items-center space-x-1">
                        <ShoppingCart className="h-4 w-4" />
                        <span>Bill of Materials ({idea.generatedBOM.length})</span>
                      </h4>
                      <div className="space-y-2">
                        {idea.generatedBOM.slice(0, 3).map((item) => (
                          <div key={item.id} className="text-sm p-2 bg-gray-50 rounded">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{item.name}</span>
                              <div className="flex items-center space-x-1">
                                <span className="text-xs">x{item.quantity}</span>
                                <DollarSign className="h-3 w-3" />
                                <span className="text-xs">${item.estimatedCost}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <Badge variant="outline" className="text-xs capitalize">
                                {item.category}
                              </Badge>
                              {item.source && (
                                <span className="text-xs text-gray-500">{item.source}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* AI Recommendations */}
                  <div>
                    <h4 className="font-medium mb-2">AI Recommendations</h4>
                    <div className="text-sm space-y-1">
                      {idea.aiAnalysis.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start space-x-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span className="text-gray-600">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projects Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FolderOpen className="h-5 w-5" />
            <span>Active Projects</span>
            <Badge variant="secondary">{filteredProjects.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredProjects.map((project) => (
              <div key={project.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{project.title}</h3>
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(project.status)}`}></div>
                      <Badge variant="outline" className="capitalize">{project.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline">{project.category}</Badge>
                      <Badge variant="outline">${project.estimatedBudget} budget</Badge>
                      <span className="text-xs text-gray-500">
                        Updated {new Date(project.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tasks Progress */}
                  <div>
                    <h4 className="font-medium mb-2">Tasks Progress</h4>
                    <div className="space-y-1">
                      {project.tasks.slice(0, 3).map((task) => (
                        <div key={task.id} className="flex items-center justify-between text-sm">
                          <span className={task.status === 'completed' ? 'line-through text-gray-500' : ''}>
                            {task.title}
                          </span>
                          <Badge 
                            variant={task.status === 'completed' ? 'default' : 'outline'}
                            className="text-xs capitalize"
                          >
                            {task.status}
                          </Badge>
                        </div>
                      ))}
                      {project.tasks.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{project.tasks.length - 3} more tasks
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Materials Overview */}
                  <div>
                    <h4 className="font-medium mb-2">Materials Overview</h4>
                    <div className="space-y-1">
                      {project.billOfMaterials.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span>{item.name}</span>
                          <span className="text-gray-500">${item.estimatedCost * item.quantity}</span>
                        </div>
                      ))}
                      {project.billOfMaterials.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{project.billOfMaterials.length - 3} more items
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredProjects.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No projects found. Start by analyzing an idea above!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IdeasProjectsManager;
