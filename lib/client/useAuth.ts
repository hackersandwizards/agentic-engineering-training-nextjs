"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthApi, UsersApi, type UserPublic } from "./api";
import { queryKeys } from "./queryKeys";

export const useAuth = () => {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user, isLoading: isLoadingUser } = useQuery<
    UserPublic | null,
    Error
  >({
    queryKey: queryKeys.currentUser,
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
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      AuthApi.login(data.email, data.password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
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
