import { motion } from 'framer-motion';
import { 
  Inbox, Calendar, Briefcase, User, ChevronLeft, Hash, 
  Settings, Star, Archive, Trash2, Plus, Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Project } from '@/types/task';

interface DashboardSidebarProps {
  projects: Project[];
  activeProject: string;
  onSelectProject: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onOpenNotifications: () => void;
  notificationCount?: number;
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
}: DashboardSidebarProps) {
  const mainProjects = projects.filter((p) => p.id === 'inbox' || p.id === 'today');
  const userProjects = projects.filter((p) => p.id !== 'inbox' && p.id !== 'today');

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
          {/* Notifications button */}
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
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all"
            >
              <link.icon className="w-4 h-4" style={{ color: link.color }} />
              <span className="truncate">{link.name}</span>
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
    </>
  );
}