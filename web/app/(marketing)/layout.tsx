import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import NewsletterExitModal from "@/components/newsletter/NewsletterExitModal";
import { createClient } from "@/lib/supabase/server";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let navUser: { id: string; email: string; full_name: string | null } | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();
    navUser = {
      id: user.id,
      email: user.email ?? "",
      full_name: profile?.full_name ?? (user.user_metadata?.full_name as string | undefined) ?? null,
    };
  }

  return (
    <>
      <SiteNav user={navUser} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <NewsletterExitModal isLoggedIn={!!user} />
    </>
  );
}
