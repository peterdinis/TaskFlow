import { useRouter } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { LoginFormData, loginSchema } from "@/schemas/authSchemas";

export function LoginPage() {
	const router = useRouter();
	const auth = useAuth();
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
			rememberMe: false,
		},
	});

	const onSubmit = async (data: LoginFormData) => {
		setIsLoading(true);
		setError("");

		try {
			await auth.login(data.email, data.password, data.rememberMe);
			router.navigate(
				{
					to: "/dashboard"
				}
			)
		} catch (err: any) {
			setError(err.message || "Prihlasovanie zlyhalo");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
				<div>
					<h2 className="text-3xl font-bold text-center">Prihláste sa</h2>
				</div>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					<div>
						<label className="block text-sm font-medium">Email</label>
						<input
							{...register("email")}
							type="email"
							className="mt-1 block w-full px-3 py-2 border rounded-md"
							placeholder="vas@email.com"
						/>
						{errors.email && (
							<p className="text-red-600 text-sm mt-1">
								{errors.email.message}
							</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium">Heslo</label>
						<input
							{...register("password")}
							type="password"
							className="mt-1 block w-full px-3 py-2 border rounded-md"
							placeholder="••••••••"
						/>
						{errors.password && (
							<p className="text-red-600 text-sm mt-1">
								{errors.password.message}
							</p>
						)}
					</div>

					<div className="flex items-center">
						<input
							{...register("rememberMe")}
							type="checkbox"
							className="h-4 w-4"
						/>
						<label className="ml-2 text-sm">Zapamätať si ma</label>
					</div>

					{error && (
						<div className="bg-red-50 text-red-600 p-3 rounded">{error}</div>
					)}

					<button
						type="submit"
						disabled={isLoading}
						className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
					>
						{isLoading ? "Prihlasujem..." : "Prihlásiť sa"}
					</button>
				</form>
			</div>
		</div>
	);
}
