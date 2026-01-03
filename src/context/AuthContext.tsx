import {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";
import { useRouter } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Cookies from "js-cookie";

interface User {
	id: string;
	email: string;
	name: string;
	role: string;
	createdAt: number;
}

interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	login: (
		email: string,
		password: string,
		rememberMe?: boolean,
	) => Promise<void>;
	register: (name: string, email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	updateProfile: (data: {
		name: string;
		email: string;
		currentPassword?: string;
		newPassword?: string;
	}) => Promise<{
		user: { id: string; email: string; name: string; role: string };
	}>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const router = useRouter();

	// Convex queries and mutations
	const userQuery = useQuery(api.auth.getCurrentUser, {
		sessionToken: Cookies.get("session_token") || undefined,
	});

	const loginMutation = useMutation(api.auth.login);
	const registerMutation = useMutation(api.auth.register);
	const logoutMutation = useMutation(api.auth.logout);
	const updateProfileMutation = useMutation(api.auth.updateProfile);

	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Sync user from query
	useEffect(() => {
		setIsLoading(userQuery === undefined);
		if (userQuery) {
			setUser(userQuery as User);
		} else if (userQuery === null) {
			setUser(null);
		}
	}, [userQuery]);

	const login = async (email: string, password: string, rememberMe = false) => {
		try {
			const result = await loginMutation({ email, password, rememberMe });

			// Save session token to cookies
			Cookies.set("session_token", result.sessionToken, {
				expires: rememberMe ? 30 : 1,
				secure: process.env.NODE_ENV === "production",
				sameSite: "strict",
			});

			// User will be updated automatically via the query
			await router.invalidate();
			router.navigate({ to: "/" });
		} catch (error) {
			console.error("Login failed:", error);
			throw error;
		}
	};

	const register = async (name: string, email: string, password: string) => {
		try {
			const result = await registerMutation({ name, email, password });

			Cookies.set("session_token", result.sessionToken, {
				expires: 30,
				secure: process.env.NODE_ENV === "production",
				sameSite: "strict",
			});

			await router.invalidate();
			router.navigate({ to: "/" });
		} catch (error) {
			console.error("Registration failed:", error);
			throw error;
		}
	};

	const logout = async () => {
		const sessionToken = Cookies.get("session_token");

		if (sessionToken) {
			try {
				await logoutMutation({ sessionToken });
			} catch (error) {
				console.error("Logout error:", error);
			}
		}

		Cookies.remove("session_token");
		await router.invalidate();
		router.navigate({ to: "/login" });
	};

	const updateProfile = async (data: {
		name: string;
		email: string;
		currentPassword?: string;
		newPassword?: string;
	}) => {
		const sessionToken = Cookies.get("session_token");

		if (!sessionToken) {
			throw new Error("Nie ste prihlásený");
		}

		try {
			const result = await updateProfileMutation({
				sessionToken,
				...data,
			});

			return result;
		} catch (error) {
			console.error("Profile update failed:", error);
			throw error;
		}
	};

	const value = {
		user,
		isLoading,
		login,
		register,
		logout,
		updateProfile,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
