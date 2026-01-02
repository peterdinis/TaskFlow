import RegisterForm from "@/components/auth/RegisterForm";
import { PendingComponent } from "@/components/shared/PendingComponent";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/register")({
	component: RegisterForm,
	pendingComponent: PendingComponent,
});
