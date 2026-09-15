import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export default async function AdminLoginPage({ searchParams }: {
  searchParams: Promise<{ gameId?: string }>;
}) {
  const { gameId } = await searchParams;

  return (
    <main className="container admin-auth">
      <AdminLoginForm gameId={gameId} />
    </main>
  );
}
