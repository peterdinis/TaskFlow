import { Navigate } from "@tanstack/react-router";
import { ReactNode } from "react";
import { AnimatedLoader } from "@/components/shared/AnimatedComponent";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
	children: ReactNode;
	requiredRole?: string;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
	const { user, isLoading } = useAuth();

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<AnimatedLoader />
			</div>
		);
	}

	if (!user) {
		return <Navigate to="/login" />;
	}

	return <>{children}</>;
}
