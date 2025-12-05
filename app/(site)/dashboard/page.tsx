import DatabaseDashboard from "@/components/Dashboard/DatabaseDashboard"
import ProtectedRoute from "@/components/Auth/ProtectedRoute"

export const metadata = {
  title: "Candidate Dashboard - Database",
  description: "Manage and view candidate applications from the database",
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DatabaseDashboard />
    </ProtectedRoute>
  )
}
