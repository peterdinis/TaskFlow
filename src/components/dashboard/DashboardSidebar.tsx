import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Inbox, Calendar, Briefcase, User, ChevronLeft, Hash, 
  Settings, Star, Archive, Trash2, Plus, Bell, Clock, AlertTriangle,
  RotateCcw, Delete, FolderArchive, Search, Calendar as CalendarIcon,
  LogIn, User as UserIcon, LogOut, Palette, Bell as BellIcon,
  Moon, Sun, Shield, HelpCircle, ExternalLink
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    isDemo?: boolean;
  };
  onLogin?: () => void;
  onLogout?: () => void;
  onThemeChange?: (theme: 'light' | 'dark' | 'system') => void;
  currentTheme?: 'light' | 'dark' | 'system';
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

const themeOptions = [
  { id: 'light', name: 'Light', icon: Sun, description: 'Use light theme' },
  { id: 'dark', name: 'Dark', icon: Moon, description: 'Use dark theme' },
  { id: 'system', name: 'System', icon: Settings, description: 'Follow system settings' },
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
  user,
  onLogin,
  onLogout,
  onThemeChange,
  currentTheme = 'system',
}: DashboardSidebarProps) {
  const [showTrashDialog, setShowTrashDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showFavoritesDialog, setShowFavoritesDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
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

  const handleSettingsClick = () => {
    if (!user) {
      setShowLoginDialog(true);
    } else {
      setShowSettingsDialog(true);
    }
  };

  const handleDemoLogin = () => {
    if (onLogin) {
      onLogin();
    }
    setShowLoginDialog(false);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    setShowSettingsDialog(false);
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
          {/* User Profile Section */}
          {user ? (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-lg bg-sidebar-accent/30 border border-sidebar-border"
            >
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-10 w-10 border-2 border-sidebar-border">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sidebar-foreground truncate">{user.name}</p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">{user.email}</p>
                </div>
              </div>
              {user.isDemo && (
                <div className="flex items-center gap-2 px-2 py-1 bg-warning/10 rounded text-xs text-warning">
                  <Shield className="w-3 h-3" />
                  <span>Demo Account</span>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setShowLoginDialog(true)}
              className="w-full mb-4 p-3 rounded-lg bg-sidebar-accent/30 border border-sidebar-border hover:bg-sidebar-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-sidebar-foreground">Guest User</p>
                  <p className="text-xs text-sidebar-foreground/60">Sign in to save your data</p>
                </div>
                <LogIn className="w-4 h-4 text-sidebar-foreground/60" />
              </div>
            </motion.button>
          )}

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
            onClick={handleSettingsClick}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </motion.button>
        </div>
      </motion.aside>

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 25 }}
          >
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <UserIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-xl">Welcome to TaskFlow</DialogTitle>
                  <DialogDescription>
                    Sign in to save your tasks and access all features
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="rounded-lg bg-muted/50 p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <UserIcon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-medium text-lg mb-2">Try Demo Account</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Experience TaskFlow with a pre-configured demo account
                </p>
                <div className="space-y-3">
                  <div className="text-left">
                    <p className="font-medium text-sm">Demo User</p>
                    <p className="text-xs text-muted-foreground">demo@taskflow.com</p>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-warning" />
                    <span className="text-warning">All data resets on logout</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleDemoLogin}
                  className="w-full gap-2 h-12"
                  size="lg"
                >
                  <LogIn className="w-5 h-5" />
                  Sign in as Demo User
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="gap-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                  </Button>
                </div>
              </div>

              <div className="text-center text-xs text-muted-foreground">
                <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
              </div>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Settings
            </DialogTitle>
            <DialogDescription>
              Manage your account and application preferences
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-6">
              {/* User Profile Section */}
              <div className="rounded-lg border border-border p-4">
                <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
                  <UserIcon className="w-5 h-5" />
                  Profile
                </h3>
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-lg">{user?.name || 'User'}</p>
                    <p className="text-sm text-muted-foreground">{user?.email || 'No email'}</p>
                    {user?.isDemo && (
                      <Badge variant="outline" className="mt-2 bg-warning/10 text-warning border-warning">
                        <Shield className="w-3 h-3 mr-1" />
                        Demo Account
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Theme Settings */}
              <div className="rounded-lg border border-border p-4">
                <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Appearance
                </h3>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-3">Choose your preferred theme</p>
                  <div className="grid grid-cols-3 gap-3">
                    {themeOptions.map((theme) => {
                      const Icon = theme.icon;
                      return (
                        <motion.button
                          key={theme.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => onThemeChange?.(theme.id as any)}
                          className={`
                            flex flex-col items-center gap-3 p-4 rounded-lg border transition-all
                            ${currentTheme === theme.id
                              ? 'bg-primary/10 border-primary text-primary'
                              : 'bg-muted/50 border-border hover:bg-muted'
                            }
                          `}
                        >
                          <Icon className="w-6 h-6" />
                          <div className="text-center">
                            <p className="font-medium">{theme.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">{theme.description}</p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="rounded-lg border border-border p-4">
                <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
                  <BellIcon className="w-5 h-5" />
                  Notifications
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Task reminders</p>
                      <p className="text-sm text-muted-foreground">Get notified about upcoming tasks</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Project updates</p>
                      <p className="text-sm text-muted-foreground">Notifications for project changes</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Weekly reports</p>
                      <p className="text-sm text-muted-foreground">Receive weekly progress reports</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              {/* Data Management */}
              <div className="rounded-lg border border-border p-4">
                <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
                  <FolderArchive className="w-5 h-5" />
                  Data Management
                </h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Archive className="w-4 h-4" />
                    Export all data
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Reset demo data
                  </Button>
                  <div className="text-sm text-muted-foreground pt-2">
                    <p>Your data is stored locally in your browser</p>
                    {user?.isDemo && (
                      <p className="text-warning mt-1">
                        Demo account data will be reset on logout
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Help & Support */}
              <div className="rounded-lg border border-border p-4">
                <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  Help & Support
                </h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <HelpCircle className="w-4 h-4" />
                    Documentation
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Report an issue
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Request a feature
                  </Button>
                </div>
              </div>

              {/* Logout Section */}
              <div className="rounded-lg border border-border p-4">
                <h3 className="font-medium text-lg mb-4 text-destructive">Danger Zone</h3>
                <div className="space-y-4">
                  {user?.isDemo && (
                    <div className="p-3 bg-warning/10 rounded-lg border border-warning">
                      <div className="flex items-center gap-2 mb-1">
                        <Shield className="w-4 h-4 text-warning" />
                        <p className="font-medium text-warning">Demo Account Notice</p>
                      </div>
                      <p className="text-sm text-warning/80">
                        All your data will be permanently deleted when you log out
                      </p>
                    </div>
                  )}
                  <Button
                    variant="destructive"
                    onClick={handleLogout}
                    className="w-full gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    {user?.isDemo ? 'Reset Demo & Logout' : 'Logout'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Favorites Dialog */}
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

      {/* Archive Dialog */}
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

      {/* Trash Dialog */}
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