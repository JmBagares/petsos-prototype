// app/_layout.tsx (optional upgrade later)
import { Stack, usePathname, router } from "expo-router";
import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import { ReportsProvider } from "../context/ReportsContext";

export default function RootLayout() {
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const isAuthed = !!data.session;
      if (!isAuthed && pathname !== "/login" && pathname !== "/register") {
        router.replace("/login");
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session && (pathname === "/login" || pathname === "/register")) router.replace("/");
      if (!session && pathname !== "/login" && pathname !== "/register") router.replace("/login");
    });
    return () => sub.subscription.unsubscribe();
  }, [pathname]);

  return (
    <ReportsProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ReportsProvider>
  );
}
