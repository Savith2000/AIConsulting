import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AnimatedBackground from "@/components/AnimatedBackground";
import AdminContent from "@/components/AdminContent";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Middleware handles all admin routing - if we get here, user is admin
  // No need to check again to avoid redirect loops

  return (
    <div className="min-h-screen p-8 relative overflow-hidden">
      <AnimatedBackground />
      <AdminContent />
    </div>
  );
}

