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
  AlertTriangle,
  ExternalLink,
  Calendar,
  Users,
  BarChart3,
  Target
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  estimatedHours: number;
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  startDate?: string;
  endDate?: string;
  dependencies?: string[];
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
  projectId: string; // Unique identifier for external integration
  title: string;
  description: string;
  status: 'idea' | 'planning' | 'active' | 'completed' | 'paused';
  category: string;
  tasks: Task[];
  billOfMaterials: BOMItem[];
  estimatedBudget: number;
  startDate?: string;
  endDate?: string;
  targetDate?: string;
  assignedTeam?: string[];
  progressPercentage: number;
  createdDate: string;
  lastUpdated: string;
  lastSyncDate?: string;
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
    loadExistingProjects();
  }, []);

  const generateProjectId = (): string => {
    return `PM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const calculateProgress = (tasks: Task[]): number => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  const loadExistingProjects = async () => {
    // Mock existing projects with enhanced metadata
    const mockProjects: Project[] = [
      {
        id: '1',
        projectId: generateProjectId(),
        title: 'Smart Home Automation',
        description: 'Automate lighting and temperature control',
        status: 'active',
        category: 'Technology',
        startDate: '2024-05-15',
        endDate: '2024-07-15',
        targetDate: '2024-06-30',
        assignedTeam: ['john.doe@email.com', 'jane.smith@email.com'],
        progressPercentage: 0,
        tasks: [
          {
            id: '1-1',
            title: 'Research smart switches',
            description: 'Compare different smart switch brands and compatibility',
            status: 'completed',
            estimatedHours: 4,
            priority: 'medium',
            assignee: 'john.doe@email.com',
            startDate: '2024-05-15',
            endDate: '2024-05-17'
          },
          {
            id: '1-2',
            title: 'Install smart thermostat',
            description: 'Replace existing thermostat with smart model',
            status: 'in-progress',
            estimatedHours: 6,
            priority: 'high',
            assignee: 'jane.smith@email.com',
            startDate: '2024-05-20',
            dependencies: ['1-1']
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
        lastUpdated: '2024-06-01',
        lastSyncDate: '2024-06-01'
      }
    ];
    
    // Calculate progress for each project
    const projectsWithProgress = mockProjects.map(project => ({
      ...project,
      progressPercentage: calculateProgress(project.tasks)
    }));
    
    setProjects(projectsWithProgress);
  };

  const analyzeIdea = async () => {
    if (!newIdea.trim()) return;

    setAnalyzing(true);
    
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
    const words = description.split(' ').slice(0, 6);
    return words.join(' ') + (description.split(' ').length > 6 ? '...' : '');
  };

  const determineCategory = (description: string): string => {
    const techKeywords = ['app', 'software', 'code', 'automation', 'smart'];
    const homeKeywords = ['home', 'garden', 'diy', 'repair', 'build'];
    
    const lowerDesc = description.toLowerCase();
    if (techKeywords.some(keyword => lowerDesc.includes(keyword))) return 'Technology';
    if (homeKeywords.some(keyword => lowerDesc.includes(keyword))) return 'Home & Garden';
    return 'General';
  };

  const findMatchingProjects = (description: string): string[] => {
    return projects
      .filter(project => 
        project.title.toLowerCase().includes(description.toLowerCase().split(' ')[0]) ||
        project.category === determineCategory(description)
      )
      .map(project => project.id);
  };

  const generateTasks = (description: string): Task[] => {
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
        priority: 'medium',
        dependencies: [`task-${Date.now()}-1`]
      },
      {
        id: `task-${Date.now()}-3`,
        title: 'Testing and Refinement',
        description: 'Test functionality and make improvements',
        status: 'pending',
        estimatedHours: 12,
        priority: 'medium',
        dependencies: [`task-${Date.now()}-2`]
      }
    ];
  };

  const generateBOM = (description: string): BOMItem[] => {
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
      projectId: generateProjectId(),
      title: idea.title,
      description: idea.description,
      status: 'planning',
      category: idea.category,
      tasks: idea.generatedTasks,
      billOfMaterials: idea.generatedBOM,
      estimatedBudget: idea.aiAnalysis.estimatedCost,
      progressPercentage: 0,
      createdDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    setProjects(prev => [newProject, ...prev]);
    setIdeas(prev => prev.filter(i => i.id !== idea.id));
  };

  const handleOpenInProjectManager = (projectId: string) => {
    console.log(`Opening project ${projectId} in full Project Manager`);
    // Future: window.open(`/project-manager/project/${projectId}`, '_blank');
  };

  const handleSyncWithExternalPM = (projectId: string) => {
    console.log(`Syncing project ${projectId} with external PM tools`);
    // Future: API call to sync with Google Tasks, MS Planner, etc.
  };

  const handleExportProject = (project: Project) => {
    const exportData = {
      ...project,
      exportDate: new Date().toISOString(),
      format: 'AutoBlog-PM-v1.0'
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `project-${project.projectId}.json`;
    link.click();
    URL.revokeObjectURL(url);
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

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-gray-300';
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

      {/* Integration Placeholder */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-sm">
            <ExternalLink className="h-4 w-4" />
            <span>Project Management Integration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" disabled>
              <Users className="h-4 w-4 mr-2" />
              Connect Google Tasks
            </Button>
            <Button variant="outline" size="sm" disabled>
              <BarChart3 className="h-4 w-4 mr-2" />
              MS Planner Integration
            </Button>
            <Button variant="outline" size="sm" disabled>
              <Target className="h-4 w-4 mr-2" />
              Open Full PM App
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Future integration with comprehensive project management tools
          </p>
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
                      <Badge variant="outline">ID: {project.projectId}</Badge>
                      {project.targetDate && (
                        <Badge variant="outline" className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Due: {new Date(project.targetDate).toLocaleDateString()}</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Button size="sm" variant="outline" onClick={() => handleOpenInProjectManager(project.projectId)}>
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Open in PM
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleExportProject(project)}>
                      Export
                    </Button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>{project.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.progressPercentage)}`}
                      style={{ width: `${project.progressPercentage}%` }}
                    ></div>
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
                          <div className="flex items-center space-x-2">
                            {task.assignee && (
                              <Badge variant="outline" className="text-xs">
                                {task.assignee.split('@')[0]}
                              </Badge>
                            )}
                            <Badge 
                              variant={task.status === 'completed' ? 'default' : 'outline'}
                              className="text-xs capitalize"
                            >
                              {task.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {project.tasks.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{project.tasks.length - 3} more tasks
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Timeline & Team */}
                  <div>
                    <h4 className="font-medium mb-2">Timeline & Team</h4>
                    <div className="space-y-1 text-sm">
                      {project.startDate && (
                        <div className="flex items-center justify-between">
                          <span>Start:</span>
                          <span className="text-gray-600">{new Date(project.startDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {project.endDate && (
                        <div className="flex items-center justify-between">
                          <span>End:</span>
                          <span className="text-gray-600">{new Date(project.endDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {project.assignedTeam && project.assignedTeam.length > 0 && (
                        <div className="flex items-center justify-between">
                          <span>Team:</span>
                          <span className="text-gray-600">{project.assignedTeam.length} members</span>
                        </div>
                      )}
                      {project.lastSyncDate && (
                        <div className="flex items-center justify-between">
                          <span>Last Sync:</span>
                          <span className="text-gray-600">{new Date(project.lastSyncDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Integration Actions */}
                <div className="flex items-center space-x-2 pt-2 border-t">
                  <Button size="sm" variant="ghost" onClick={() => handleSyncWithExternalPM(project.projectId)}>
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Sync
                  </Button>
                  <Button size="sm" variant="ghost" disabled>
                    <Users className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                  <Button size="sm" variant="ghost" disabled>
                    <Target className="h-4 w-4 mr-1" />
                    Roadmap
                  </Button>
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
