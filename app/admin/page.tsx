
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';
import AdminShell from '@/components/admin/AdminShell';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {

  return (
    <AdminShell title="Admin Dashboard">
      <AdminDashboardClient />
    </AdminShell>
  );
}
