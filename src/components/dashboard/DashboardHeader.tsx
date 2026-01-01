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

interface DashboardHeaderProps {
	projectName: string;
	taskCount: { total: number; completed: number };
	onToggleSidebar: () => void;
	onOpenSearch: () => void;
	onOpenNotifications: () => void;
	notificationCount?: number;
	onCreateProject?: (projectData: {
		name: string;
		color: string;
		icon: string;
	}) => void;
}

const projectColors = [
	{ name: "Blue", value: "hsl(210, 100%, 50%)" },
	{ name: "Green", value: "hsl(142, 76%, 36%)" },
	{ name: "Red", value: "hsl(0, 84%, 60%)" },
	{ name: "Purple", value: "hsl(280, 65%, 60%)" },
	{ name: "Orange", value: "hsl(24, 95%, 53%)" },
	{ name: "Pink", value: "hsl(330, 81%, 60%)" },
];

const projectIcons = [
	{ name: "Briefcase", icon: "Briefcase", component: Briefcase },
	{ name: "Folder", icon: "Folder", component: FolderPlus },
	{ name: "Calendar", icon: "Calendar", component: Calendar },
	{ name: "Book", icon: "Book", component: Book },
	{ name: "Target", icon: "Target", component: Target },
	{ name: "Star", icon: "Star", component: Star },
];

export function DashboardHeader({
	projectName,
	taskCount,
	onToggleSidebar,
	onOpenSearch,
	onOpenNotifications,
	notificationCount = 0,
	onCreateProject,
}: DashboardHeaderProps) {
	const [showCreateProject, setShowCreateProject] = useState(false);
	const [projectData, setProjectData] = useState({
		name: "",
		color: projectColors[0].value,
		icon: "Briefcase",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleCreateProject = async () => {
		if (!projectData.name.trim()) return;

		setIsSubmitting(true);
		try {
			if (onCreateProject) {
				await onCreateProject(projectData);
			}
			setShowCreateProject(false);
			setProjectData({
				name: "",
				color: projectColors[0].value,
				icon: "Briefcase",
			});
		} catch (error) {
			console.error("Failed to create project:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<>
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
							onClick={() => setShowCreateProject(true)}
							className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
							title="Create new project"
						>
							<Plus className="w-5 h-5" />
						</motion.button>
						<ModeToggle />
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
										Organize your tasks into projects
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
									placeholder="e.g., Marketing Campaign"
									value={projectData.name}
									onChange={(e) =>
										setProjectData({ ...projectData, name: e.target.value })
									}
									className="h-11"
									autoFocus
								/>
							</div>

							<div className="space-y-6">
								<div className="space-y-3">
									<div className="flex items-center gap-2">
										<Palette className="w-4 h-4 text-muted-foreground" />
										<Label className="text-sm font-medium">Color</Label>
									</div>
									<div className="grid grid-cols-6 gap-3">
										{projectColors.map((color) => (
											<motion.button
												key={color.value}
												whileHover={{ scale: 1.1 }}
												whileTap={{ scale: 0.95 }}
												onClick={() =>
													setProjectData({ ...projectData, color: color.value })
												}
												className={`
                          w-9 h-9 rounded-full border-2 transition-all relative
                          ${
														projectData.color === color.value
															? "border-foreground scale-110"
															: "border-transparent hover:border-foreground/50"
													}
                        `}
												style={{ backgroundColor: color.value }}
												title={color.name}
											>
												{projectData.color === color.value && (
													<motion.div
														initial={{ scale: 0 }}
														animate={{ scale: 1 }}
														className="absolute inset-0 flex items-center justify-center"
													>
														<div className="w-4 h-4 rounded-full bg-white/20" />
													</motion.div>
												)}
											</motion.button>
										))}
									</div>
								</div>

								<div className="space-y-3">
									<div className="flex items-center gap-2">
										<Hash className="w-4 h-4 text-muted-foreground" />
										<Label className="text-sm font-medium">Icon</Label>
									</div>
									<div className="grid grid-cols-6 gap-3">
										{projectIcons.map((icon) => {
											const IconComponent = icon.component;
											return (
												<motion.button
													key={icon.icon}
													whileHover={{ scale: 1.05, y: -2 }}
													whileTap={{ scale: 0.95 }}
													onClick={() =>
														setProjectData({ ...projectData, icon: icon.icon })
													}
													className={`
                            flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all
                            ${
															projectData.icon === icon.icon
																? "bg-primary/10 border-primary text-primary shadow-sm"
																: "bg-muted/50 border-border hover:bg-muted"
														}
                          `}
												>
													<IconComponent className="w-5 h-5" />
													<span className="text-[10px] font-medium">
														{icon.name}
													</span>
												</motion.button>
											);
										})}
									</div>
								</div>
							</div>

							<div className="rounded-lg bg-muted/50 p-4 border border-border">
								<div className="flex items-center gap-3">
									<div
										className="flex items-center justify-center w-10 h-10 rounded-lg"
										style={{ backgroundColor: projectData.color }}
									>
										{(() => {
											const IconComponent =
												projectIcons.find((i) => i.icon === projectData.icon)
													?.component || Briefcase;
											return <IconComponent className="w-5 h-5 text-white" />;
										})()}
									</div>
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-1">
											<span className="font-medium text-foreground">
												{projectData.name || "New Project"}
											</span>
											<Badge variant="outline" className="text-xs">
												{projectIcons.find((i) => i.icon === projectData.icon)
													?.name || "Briefcase"}
											</Badge>
										</div>
										<p className="text-xs text-muted-foreground">
											Preview of your project
										</p>
									</div>
								</div>
							</div>
						</div>

						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setShowCreateProject(false)}
							>
								Cancel
							</Button>
							<Button
								onClick={handleCreateProject}
								disabled={!projectData.name.trim() || isSubmitting}
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
										Create Project
									</>
								)}
							</Button>
						</DialogFooter>
					</motion.div>
				</DialogContent>
			</Dialog>
		</>
	);
}
