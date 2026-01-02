import { z } from "zod";

export const loginSchema = z.object({
	email: z.string().min(1, "Email je povinný").email("Neplatný formát emailu"),
	password: z
		.string()
		.min(1, "Heslo je povinné")
		.min(8, "Heslo musí mať aspoň 8 znakov"),
	rememberMe: z.boolean().optional(),
});

export const registerSchema = z
	.object({
		name: z
			.string()
			.min(1, "Meno je povinné")
			.min(2, "Meno musí mať aspoň 2 znaky")
			.max(50, "Meno je príliš dlhé"),
		email: z
			.string()
			.min(1, "Email je povinný")
			.email("Neplatný formát emailu")
			.max(100, "Email je príliš dlhý"),
		password: z
			.string()
			.min(1, "Heslo je povinné")
			.min(8, "Heslo musí mať aspoň 8 znakov")
			.regex(/[A-Z]/, "Heslo musí obsahovať aspoň jedno veľké písmeno")
			.regex(/[a-z]/, "Heslo musí obsahovať aspoň jedno malé písmeno")
			.regex(/[0-9]/, "Heslo musí obsahovať aspoň jednu číslicu")
			.regex(/[^A-Za-z0-9]/, "Heslo musí obsahovať aspoň jeden špeciálny znak"),
		confirmPassword: z.string().min(1, "Potvrdenie hesla je povinné"),
		terms: z.boolean().refine((val) => val === true, {
			message: "Musíte súhlasiť s podmienkami",
		}),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Heslá sa nezhodujú",
		path: ["confirmPassword"],
	});

export const profileSchema = z
	.object({
		name: z
			.string()
			.min(1, "Meno je povinné")
			.min(2, "Meno musí mať aspoň 2 znaky")
			.max(50, "Meno je príliš dlhé"),
		email: z
			.string()
			.min(1, "Email je povinný")
			.email("Neplatný formát emailu"),
		currentPassword: z.string().optional(),
		newPassword: z
			.string()
			.min(8, "Heslo musí mať aspoň 8 znakov")
			.regex(/[A-Z]/, "Heslo musí obsahovať aspoň jedno veľké písmeno")
			.regex(/[a-z]/, "Heslo musí obsahovať aspoň jedno malé písmeno")
			.regex(/[0-9]/, "Heslo musí obsahovať aspoň jednu číslicu")
			.optional(),
		confirmNewPassword: z.string().optional(),
	})
	.refine(
		(data) => {
			if (data.newPassword && !data.currentPassword) {
				return false;
			}
			return true;
		},
		{
			message: "Aktuálne heslo je potrebné pre zmenu hesla",
			path: ["currentPassword"],
		},
	)
	.refine(
		(data) => {
			if (data.newPassword && data.newPassword !== data.confirmNewPassword) {
				return false;
			}
			return true;
		},
		{
			message: "Nové heslá sa nezhodujú",
			path: ["confirmNewPassword"],
		},
	);

export const forgotPasswordSchema = z.object({
	email: z.string().min(1, "Email je povinný").email("Neplatný formát emailu"),
});

export const resetPasswordSchema = z
	.object({
		password: z
			.string()
			.min(1, "Heslo je povinné")
			.min(8, "Heslo musí mať aspoň 8 znakov")
			.regex(/[A-Z]/, "Heslo musí obsahovať aspoň jedno veľké písmeno")
			.regex(/[a-z]/, "Heslo musí obsahovať aspoň jedno malé písmeno")
			.regex(/[0-9]/, "Heslo musí obsahovať aspoň jednu číslicu"),
		confirmPassword: z.string().min(1, "Potvrdenie hesla je povinné"),
		token: z.string().min(1, "Token je povinný"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Heslá sa nezhodujú",
		path: ["confirmPassword"],
	});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
