"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  clearAuthToken,
  setAuthToken as persistToken,
} from "~/src/lib/trpc";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  image: string | null;
  role: "user" | "admin";
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        persistToken(token);
        set({ user, token });
      },
      clearAuth: () => {
        clearAuthToken();
        set({ user: null, token: null });
      },
    }),
    {
      name: "formcraft-auth",
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          persistToken(state.token);
        }
      },
    },
  ),
);
