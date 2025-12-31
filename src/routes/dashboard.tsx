import DashboardWrapper from '@/components/dashboard/DashboardWrapper'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <DashboardWrapper />
}
