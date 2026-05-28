import React, { createContext, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase/client";
import type { Profile, UserRole } from "../types";

interface AuthContextType {
  session: Session | null;
  profile: Profile | null;
  role: UserRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error.message);
        return;
      }

      if (data) {
        setProfile(data);
        setRole(data.role);
      } else {
        // If the profile does not exist yet (OAuth delay), fallback to a basic sales role
        console.warn("Profile not found, waiting for trigger or fallback.");
        setRole("sales");
      }
    } catch (err) {
      console.error("Unexpected error fetching profile:", err);
    }
  };

  const refreshProfile = async () => {
    if (session?.user?.id) {
      await fetchProfile(session.user.id);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setSession(null);
      setProfile(null);
      setRole(null);
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        if (session?.user) {
          fetchProfile(session.user.id)
            .then(() => setLoading(false))
            .catch((err) => {
              console.error("Error loading profile after session get:", err);
              setLoading(false);
            });
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error getting initial session:", err);
        setLoading(false);
      });

    // 2. Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);

      if (newSession?.user) {
        await fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
        setRole(null);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ session, profile, role, loading, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
