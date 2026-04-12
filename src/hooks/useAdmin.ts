import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useAdmin() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const checkAdmin = async (userId: string) => {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin");

      return roles && roles.length > 0;
    };

    // Initial session check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return;

      if (!session?.user) {
        setLoading(false);
        navigate("/admin/login");
        return;
      }

      setUser(session.user);
      const admin = await checkAdmin(session.user.id);
      if (!isMounted) return;

      if (!admin) {
        await supabase.auth.signOut();
        setIsAdmin(false);
        setLoading(false);
        navigate("/admin/login");
      } else {
        setIsAdmin(true);
        setLoading(false);
      }
    });

    // Listen for auth changes (login/logout while on page)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;

      if (!session?.user) {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        navigate("/admin/login");
        return;
      }

      setUser(session.user);
      const admin = await checkAdmin(session.user.id);
      if (!isMounted) return;

      if (!admin) {
        await supabase.auth.signOut();
        setIsAdmin(false);
        navigate("/admin/login");
      } else {
        setIsAdmin(true);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  return { user, isAdmin, loading, signOut };
}
