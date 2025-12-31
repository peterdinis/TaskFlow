import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Inbox, Calendar, Briefcase, User, ChevronLeft, Hash, 
  Settings, Star, Archive, Trash2, Plus, Bell, Clock, AlertTriangle,
  RotateCcw, Delete, FolderArchive, Search, Calendar as CalendarIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Project, Task } from '@/types/task';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface DashboardSidebarProps {
  projects: Project[];
  activeProject: string;
  onSelectProject: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onOpenNotifications: () => void;
  notificationCount?: number;
  archivedTasks?: Task[];
  deletedTasks?: Task[];
  onRestoreTask?: (taskId: string) => void;
  onUnarchiveTask?: (taskId: string) => void;
  onPermanentlyDelete?: (taskId: string) => void;
  onToggleFavorite?: (taskId: string, isFavorite: boolean) => void;
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void;
  tasks?: Task[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Inbox,
  Calendar,
  Briefcase,
  User,
};

const quickLinks = [
  { id: 'favorites', name: 'Favorites', icon: Star, color: 'hsl(45, 90%, 50%)' },
  { id: 'archive', name: 'Archive', icon: Archive, color: 'hsl(210, 40%, 50%)' },
  { id: 'trash', name: 'Trash', icon: Trash2, color: 'hsl(0, 60%, 50%)' },
];

export function DashboardSidebar({
  projects,
  activeProject,
  onSelectProject,
  isOpen,
  onToggle,
  onOpenNotifications,
  notificationCount = 2,
  archivedTasks = [],
  deletedTasks = [],
  onRestoreTask,
  onUnarchiveTask,
  onPermanentlyDelete,
  onToggleFavorite,
  onUpdateTask,
  tasks = [],
}: DashboardSidebarProps) {
  const [showTrashDialog, setShowTrashDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showFavoritesDialog, setShowFavoritesDialog] = useState(false);
  const [archiveSearch, setArchiveSearch] = useState('');
  const [archiveFilter, setArchiveFilter] = useState<'all' | 'completed' | 'incomplete'>('all');
  const [favoritesSearch, setFavoritesSearch] = useState('');
  const [favoritesFilter, setFavoritesFilter] = useState<'all' | 'completed' | 'incomplete'>('all');
  
  const mainProjects = projects.filter((p) => p.id === 'inbox' || p.id === 'today');
  const userProjects = projects.filter((p) => p.id !== 'inbox' && p.id !== 'today');
  
  const favoriteTasks = tasks.filter(task => task.isFavorite);
  
  const filteredFavoriteTasks = favoriteTasks.filter(task => {
    const matchesSearch = !favoritesSearch || 
      task.title.toLowerCase().includes(favoritesSearch.toLowerCase()) ||
      task.description?.toLowerCase().includes(favoritesSearch.toLowerCase());
    
    const matchesStatus = 
      favoritesFilter === 'all' ||
      (favoritesFilter === 'completed' && task.completed) ||
      (favoritesFilter === 'incomplete' && !task.completed);
    
    return matchesSearch && matchesStatus;
  });

  const handleTrashClick = () => {
    setShowTrashDialog(true);
  };

  const handleArchiveClick = () => {
    setShowArchiveDialog(true);
  };

  const handleFavoritesClick = () => {
    setShowFavoritesDialog(true);
  };

  const getDaysAgo = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getExpirationStatus = (deletedAt: Date) => {
    const now = new Date();
    const daysInTrash = Math.floor((now.getTime() - deletedAt.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysInTrash >= 28) {
      return { label: 'Expires soon', color: 'bg-destructive/20 text-destructive' };
    } else if (daysInTrash >= 21) {
      return { label: 'Expires in 1 week', color: 'bg-warning/20 text-warning' };
    }
    return { label: 'Safe', color: 'bg-muted text-muted-foreground' };
  };

  const filteredArchivedTasks = archivedTasks.filter(task => {
    const matchesSearch = !archiveSearch || 
      task.title.toLowerCase().includes(archiveSearch.toLowerCase()) ||
      task.description?.toLowerCase().includes(archiveSearch.toLowerCase());
    
    const matchesStatus = 
      archiveFilter === 'all' ||
      (archiveFilter === 'completed' && task.completed) ||
      (archiveFilter === 'incomplete' && !task.completed);
    
    return matchesSearch && matchesStatus;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive/20 text-destructive';
      case 'medium': return 'bg-warning/20 text-warning';
      case 'low': return 'bg-primary/20 text-primary';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleToggleFavorite = (taskId: string, currentStatus: boolean) => {
    if (onToggleFavorite) {
      onToggleFavorite(taskId, !currentStatus);
    } else if (onUpdateTask) {
      onUpdateTask(taskId, { isFavorite: !currentStatus });
    }
  };

  const handleToggleTaskCompletion = (taskId: string, currentStatus: boolean) => {
    if (onUpdateTask) {
      onUpdateTask(taskId, { 
        completed: !currentStatus,
        completedAt: !currentStatus ? new Date() : undefined
      });
    }
  };

  return (
    <>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-foreground/10 backdrop-blur-sm z-30 lg:hidden"
          onClick={onToggle}
        />
      )}

      <motion.aside
        initial={false}
        animate={{
          width: isOpen ? 260 : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        className={cn(
          'fixed lg:relative h-screen bg-sidebar border-r border-sidebar-border z-40 overflow-hidden',
          'flex flex-col shadow-lg'
        )}
        style={{
          height: '100vh',
          maxHeight: '100vh',
        }}
      >
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-semibold text-sm">T</span>
            </div>
            <span className="font-semibold text-sidebar-foreground">TaskFlow</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggle}
            className="p-1.5 rounded-md text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-sidebar-accent scrollbar-track-transparent">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onOpenNotifications}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all"
          >
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-primary" />
              <span>Notifications</span>
            </div>
            {notificationCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium min-w-[20px] text-center">
                {notificationCount}
              </span>
            )}
          </motion.button>

          <div className="h-px bg-sidebar-border my-2" />

          {mainProjects.map((project, index) => {
            const Icon = iconMap[project.icon] || Hash;
            return (
              <motion.button
                key={project.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onSelectProject(project.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all',
                  activeProject === project.id
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="truncate">{project.name}</span>
              </motion.button>
            );
          })}

          <div className="pt-4 pb-2">
            <div className="flex items-center justify-between px-3">
              <p className="text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider">
                Projects
              </p>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1 rounded text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              >
                <Plus className="w-3 h-3" />
              </motion.button>
            </div>
          </div>

          {userProjects.map((project, index) => (
            <motion.button
              key={project.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (mainProjects.length + index) * 0.05 }}
              onClick={() => onSelectProject(project.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all',
                activeProject === project.id
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: project.color }}
              />
              <span className="truncate">{project.name}</span>
            </motion.button>
          ))}

          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider">
              Quick Links
            </p>
          </div>

          {quickLinks.map((link, index) => (
            <motion.button
              key={link.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (mainProjects.length + userProjects.length + index) * 0.05 }}
              onClick={link.id === 'trash' ? handleTrashClick : 
                       link.id === 'archive' ? handleArchiveClick : 
                       link.id === 'favorites' ? handleFavoritesClick : undefined}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                link.id === 'trash'
                  ? "text-sidebar-foreground/80 hover:bg-destructive/10 hover:text-destructive"
                  : link.id === 'archive'
                  ? "text-sidebar-foreground/80 hover:bg-primary/10 hover:text-primary"
                  : link.id === 'favorites'
                  ? "text-sidebar-foreground/80 hover:bg-warning/10 hover:text-warning"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <link.icon className="w-4 h-4" style={{ color: link.color }} />
              <div className="flex items-center justify-between flex-1">
                <span className="truncate">{link.name}</span>
                {(link.id === 'trash' && deletedTasks.length > 0) && (
                  <Badge variant="destructive" className="ml-2 h-5 min-w-5 px-1 text-xs">
                    {deletedTasks.length}
                  </Badge>
                )}
                {(link.id === 'archive' && archivedTasks.length > 0) && (
                  <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1 text-xs">
                    {archivedTasks.length}
                  </Badge>
                )}
                {(link.id === 'favorites' && favoriteTasks.length > 0) && (
                  <Badge 
                    variant="outline" 
                    className="ml-2 h-5 min-w-5 px-1 text-xs bg-warning/20 text-warning-foreground border-warning"
                  >
                    {favoriteTasks.length}
                  </Badge>
                )}
              </div>
            </motion.button>
          ))}
        </nav>

        <div className="p-3 border-t border-sidebar-border flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </motion.button>
        </div>
      </motion.aside>

      <Dialog open={showFavoritesDialog} onOpenChange={setShowFavoritesDialog}>
        <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-warning fill-warning" />
              Favorite Tasks
              {favoriteTasks.length > 0 && (
                <Badge 
                  variant="outline" 
                  className="ml-2 bg-warning/20 text-warning-foreground border-warning"
                >
                  {favoriteTasks.length} items
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Your favorite tasks are pinned here for quick access.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="mb-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search favorite tasks..."
                  value={favoritesSearch}
                  onChange={(e) => setFavoritesSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Tabs 
                  value={favoritesFilter} 
                  onValueChange={(value) => setFavoritesFilter(value as any)}
                  className="w-full max-w-xs"
                >
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                    <TabsTrigger value="incomplete">Active</TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <div className="text-sm text-muted-foreground">
                  {filteredFavoriteTasks.length} of {favoriteTasks.length} favorites
                </div>
              </div>
            </div>

            {filteredFavoriteTasks.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                <div className="w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center mb-4">
                  <Star className="w-10 h-10 text-warning" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {favoriteTasks.length === 0 ? 'No favorite tasks yet' : 'No favorites found'}
                </h3>
                <p className="text-muted-foreground text-sm max-w-sm">
                  {favoriteTasks.length === 0 
                    ? 'Click the star icon on any task to add it to your favorites'
                    : 'Try adjusting your search or filters'}
                </p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto pr-2">
                  <div className="space-y-3">
                    {filteredFavoriteTasks.map((task) => {
                      const createdDate = task.createdAt ? new Date(task.createdAt) : new Date();
                      
                      return (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={cn(
                            "bg-card border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors",
                            task.completed && "opacity-75"
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <button
                                  onClick={() => handleToggleFavorite(task.id, task.isFavorite)}
                                  className="p-1 hover:bg-warning/10 rounded transition-colors"
                                  title="Remove from favorites"
                                >
                                  <Star className="w-4 h-4 text-warning fill-warning" />
                                </button>
                                
                                <h4 className={cn(
                                  "font-medium text-foreground line-clamp-1 flex-1",
                                  task.completed && "line-through text-muted-foreground"
                                )}>
                                  {task.title}
                                </h4>
                                
                                <div className="flex items-center gap-1">
                                  {task.completed && (
                                    <Badge variant="outline" className="text-xs bg-green-500/20 text-green-600">
                                      Completed
                                    </Badge>
                                  )}
                                  {task.priority && task.priority !== 'none' && (
                                    <Badge 
                                      variant="outline" 
                                      className={cn("text-xs", getPriorityColor(task.priority))}
                                    >
                                      {task.priority}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              {task.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3 ml-7">
                                  {task.description}
                                </p>
                              )}
                              
                              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground ml-7">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Created {getDaysAgo(createdDate)}
                                </div>
                                
                                {task.projectId && projects.find(p => p.id === task.projectId) && (
                                  <div className="flex items-center gap-1">
                                    <div 
                                      className="w-2 h-2 rounded-full"
                                      style={{ 
                                        backgroundColor: projects.find(p => p.id === task.projectId)?.color 
                                      }}
                                    />
                                    <span>
                                      {projects.find(p => p.id === task.projectId)?.name}
                                    </span>
                                  </div>
                                )}
                                
                                {task.dueDate && (
                                  <div className="flex items-center gap-1">
                                    <CalendarIcon className="w-3 h-3" />
                                    <span>
                                      Due {format(new Date(task.dueDate), 'MMM d, yyyy')}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <div className="flex items-center gap-2">
                                <Label htmlFor={`complete-${task.id}`} className="text-xs text-muted-foreground">
                                  Complete
                                </Label>
                                <Switch
                                  id={`complete-${task.id}`}
                                  checked={task.completed}
                                  onCheckedChange={() => handleToggleTaskCompletion(task.id, task.completed)}
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Star className="w-4 h-4 mt-0.5 flex-shrink-0 text-warning" />
                    <p>
                      <span className="font-medium">Tip:</span> Favorites are great for keeping 
                      important tasks at your fingertips. You can remove a task from favorites 
                      by clicking the star icon.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderArchive className="w-5 h-5 text-primary" />
              Archive
              {archivedTasks.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {archivedTasks.length} items
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Archived tasks are hidden from your main view but can be restored anytime.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="mb-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search archived tasks..."
                  value={archiveSearch}
                  onChange={(e) => setArchiveSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Tabs 
                  value={archiveFilter} 
                  onValueChange={(value) => setArchiveFilter(value as any)}
                  className="w-full max-w-xs"
                >
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                    <TabsTrigger value="incomplete">Active</TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <div className="text-sm text-muted-foreground">
                  {filteredArchivedTasks.length} of {archivedTasks.length} tasks
                </div>
              </div>
            </div>

            {filteredArchivedTasks.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <Archive className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {archivedTasks.length === 0 ? 'Archive is empty' : 'No tasks found'}
                </h3>
                <p className="text-muted-foreground text-sm max-w-sm">
                  {archivedTasks.length === 0 
                    ? 'Archive tasks to keep them organized without cluttering your main view'
                    : 'Try adjusting your search or filters'}
                </p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto pr-2">
                  <div className="space-y-3">
                    {filteredArchivedTasks.map((task) => {
                      const archivedDate = task.archivedAt ? new Date(task.archivedAt) : new Date();
                      
                      return (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={cn(
                            "bg-card border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors",
                            task.completed && "opacity-75"
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className={cn(
                                  "font-medium text-foreground line-clamp-1",
                                  task.completed && "line-through text-muted-foreground"
                                )}>
                                  {task.title}
                                </h4>
                                
                                <div className="flex items-center gap-1">
                                  {task.completed && (
                                    <Badge variant="outline" className="text-xs bg-green-500/20 text-green-600">
                                      Completed
                                    </Badge>
                                  )}
                                  {task.priority && task.priority !== 'none' && (
                                    <Badge 
                                      variant="outline" 
                                      className={cn("text-xs", getPriorityColor(task.priority))}
                                    >
                                      {task.priority}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              {task.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                  {task.description}
                                </p>
                              )}
                              
                              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Archived {getDaysAgo(archivedDate)}
                                </div>
                                
                                {task.projectId && projects.find(p => p.id === task.projectId) && (
                                  <div className="flex items-center gap-1">
                                    <div 
                                      className="w-2 h-2 rounded-full"
                                      style={{ 
                                        backgroundColor: projects.find(p => p.id === task.projectId)?.color 
                                      }}
                                    />
                                    <span>
                                      {projects.find(p => p.id === task.projectId)?.name}
                                    </span>
                                  </div>
                                )}
                                
                                {task.dueDate && (
                                  <div className="flex items-center gap-1">
                                    <CalendarIcon className="w-3 h-3" />
                                    <span>
                                      Due {format(new Date(task.dueDate), 'MMM d, yyyy')}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onUnarchiveTask?.(task.id)}
                                className="h-8"
                                title="Unarchive"
                              >
                                <Archive className="w-4 h-4 mr-1" />
                                Restore
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Archive className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>
                      <span className="font-medium">Note:</span> Archived tasks are hidden from your 
                      main view but remain accessible here. You can restore them anytime.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showTrashDialog} onOpenChange={setShowTrashDialog}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              Trash Bin
              {deletedTasks.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {deletedTasks.length} items
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Deleted items are kept for 30 days before being permanently removed.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col">
            {deletedTasks.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <Trash2 className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Trash is empty</h3>
                <p className="text-muted-foreground text-sm">
                  Items you delete will appear here
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {deletedTasks.length} item{deletedTasks.length !== 1 ? 's' : ''} in trash
                  </div>
                  {deletedTasks.length > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm('Permanently delete all items? This action cannot be undone.')) {
                          deletedTasks.forEach(task => onPermanentlyDelete?.(task.id));
                        }
                      }}
                    >
                      <Delete className="w-4 h-4 mr-2" />
                      Empty Trash
                    </Button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto pr-2">
                  <div className="space-y-3">
                    {deletedTasks.map((task) => {
                      const deletedDate = task.deletedAt ? new Date(task.deletedAt) : new Date();
                      const expirationStatus = getExpirationStatus(deletedDate);
                      
                      return (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-card border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-foreground line-clamp-1">
                                  {task.title}
                                </h4>
                                {task.projectId && projects.find(p => p.id === task.projectId) && (
                                  <Badge variant="outline" className="text-xs">
                                    {projects.find(p => p.id === task.projectId)?.name}
                                  </Badge>
                                )}
                              </div>
                              
                              {task.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                  {task.description}
                                </p>
                              )}
                              
                              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Deleted {getDaysAgo(deletedDate)}
                                </div>
                                
                                <div className="flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  <Badge variant="outline" className={cn("text-xs", expirationStatus.color)}>
                                    {expirationStatus.label}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onRestoreTask?.(task.id)}
                                className="h-8 w-8 p-0"
                                title="Restore"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  if (confirm('Permanently delete this task? This action cannot be undone.')) {
                                    onPermanentlyDelete?.(task.id);
                                  }
                                }}
                                className="h-8 w-8 p-0"
                                title="Delete permanently"
                              >
                                <Delete className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>
                      <span className="font-medium">Note:</span> Items in trash will be 
                      automatically deleted after 30 days. Restore items to keep them.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}