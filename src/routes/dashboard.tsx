import DashboardWrapper from "@/components/dashboard/DashboardWrapper";
import { AnimatedLoader } from "@/components/shared/AnimatedComponent";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
	component: RouteComponent,
	pendingComponent: AnimatedLoader,
	ssr: false
});

function RouteComponent() {
	return <DashboardWrapper />;
}
