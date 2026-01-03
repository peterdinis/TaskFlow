import {
    createContext,
    useContext,
    useState,
    useEffect,
    useMemo,
    ReactNode,
} from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "./AuthContext";
import { Id } from "../../convex/_generated/dataModel";

export interface Notification {
    id: string;
    type: "success" | "reminder" | "alert";
    title: string;
    message: string;
    isRead: boolean;
    createdAt: number;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    clearAll: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
    undefined,
);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();

    // Queries
    const rawNotifications = useQuery(
        api.notifications.getNotifications,
        user ? { userId: user.id as Id<"users"> } : "skip",
    );

    // Mutations
    const markReadMutation = useMutation(api.notifications.markRead);
    const markAllReadMutation = useMutation(api.notifications.markAllRead);
    const deleteNotificationMutation = useMutation(
        api.notifications.deleteNotification,
    );
    const clearAllMutation = useMutation(api.notifications.clearAll);

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (rawNotifications !== undefined) {
            if (rawNotifications === null) {
                setNotifications([]);
            } else {
                const mapped: Notification[] = rawNotifications.map((n) => ({
                    id: n._id,
                    type: n.type,
                    title: n.title,
                    message: n.message,
                    isRead: n.isRead,
                    createdAt: n.createdAt,
                }));
                setNotifications(mapped);
            }
            setIsLoading(false);
        }
    }, [rawNotifications]);

    const unreadCount = useMemo(() => {
        return notifications.filter((n) => !n.isRead).length;
    }, [notifications]);

    const markAsRead = async (id: string) => {
        await markReadMutation({ id: id as Id<"notifications"> });
    };

    const markAllAsRead = async () => {
        if (!user) return;
        await markAllReadMutation({ userId: user.id as Id<"users"> });
    };

    const deleteNotification = async (id: string) => {
        await deleteNotificationMutation({ id: id as Id<"notifications"> });
    };

    const clearAll = async () => {
        if (!user) return;
        await clearAllMutation({ userId: user.id as Id<"users"> });
    };

    const value = {
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error(
            "useNotifications must be used within a NotificationProvider",
        );
    }
    return context;
}
