/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser } from "@/utils/getCurrentUser";
import { logoutUser } from "@/utils/logoutUser";

type User = {
  _id: string;
  email: string;
  role: "CUSTOMER" | "MODERATOR" | "MANAGER" | "ADMIN";
};

type UserContextType = {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
};

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hydrateUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };
    hydrateUser();
  }, []);


  const login = (userData: any) => setUser(userData);
  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {/* {!loading && children} */}
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
};