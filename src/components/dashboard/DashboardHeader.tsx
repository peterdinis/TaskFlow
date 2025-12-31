import { motion } from 'framer-motion';
import { Menu, Search, Bell} from 'lucide-react';

interface DashboardHeaderProps {
  projectName: string;
  taskCount: { total: number; completed: number };
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  notificationCount?: number;
}

export function DashboardHeader({ 
  projectName, 
  taskCount, 
  onToggleSidebar, 
  onOpenSearch,
  onOpenNotifications,
  notificationCount = 0,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5" />
          </motion.button>

          <div>
            <motion.h1
              key={projectName}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-semibold text-foreground"
            >
              {projectName}
            </motion.h1>
            <p className="text-xs text-muted-foreground">
              {taskCount.completed} of {taskCount.total} completed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenSearch}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Search className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-medium flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </motion.button>
        </div>
      </div>
    </header>
  );
}