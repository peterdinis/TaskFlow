import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "@tanstack/react-router";
import {
	LogIn,
	User,
	Lock,
	Mail,
	Eye,
	EyeOff,
	Check,
	X,
	Github,
	Chrome,
	Sparkles,
	ArrowRight,
	Loader2,
	Shield,
	AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { createFileRoute } from "@tanstack/react-router";

const mockLogin = async (
	email: string,
	password: string,
	rememberMe: boolean,
) => {
	await new Promise((resolve) => setTimeout(resolve, 1000));

	if (email === "demo@taskflow.com" && password === "demo123") {
		localStorage.setItem("auth_token", "demo_token");
		localStorage.setItem(
			"user",
			JSON.stringify({
				id: "demo-user-123",
				name: "Demo User",
				email: "demo@taskflow.com",
				isDemo: true,
			}),
		);
		return;
	}

	if (email && password.length >= 8) {
		localStorage.setItem("auth_token", "user_token");
		localStorage.setItem(
			"user",
			JSON.stringify({
				id: `user-${Date.now()}`,
				name: email.split("@")[0],
				email,
				isDemo: false,
			}),
		);
		return;
	}

	throw new Error("Invalid credentials");
};

const mockDemoLogin = async () => {
	await new Promise((resolve) => setTimeout(resolve, 800));

	localStorage.setItem("auth_token", "demo_token");
	localStorage.setItem(
		"user",
		JSON.stringify({
			id: "demo-user-123",
			name: "Demo User",
			email: "demo@taskflow.com",
			avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Demo",
			isDemo: true,
		}),
	);
};

const mockGoogleLogin = async () => {
	await new Promise((resolve) => setTimeout(resolve, 800));

	localStorage.setItem("auth_token", "google_token");
	localStorage.setItem(
		"user",
		JSON.stringify({
			id: "google-user-123",
			name: "Google User",
			email: "user@gmail.com",
			avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Google",
			isDemo: false,
		}),
	);
};

const mockGithubLogin = async () => {
	await new Promise((resolve) => setTimeout(resolve, 800));

	localStorage.setItem("auth_token", "github_token");
	localStorage.setItem(
		"user",
		JSON.stringify({
			id: "github-user-123",
			name: "GitHub User",
			email: "user@github.com",
			avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=GitHub",
			isDemo: false,
		}),
	);
};

// LoginForm Component
interface LoginFormProps {
	onLogin: (
		email: string,
		password: string,
		rememberMe: boolean,
	) => Promise<void>;
	onGoogleLogin?: () => Promise<void>;
	onGithubLogin?: () => Promise<void>;
	onDemoLogin?: () => Promise<void>;
	onSignup?: () => void;
	onForgotPassword?: () => void;
	isLoading?: boolean;
	error?: string | null;
	className?: string;
}

function LoginForm({
	onLogin,
	onGoogleLogin,
	onGithubLogin,
	onDemoLogin,
	onSignup,
	onForgotPassword,
	isLoading = false,
	error = null,
	className,
}: LoginFormProps) {
	const [isLoginMode, setIsLoginMode] = useState(true);
	const [showPassword, setShowPassword] = useState(false);
	const [rememberMe, setRememberMe] = useState(true);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [name, setName] = useState("");
	const [localError, setLocalError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	const validateForm = () => {
		setLocalError(null);

		if (!email.trim()) {
			setLocalError("Email is required");
			return false;
		}

		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			setLocalError("Please enter a valid email address");
			return false;
		}

		if (!password.trim()) {
			setLocalError("Password is required");
			return false;
		}

		if (!isLoginMode) {
			if (password.length < 8) {
				setLocalError("Password must be at least 8 characters");
				return false;
			}

			if (password !== confirmPassword) {
				setLocalError("Passwords do not match");
				return false;
			}

			if (!name.trim()) {
				setLocalError("Name is required");
				return false;
			}
		}

		return true;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		try {
			await onLogin(email, password, rememberMe);
			setSuccessMessage(
				isLoginMode ? "Welcome back!" : "Account created successfully!",
			);
			setTimeout(() => setSuccessMessage(null), 3000);
		} catch (err) {
			setLocalError(err instanceof Error ? err.message : "An error occurred");
		}
	};

	const handleGoogleLogin = async () => {
		if (onGoogleLogin) {
			try {
				await onGoogleLogin();
			} catch (err) {
				setLocalError(
					err instanceof Error ? err.message : "Google login failed",
				);
			}
		}
	};

	const handleGithubLogin = async () => {
		if (onGithubLogin) {
			try {
				await onGithubLogin();
			} catch (err) {
				setLocalError(
					err instanceof Error ? err.message : "GitHub login failed",
				);
			}
		}
	};

	const handleDemoLogin = async () => {
		if (onDemoLogin) {
			try {
				await onDemoLogin();
			} catch (err) {
				setLocalError(err instanceof Error ? err.message : "Demo login failed");
			}
		}
	};

	const toggleMode = () => {
		setIsLoginMode(!isLoginMode);
		setLocalError(null);
		setSuccessMessage(null);
	};

	const passwordStrength =
		password.length > 0
			? password.length < 8
				? "Weak"
				: /[A-Z]/.test(password) &&
						/[0-9]/.test(password) &&
						/[^A-Za-z0-9]/.test(password)
					? "Strong"
					: "Good"
			: null;

	const getPasswordStrengthColor = (strength: string | null) => {
		if (!strength) return "bg-muted";
		switch (strength) {
			case "Weak":
				return "bg-destructive";
			case "Good":
				return "bg-warning";
			case "Strong":
				return "bg-green-500";
			default:
				return "bg-muted";
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			className={cn("w-full max-w-md mx-auto", className)}
		>
			<div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
				{/* Header with gradient */}
				<div className="bg-gradient-to-r from-primary/90 to-primary p-6">
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
								<LogIn className="w-6 h-6 text-white" />
							</div>
							<div>
								<h2 className="text-2xl font-bold text-white">
									{isLoginMode ? "Welcome Back" : "Join TaskFlow"}
								</h2>
								<p className="text-white/80 text-sm">
									{isLoginMode
										? "Sign in to continue to your tasks"
										: "Create your account to get started"}
								</p>
							</div>
						</div>
						<Badge
							variant="secondary"
							className="bg-white/20 backdrop-blur-sm text-white border-0"
						>
							<Sparkles className="w-3 h-3 mr-1" />
							TaskFlow
						</Badge>
					</div>
				</div>

				<div className="p-6">
					{/* Social Login Buttons */}
					<div className="space-y-3 mb-6">
						<motion.button
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							onClick={handleGoogleLogin}
							disabled={isLoading}
							className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors disabled:opacity-50"
						>
							<Chrome className="w-5 h-5" />
							<span className="font-medium">Continue with Google</span>
						</motion.button>

						<motion.button
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							onClick={handleGithubLogin}
							disabled={isLoading}
							className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors disabled:opacity-50"
						>
							<Github className="w-5 h-5" />
							<span className="font-medium">Continue with GitHub</span>
						</motion.button>

						<motion.button
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							onClick={handleDemoLogin}
							disabled={isLoading}
							className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-border bg-warning/10 hover:bg-warning/20 text-warning-foreground transition-colors disabled:opacity-50"
						>
							<Shield className="w-5 h-5" />
							<span className="font-medium">Try Demo Account</span>
						</motion.button>
					</div>

					<div className="relative my-6">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-border" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-card px-2 text-muted-foreground">
								Or continue with email
							</span>
						</div>
					</div>

					{/* Error & Success Messages */}
					<AnimatePresence>
						{(error || localError) && (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: "auto" }}
								exit={{ opacity: 0, height: 0 }}
								className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20"
							>
								<div className="flex items-start gap-2">
									<AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
									<p className="text-sm text-destructive">
										{error || localError}
									</p>
								</div>
							</motion.div>
						)}
					</AnimatePresence>

					<AnimatePresence>
						{successMessage && (
							<motion.div
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.95 }}
								className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20"
							>
								<div className="flex items-start gap-2">
									<Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
									<p className="text-sm text-green-600">{successMessage}</p>
								</div>
							</motion.div>
						)}
					</AnimatePresence>

					{/* Form */}
					<form onSubmit={handleSubmit} className="space-y-4">
						<AnimatePresence mode="wait">
							{!isLoginMode && (
								<motion.div
									key="name-field"
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: "auto" }}
									exit={{ opacity: 0, height: 0 }}
									className="space-y-2"
								>
									<Label htmlFor="name" className="text-sm font-medium">
										Full Name
									</Label>
									<div className="relative">
										<User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
										<Input
											id="name"
											type="text"
											placeholder="John Doe"
											value={name}
											onChange={(e) => setName(e.target.value)}
											className="pl-10"
											disabled={isLoading}
										/>
									</div>
								</motion.div>
							)}
						</AnimatePresence>

						<div className="space-y-2">
							<Label htmlFor="email" className="text-sm font-medium">
								Email Address
							</Label>
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
								<Input
									id="email"
									type="email"
									placeholder="you@example.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="pl-10"
									disabled={isLoading}
								/>
							</div>
						</div>

						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label htmlFor="password" className="text-sm font-medium">
									Password
								</Label>
								{!isLoginMode && password && passwordStrength && (
									<div className="flex items-center gap-2">
										<div className="text-xs text-muted-foreground">
											{passwordStrength}
										</div>
										<div className="flex gap-1">
											{[1, 2, 3].map((i) => (
												<div
													key={i}
													className={cn(
														"w-2 h-2 rounded-full transition-all",
														passwordStrength === "Weak" && i === 1
															? getPasswordStrengthColor(passwordStrength)
															: passwordStrength === "Good" && i <= 2
																? getPasswordStrengthColor(passwordStrength)
																: passwordStrength === "Strong" && i <= 3
																	? getPasswordStrengthColor(passwordStrength)
																	: "bg-muted",
													)}
												/>
											))}
										</div>
									</div>
								)}
							</div>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									placeholder={
										isLoginMode ? "Enter your password" : "Create a password"
									}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="pl-10 pr-10"
									disabled={isLoading}
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
								>
									{showPassword ? (
										<EyeOff className="w-4 h-4" />
									) : (
										<Eye className="w-4 h-4" />
									)}
								</button>
							</div>
						</div>

						<AnimatePresence>
							{!isLoginMode && (
								<motion.div
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: "auto" }}
									exit={{ opacity: 0, height: 0 }}
									className="space-y-2"
								>
									<Label
										htmlFor="confirmPassword"
										className="text-sm font-medium"
									>
										Confirm Password
									</Label>
									<div className="relative">
										<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
										<Input
											id="confirmPassword"
											type={showPassword ? "text" : "password"}
											placeholder="Confirm your password"
											value={confirmPassword}
											onChange={(e) => setConfirmPassword(e.target.value)}
											className="pl-10"
											disabled={isLoading}
										/>
										{confirmPassword && (
											<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
												{password === confirmPassword ? (
													<Check className="w-4 h-4 text-green-500" />
												) : (
													<X className="w-4 h-4 text-destructive" />
												)}
											</div>
										)}
									</div>
								</motion.div>
							)}
						</AnimatePresence>

						{isLoginMode && (
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Switch
										id="remember-me"
										checked={rememberMe}
										onCheckedChange={setRememberMe}
										disabled={isLoading}
									/>
									<Label
										htmlFor="remember-me"
										className="text-sm text-muted-foreground"
									>
										Remember me
									</Label>
								</div>
								<button
									type="button"
									onClick={onForgotPassword}
									className="text-sm text-primary hover:text-primary/80 transition-colors"
									disabled={isLoading}
								>
									Forgot password?
								</button>
							</div>
						)}

						<motion.button
							type="submit"
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							disabled={isLoading}
							className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
						>
							{isLoading ? (
								<>
									<Loader2 className="w-5 h-5 animate-spin" />
									{isLoginMode ? "Signing in..." : "Creating account..."}
								</>
							) : (
								<>
									{isLoginMode ? "Sign In" : "Create Account"}
									<ArrowRight className="w-4 h-4" />
								</>
							)}
						</motion.button>
					</form>

					{/* Mode Toggle */}
					<div className="mt-6 pt-6 border-t border-border">
						<div className="text-center">
							<p className="text-sm text-muted-foreground">
								{isLoginMode
									? "Don't have an account?"
									: "Already have an account?"}
							</p>
							<motion.button
								type="button"
								onClick={toggleMode}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className="mt-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
								disabled={isLoading}
							>
								{isLoginMode ? "Create an account" : "Sign in instead"}
							</motion.button>
						</div>
					</div>

					{/* Features List */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.3 }}
						className="mt-6 pt-6 border-t border-border"
					>
						<h3 className="text-sm font-medium mb-3 text-center">
							Why TaskFlow?
						</h3>
						<div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
							<div className="flex items-center gap-2">
								<div className="w-2 h-2 rounded-full bg-primary" />
								<span>Smart Task Management</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="w-2 h-2 rounded-full bg-primary" />
								<span>Real-time Sync</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="w-2 h-2 rounded-full bg-primary" />
								<span>Cross-platform</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="w-2 h-2 rounded-full bg-primary" />
								<span>100% Free</span>
							</div>
						</div>
					</motion.div>
				</div>
			</div>

			{/* Privacy Notice */}
			<div className="mt-4 text-center">
				<p className="text-xs text-muted-foreground">
					By continuing, you agree to our{" "}
					<button className="underline hover:text-foreground transition-colors">
						Terms of Service
					</button>{" "}
					and{" "}
					<button className="underline hover:text-foreground transition-colors">
						Privacy Policy
					</button>
				</p>
			</div>
		</motion.div>
	);
}

