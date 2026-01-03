import { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Task, Priority } from "@/types/task";
import { TaskItem } from "./TaskItem";
import {
	Filter,
	X,
	CheckCircle,
	AlertCircle,
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface TaskListProps {
	tasks: Task[];
	onToggle: (id: string) => void;
	onDelete: (id: string) => void;
	onUpdatePriority: (id: string, priority: Priority) => void;
	projects?: Array<{ id: string; name: string; color: string }>;
}

type FilterType =
	| "all"
	| "active"
	| "completed"
	| "priority"
	| "today"
	| "overdue";
type SortType = "dueDate" | "priority" | "createdAt" | "title";

interface FilterState {
	type: FilterType;
	priority: Priority | "all";
	projectId: string | "all";
	tags: string[];
	sortBy: SortType;
	sortOrder: "asc" | "desc";
}

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

export function TaskList({
	tasks,
	onToggle,
	onDelete,
	onUpdatePriority,
	projects = [],
}: TaskListProps) {
	const [filters, setFilters] = useState<FilterState>({
		type: "all",
		priority: "all",
		projectId: "all",
		tags: [],
		sortBy: "dueDate",
		sortOrder: "asc",
	});

	const [availableTags, setAvailableTags] = useState<string[]>([]);
	const [showFilters, setShowFilters] = useState(false);
	const [activeFilters, setActiveFilters] = useState(0);

	// Pagination state
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(25);

	// Extract all unique tags from tasks
	useEffect(() => {
		const allTags = tasks.flatMap((task) => task.tags || []);
		const uniqueTags = Array.from(new Set(allTags));
		setAvailableTags(uniqueTags);
	}, [tasks]);

	// Calculate active filter count
	useEffect(() => {
		let count = 0;
		if (filters.type !== "all") count++;
		if (filters.priority !== "all") count++;
		if (filters.projectId !== "all") count++;
		if (filters.tags.length > 0) count++;
		if (filters.sortBy !== "dueDate") count++;
		setActiveFilters(count);
	}, [filters]);

	// Reset to first page when filters change
	useEffect(() => {
		setCurrentPage(1);
	}, [filters]);

	// Filter and sort tasks
	const filteredTasks = useMemo(() => {
		return tasks
			.filter((task) => {
				// Filter by type
				if (filters.type === "active" && task.completed) return false;
				if (filters.type === "completed" && !task.completed) return false;

				// Filter by priority
				if (filters.priority !== "all" && task.priority !== filters.priority)
					return false;

				// Filter by project
				if (filters.projectId !== "all" && task.projectId !== filters.projectId)
					return false;

				// Filter by tags
				if (filters.tags.length > 0) {
					const taskTags = task.tags || [];
					if (!filters.tags.every((tag) => taskTags.includes(tag)))
						return false;
				}

				// Filter by today
				if (filters.type === "today" && task.dueDate) {
					const today = new Date();
					const dueDate = new Date(task.dueDate);
					return (
						dueDate.getDate() === today.getDate() &&
						dueDate.getMonth() === today.getMonth() &&
						dueDate.getFullYear() === today.getFullYear()
					);
				}

				// Filter by overdue
				if (filters.type === "overdue" && task.dueDate) {
					const today = new Date();
					const dueDate = new Date(task.dueDate);
					return dueDate < today && !task.completed;
				}

				return true;
			})
			.sort((a, b) => {
				let compareValue = 0;

				switch (filters.sortBy) {
					case "dueDate":
						const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
						const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
						compareValue = dateA - dateB;
						break;

					case "priority":
						const priorityOrder: Record<Priority, number> = {
							high: 0,
							medium: 1,
							low: 2,
							none: 3,
						};
						compareValue =
							priorityOrder[a.priority] - priorityOrder[b.priority];
						break;

					case "createdAt":
						const createdAtA = new Date(a.createdAt).getTime();
						const createdAtB = new Date(b.createdAt).getTime();
						compareValue = createdAtA - createdAtB;
						break;

					case "title":
						compareValue = a.title.localeCompare(b.title);
						break;
				}

				return filters.sortOrder === "asc" ? compareValue : -compareValue;
			});
	}, [tasks, filters]);

	// Calculate pagination
	const totalTasks = filteredTasks.length;
	const totalPages = Math.ceil(totalTasks / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = Math.min(startIndex + itemsPerPage, totalTasks);
	const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

	// Separate completed and incomplete tasks
	const incompleteTasks = paginatedTasks.filter((t) => !t.completed);
	const completedTasks = paginatedTasks.filter((t) => t.completed);

	const handleFilterChange = <K extends keyof FilterState>(
		key: K,
		value: FilterState[K],
	) => {
		setFilters((prev) => ({ ...prev, [key]: value }));
	};

	const toggleTag = (tag: string) => {
		setFilters((prev) => ({
			...prev,
			tags: prev.tags.includes(tag)
				? prev.tags.filter((t) => t !== tag)
				: [...prev.tags, tag],
		}));
	};

	const clearFilters = () => {
		setFilters({
			type: "all",
			priority: "all",
			projectId: "all",
			tags: [],
			sortBy: "dueDate",
			sortOrder: "asc",
		});
	};

	const getFilterLabel = () => {
		switch (filters.type) {
			case "today":
				return "Today";
			case "overdue":
				return "Overdue";
			case "priority":
				return "Priority";
			case "active":
				return "Active";
			case "completed":
				return "Completed";
			default:
				return "All Tasks";
		}
	};

	// Pagination handlers
	const goToPage = (page: number) => {
		setCurrentPage(Math.max(1, Math.min(page, totalPages)));
	};

	const goToFirstPage = () => goToPage(1);
	const goToPrevPage = () => goToPage(currentPage - 1);
	const goToNextPage = () => goToPage(currentPage + 1);
	const goToLastPage = () => goToPage(totalPages);

	// Generate page numbers with ellipsis
	const getPageNumbers = () => {
		const pages: (number | string)[] = [];
		const maxVisiblePages = 5;

		if (totalPages <= maxVisiblePages) {
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			pages.push(1);

			if (currentPage > 3) {
				pages.push("...");
			}

			const start = Math.max(2, currentPage - 1);
			const end = Math.min(totalPages - 1, currentPage + 1);

			for (let i = start; i <= end; i++) {
				pages.push(i);
			}

			if (currentPage < totalPages - 2) {
				pages.push("...");
			}

			pages.push(totalPages);
		}

		return pages;
	};

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.05,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 10 },
		visible: { opacity: 1, y: 0 },
		exit: { opacity: 0, x: -20 },
	};

	return (
		<div className="space-y-4">
			{/* Filter Header */}
			<motion.div
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				className="space-y-3"
			>
				{/* Filter Controls */}
				<div className="flex flex-wrap items-center justify-between gap-2">
					{/* Main Filter Tabs */}
					<Tabs
						value={filters.type}
						onValueChange={(value) =>
							handleFilterChange("type", value as FilterType)
						}
						className="w-full max-w-lg"
					>
						<TabsList className="grid grid-cols-6 h-9">
							<TabsTrigger value="all">All</TabsTrigger>
							<TabsTrigger value="active">Active</TabsTrigger>
							<TabsTrigger value="today">Today</TabsTrigger>
							<TabsTrigger value="priority">Priority</TabsTrigger>
							<TabsTrigger value="overdue">Overdue</TabsTrigger>
							<TabsTrigger value="completed">Completed</TabsTrigger>
						</TabsList>
					</Tabs>

					{/* Right side controls */}
					<div className="flex items-center gap-2">
						{/* Advanced Filters Button */}
						<DropdownMenu open={showFilters} onOpenChange={setShowFilters}>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="sm" className="relative">
									<Filter className="w-4 h-4 mr-2" />
									Filters
									{activeFilters > 0 && (
										<Badge
											variant="secondary"
											className="absolute -top-1 -right-1 px-1.5 min-w-[20px] h-5"
										>
											{activeFilters}
										</Badge>
									)}
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-64 p-3">
								<DropdownMenuLabel>Filter Tasks</DropdownMenuLabel>
								<DropdownMenuSeparator />

								{/* Priority Filter */}
								<DropdownMenuGroup>
									<p className="text-xs font-medium text-muted-foreground mb-1">
										Priority
									</p>
									<div className="flex flex-wrap gap-1">
										{(["all", "high", "medium", "low", "none"] as const).map(
											(p) => (
												<Badge
													key={p}
													variant={
														filters.priority === p ? "default" : "outline"
													}
													className="cursor-pointer"
													onClick={() => handleFilterChange("priority", p)}
												>
													{p === "all"
														? "All"
														: p.charAt(0).toUpperCase() + p.slice(1)}
												</Badge>
											),
										)}
									</div>
								</DropdownMenuGroup>

								<DropdownMenuSeparator />

								{/* Project Filter */}
								{projects.length > 0 && (
									<>
										<DropdownMenuGroup>
											<p className="text-xs font-medium text-muted-foreground mb-1">
												Project
											</p>
											<div className="space-y-1">
												<DropdownMenuItem
													onClick={() => handleFilterChange("projectId", "all")}
													className={cn(
														"cursor-pointer",
														filters.projectId === "all" && "bg-accent",
													)}
												>
													<CheckCircle
														className={cn(
															"w-3 h-3 mr-2",
															filters.projectId === "all"
																? "opacity-100"
																: "opacity-0",
														)}
													/>
													All Projects
												</DropdownMenuItem>
												{projects.map((project) => (
													<DropdownMenuItem
														key={project.id}
														onClick={() =>
															handleFilterChange("projectId", project.id)
														}
														className={cn(
															"cursor-pointer",
															filters.projectId === project.id && "bg-accent",
														)}
													>
														<CheckCircle
															className={cn(
																"w-3 h-3 mr-2",
																filters.projectId === project.id
																	? "opacity-100"
																	: "opacity-0",
															)}
														/>
														<div
															className="w-2 h-2 rounded-full mr-2"
															style={{ backgroundColor: project.color }}
														/>
														{project.name}
													</DropdownMenuItem>
												))}
											</div>
										</DropdownMenuGroup>
										<DropdownMenuSeparator />
									</>
								)}

								{/* Tags Filter */}
								{availableTags.length > 0 && (
									<DropdownMenuGroup>
										<p className="text-xs font-medium text-muted-foreground mb-1">
											Tags
										</p>
										<div className="flex flex-wrap gap-1">
											{availableTags.map((tag) => (
												<Badge
													key={tag}
													variant={
														filters.tags.includes(tag) ? "default" : "outline"
													}
													className="cursor-pointer"
													onClick={() => toggleTag(tag)}
												>
													{filters.tags.includes(tag) && (
														<X className="w-3 h-3 mr-1" />
													)}
													{tag}
												</Badge>
											))}
										</div>
									</DropdownMenuGroup>
								)}

								<DropdownMenuSeparator />

								{/* Sort Options */}
								<DropdownMenuGroup>
									<p className="text-xs font-medium text-muted-foreground mb-1">
										Sort By
									</p>
									<div className="space-y-1">
										{(
											["dueDate", "priority", "createdAt", "title"] as const
										).map((sort) => (
											<DropdownMenuItem
												key={sort}
												onClick={() => handleFilterChange("sortBy", sort)}
												className={cn(
													"cursor-pointer",
													filters.sortBy === sort && "bg-accent",
												)}
											>
												<CheckCircle
													className={cn(
														"w-3 h-3 mr-2",
														filters.sortBy === sort
															? "opacity-100"
															: "opacity-0",
													)}
												/>
												{sort === "dueDate"
													? "Due Date"
													: sort === "priority"
														? "Priority"
														: sort === "createdAt"
															? "Date Created"
															: "Title"}
											</DropdownMenuItem>
										))}
									</div>
									<div className="mt-2 flex items-center gap-2">
										<Button
											variant={
												filters.sortOrder === "asc" ? "default" : "outline"
											}
											size="sm"
											onClick={() => handleFilterChange("sortOrder", "asc")}
											className="flex-1 h-7"
										>
											Asc
										</Button>
										<Button
											variant={
												filters.sortOrder === "desc" ? "default" : "outline"
											}
											size="sm"
											onClick={() => handleFilterChange("sortOrder", "desc")}
											className="flex-1 h-7"
										>
											Desc
										</Button>
									</div>
								</DropdownMenuGroup>

								<DropdownMenuSeparator />

								{/* Clear Filters */}
								<Button
									variant="ghost"
									size="sm"
									onClick={clearFilters}
									className="w-full justify-center text-xs"
								>
									<X className="w-3 h-3 mr-2" />
									Clear All Filters
								</Button>
							</DropdownMenuContent>
						</DropdownMenu>

						{/* Active Filters Display */}
						{activeFilters > 0 && (
							<motion.div
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								className="flex items-center gap-2"
							>
								<Badge variant="secondary" className="gap-1">
									{getFilterLabel()}
									<span className="text-xs opacity-70 ml-1">
										• {filteredTasks.length}
									</span>
								</Badge>
								<Button
									variant="ghost"
									size="sm"
									onClick={clearFilters}
									className="h-6 px-2"
								>
									<X className="w-3 h-3" />
								</Button>
							</motion.div>
						)}
					</div>
				</div>
			</motion.div>

			{/* Task Count and Pagination Controls */}
			<div className="flex flex-wrap items-center justify-between gap-3">
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="text-sm text-muted-foreground"
				>
					<span>
						Showing {startIndex + 1}-{endIndex} of {totalTasks} tasks
						{filteredTasks.length !== tasks.length &&
							` (filtered from ${tasks.length} total)`}
					</span>
				</motion.div>

				{/* Items per page selector */}
				<div className="flex items-center gap-3">
					<div className="flex items-center gap-2">
						<span className="text-sm text-muted-foreground">Show:</span>
						<Select
							value={itemsPerPage.toString()}
							onValueChange={(value) => {
								setItemsPerPage(Number(value));
								setCurrentPage(1); // Reset to first page when changing items per page
							}}
						>
							<SelectTrigger className="w-20 h-8">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{ITEMS_PER_PAGE_OPTIONS.map((option) => (
									<SelectItem key={option} value={option.toString()}>
										{option}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<span className="text-sm text-muted-foreground">per page</span>
					</div>

					{/* Pagination controls */}
					{totalPages > 1 && (
						<div className="flex items-center gap-1">
							<Button
								variant="outline"
								size="icon"
								onClick={goToFirstPage}
								disabled={currentPage === 1}
								className="h-8 w-8"
							>
								<ChevronsLeft className="w-4 h-4" />
							</Button>
							<Button
								variant="outline"
								size="icon"
								onClick={goToPrevPage}
								disabled={currentPage === 1}
								className="h-8 w-8"
							>
								<ChevronLeft className="w-4 h-4" />
							</Button>

							{/* Page numbers */}
							<div className="flex items-center gap-1 mx-2">
								{getPageNumbers().map((page, index) =>
									page === "..." ? (
										<span
											key={`ellipsis-${index}`}
											className="px-2 text-muted-foreground"
										>
											...
										</span>
									) : (
										<Button
											key={page}
											variant={currentPage === page ? "default" : "outline"}
											size="sm"
											onClick={() => goToPage(page as number)}
											className="h-8 w-8"
										>
											{page}
										</Button>
									),
								)}
							</div>

							<Button
								variant="outline"
								size="icon"
								onClick={goToNextPage}
								disabled={currentPage === totalPages}
								className="h-8 w-8"
							>
								<ChevronRight className="w-4 h-4" />
							</Button>
							<Button
								variant="outline"
								size="icon"
								onClick={goToLastPage}
								disabled={currentPage === totalPages}
								className="h-8 w-8"
							>
								<ChevronsRight className="w-4 h-4" />
							</Button>
						</div>
					)}
				</div>
			</div>

			{/* Task List */}
			<ScrollArea className="h-[calc(100vh-280px)] pr-4 scrollable-hidden">
				<AnimatePresence mode="wait">
					{paginatedTasks.length === 0 ? (
						<motion.div
							key="empty"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							className="py-12 text-center space-y-3"
						>
							<div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
								<AlertCircle className="w-8 h-8 text-muted-foreground" />
							</div>
							<div>
								<p className="text-foreground font-medium">No tasks found</p>
								<p className="text-sm text-muted-foreground mt-1">
									{tasks.length === 0
										? "Add your first task to get started!"
										: "Try adjusting your filters"}
								</p>
							</div>
							{activeFilters > 0 && (
								<Button variant="outline" size="sm" onClick={clearFilters}>
									Clear filters
								</Button>
							)}
						</motion.div>
					) : (
						<motion.div
							key="tasks"
							variants={containerVariants}
							initial="hidden"
							animate="visible"
							className="space-y-1"
						>
							{/* Incomplete Tasks */}
							<AnimatePresence mode="popLayout">
								{incompleteTasks.map((task) => (
									<motion.div
										key={task.id}
										variants={itemVariants}
										layout
										transition={{
											type: "spring",
											stiffness: 500,
											damping: 30,
											mass: 1,
										}}
									>
										<TaskItem
											task={task}
											onToggle={() => onToggle(task.id)}
											onDelete={() => onDelete(task.id)}
											onUpdatePriority={(priority) =>
												onUpdatePriority(task.id, priority)
											}
										/>
									</motion.div>
								))}
							</AnimatePresence>

							{/* Completed Tasks Section */}
							{completedTasks.length > 0 && filters.type !== "active" && (
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									className="pt-6"
								>
									<motion.div
										initial={{ opacity: 0, x: -10 }}
										animate={{ opacity: 1, x: 0 }}
										className="flex items-center gap-2 mb-2 px-2"
									>
										<div className="h-px flex-1 bg-border" />
										<span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
											Completed ({completedTasks.length} on this page)
										</span>
										<div className="h-px flex-1 bg-border" />
									</motion.div>
									<AnimatePresence mode="popLayout">
										{completedTasks.map((task) => (
											<motion.div
												key={task.id}
												variants={itemVariants}
												layout
												transition={{
													type: "spring",
													stiffness: 500,
													damping: 30,
													mass: 1,
												}}
											>
												<TaskItem
													task={task}
													onToggle={() => onToggle(task.id)}
													onDelete={() => onDelete(task.id)}
													onUpdatePriority={(priority) =>
														onUpdatePriority(task.id, priority)
													}
												/>
											</motion.div>
										))}
									</AnimatePresence>
								</motion.div>
							)}
						</motion.div>
					)}
				</AnimatePresence>
			</ScrollArea>

			{/* Bottom Pagination Summary */}
			{totalPages > 1 && (
				<div className="flex items-center justify-between pt-4 border-t border-border">
					<div className="text-sm text-muted-foreground">
						Page {currentPage} of {totalPages}
					</div>
					<div className="flex items-center gap-2">
						<Select
							value={currentPage.toString()}
							onValueChange={(value) => goToPage(Number(value))}
						>
							<SelectTrigger className="w-20 h-8">
								<SelectValue placeholder="Page" />
							</SelectTrigger>
							<SelectContent>
								{Array.from({ length: totalPages }, (_, i) => i + 1).map(
									(page) => (
										<SelectItem key={page} value={page.toString()}>
											Page {page}
										</SelectItem>
									),
								)}
							</SelectContent>
						</Select>
						<span className="text-sm text-muted-foreground">
							of {totalPages}
						</span>
					</div>
				</div>
			)}
		</div>
	);
}
