import { useState } from "react";
import { motion } from "framer-motion";
import {
	Menu,
	Search,
	Bell,
	Plus,
	FolderPlus,
	Palette,
	Hash,
	Calendar,
	Book,
	Target,
	Star,
	Briefcase,
	Inbox,
	User,
	Tag,
	Check,
} from "lucide-react";
import { ModeToggle } from "../shared/ModeToggle";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "../ui/dialog";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "../ui/tooltip";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { useProjects } from "@/context/ProjectsContext";

interface DashboardHeaderProps {
	projectName: string;
	taskCount: { total: number; completed: number };
	onToggleSidebar: () => void;
	onOpenSearch: () => void;
	onOpenNotifications: () => void;
	notificationCount?: number;
}

// Definícia ikonového mapovania
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
	Inbox,
	Calendar,
	Briefcase,
	User,
	Star,
	Tag,
	FolderPlus,
	Book,
	Target,
};

// Farbové možnosti pre projekt
const projectColors = [
	{ name: "Blue", value: "#3B82F6" },
	{ name: "Green", value: "#10B981" },
	{ name: "Yellow", value: "#F59E0B" },
	{ name: "Red", value: "#EF4444" },
	{ name: "Purple", value: "#8B5CF6" },
	{ name: "Pink", value: "#EC4899" },
	{ name: "Cyan", value: "#06B6D4" },
	{ name: "Lime", value: "#84CC16" },
];

// Ikony pre projekt
const projectIcons = [
	{ name: "Briefcase", icon: "Briefcase" },
	{ name: "User", icon: "User" },
	{ name: "Calendar", icon: "Calendar" },
	{ name: "Inbox", icon: "Inbox" },
	{ name: "Star", icon: "Star" },
	{ name: "Tag", icon: "Tag" },
	{ name: "Folder", icon: "FolderPlus" },
	{ name: "Book", icon: "Book" },
	{ name: "Target", icon: "Target" },
];

