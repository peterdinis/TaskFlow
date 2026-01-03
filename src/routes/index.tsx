import { createFileRoute } from "@tanstack/react-router";
import { PendingComponent } from "@/components/shared/PendingComponent";
import { HomeWrapper } from "@/components/home/HomeWrapper";

export const Route = createFileRoute("/")({
	component: HomeWrapper,
	pendingComponent: PendingComponent,
});
