import z from "zod";

export const createNotificationSchema = z.object({
    userId: z.string(),
    type: z.enum(["success", "reminder", "alert"]),
    title: z.string().min(1).max(100),
    message: z.string().min(1).max(500),
});

export const updateNotificationSchema = z.object({
    id: z.string(),
    isRead: z.boolean().optional(),
});