export function DashboardHeader({
	projectName,
	taskCount,
	onToggleSidebar,
	onOpenSearch,
	onOpenNotifications,
	notificationCount = 0,
}: DashboardHeaderProps) {
	const { user } = useAuth();
	const { createProject } = useProjects();
	const [showCreateProject, setShowCreateProject] = useState(false);
	const [projectData, setProjectData] = useState({
		name: "",
		color: projectColors[0].value,
		icon: "Briefcase",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [projectError, setProjectError] = useState("");

	const handleCreateProject = async () => {
		if (!projectData.name.trim()) {
			setProjectError("Project name is required");
			return;
		}

		if (!user) {
			setProjectError("You must be logged in to create projects");
			return;
		}

		setIsSubmitting(true);
		setProjectError("");

		try {
			await createProject({
				name: projectData.name.trim(),
				type: "user",
				color: projectData.color,
				icon: projectData.icon,
			});

			// Reset a zatvorenie dialógu
			setProjectData({
				name: "",
				color: projectColors[0].value,
				icon: "Briefcase",
			});
			setShowCreateProject(false);
		} catch (error) {
			setProjectError(
				error instanceof Error ? error.message : "Failed to create project",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCreateProjectClick = () => {
		if (!user) {
			setProjectError("Please sign in to create projects");
			setShowCreateProject(true);
		} else {
			setProjectError("");
			setShowCreateProject(true);
		}
	};

	const handleColorSelect = (color: string) => {
		setProjectData({ ...projectData, color });
	};

	const handleIconSelect = (icon: string) => {
		setProjectData({ ...projectData, icon });
	};

	const getCurrentIcon = () => {
		return iconMap[projectData.icon] || Briefcase;
	};

	const IconComponent = getCurrentIcon();

	return (
		<TooltipProvider delayDuration={300}>
			<header className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-border">
				<div className="flex items-center justify-between px-4 h-14">
					<div className="flex items-center gap-3">
						<Tooltip>
							<TooltipTrigger asChild>
								<motion.button
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									onClick={onToggleSidebar}
									className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
								>
									<Menu className="w-5 h-5" />
								</motion.button>
							</TooltipTrigger>
							<TooltipContent side="bottom" sideOffset={5}>
								Toggle sidebar
							</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
								<div>
									<motion.h1
										key={projectName}
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
										className="font-semibold text-foreground cursor-default"
									>
										{projectName}
									</motion.h1>
									<p className="text-xs text-muted-foreground">
										{taskCount.completed} of {taskCount.total} completed
									</p>
								</div>
							</TooltipTrigger>
							<TooltipContent side="bottom" sideOffset={5}>
								<div className="max-w-xs">
									<p className="font-medium">{projectName}</p>
									<p className="text-sm text-muted-foreground mt-1">
										{taskCount.completed === taskCount.total
											? "All tasks completed! 🎉"
											: `${taskCount.total - taskCount.completed} tasks remaining`}
									</p>
									{taskCount.total > 0 && (
										<div className="mt-2">
											<div className="flex items-center justify-between text-xs mb-1">
												<span>Progress</span>
												<span>
													{Math.round(
														(taskCount.completed / taskCount.total) * 100,
													)}
													%
												</span>
											</div>
											<div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
												<motion.div
													initial={{ width: 0 }}
													animate={{
														width: `${(taskCount.completed / taskCount.total) * 100}%`,
													}}
													transition={{ duration: 0.5, ease: "easeOut" }}
													className="h-full bg-primary"
												/>
											</div>
										</div>
									)}
								</div>
							</TooltipContent>
						</Tooltip>
					</div>

					<div className="flex items-center gap-1">
						<Tooltip>
							<TooltipTrigger asChild>
								<motion.button
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									onClick={handleCreateProjectClick}
									className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
								>
									<Plus className="w-5 h-5" />
								</motion.button>
							</TooltipTrigger>
							<TooltipContent side="bottom" sideOffset={5}>
								Create new project
							</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
								<div>
									<ModeToggle />
								</div>
							</TooltipTrigger>
							<TooltipContent side="bottom" sideOffset={5}>
								Toggle theme
							</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
								<motion.button
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									onClick={onOpenSearch}
									className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
								>
									<Search className="w-5 h-5" />
								</motion.button>
							</TooltipTrigger>
							<TooltipContent side="bottom" sideOffset={5}>
								Search tasks and projects
							</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
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
							</TooltipTrigger>
							<TooltipContent side="bottom" sideOffset={5}>
								<div className="max-w-xs">
									<p className="font-medium">Notifications</p>
									{notificationCount > 0 ? (
										<p className="text-sm text-muted-foreground mt-1">
											You have {notificationCount} unread notification
											{notificationCount !== 1 ? "s" : ""}
										</p>
									) : (
										<p className="text-sm text-muted-foreground mt-1">
											No new notifications
										</p>
									)}
								</div>
							</TooltipContent>
						</Tooltip>
					</div>
				</div>
			</header>

			<Dialog open={showCreateProject} onOpenChange={setShowCreateProject}>
				<DialogContent className="sm:max-w-[500px]">
					<motion.div
						initial={{ scale: 0.95, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ type: "spring", damping: 25 }}
					>
						<DialogHeader>
							<div className="flex items-center gap-3 mb-2">
								<div className="p-2 rounded-lg bg-primary/10">
									<FolderPlus className="w-6 h-6 text-primary" />
								</div>
								<div>
									<DialogTitle className="text-xl">
										Create New Project
									</DialogTitle>
									<DialogDescription>
										Organize your tasks with a new project
									</DialogDescription>
								</div>
							</div>
						</DialogHeader>

						<div className="space-y-6 py-4">
							<div className="space-y-2">
								<Label htmlFor="project-name" className="text-sm font-medium">
									Project Name
								</Label>
								<Input
									id="project-name"
									placeholder="e.g., Work Projects, Personal Goals..."
									value={projectData.name}
									onChange={(e) => {
										setProjectData({ ...projectData, name: e.target.value });
										setProjectError(""); // Clear error when user types
									}}
									className={cn(
										"h-11",
										projectError && "border-destructive focus-visible:ring-destructive",
									)}
									autoFocus
									onKeyDown={(e) => {
										if (e.key === "Enter" && projectData.name.trim() && user) {
											handleCreateProject();
										}
									}}
								/>
								{projectError && (
									<p className="text-sm text-destructive">{projectError}</p>
								)}
							</div>

							<div className="space-y-6">
								<div className="space-y-3">
									<div className="flex items-center gap-2">
										<Palette className="w-4 h-4 text-muted-foreground" />
										<Label className="text-sm font-medium">Color</Label>
									</div>
									<div className="grid grid-cols-8 gap-2">
										{projectColors.map((color) => (
											<Tooltip key={color.value}>
												<TooltipTrigger asChild>
													<motion.button
														whileHover={{ scale: 1.1 }}
														whileTap={{ scale: 0.95 }}
														onClick={() => handleColorSelect(color.value)}
														className={cn(
															"w-8 h-8 rounded-full border-2 transition-all relative flex items-center justify-center",
															projectData.color === color.value
																? "border-foreground scale-110 ring-2 ring-offset-2 ring-offset-background ring-foreground/20"
																: "border-transparent hover:border-foreground/30",
														)}
														style={{ backgroundColor: color.value }}
													>
														{projectData.color === color.value && (
															<motion.div
																initial={{ scale: 0 }}
																animate={{ scale: 1 }}
																className="absolute"
															>
																<Check className="w-4 h-4 text-white drop-shadow-md" />
															</motion.div>
														)}
													</motion.button>
												</TooltipTrigger>
												<TooltipContent side="top" sideOffset={5}>
													{color.name}
												</TooltipContent>
											</Tooltip>
										))}
									</div>
								</div>

								<div className="space-y-3">
									<div className="flex items-center gap-2">
										<Hash className="w-4 h-4 text-muted-foreground" />
										<Label className="text-sm font-medium">Icon</Label>
									</div>
									<div className="grid grid-cols-5 gap-2">
										{projectIcons.map((icon) => {
											const Icon = iconMap[icon.icon] || Briefcase;
											const isSelected = projectData.icon === icon.icon;
											return (
												<Tooltip key={icon.icon}>
													<TooltipTrigger asChild>
														<motion.button
															whileHover={{ scale: 1.05, y: -2 }}
															whileTap={{ scale: 0.95 }}
															onClick={() => handleIconSelect(icon.icon)}
															className={cn(
																"flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all",
																isSelected
																	? "bg-primary/10 border-primary text-primary shadow-sm"
																	: "bg-muted/50 border-border hover:bg-muted",
															)}
														>
															<Icon className="w-5 h-5" />
															<span className="text-[10px] font-medium truncate w-full text-center">
																{icon.name}
															</span>
														</motion.button>
													</TooltipTrigger>
													<TooltipContent side="top" sideOffset={5}>
														{icon.name} icon
													</TooltipContent>
												</Tooltip>
											);
										})}
									</div>
								</div>
							</div>

							<div className="rounded-lg bg-muted/50 p-4 border border-border">
								<div className="flex items-center gap-3">
									<Tooltip>
										<TooltipTrigger asChild>
											<div
												className="flex items-center justify-center w-10 h-10 rounded-lg"
												style={{ backgroundColor: projectData.color }}
											>
												<IconComponent className="w-5 h-5 text-white" />
											</div>
										</TooltipTrigger>
										<TooltipContent>
											Project preview with selected color and icon
										</TooltipContent>
									</Tooltip>
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-1">
											<Tooltip>
												<TooltipTrigger asChild>
													<span
														className={cn(
															"font-medium text-foreground truncate max-w-[200px]",
															!projectData.name && "text-muted-foreground italic",
														)}
													>
														{projectData.name || "Your project name"}
													</span>
												</TooltipTrigger>
												{projectData.name && (
													<TooltipContent>
														{projectData.name}
													</TooltipContent>
												)}
											</Tooltip>
											<Tooltip>
												<TooltipTrigger asChild>
													<Badge variant="outline" className="text-xs">
														{projectIcons.find((i) => i.icon === projectData.icon)
															?.name || "Briefcase"}
													</Badge>
												</TooltipTrigger>
												<TooltipContent>
													Selected icon type
												</TooltipContent>
											</Tooltip>
										</div>
										<p className="text-xs text-muted-foreground">
											{user
												? "Project will be saved to your account"
												: "Sign in to save this project"}
										</p>
									</div>
								</div>
							</div>

							{!user && (
								<Tooltip>
									<TooltipTrigger asChild>
										<div className="p-3 bg-warning/10 border border-warning/20 rounded">
											<div className="flex items-start gap-2">
												<Bell className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
												<div>
													<p className="text-sm font-medium text-warning">
														Sign In Required
													</p>
													<p className="text-sm text-warning/80">
														Projects created in guest mode are temporary. Sign in to
														save them permanently.
													</p>
												</div>
											</div>
										</div>
									</TooltipTrigger>
									<TooltipContent side="top" sideOffset={5}>
										Click "Sign In to Create" button to proceed
									</TooltipContent>
								</Tooltip>
							)}
						</div>

						<DialogFooter>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="outline"
										onClick={() => setShowCreateProject(false)}
										disabled={isSubmitting}
									>
										Cancel
									</Button>
								</TooltipTrigger>
								<TooltipContent>Close without saving</TooltipContent>
							</Tooltip>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										onClick={handleCreateProject}
										disabled={!projectData.name.trim() || isSubmitting || !user}
										className="gap-2"
									>
										{isSubmitting ? (
											<>
												<motion.div
													animate={{ rotate: 360 }}
													transition={{
														duration: 1,
														repeat: Infinity,
														ease: "linear",
													}}
													className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
												/>
												Creating...
											</>
										) : (
											<>
												<FolderPlus className="w-4 h-4" />
												{user ? "Create Project" : "Sign In to Create"}
											</>
										)}
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									{!projectData.name.trim()
										? "Enter a project name to continue"
										: !user
											? "Sign in to create permanent projects"
											: "Create new project"}
								</TooltipContent>
							</Tooltip>
						</DialogFooter>
					</motion.div>
				</DialogContent>
			</Dialog>
		</TooltipProvider>
	);
}