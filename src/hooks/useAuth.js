import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) { setLoading(false); return; }
          const { data: userData } = await supabase
            .from("usuarios")
            .select("rol, nombre")
            .eq("id", user.id)
            .single();
          setUser({
            id: user.id,
            email: user.email,
            name: userData?.nombre || user.email,
            role: userData?.rol || "user"
          });
        }
      } catch (e) {
        console.error("Auth error:", e);
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return { user, setUser, loading, logout };
}
