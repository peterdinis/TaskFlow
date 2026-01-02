import { LoginPage } from "@/components/auth/LoginForm";
import { PendingComponent } from "@/components/shared/PendingComponent";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
	component: LoginPage,
	pendingComponent: PendingComponent,
});
