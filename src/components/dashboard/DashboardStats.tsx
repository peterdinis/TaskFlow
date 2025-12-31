import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Target, TrendingUp } from 'lucide-react';

interface DashboardStatsProps {
  totalTasks: number;
  completedTasks: number;
  highPriorityCount: number;
}

export function DashboardStats({ totalTasks, completedTasks, highPriorityCount }: DashboardStatsProps) {
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const pendingTasks = totalTasks - completedTasks;

  const stats = [
    {
      label: 'Completed',
      value: completedTasks,
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Pending',
      value: pendingTasks,
      icon: Clock,
      color: 'text-priority-medium',
      bgColor: 'bg-priority-medium/10',
    },
    {
      label: 'High Priority',
      value: highPriorityCount,
      icon: Target,
      color: 'text-priority-high',
      bgColor: 'bg-priority-high/10',
    },
    {
      label: 'Progress',
      value: `${completionRate}%`,
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-card rounded-xl p-4 floating-shadow border border-border/50"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
