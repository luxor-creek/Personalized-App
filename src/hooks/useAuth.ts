import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export interface AuthState {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  checkingAuth: boolean;
  profile: {
    plan: string;
    trial_ends_at: string | null;
    max_pages: number;
    max_live_pages: number;
    max_campaigns: number;
  } | null;
}

export function useAuth(requireAdmin = false) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [profile, setProfile] = useState<AuthState["profile"]>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (!session?.user) {
          setCheckingAuth(false);
          navigate("/auth");
          return;
        }

        setTimeout(() => {
          checkRole(session.user.id);
          fetchProfile(session.user.id);
        }, 0);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (!session?.user) {
        setCheckingAuth(false);
        navigate("/auth");
        return;
      }

      checkRole(session.user.id);
      fetchProfile(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (error) {
        setIsAdmin(false);
      } else {
        setIsAdmin(data?.role === "admin");
      }
    } catch {
      setIsAdmin(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("plan, trial_ends_at, max_pages, max_live_pages, max_campaigns")
        .eq("user_id", userId)
        .single();

      if (data) {
        setProfile(data as AuthState["profile"]);
      }
    } catch {
      // Profile may not exist for existing users
    }
  };

  const handleLogout = async () => {
    // Clear sensitive integration credentials from localStorage on logout
    localStorage.removeItem("admin_integrations_config");
    localStorage.removeItem("admin_custom_integrations");
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return { user, session, isAdmin, checkingAuth, profile, handleLogout };
}
