import { useTasks } from "@/hooks/useTasks";
import { FC, useState } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { motion } from 'framer-motion';
import { DashboardHeader } from "./DashboardHeader";
import { DashboardStats } from "./DashboardStats";

const DashboardWrapper: FC = () => {
    const {
        tasks,
        projects,
        activeProject,
        setActiveProject,
        addTask,
        toggleTask,
        deleteTask,
        updateTaskPriority,
        taskCount,
    } = useTasks();

    const currentProject = projects.find((p) => p.id === activeProject);
    const highPriorityCount = tasks.filter((t) => t.priority === 'high' && !t.completed).length;

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchOpen, setSearchOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    return (
        <div className="min-h-screen flex bg-background">
            <DashboardSidebar
                projects={projects}
                activeProject={activeProject}
                onSelectProject={setActiveProject}
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
                onOpenNotifications={() => setNotificationsOpen(true)}
                notificationCount={2}
            />
            <motion.main
                className="flex-1 flex flex-col min-w-0"
                animate={{ marginLeft: sidebarOpen ? 0 : 0 }}
            >
                <DashboardHeader
                    projectName={currentProject?.name || 'Inbox'}
                    taskCount={taskCount}
                    onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                    onOpenSearch={() => setSearchOpen(true)}
                    onOpenNotifications={() => setNotificationsOpen(true)}
                    notificationCount={2}
                />
                <div className="flex-1 overflow-y-auto">
                    <DashboardStats
                        totalTasks={taskCount.total}
                        completedTasks={taskCount.completed}
                        highPriorityCount={highPriorityCount}
                    />

                    <div className="mb-4">
                        <h2 className="text-lg font-semibold text-foreground mb-1">Tasks</h2>
                        <p className="text-sm text-muted-foreground">
                            Manage your tasks and stay productive
                        </p>
                    </div>
                </div>
            </motion.main>
        </div>
    )
}

export default DashboardWrapper