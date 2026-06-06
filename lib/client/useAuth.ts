"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthApi, UsersApi, type UserPublic } from "./api";

export const useAuth = () => {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Auth state derives from the session cookie: if /users/me succeeds the user
  // is logged in, otherwise it returns null.
  const { data: user, isLoading: isLoadingUser } = useQuery<
    UserPublic | null,
    Error
  >({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        return await UsersApi.getMe();
      } catch {
        return null;
      }
    },
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
    mutationFn: (data: { email: string; password: string }) =>
      AuthApi.login(data.email, data.password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      router.push("/");
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const logout = async () => {
    try {
      await AuthApi.logout();
    } finally {
      queryClient.clear();
      router.push("/login");
    }
  };

  return {
    signUpMutation,
    loginMutation,
    logout,
    user,
    isLoadingUser,
    error,
    resetError: () => setError(null),
  };
};

export default useAuth;
