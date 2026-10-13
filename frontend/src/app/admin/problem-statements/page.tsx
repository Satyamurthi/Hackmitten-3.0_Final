import { AdminShell } from "@/components/admin/shell";
import { ProblemStatementsManager } from "@/components/admin/problem-statements-manager";

export const metadata = {
  title: "Problem Statement Management | Hackmitten 3.0 Admin",
};

export default function AdminProblemStatementsPage() {
  return (
    <AdminShell>
      <ProblemStatementsManager />
    </AdminShell>
  );
}
