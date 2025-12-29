import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';
import AdminShell from '@/components/admin/AdminShell';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  // Verify admin session - middleware handles the actual verification
  // This is just a fallback check
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  
  if (!token) {
    redirect('/admin/login');
  }

  return (
    <AdminShell title="Admin Dashboard">
      <AdminDashboardClient />
    </AdminShell>
  );
}