// LoginPage Component
function LoginPage({
	onLogin,
	onGoogleLogin,
	onGithubLogin,
	onDemoLogin,
	isLoading,
	error,
}: {
	onLogin: (
		email: string,
		password: string,
		rememberMe: boolean,
	) => Promise<void>;
	onGoogleLogin?: () => Promise<void>;
	onGithubLogin?: () => Promise<void>;
	onDemoLogin?: () => Promise<void>;
	isLoading?: boolean;
	error?: string | null;
}) {
	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
			<div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />

			<div className="relative w-full max-w-6xl mx-auto">
				<div className="grid lg:grid-cols-2 gap-12 items-center">
					{/* Left side - Brand & Features */}
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5 }}
						className="space-y-8"
					>
						<div className="flex items-center gap-3">
							<div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
								<span className="text-primary-foreground font-bold text-xl">
									TF
								</span>
							</div>
							<div>
								<h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
									TaskFlow
								</h1>
								<p className="text-muted-foreground">
									Your intelligent task manager
								</p>
							</div>
						</div>

						<div className="space-y-6">
							<h2 className="text-2xl font-semibold">
								Organize your work and life, finally.
							</h2>

							<div className="space-y-4">
								{[
									{
										title: "Smart Task Management",
										description:
											"AI-powered suggestions and intelligent organization",
										icon: "🧠",
									},
									{
										title: "Real-time Collaboration",
										description: "Work together with your team seamlessly",
										icon: "👥",
									},
									{
										title: "Cross-platform Sync",
										description: "Access your tasks anywhere, on any device",
										icon: "📱",
									},
									{
										title: "Productivity Insights",
										description: "Track progress and optimize your workflow",
										icon: "📈",
									},
								].map((feature, index) => (
									<motion.div
										key={feature.title}
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: index * 0.1 }}
										className="flex items-start gap-4"
									>
										<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg">
											{feature.icon}
										</div>
										<div>
											<h3 className="font-medium">{feature.title}</h3>
											<p className="text-sm text-muted-foreground">
												{feature.description}
											</p>
										</div>
									</motion.div>
								))}
							</div>
						</div>

						<div className="pt-8 border-t border-border">
							<div className="flex items-center gap-4">
								{[
									{ label: "10K+", description: "Active Users" },
									{ label: "99%", description: "Satisfaction" },
									{ label: "24/7", description: "Support" },
								].map((stat) => (
									<div key={stat.label} className="text-center">
										<div className="text-2xl font-bold text-primary">
											{stat.label}
										</div>
										<div className="text-xs text-muted-foreground">
											{stat.description}
										</div>
									</div>
								))}
							</div>
						</div>
					</motion.div>

					{/* Right side - Login Form */}
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
						className="flex justify-center"
					>
						<LoginForm
							onLogin={onLogin}
							onGoogleLogin={onGoogleLogin}
							onGithubLogin={onGithubLogin}
							onDemoLogin={onDemoLogin}
							isLoading={isLoading}
							error={error}
							className="w-full max-w-md"
						/>
					</motion.div>
				</div>
			</div>
		</div>
	);
}

