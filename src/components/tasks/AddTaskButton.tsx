import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Flag, X, Calendar, Tag, Clock, Hash, Check } from "lucide-react";
import { Priority } from "@/types/task";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

interface AddTaskButtonProps {
	onAdd: (data: any) => void;
	projects?: Array<{ id: string; name: string; color: string }>;
	tags?: string[];
	defaultProject?: string;
}

const priorityOptions: {
	value: Priority;
	label: string;
	color: string;
	icon: string;
}[] = [
	{ value: "high", label: "Priority 1", color: "bg-priority-high", icon: "🔴" },
	{
		value: "medium",
		label: "Priority 2",
		color: "bg-priority-medium",
		icon: "🟡",
	},
	{ value: "low", label: "Priority 3", color: "bg-priority-low", icon: "🔵" },
	{ value: "none", label: "No Priority", color: "bg-muted", icon: "⚪" },
];

export function AddTaskButton({
	onAdd,
	projects = [],
	tags = [],
	defaultProject,
}: AddTaskButtonProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [priority, setPriority] = useState<Priority>("none");
	const [dueDate, setDueDate] = useState<Date>();
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [selectedProject, setSelectedProject] = useState<string>(
		defaultProject || "",
	);
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [customTag, setCustomTag] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (isOpen && inputRef.current) {
			setTimeout(() => inputRef.current?.focus(), 100);
		}
	}, [isOpen]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (title.trim()) {
			onAdd({
				title: title.trim(),
				priority,
				dueDate,
				tags: selectedTags,
				description: description.trim(),
				projectId: selectedProject || undefined,
			});
			resetForm();
		}
	};

	const handleQuickAdd = () => {
		if (title.trim()) {
			onAdd({
				title: title.trim(),
				priority,
				dueDate,
				tags: selectedTags,
				description: description.trim(),
				projectId: selectedProject || undefined,
			});
			resetForm();
		}
	};

	const resetForm = () => {
		setTitle("");
		setDescription("");
		setPriority("none");
		setDueDate(undefined);
		setSelectedTags([]);
		setSelectedProject(defaultProject || "");
		setIsOpen(false);
		setIsExpanded(false);
		setCustomTag("");
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Escape") {
			resetForm();
		}

		if (e.key === "Enter" && e.metaKey) {
			handleSubmit(e);
		}

		if (e.key === "Tab" && !e.shiftKey && title.trim()) {
			e.preventDefault();
			setIsExpanded(true);
		}
	};

	const toggleTag = (tag: string) => {
		setSelectedTags((prev) =>
			prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
		);
	};

	const addCustomTag = () => {
		if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
			setSelectedTags((prev) => [...prev, customTag.trim()]);
			setCustomTag("");
		}
	};

	const quickDueDates = [
		{
			label: "Today",
			value: () => {
				const date = new Date();
				date.setHours(23, 59, 59);
				return date;
			},
		},
		{
			label: "Tomorrow",
			value: () => {
				const date = new Date();
				date.setDate(date.getDate() + 1);
				date.setHours(23, 59, 59);
				return date;
			},
		},
		{
			label: "Next Week",
			value: () => {
				const date = new Date();
				date.setDate(date.getDate() + 7);
				date.setHours(23, 59, 59);
				return date;
			},
		},
		{ label: "No Date", value: () => undefined },
	];

	const isFormValid = title.trim().length > 0;

	return (
		<>
			{/* Backdrop */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
						onClick={() => setIsOpen(false)}
					/>
				)}
			</AnimatePresence>

			{/* Floating Input Card */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: 20, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 20, scale: 0.95 }}
						transition={{ type: "spring", stiffness: 400, damping: 30 }}
						className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
					>
						<form
							onSubmit={handleSubmit}
							className="bg-card rounded-lg shadow-2xl border border-border overflow-hidden"
						>
							{/* Header */}
							<div className="px-4 py-3 border-b border-border bg-card/95">
								<div className="flex items-center justify-between mb-2">
									<h3 className="text-sm font-medium text-foreground">
										New Task
									</h3>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={() => setIsOpen(false)}
										className="h-7 w-7"
									>
										<X className="w-3 h-3" />
									</Button>
								</div>
							</div>

							{/* Main Input */}
							<div className="p-4">
								<div className="mb-3">
									<Input
										ref={inputRef}
										type="text"
										value={title}
										onChange={(e) => setTitle(e.target.value)}
										onKeyDown={handleKeyDown}
										placeholder="What needs to be done?"
										className="bg-transparent border-0 px-0 h-8 text-base placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
									/>
								</div>

								<AnimatePresence>
									{(isExpanded ||
										description ||
										dueDate ||
										selectedTags.length > 0 ||
										selectedProject) && (
										<motion.div
											initial={{ opacity: 0, height: 0 }}
											animate={{ opacity: 1, height: "auto" }}
											exit={{ opacity: 0, height: 0 }}
											className="space-y-4 overflow-hidden"
										>
											{/* Description */}
											<div>
												<textarea
													value={description}
													onChange={(e) => setDescription(e.target.value)}
													placeholder="Add description..."
													className="w-full min-h-[80px] bg-transparent text-sm text-foreground placeholder:text-muted-foreground border border-border rounded-lg p-3 resize-none outline-none focus:ring-1 focus:ring-primary"
												/>
											</div>

											{/* Quick Options */}
											<div className="flex flex-wrap gap-2">
												{/* Project Selection */}
												{projects.length > 0 && (
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button
																variant="outline"
																size="sm"
																className="h-7 gap-1"
															>
																<Hash className="w-3 h-3" />
																{(selectedProject &&
																	projects.find((p) => p.id === selectedProject)
																		?.name) ||
																	"Project"}
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="start" className="w-48">
															<DropdownMenuItem
																onClick={() => setSelectedProject("")}
															>
																No Project
															</DropdownMenuItem>
															<DropdownMenuSeparator />
															{projects.map((project) => (
																<DropdownMenuItem
																	key={project.id}
																	onClick={() => setSelectedProject(project.id)}
																	className="flex items-center gap-2"
																>
																	<div
																		className="w-2 h-2 rounded-full"
																		style={{ backgroundColor: project.color }}
																	/>
																	{project.name}
																</DropdownMenuItem>
															))}
														</DropdownMenuContent>
													</DropdownMenu>
												)}

												{/* Due Date */}
												<Popover
													open={showDatePicker}
													onOpenChange={setShowDatePicker}
												>
													<PopoverTrigger asChild>
														<Button
															variant="outline"
															size="sm"
															className="h-7 gap-1"
														>
															<Calendar className="w-3 h-3" />
															{dueDate ? format(dueDate, "MMM d") : "Due date"}
														</Button>
													</PopoverTrigger>
													<PopoverContent className="w-auto p-0" align="start">
														<div className="p-2">
															<div className="space-y-1">
																{quickDueDates.map((quickDate) => (
																	<Button
																		key={quickDate.label}
																		variant="ghost"
																		size="sm"
																		className="w-full justify-start text-sm"
																		onClick={() => {
																			setDueDate(quickDate.value());
																			setShowDatePicker(false);
																		}}
																	>
																		{quickDate.label}
																	</Button>
																))}
															</div>
															<div className="border-t my-2" />
															<CalendarComponent
																mode="single"
																selected={dueDate}
																onSelect={setDueDate}
																className="rounded-md border-0"
															/>
														</div>
													</PopoverContent>
												</Popover>

												{/* Tags */}
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button
															variant="outline"
															size="sm"
															className="h-7 gap-1"
														>
															<Tag className="w-3 h-3" />
															{selectedTags.length > 0
																? `${selectedTags.length} tags`
																: "Tags"}
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent
														align="start"
														className="w-64 p-2"
													>
														<div className="space-y-2">
															{/* Existing Tags */}
															<div className="space-y-1">
																<p className="text-xs text-muted-foreground px-2">
																	Select tags
																</p>
																<div className="flex flex-wrap gap-1">
																	{tags.map((tag) => (
																		<Badge
																			key={tag}
																			variant={
																				selectedTags.includes(tag)
																					? "default"
																					: "outline"
																			}
																			className="cursor-pointer"
																			onClick={() => toggleTag(tag)}
																		>
																			{selectedTags.includes(tag) && (
																				<Check className="w-3 h-3 mr-1" />
																			)}
																			{tag}
																		</Badge>
																	))}
																</div>
															</div>

															{/* Add Custom Tag */}
															<div className="pt-2 border-t">
																<p className="text-xs text-muted-foreground px-2 mb-2">
																	Add new tag
																</p>
																<div className="flex gap-1">
																	<Input
																		value={customTag}
																		onChange={(e) =>
																			setCustomTag(e.target.value)
																		}
																		placeholder="New tag..."
																		className="h-7 text-xs"
																		onKeyDown={(e) =>
																			e.key === "Enter" && addCustomTag()
																		}
																	/>
																	<Button
																		size="sm"
																		className="h-7"
																		onClick={addCustomTag}
																		disabled={!customTag.trim()}
																	>
																		Add
																	</Button>
																</div>
															</div>
														</div>
													</DropdownMenuContent>
												</DropdownMenu>
											</div>

											{/* Selected Tags Display */}
											{selectedTags.length > 0 && (
												<div className="flex flex-wrap gap-1">
													{selectedTags.map((tag) => (
														<Badge
															key={tag}
															variant="secondary"
															className="gap-1"
														>
															{tag}
															<X
																className="w-3 h-3 cursor-pointer"
																onClick={() => toggleTag(tag)}
															/>
														</Badge>
													))}
												</div>
											)}
										</motion.div>
									)}
								</AnimatePresence>
							</div>

							{/* Footer */}
							<div className="px-4 py-3 border-t border-border bg-muted/30 flex items-center justify-between">
								{/* Priority Buttons */}
								<div className="flex items-center gap-1">
									{priorityOptions.map((option) => (
										<motion.button
											key={option.value}
											type="button"
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
											onClick={() => setPriority(option.value)}
											className={cn(
												"flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all",
												priority === option.value
													? `${option.color} text-primary-foreground`
													: "bg-muted text-muted-foreground hover:text-foreground",
											)}
										>
											<span className="text-xs">{option.icon}</span>
											<span className="hidden sm:inline">{option.label}</span>
										</motion.button>
									))}
								</div>

								{/* Action Buttons */}
								<div className="flex items-center gap-2">
									{isExpanded && (
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={() => setIsExpanded(false)}
											className="h-7 text-xs"
										>
											Simplify
										</Button>
									)}
									<Button
										type="submit"
										size="sm"
										disabled={!isFormValid}
										className={cn(
											"h-7 text-xs font-medium",
											isFormValid && "shadow-sm",
										)}
									>
										Add Task
									</Button>
								</div>
							</div>

							{/* Keyboard Shortcuts */}
							<div className="px-4 py-2 border-t border-border bg-card text-xs text-muted-foreground">
								<div className="flex items-center justify-between">
									<span>
										Press{" "}
										<kbd className="px-1.5 py-0.5 rounded bg-muted mx-1">
											Tab
										</kbd>{" "}
										for more options
									</span>
									<span>
										Press{" "}
										<kbd className="px-1.5 py-0.5 rounded bg-muted mx-1">
											⌘⏎
										</kbd>{" "}
										to save
									</span>
								</div>
							</div>
						</form>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Floating Action Button */}
			<motion.div
				className="fixed bottom-6 right-6 z-50"
				initial={false}
				animate={isOpen ? { scale: 0 } : { scale: 1 }}
				transition={{ type: "spring", stiffness: 400, damping: 25 }}
			>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<motion.button
							className="w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-2xl flex items-center justify-center"
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.9 }}
						>
							<Plus className="w-6 h-6" />
						</motion.button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-48">
						<DropdownMenuItem onClick={() => setIsOpen(true)}>
							<Plus className="w-4 h-4 mr-2" />
							New Task
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={() => {
								setPriority("high");
								setIsOpen(true);
							}}
						>
							<Flag className="w-4 h-4 mr-2 text-priority-high" />
							Add Priority Task
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => {
								setDueDate(new Date());
								setIsOpen(true);
							}}
						>
							<Clock className="w-4 h-4 mr-2 text-primary" />
							Add Task with Deadline
						</DropdownMenuItem>
						{projects.length > 0 && defaultProject && (
							<DropdownMenuItem
								onClick={() => {
									setSelectedProject(defaultProject);
									setIsOpen(true);
								}}
							>
								<Hash className="w-4 h-4 mr-2" />
								Add to Current Project
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</motion.div>

			{/* Quick Add Button (appears when typing) */}
			<AnimatePresence>
				{title.trim() && isOpen && !isExpanded && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 20 }}
						className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
					>
						<Button onClick={handleQuickAdd} className="shadow-lg">
							<Plus className="w-4 h-4 mr-2" />
							Quick Add Task
						</Button>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
