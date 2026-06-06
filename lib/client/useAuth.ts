"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthApi, UsersApi, type UserPublic } from "./api";

export const isLoggedIn = () => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("access_token") !== null;
};

export const useAuth = () => {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user, isLoading: isLoadingUser } = useQuery<
    UserPublic | null,
    Error
  >({
    queryKey: ["currentUser"],
    queryFn: async () => {
      if (!isLoggedIn()) return null;
      try {
        return await UsersApi.getMe();
      } catch {
        localStorage.removeItem("access_token");
        return null;
      }
    },
    enabled: typeof window !== "undefined",
    retry: false,
  });

  const signUpMutation = useMutation({
    mutationFn: (data: {
      email: string;
      password: string;
      full_name?: string;
    }) => UsersApi.signup(data),
    onSuccess: () => {
      router.push("/login");
    },
    onError: (err: Error) => {
      setError(err.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await AuthApi.login(data.email, data.password);
      localStorage.setItem("access_token", response.access_token);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      router.push("/");
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const logout = () => {
    localStorage.removeItem("access_token");
    queryClient.clear();
    router.push("/login");
  };

  return {
    signUpMutation,
    loginMutation,
    logout,
    user,
    isLoadingUser,
    isLoggedIn: isLoggedIn(),
    error,
    resetError: () => setError(null),
  };
};

export default useAuth;