// Main Route Component
export const Route = createFileRoute("/login")({
	component: LoginRouteComponent,
});

function LoginRouteComponent() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleLogin = async (
		email: string,
		password: string,
		rememberMe: boolean,
	) => {
		setIsLoading(true);
		setError(null);

		try {
			await mockLogin(email, password, rememberMe);
			await router.navigate({ to: "/dashboard" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Login failed");
		} finally {
			setIsLoading(false);
		}
	};

	const handleGoogleLogin = async () => {
		setIsLoading(true);
		setError(null);

		try {
			await mockGoogleLogin();
			await router.navigate({ to: "/dashboard" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Google login failed");
		} finally {
			setIsLoading(false);
		}
	};

	const handleGithubLogin = async () => {
		setIsLoading(true);
		setError(null);

		try {
			await mockGithubLogin();
			await router.navigate({ to: "/dashboard" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "GitHub login failed");
		} finally {
			setIsLoading(false);
		}
	};

	const handleDemoLogin = async () => {
		setIsLoading(true);
		setError(null);

		try {
			await mockDemoLogin();
			await router.navigate({ to: "/dashboard" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Demo login failed");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		const token = localStorage.getItem("auth_token");
		if (token) {
			router.navigate({ to: "/dashboard" });
		}
	}, [router]);

	return (
		<LoginPage
			onLogin={handleLogin}
			onGoogleLogin={handleGoogleLogin}
			onGithubLogin={handleGithubLogin}
			onDemoLogin={handleDemoLogin}
			isLoading={isLoading}
			error={error}
		/>
	);
}
