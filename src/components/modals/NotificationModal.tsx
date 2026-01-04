import { motion, AnimatePresence } from "framer-motion";
import {
	X,
	Bell,
	CheckCircle2,
	Clock,
	AlertCircle,
	Trash2,
	Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef, useCallback } from "react";
import { useNotifications } from "@/context/NotificationContext";
import { formatDistanceToNow } from "date-fns";

interface NotificationsModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const iconMap = {
	success: CheckCircle2,
	reminder: Clock,
	alert: AlertCircle,
};

const colorMap = {
	success: "text-green-500 bg-green-500/10",
	reminder: "text-priority-medium bg-priority-medium/10",
	alert: "text-priority-high bg-priority-high/10",
};

export function NotificationsModal({
	isOpen,
	onClose,
}: NotificationsModalProps) {
	const {
		notifications,
		unreadCount,
		isLoading,
		markAsRead,
		markAllAsRead,
		deleteNotification,
		clearAll,
		createNotification,
	} = useNotifications();
	
	const [isDeleting, setIsDeleting] = useState<string | null>(null);
	const [newNotifications, setNewNotifications] = useState<Set<string>>(new Set());
	const [hasNewNotifications, setHasNewNotifications] = useState(false);
	const [showSuccessFeedback, setShowSuccessFeedback] = useState(false);
	const [successMessage, setSuccessMessage] = useState("");
	const [pulsingNotification, setPulsingNotification] = useState<string | null>(null);
	
	const previousNotificationsRef = useRef(notifications);
	const previousUnreadCountRef = useRef(unreadCount);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	// Detect new notifications with improved logic
	useEffect(() => {
		if (!isOpen || notifications.length === 0) {
			previousNotificationsRef.current = notifications;
			return;
		}

		const currentIds = new Set(notifications.map(n => n.id));
		const previousIds = new Set(previousNotificationsRef.current.map(n => n.id));
		
		// Find new notifications
		const newIds = [...currentIds].filter(id => !previousIds.has(id));
		
		if (newIds.length > 0) {
			// Play sound for new notifications
			if (audioRef.current) {
				audioRef.current.currentTime = 0;
				audioRef.current.play().catch(console.error);
			}
			
			// Add new notifications to highlight set
			setNewNotifications(prev => {
				const updated = new Set(prev);
				newIds.forEach(id => updated.add(id));
				return updated;
			});
			
			// Show "new" indicator
			setHasNewNotifications(true);
			
			// Pulse animation for the newest notification
			const newestId = notifications[0]?.id;
			if (newestId) {
				setPulsingNotification(newestId);
				const timer = setTimeout(() => {
					setPulsingNotification(null);
				}, 1500);
				return () => clearTimeout(timer);
			}
			
			// Auto-clear highlight after 3 seconds
			const clearTimer = setTimeout(() => {
				setNewNotifications(new Set());
				setHasNewNotifications(false);
			}, 3000);
			
			return () => clearTimeout(clearTimer);
		}
		
		previousNotificationsRef.current = notifications;
	}, [notifications, isOpen]);

	// Detect when unread count changes
	useEffect(() => {
		if (isOpen && previousUnreadCountRef.current > unreadCount) {
			// User marked notifications as read
			setSuccessMessage(`Marked ${previousUnreadCountRef.current - unreadCount} notifications as read`);
			setShowSuccessFeedback(true);
			setTimeout(() => setShowSuccessFeedback(false), 2000);
		}
		previousUnreadCountRef.current = unreadCount;
	}, [unreadCount, isOpen]);

	const showFeedback = useCallback((message: string) => {
		setSuccessMessage(message);
		setShowSuccessFeedback(true);
		setTimeout(() => setShowSuccessFeedback(false), 1500);
	}, []);

	const handleMarkAllAsRead = async () => {
		if (unreadCount === 0) return;
		
		try {
			await markAllAsRead();
			showFeedback(`Marked ${unreadCount} notifications as read`);
		} catch (error) {
			console.error("Failed to mark all as read:", error);
			showFeedback("Failed to mark as read");
		}
	};

	const handleMarkAsRead = async (id: string, title?: string) => {
		try {
			await markAsRead(id);
			if (title) {
				showFeedback(`Marked "${title}" as read`);
			}
		} catch (error) {
			console.error("Failed to mark as read:", error);
		}
	};

	const handleDeleteNotification = async (id: string, title?: string) => {
		setIsDeleting(id);
		try {
			await deleteNotification(id);
			if (title) {
				showFeedback(`Deleted "${title}"`);
			}
		} catch (error) {
			console.error("Failed to delete notification:", error);
			showFeedback("Failed to delete");
		} finally {
			setIsDeleting(null);
		}
	};

	const handleClearAll = async () => {
		if (notifications.length === 0) return;
		
		try {
			await clearAll();
			showFeedback(`Cleared ${notifications.length} notifications`);
		} catch (error) {
			console.error("Failed to clear all notifications:", error);
			showFeedback("Failed to clear all");
		}
	};

	const handleAddTestNotification = async (type: "success" | "reminder" | "alert") => {
		const titles = {
			success: "Task Completed",
			reminder: "Meeting Reminder",
			alert: "Important Update"
		};
		
		const messages = {
			success: "Your task 'Design Review' has been completed successfully.",
			reminder: "Team meeting starts in 30 minutes. Don't forget to prepare!",
			alert: "System maintenance scheduled for tonight at 2 AM. Please save your work."
		};

		await createNotification(
			type,
			titles[type],
			messages[type]
		);
		showFeedback(`Added ${type} notification`);
	};

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!isOpen) return;
			
			if (e.key === "Escape") {
				onClose();
			}
			
			if (e.key === "r" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				handleMarkAllAsRead();
			}
			
			if ((e.key === "Delete" || e.key === "Backspace") && e.metaKey) {
				e.preventDefault();
				if (notifications.length > 0) {
					handleClearAll();
				}
			}
			
			// Test shortcuts (only in development)
			if (process.env.NODE_ENV === "development") {
				if (e.key === "1" && e.altKey) {
					e.preventDefault();
					handleAddTestNotification("success");
				}
				if (e.key === "2" && e.altKey) {
					e.preventDefault();
					handleAddTestNotification("reminder");
				}
				if (e.key === "3" && e.altKey) {
					e.preventDefault();
					handleAddTestNotification("alert");
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, notifications.length]);

	// Clear highlights when closing modal
	useEffect(() => {
		if (!isOpen) {
			setNewNotifications(new Set());
			setHasNewNotifications(false);
			setPulsingNotification(null);
		}
	}, [isOpen]);

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
						onClick={onClose}
					/>
					
					{/* Success feedback - improved */}
					<AnimatePresence>
						{showSuccessFeedback && (
							<motion.div
								initial={{ opacity: 0, y: -20, scale: 0.9 }}
								animate={{ opacity: 1, y: 0, scale: 1 }}
								exit={{ opacity: 0, y: -20, scale: 0.9 }}
								className="fixed top-20 right-4 z-50 px-4 py-3 bg-green-500 text-white rounded-lg shadow-xl flex items-center gap-2"
							>
								<CheckCircle2 className="w-4 h-4" />
								<span className="text-sm font-medium">{successMessage}</span>
							</motion.div>
						)}
					</AnimatePresence>
					
					{/* New notifications indicator */}
					<AnimatePresence>
						{hasNewNotifications && (
							<motion.div
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
								className="fixed top-28 right-4 z-50 px-3 py-1.5 bg-primary/90 text-primary-foreground rounded-full text-xs font-medium flex items-center gap-1 shadow-lg"
							>
								<Sparkles className="w-3 h-3 animate-pulse" />
								New notifications
							</motion.div>
						)}
					</AnimatePresence>
					
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: 20 }}
						transition={{ type: "spring", stiffness: 400, damping: 30 }}
						className="fixed top-0 right-0 h-full w-full max-w-md z-50"
					>
						<div className="h-full bg-card border-l border-border flex flex-col shadow-2xl">
							{/* Header */}
							<div className="flex items-center justify-between px-5 py-4 border-b border-border">
								<div className="flex items-center gap-3">
									<div className="relative">
										<Bell className="w-5 h-5 text-primary" />
										{unreadCount > 0 && (
											<motion.span
												initial={{ scale: 0 }}
												animate={{ scale: 1 }}
												className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center shadow-sm"
											>
												{unreadCount > 9 ? "9+" : unreadCount}
											</motion.span>
										)}
									</div>
									<h2 className="font-semibold text-foreground">
										Notifications
									</h2>
									{isLoading && (
										<motion.span
											animate={{ opacity: [0.5, 1, 0.5] }}
											transition={{ repeat: Infinity, duration: 1.5 }}
											className="text-xs text-muted-foreground"
										>
											Loading...
										</motion.span>
									)}
								</div>
								<div className="flex items-center gap-2">
									{process.env.NODE_ENV === "development" && (
										<button
											onClick={() => handleAddTestNotification("success")}
											className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors"
											title="Add test notification (Alt+1)"
										>
											Test
										</button>
									)}
									
									{notifications.length > 0 && (
										<motion.button
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
											onClick={handleClearAll}
											className="text-xs px-3 py-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
											disabled={isLoading}
											title="Clear all notifications (⌘Delete)"
										>
											Clear all
										</motion.button>
									)}
									<motion.button
										whileHover={{ scale: 1.1 }}
										whileTap={{ scale: 0.9 }}
										onClick={onClose}
										className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
										title="Close (Esc)"
									>
										<X className="w-5 h-5" />
									</motion.button>
								</div>
							</div>

							{/* Notifications list */}
							<div className="flex-1 overflow-y-auto">
								{isLoading ? (
									<div className="flex flex-col items-center justify-center h-full px-5 py-10">
										<div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mb-4" />
										<p className="text-sm text-muted-foreground">Loading notifications...</p>
									</div>
								) : notifications.length === 0 ? (
									<div className="flex flex-col items-center justify-center h-full px-5 py-10 text-center">
										<motion.div
											animate={{ rotate: [0, 10, -10, 0] }}
											transition={{ repeat: Infinity, duration: 3 }}
										>
											<Bell className="w-12 h-12 text-muted-foreground/40 mb-4" />
										</motion.div>
										<h3 className="font-medium text-foreground/80">
											All caught up!
										</h3>
										<p className="text-sm text-muted-foreground mt-1">
											No notifications at the moment.
										</p>
									</div>
								) : (
									<AnimatePresence mode="popLayout">
										{notifications.map((notification) => {
											const Icon = iconMap[notification.type];
											const isDeletingItem = isDeleting === notification.id;
											const isNew = newNotifications.has(notification.id);
											const isPulsing = pulsingNotification === notification.id;

											return (
												<motion.div
													key={notification.id}
													layout
													initial={{ opacity: 0, x: -20 }}
													animate={{ 
														opacity: isDeletingItem ? 0 : 1, 
														x: isDeletingItem ? 20 : 0,
														scale: isDeletingItem ? 0.9 : 1,
														borderColor: isNew ? "rgb(59 130 246 / 0.5)" : "transparent",
													}}
													exit={{ opacity: 0, x: 20 }}
													transition={{
														type: "spring",
														stiffness: 400,
														damping: 30,
														opacity: { duration: 0.2 },
													}}
													onClick={() =>
														!notification.isRead &&
														handleMarkAsRead(notification.id, notification.title)
													}
													className={cn(
														"group relative px-5 py-4 border-l-4 border-transparent hover:bg-muted/50 transition-all duration-300 cursor-pointer",
														!notification.isRead && "bg-primary/5",
														isDeletingItem && "opacity-50 pointer-events-none",
														isNew && "border-l-primary bg-primary/10 animate-pulse-border",
														isPulsing && "animate-pulse-glow"
													)}
												>
													{isNew && (
														<motion.div
															initial={{ scale: 0 }}
															animate={{ scale: 1 }}
															className="absolute -left-1 top-3 w-2 h-2 rounded-full bg-primary"
														/>
													)}
													
													<div className="flex gap-3">
														<motion.div
															animate={isPulsing ? { scale: [1, 1.1, 1] } : {}}
															transition={isPulsing ? { repeat: 3, duration: 0.5 } : {}}
															className={cn(
																"w-8 h-8 rounded-full flex items-center justify-center shrink-0",
																colorMap[notification.type],
															)}
														>
															<Icon className="w-4 h-4" />
														</motion.div>
														<div className="flex-1 min-w-0">
															<div className="flex items-center gap-2">
																<p className="font-medium text-sm text-foreground">
																	{notification.title}
																</p>
																{!notification.isRead && (
																	<motion.div
																		initial={{ scale: 0 }}
																		animate={{ scale: 1 }}
																		className="w-2 h-2 rounded-full bg-primary"
																	/>
																)}
																{isNew && (
																	<motion.span
																		initial={{ opacity: 0 }}
																		animate={{ opacity: 1 }}
																		className="text-xs px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground"
																	>
																		New
																	</motion.span>
																)}
															</div>
															<p className="text-sm text-muted-foreground mt-0.5">
																{notification.message}
															</p>
															<p className="text-xs text-muted-foreground/70 mt-1">
																{formatDistanceToNow(
																	new Date(notification.createdAt),
																	{ addSuffix: true },
																)}
															</p>
														</div>
													</div>

													{/* Delete button */}
													<motion.button
														initial={{ opacity: 0, scale: 0.8 }}
														animate={{ opacity: 0.6 }}
														whileHover={{ opacity: 1, scale: 1.1 }}
														whileTap={{ scale: 0.9 }}
														onClick={(e) => {
															e.stopPropagation();
															handleDeleteNotification(notification.id, notification.title);
														}}
														className="absolute top-3 right-5 p-1.5 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
														disabled={isDeletingItem}
														title="Delete notification"
													>
														<Trash2 className="w-3.5 h-3.5" />
													</motion.button>

													{!notification.isRead && (
														<motion.div
															layoutId={`read-indicator-${notification.id}`}
															className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
														/>
													)}
												</motion.div>
											);
										})}
									</AnimatePresence>
								)}
							</div>

							{/* Footer */}
							{notifications.length > 0 && !isLoading && (
								<div className="px-5 py-3 border-t border-border bg-muted/20">
									<div className="flex gap-2 items-center justify-between mb-2">
										<button
											onClick={handleMarkAllAsRead}
											disabled={unreadCount === 0}
											className={cn(
												"flex-1 py-2 text-sm font-medium transition-all rounded-lg flex items-center justify-center gap-2",
												unreadCount > 0
													? "text-primary hover:text-primary/80 hover:bg-primary/10 active:scale-95"
													: "text-muted-foreground/50 cursor-not-allowed",
											)}
											title="Mark all as read (⌘R)"
										>
											<CheckCircle2 className="w-4 h-4" />
											Mark all as read
											{unreadCount > 0 && (
												<span className="text-xs opacity-70">
													({unreadCount})
												</span>
											)}
										</button>
									</div>
									
									{/* Stats */}
									<div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
										<span className="flex items-center gap-1">
											<Bell className="w-3 h-3" />
											Total: {notifications.length}
										</span>
										<span className={cn(
											"px-2 py-0.5 rounded-full",
											unreadCount > 0 
												? "bg-primary/10 text-primary" 
												: "bg-green-500/10 text-green-500"
										)}>
											{unreadCount > 0 ? `${unreadCount} unread` : "All read"}
										</span>
										<span>
											Latest: {notifications.length > 0 && 
												formatDistanceToNow(new Date(notifications[0].createdAt), {
													addSuffix: true
												})
											}
										</span>
									</div>
								</div>
							)}
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}