"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuth(requireAuth = true) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    const auth = localStorage.getItem("compshield_auth");
    const storedUser = localStorage.getItem("compshield_user");

    if (auth === "true" && storedUser) {
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
    localStorage.removeItem("compshield_auth");
    localStorage.removeItem("compshield_user");
    setIsAuthenticated(false);
    setUser(null);
    router.replace("/login");
  };

  return { isAuthenticated, user, logout };
}
