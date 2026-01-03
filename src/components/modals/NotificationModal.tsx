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
import { useState } from "react";
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
		markAsRead,
		markAllAsRead,
		deleteNotification,
		clearAll,
	} = useNotifications();
	const [isDeleting, setIsDeleting] = useState<string | null>(null);

	const handleMarkAllAsRead = async () => {
		await markAllAsRead();
	};

	const handleMarkAsRead = async (id: string) => {
		await markAsRead(id);
	};

	const handleDeleteNotification = async (id: string) => {
		setIsDeleting(id);
		await deleteNotification(id);
		setIsDeleting(null);
	};

	const handleClearAll = async () => {
		await clearAll();
	};

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
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: 20 }}
						transition={{ type: "spring", stiffness: 400, damping: 30 }}
						className="fixed top-0 right-0 h-full w-full max-w-md z-50"
					>
						<div className="h-full bg-card border-l border-border flex flex-col">
							<div className="flex items-center justify-between px-5 py-4 border-b border-border">
								<div className="flex items-center gap-3">
									<Bell className="w-5 h-5 text-primary" />
									<h2 className="font-semibold text-foreground">
										Notifications
									</h2>
									{unreadCount > 0 && (
										<span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
											{unreadCount}
										</span>
									)}
								</div>
								<div className="flex items-center gap-2">
									{notifications.length > 0 && (
										<motion.button
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
											onClick={handleClearAll}
											className="text-xs px-3 py-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
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

							<div className="flex-1 overflow-y-auto">
								{notifications.length === 0 ? (
									<div className="flex flex-col items-center justify-center h-full px-5 py-10 text-center">
										<Bell className="w-12 h-12 text-muted-foreground/40 mb-4" />
										<h3 className="font-medium text-foreground/80">
											No notifications
										</h3>
										<p className="text-sm text-muted-foreground mt-1">
											You're all caught up!
										</p>
									</div>
								) : (
									notifications.map((notification, _) => {
										const Icon = iconMap[notification.type];
										const isDeletingItem = isDeleting === notification.id;

										return (
											<motion.div
												key={notification.id}
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
													isDeletingItem && "opacity-50",
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
																<div className="w-2 h-2 rounded-full bg-primary" />
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

												{/* Delete button - appears on hover */}
												<motion.button
													initial={{ opacity: 0, scale: 0.8 }}
													whileHover={{ scale: 1.1 }}
													whileTap={{ scale: 0.9 }}
													onClick={(e) => {
														e.stopPropagation();
														handleDeleteNotification(notification.id);
													}}
													className="absolute top-3 right-5 p-1.5 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
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
									})
								)}
							</div>

							{notifications.length > 0 && (
								<div className="px-5 py-3 border-t border-border">
									<div className="flex gap-2">
										<button
											onClick={handleMarkAllAsRead}
											disabled={unreadCount === 0}
											className={cn(
												"flex-1 py-2 text-sm font-medium transition-colors rounded-lg",
												unreadCount > 0
													? "text-primary hover:text-primary/80 hover:bg-primary/10"
													: "text-muted-foreground/50 cursor-not-allowed",
											)}
										>
											Mark all as read
										</button>
										{unreadCount > 0 && (
											<div className="flex items-center px-3 text-xs text-muted-foreground">
												{unreadCount} unread
											</div>
										)}
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
