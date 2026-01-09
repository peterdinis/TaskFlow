import { motion } from "framer-motion";
import { Trash2, Flag, Star, Archive, MoreVertical } from "lucide-react";
import { Task, Priority } from "@/types/task";
import { cn } from "@/lib/utils";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { TodoCheckbox } from "./TodoCheckbox";

interface TodoItemProps {
	task: Task;
	onToggle: () => void;
	onDelete: () => void;
	onUpdatePriority: (priority: Priority) => void;
	onToggleFavorite?: () => void;
	onToggleArchive?: () => void;
	onMoveToTrash?: () => void;
}

const priorityOptions: { value: Priority; label: string; color: string }[] = [
	{ value: "high", label: "High", color: "text-priority-high" },
	{ value: "medium", label: "Medium", color: "text-priority-medium" },
	{ value: "low", label: "Low", color: "text-priority-low" },
	{ value: "none", label: "None", color: "text-muted-foreground" },
];

export function TodoItem({
	task,
	onToggle,
	onDelete,
	onUpdatePriority,
	onToggleFavorite,
	onToggleArchive,
	onMoveToTrash,
}: TodoItemProps) {
	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
			transition={{ type: "spring", stiffness: 400, damping: 30 }}
			className="group"
		>
			<div
				className={cn(
					"flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
					"hover:bg-card floating-shadow hover:floating-shadow-hover",
					"border border-transparent hover:border-border/50",
					task.completed && "opacity-60",
				)}
			>
				<TodoCheckbox
					checked={task.completed}
					priority={task.priority}
					onToggle={onToggle}
				/>

				<motion.span
					className={cn(
						"flex-1 text-sm transition-all duration-300",
						task.completed && "line-through text-muted-foreground",
					)}
					animate={{ opacity: task.completed ? 0.6 : 1 }}
				>
					{task.title}
				</motion.span>

				<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
					{/* Favorite Button */}
					{onToggleFavorite && (
						<motion.button
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.9 }}
							onClick={onToggleFavorite}
							className={cn(
								"p-1.5 rounded-md transition-colors",
								task.isFavorite
									? "text-yellow-500 hover:text-yellow-600 hover:bg-yellow-500/10"
									: "text-muted-foreground hover:text-yellow-500 hover:bg-muted",
							)}
							title={
								task.isFavorite ? "Remove from favorites" : "Add to favorites"
							}
						>
							<Star
								className={cn("w-4 h-4", task.isFavorite && "fill-current")}
							/>
						</motion.button>
					)}

					{/* Priority Dropdown */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<motion.button
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.9 }}
								className={cn(
									"p-1.5 rounded-md hover:bg-muted transition-colors",
									task.priority === "high" && "text-priority-high",
									task.priority === "medium" && "text-priority-medium",
									task.priority === "low" && "text-priority-low",
									task.priority === "none" && "text-muted-foreground",
								)}
								title="Set priority"
							>
								<Flag className="w-4 h-4" />
							</motion.button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-32 bg-popover">
							{priorityOptions.map((option) => (
								<DropdownMenuItem
									key={option.value}
									onClick={() => onUpdatePriority(option.value)}
									className={cn("flex items-center gap-2", option.color)}
								>
									<Flag className="w-3 h-3" />
									{option.label}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>

					{/* Actions Dropdown */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<motion.button
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.9 }}
								className="p-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors"
								title="More options"
							>
								<MoreVertical className="w-4 h-4" />
							</motion.button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-40 bg-popover">
							{onToggleArchive && (
								<DropdownMenuItem
									onClick={onToggleArchive}
									className="flex items-center gap-2 cursor-pointer"
								>
									<Archive className="w-4 h-4" />
									{task.archivedAt ? "Unarchive" : "Archive"}
								</DropdownMenuItem>
							)}
							{onMoveToTrash && !task.deletedAt && (
								<>
									{onToggleArchive && <DropdownMenuSeparator />}
									<DropdownMenuItem
										onClick={onMoveToTrash}
										className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
									>
										<Trash2 className="w-4 h-4" />
										Move to Trash
									</DropdownMenuItem>
								</>
							)}
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={onDelete}
								className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
							>
								<Trash2 className="w-4 h-4" />
								Delete Permanently
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</motion.div>
	);
}
