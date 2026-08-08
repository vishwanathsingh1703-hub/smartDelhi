import AuthGuard from '@/components/auth/AuthGuard';

function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#020617] text-white p-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-gray-400 mt-2">
        Welcome to the SmartDELHI administration center.
      </p>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AuthGuard allowedRoles={['ADMIN']}>
      <AdminDashboard />
    </AuthGuard>
  );
}