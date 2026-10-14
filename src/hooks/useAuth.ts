"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearAuth, getToken } from "@/lib/api";

export function useAuth(requireAuth = true) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    const auth = localStorage.getItem("compshield_auth");
    const storedUser = localStorage.getItem("compshield_user");
    const token = getToken();

    // Prefer token-based session; still accept legacy mock flag
    if ((token || auth === "true") && storedUser) {
      setIsAuthenticated(true);
      setUser(storedUser);
    } else {
      setIsAuthenticated(false);
      if (requireAuth) {
        router.replace("/login");
      }
    }
  }, [requireAuth, router]);

  const logout = () => {
    clearAuth();
    setIsAuthenticated(false);
    setUser(null);
    router.replace("/login");
  };

  return { isAuthenticated, user, logout };
}
