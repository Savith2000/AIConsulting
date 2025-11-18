import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkIsAdmin, checkOnboardingComplete } from "@/lib/supabase/profile";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Check onboarding status
    const onboardingComplete = await checkOnboardingComplete(user.id);
    if (!onboardingComplete) {
      redirect("/onboarding");
    } else {
      // Check admin status and redirect accordingly
      const isAdmin = await checkIsAdmin(user.id);
      redirect(isAdmin ? "/admin" : "/dashboard");
    }
  } else {
    redirect("/login");
  }
}

