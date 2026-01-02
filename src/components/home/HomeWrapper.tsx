import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
	ArrowRight,
	Sparkles,
	Target,
	Play,
	Menu,
	X,
	Users,
	Heart,
	Star,
	Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STATS = [
	{ value: "500K+", label: "Active Users", icon: Users },
	{ value: "98%", label: "Satisfaction", icon: Heart },
	{ value: "4.9", label: "Rating", icon: Star },
	{ value: "24/7", label: "Support", icon: Clock },
] as const;

export function HomeWrapper() {
	const navigate = useNavigate();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isScrolled, setIsScrolled] = useState(false);
	const featuresRef = useRef<HTMLElement>(null);
	const pricingRef = useRef<HTMLElement>(null);
	const testimonialsRef = useRef<HTMLElement>(null);

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 50);
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const handleGetStarted = useCallback(() => {
		navigate({ to: "/register" });
	}, [navigate]);

	const handleLogin = useCallback(() => {
		navigate({ to: "/login" });
	}, [navigate]);

	const scrollToSection = useCallback((sectionId: string) => {
		let element: HTMLElement | null = null;

		switch (sectionId) {
			case "features":
				element = featuresRef.current;
				break;
			case "pricing":
				element = pricingRef.current;
				break;
			case "testimonials":
				element = testimonialsRef.current;
				break;
			default:
				element = document.getElementById(sectionId);
		}

		if (element) {
			element.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});
			setIsMenuOpen(false);
		}
	}, []);

	return (
		<div className="min-h-screen bg-linear-to-b from-background via-background to-primary/5">
			{/* Header */}
			<header
				className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
					isScrolled
						? "bg-background/95 backdrop-blur-lg border-border/50 shadow-sm"
						: "bg-transparent border-transparent"
				}`}
			>
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 rounded-lg bg-linear-to-r from-primary to-primary/60 flex items-center justify-center">
								<span className="text-primary-foreground font-bold text-sm">
									TF
								</span>
							</div>
							<span className="font-bold text-xl bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
								TaskFlow
							</span>
						</div>

						<div className="flex items-center gap-4">
							<Button
								variant="ghost"
								onClick={handleLogin}
								className="hidden sm:inline-flex"
							>
								Sign In
							</Button>
							<Button onClick={handleGetStarted} className="gap-2">
								Get Started Free
								<ArrowRight className="w-4 h-4" />
							</Button>

							<button
								onClick={() => setIsMenuOpen(!isMenuOpen)}
								className="md:hidden p-2"
							>
								{isMenuOpen ? (
									<X className="w-6 h-6" />
								) : (
									<Menu className="w-6 h-6" />
								)}
							</button>
						</div>
					</div>
				</div>

				{/* Mobile Menu */}
				{isMenuOpen && (
					<div className="md:hidden border-t border-border bg-background/95 backdrop-blur-lg">
						<div className="container mx-auto px-4 py-4">
							<div className="flex flex-col gap-4">
								{["Features", "Pricing", "Testimonials"].map((item) => (
									<button
										key={item}
										onClick={() => scrollToSection(item.toLowerCase())}
										className="py-2 text-left font-medium hover:text-primary transition-colors"
									>
										{item}
									</button>
								))}
								<Button
									variant="outline"
									onClick={handleLogin}
									className="mt-2"
								>
									Sign In
								</Button>
							</div>
						</div>
					</div>
				)}
			</header>

			{/* Hero Section */}
			<section className="relative pt-32 pb-20 px-4 overflow-hidden">
				<div className="container mx-auto max-w-6xl">
					<div className="text-center">
						<Badge className="mb-6 px-4 py-1.5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
							<Sparkles className="w-3 h-3 mr-2" />
							Trusted by 500,000+ teams worldwide
						</Badge>

						<h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
							Organize your work
							<span className="block bg-linear-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
								and life, finally.
							</span>
						</h1>

						<p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
							TaskFlow brings all your tasks, teammates, and tools together in
							one place. Keep everything in sync across your entire
							organization.
						</p>

						<div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
							<Button
								size="lg"
								onClick={handleGetStarted}
								className="px-8 py-6 text-lg gap-3"
							>
								Start for free
								<ArrowRight className="w-5 h-5" />
							</Button>
							<Button
								size="lg"
								variant="outline"
								className="px-8 py-6 text-lg gap-3"
								onClick={() => scrollToSection("features")}
							>
								<Play className="w-5 h-5" />
								Watch demo
							</Button>
						</div>

						{/* Hero image/illustration */}
						<div className="relative mx-auto max-w-4xl">
							<div className="absolute inset-0 bg-linear-to-r from-primary/20 to-primary/10 blur-3xl rounded-3xl" />
							<div className="relative bg-card border border-border rounded-2xl p-8 shadow-2xl">
								<div className="grid grid-cols-3 gap-4 mb-4">
									{["Today", "Upcoming", "Projects"].map((item) => (
										<div key={item} className="bg-muted/50 rounded-lg p-4">
											<div className="flex items-center justify-between mb-2">
												<span className="font-medium">{item}</span>
												<Badge variant="outline" className="text-xs">
													12
												</Badge>
											</div>
											<div className="space-y-2">
												{[...Array(3)].map((_, j) => (
													<div
														key={j}
														className="h-2 bg-muted rounded-full"
														style={{
															width: `${60 + j * 20}%`,
														}}
													/>
												))}
											</div>
										</div>
									))}
								</div>
								<div className="bg-muted/30 rounded-lg p-6">
									<div className="flex items-center justify-between mb-4">
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
												<Target className="w-5 h-5 text-primary" />
											</div>
											<div>
												<div className="font-medium">Marketing Campaign</div>
												<div className="text-sm text-muted-foreground">
													4 tasks completed
												</div>
											</div>
										</div>
										<div className="flex gap-2">
											{[1, 2, 3].map((i) => (
												<div
													key={i}
													className="w-8 h-8 rounded-full bg-muted"
												/>
											))}
										</div>
									</div>
									<div className="space-y-3">
										{[...Array(4)].map((_, i) => (
											<div key={i} className="flex items-center gap-3">
												<div className="w-4 h-4 rounded-full border-2 border-primary/30" />
												<div
													className="h-3 bg-muted rounded-full"
													style={{
														width: `${70 + i * 10}%`,
													}}
												/>
											</div>
										))}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Stats Section */}
			<section className="py-20 px-4 bg-muted/30">
				<div className="container mx-auto max-w-6xl">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-8">
						{STATS.map((stat) => {
							const Icon = stat.icon;
							return (
								<div key={stat.label} className="text-center">
									<div className="flex justify-center mb-4">
										<div className="p-3 rounded-full bg-primary/10">
											<Icon className="w-6 h-6 text-primary" />
										</div>
									</div>
									<div className="text-3xl font-bold mb-2">{stat.value}</div>
									<div className="text-muted-foreground">{stat.label}</div>
								</div>
							);
						})}
					</div>
				</div>
			</section>
		</div>
	);
}
