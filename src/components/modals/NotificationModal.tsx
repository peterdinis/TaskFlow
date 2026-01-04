import { motion, AnimatePresence } from "framer-motion";
import {
	X,
	Bell,
	CheckCircle2,
	Clock,
	AlertCircle,
	Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
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
	const [hasNewNotifications, setHasNewNotifications] = useState(false);
	const previousUnreadCountRef = useRef(unreadCount);
	const [testMode, setTestMode] = useState(false);

	// Monitor new notifications
	useEffect(() => {
		if (isOpen && previousUnreadCountRef.current < unreadCount) {
			setHasNewNotifications(true);
			// Reset after 2 seconds
			const timer = setTimeout(() => {
				setHasNewNotifications(false);
			}, 2000);
			return () => clearTimeout(timer);
		}
		previousUnreadCountRef.current = unreadCount;
	}, [unreadCount, isOpen]);

	const handleMarkAllAsRead = async () => {
		if (unreadCount === 0) return;
		
		try {
			await markAllAsRead();
			// Show success feedback
			setHasNewNotifications(true);
			setTimeout(() => setHasNewNotifications(false), 1000);
		} catch (error) {
			console.error("Failed to mark all as read:", error);
			// You could show an error notification here
		}
	};

	const handleMarkAsRead = async (id: string) => {
		try {
			await markAsRead(id);
		} catch (error) {
			console.error("Failed to mark as read:", error);
		}
	};

	const handleDeleteNotification = async (id: string) => {
		setIsDeleting(id);
		try {
			await deleteNotification(id);
		} catch (error) {
			console.error("Failed to delete notification:", error);
			setIsDeleting(null);
		}
	};

	const handleClearAll = async () => {
		if (notifications.length === 0) return;
		
		try {
			await clearAll();
			// Show feedback
			setHasNewNotifications(true);
			setTimeout(() => setHasNewNotifications(false), 1000);
		} catch (error) {
			console.error("Failed to clear all notifications:", error);
		}
	};

	// Test function to add sample notifications
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
	};

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!isOpen) return;
			
			if (e.key === "Escape") {
				onClose();
			}
			
			if (e.key === "r" && e.metaKey) {
				e.preventDefault();
				handleMarkAllAsRead();
			}
			
			if (e.key === "Delete" || e.key === "Backspace") {
				if (notifications.length > 0) {
					handleClearAll();
				}
			}
			
			// Test shortcuts (only in development)
			if (process.env.NODE_ENV === "development") {
				if (e.key === "1" && e.ctrlKey) {
					e.preventDefault();
					handleAddTestNotification("success");
				}
				if (e.key === "2" && e.ctrlKey) {
					e.preventDefault();
					handleAddTestNotification("reminder");
				}
				if (e.key === "3" && e.ctrlKey) {
					e.preventDefault();
					handleAddTestNotification("alert");
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, notifications.length]);

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
					
					{/* Success feedback */}
					<AnimatePresence>
						{hasNewNotifications && (
							<motion.div
								initial={{ opacity: 0, y: -20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								className="fixed top-20 right-4 z-50 px-4 py-2 bg-green-500 text-white rounded-lg shadow-lg"
							>
								Operation successful!
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
						<div className="h-full bg-card border-l border-border flex flex-col shadow-xl">
							{/* Header */}
							<div className="flex items-center justify-between px-5 py-4 border-b border-border">
								<div className="flex items-center gap-3">
									<div className="relative">
										<Bell className="w-5 h-5 text-primary" />
										{unreadCount > 0 && (
											<motion.span
												initial={{ scale: 0 }}
												animate={{ scale: 1 }}
												className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center"
											>
												{unreadCount > 9 ? "9+" : unreadCount}
											</motion.span>
										)}
									</div>
									<h2 className="font-semibold text-foreground">
										Notifications
									</h2>
									{isLoading && (
										<span className="text-xs text-muted-foreground animate-pulse">
											Loading...
										</span>
									)}
								</div>
								<div className="flex items-center gap-2">
									{/* Test buttons (only in development) */}
									{process.env.NODE_ENV === "development" && (
										<>
											<button
												onClick={() => setTestMode(!testMode)}
												className="text-xs px-2 py-1 rounded border border-border text-muted-foreground hover:text-foreground"
											>
												Test
											</button>
											{testMode && (
												<div className="flex gap-1">
													<button
														onClick={() => handleAddTestNotification("success")}
														className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-500 hover:bg-green-500/20"
													>
														S
													</button>
													<button
														onClick={() => handleAddTestNotification("reminder")}
														className="text-xs px-2 py-1 rounded bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
													>
														R
													</button>
													<button
														onClick={() => handleAddTestNotification("alert")}
														className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20"
													>
														A
													</button>
												</div>
											)}
										</>
									)}
									
									{notifications.length > 0 && (
										<motion.button
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
											onClick={handleClearAll}
											className="text-xs px-3 py-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
											disabled={isLoading}
										>
											Clear all
										</motion.button>
									)}
									<motion.button
										whileHover={{ scale: 1.1 }}
										whileTap={{ scale: 0.9 }}
										onClick={onClose}
										className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
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
										<Bell className="w-12 h-12 text-muted-foreground/40 mb-4" />
										<h3 className="font-medium text-foreground/80">
											No notifications
										</h3>
										<p className="text-sm text-muted-foreground mt-1">
											You're all caught up!
										</p>
										{process.env.NODE_ENV === "development" && (
											<div className="mt-4 space-y-2">
												<p className="text-xs text-muted-foreground">
													Test shortcuts (in development):
												</p>
												<div className="flex gap-2 text-xs">
													<kbd className="px-2 py-1 rounded bg-muted">Ctrl+1</kbd>
													<span>Success</span>
													<kbd className="px-2 py-1 rounded bg-muted">Ctrl+2</kbd>
													<span>Reminder</span>
													<kbd className="px-2 py-1 rounded bg-muted">Ctrl+3</kbd>
													<span>Alert</span>
												</div>
											</div>
										)}
									</div>
								) : (
									<AnimatePresence>
										{notifications.map((notification) => {
											const Icon = iconMap[notification.type];
											const isDeletingItem = isDeleting === notification.id;

											return (
												<motion.div
													key={notification.id}
													layout
													initial={{ opacity: 0, x: -10 }}
													animate={{
														opacity: isDeletingItem ? 0 : 1,
														x: isDeletingItem ? 20 : 0,
														scale: isDeletingItem ? 0.9 : 1,
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
														handleMarkAsRead(notification.id)
													}
													className={cn(
														"group relative px-5 py-4 border-b border-border hover:bg-muted/50 transition-colors cursor-pointer",
														!notification.isRead && "bg-primary/5",
														isDeletingItem && "opacity-50 pointer-events-none",
													)}
												>
													<div className="flex gap-3">
														<div
															className={cn(
																"w-8 h-8 rounded-full flex items-center justify-center shrink-0",
																colorMap[notification.type],
															)}
														>
															<Icon className="w-4 h-4" />
														</div>
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
															</div>
															<p className="text-sm text-muted-foreground mt-0.5">
																{notification.message}
															</p>
															<p className="text-xs text-muted-foreground/70 mt-1">
																{formatDistanceToNow(
																	new Date(notification.createdAt),
																	{
																		addSuffix: true,
																	},
																)}
															</p>
														</div>
													</div>

													{/* Delete button */}
													<motion.button
														initial={{ opacity: 0, scale: 0.8 }}
														animate={{ opacity: 0.5 }}
														whileHover={{ opacity: 1, scale: 1.1 }}
														whileTap={{ scale: 0.9 }}
														onClick={(e) => {
															e.stopPropagation();
															handleDeleteNotification(notification.id);
														}}
														className="absolute top-3 right-5 p-1.5 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
														disabled={isDeletingItem}
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
								<div className="px-5 py-3 border-t border-border">
									<div className="flex gap-2 items-center justify-between">
										<button
											onClick={handleMarkAllAsRead}
											disabled={unreadCount === 0}
											className={cn(
												"flex-1 py-2 text-sm font-medium transition-colors rounded-lg flex items-center justify-center gap-2",
												unreadCount > 0
													? "text-primary hover:text-primary/80 hover:bg-primary/10"
													: "text-muted-foreground/50 cursor-not-allowed",
											)}
										>
											<CheckCircle2 className="w-4 h-4" />
											Mark all as read
											{unreadCount > 0 && (
												<span className="text-xs opacity-70">
													({unreadCount})
												</span>
											)}
										</button>
										
										{/* Keyboard shortcuts hint */}
										<div className="text-xs text-muted-foreground text-right">
											<div>⌘R: Mark all read</div>
											<div>Del: Clear all</div>
											<div>Esc: Close</div>
										</div>
									</div>
									
									{/* Stats */}
									<div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
										<span>Total: {notifications.length}</span>
										<span>Unread: {unreadCount}</span>
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