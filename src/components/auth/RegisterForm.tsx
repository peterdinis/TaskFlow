import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@tanstack/react-router";
import { Eye, EyeOff, User, Mail, Lock, Check } from "lucide-react";
import { RegisterFormData, registerSchema } from "@/schemas/authSchemas";
import { useAuth } from "@/context/AuthContext";

const RegisterForm: FC = () => {
	const router = useRouter();
	const auth = useAuth();
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [registrationSuccess, setRegistrationSuccess] = useState(false);

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors, isValid, isDirty },
	} = useForm<RegisterFormData>({
		resolver: zodResolver(registerSchema),
		mode: "onChange",
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
			terms: false,
		},
	});

	const password = watch("password");
	const confirmPassword = watch("confirmPassword");

	const passwordStrength = () => {
		if (!password) return 0;
		let strength = 0;
		if (password.length >= 8) strength += 25;
		if (/[A-Z]/.test(password)) strength += 25;
		if (/[a-z]/.test(password)) strength += 25;
		if (/[0-9]/.test(password)) strength += 25;
		return strength;
	};

	const getStrengthColor = (strength: number) => {
		if (strength < 50) return "bg-red-500";
		if (strength < 75) return "bg-yellow-500";
		return "bg-green-500";
	};

	const onSubmit = async (data: RegisterFormData) => {
		setIsLoading(true);
		setError("");

		try {
			await auth.register(data.name, data.email, data.password);
			setRegistrationSuccess(true);

			// Automatické presmerovanie po 3 sekundách
			setTimeout(() => {
				router.navigate({ to: "/" });
			}, 3000);
		} catch (err: any) {
			setError(err.message || "Registrácia zlyhala. Skúste to prosím znova.");
			setRegistrationSuccess(false);
		} finally {
			setIsLoading(false);
		}
	};

	if (registrationSuccess) {
		return (
			<div className="max-w-md w-full mx-auto p-8 bg-white rounded-lg shadow-md">
				<div className="text-center">
					<div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
						<Check className="h-6 w-6 text-green-600" />
					</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-2">
						Registrácia úspešná!
					</h2>
					<p className="text-gray-600 mb-6">
						Váš účet bol úspešne vytvorený. Ste automaticky prihlásený.
					</p>
					<p className="text-sm text-gray-500">
						Presmerovávam na domovskú stránku...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-md w-full mx-auto p-8 bg-white rounded-lg shadow-md">
			<div className="text-center mb-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">Vytvoriť účet</h1>
				<p className="text-gray-600">Vyplňte údaje pre registráciu</p>
			</div>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
				{/* Meno */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Celé meno
					</label>
					<div className="relative">
						<User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
						<input
							{...register("name")}
							type="text"
							autoComplete="name"
							className={`pl-10 w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
								errors.name
									? "border-red-300 focus:border-red-300"
									: "border-gray-300 focus:border-blue-500"
							}`}
							placeholder="Janko Mrkvička"
						/>
					</div>
					{errors.name && (
						<p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
					)}
				</div>

				{/* Email */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Emailová adresa
					</label>
					<div className="relative">
						<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
						<input
							{...register("email")}
							type="email"
							autoComplete="email"
							className={`pl-10 w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
								errors.email
									? "border-red-300 focus:border-red-300"
									: "border-gray-300 focus:border-blue-500"
							}`}
							placeholder="janko@example.com"
						/>
					</div>
					{errors.email && (
						<p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
					)}
				</div>

				{/* Heslo */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Heslo
					</label>
					<div className="relative">
						<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
						<input
							{...register("password")}
							type={showPassword ? "text" : "password"}
							autoComplete="new-password"
							className={`pl-10 pr-10 w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
								errors.password
									? "border-red-300 focus:border-red-300"
									: "border-gray-300 focus:border-blue-500"
							}`}
							placeholder="••••••••"
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
						>
							{showPassword ? (
								<EyeOff className="h-5 w-5" />
							) : (
								<Eye className="h-5 w-5" />
							)}
						</button>
					</div>

					{/* Indikátor sily hesla */}
					{password && (
						<div className="mt-2">
							<div className="flex justify-between mb-1">
								<span className="text-sm text-gray-600">Sila hesla:</span>
								<span className="text-sm font-medium">
									{passwordStrength()}%
								</span>
							</div>
							<div className="h-2 bg-gray-200 rounded-full overflow-hidden">
								<div
									className={`h-full ${getStrengthColor(
										passwordStrength(),
									)} transition-all duration-300`}
									style={{ width: `${passwordStrength()}%` }}
								/>
							</div>
							<div className="mt-2 text-xs text-gray-500 space-y-1">
								<p
									className={
										password.length >= 8 ? "text-green-600" : "text-gray-400"
									}
								>
									✓ Aspoň 8 znakov
								</p>
								<p
									className={
										/[A-Z]/.test(password) ? "text-green-600" : "text-gray-400"
									}
								>
									✓ Aspoň jedno veľké písmeno
								</p>
								<p
									className={
										/[a-z]/.test(password) ? "text-green-600" : "text-gray-400"
									}
								>
									✓ Aspoň jedno malé písmeno
								</p>
								<p
									className={
										/[0-9]/.test(password) ? "text-green-600" : "text-gray-400"
									}
								>
									✓ Aspoň jedna číslica
								</p>
							</div>
						</div>
					)}

					{errors.password && (
						<p className="mt-1 text-sm text-red-600">
							{errors.password.message}
						</p>
					)}
				</div>

				{/* Potvrdenie hesla */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Potvrdenie hesla
					</label>
					<div className="relative">
						<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
						<input
							{...register("confirmPassword")}
							type={showConfirmPassword ? "text" : "password"}
							autoComplete="new-password"
							className={`pl-10 pr-10 w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
								errors.confirmPassword
									? "border-red-300 focus:border-red-300"
									: "border-gray-300 focus:border-blue-500"
							}`}
							placeholder="••••••••"
						/>
						<button
							type="button"
							onClick={() => setShowConfirmPassword(!showConfirmPassword)}
							className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
						>
							{showConfirmPassword ? (
								<EyeOff className="h-5 w-5" />
							) : (
								<Eye className="h-5 w-5" />
							)}
						</button>
					</div>

					{/* Indikátor zhody hesiel */}
					{confirmPassword && password && (
						<div className="mt-2">
							<p
								className={`text-sm ${
									password === confirmPassword
										? "text-green-600"
										: "text-red-600"
								}`}
							>
								{password === confirmPassword
									? "✓ Heslá sa zhodujú"
									: "✗ Heslá sa nezhodujú"}
							</p>
						</div>
					)}

					{errors.confirmPassword && (
						<p className="mt-1 text-sm text-red-600">
							{errors.confirmPassword.message}
						</p>
					)}
				</div>

				{/* Súhlas s podmienkami */}
				<div>
					<label className="flex items-start space-x-3 cursor-pointer">
						<input
							{...register("terms")}
							type="checkbox"
							className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
						/>
						<span className="text-sm text-gray-700">
							Súhlasím s{" "}
							<a
								href="/terms"
								className="text-blue-600 hover:text-blue-500 underline"
								target="_blank"
								rel="noopener noreferrer"
							>
								podmienkami používania
							</a>{" "}
							a{" "}
							<a
								href="/privacy"
								className="text-blue-600 hover:text-blue-500 underline"
								target="_blank"
								rel="noopener noreferrer"
							>
								ochranou osobných údajov
							</a>
						</span>
					</label>
					{errors.terms && (
						<p className="mt-1 text-sm text-red-600">{errors.terms.message}</p>
					)}
				</div>

				{/* Chybová správa */}
				{error && (
					<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
						<div className="flex">
							<div className="flex-shrink-0">
								<svg
									className="h-5 w-5 text-red-400"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fillRule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
							<div className="ml-3">
								<p className="text-sm text-red-700">{error}</p>
							</div>
						</div>
					</div>
				)}

				{/* Tlačidlo registrácie */}
				<div>
					<button
						type="submit"
						disabled={isLoading || !isValid || !isDirty}
						className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						{isLoading ? (
							<>
								<svg
									className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									/>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									/>
								</svg>
								Vytváram účet...
							</>
						) : (
							"Vytvoriť účet"
						)}
					</button>
				</div>

				{/* Odkaz na prihlásenie */}
				<div className="text-center pt-4 border-t border-gray-200">
					<p className="text-sm text-gray-600">
						Máte už účet?{" "}
						<button
							type="button"
							onClick={() => router.navigate({ to: "/login" })}
							className="font-medium text-blue-600 hover:text-blue-500"
						>
							Prihláste sa
						</button>
					</p>
				</div>
			</form>

			{/* GDPR a bezpečnostná poznámka */}
			<div className="mt-8 p-4 bg-gray-50 rounded-lg">
				<h3 className="text-sm font-medium text-gray-900 mb-2">
					Bezpečnosť vašich údajov
				</h3>
				<ul className="text-xs text-gray-600 space-y-1">
					<li className="flex items-start">
						<Check className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
						<span>Vaše heslo je šifrované pomocou bcrypt</span>
					</li>
					<li className="flex items-start">
						<Check className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
						<span>Vaše údaje sú uložené v bezpečnej databáze</span>
					</li>
					<li className="flex items-start">
						<Check className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
						<span>Komunikácia je šifrovaná pomocou HTTPS</span>
					</li>
				</ul>
			</div>
		</div>
	);
};

export default RegisterForm;
