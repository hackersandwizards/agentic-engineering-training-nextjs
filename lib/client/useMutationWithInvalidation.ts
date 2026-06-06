"use client";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
  type UseMutationResult,
} from "@tanstack/react-query";

export function useMutationWithInvalidation<TData = unknown, TVariables = void>(
  options: UseMutationOptions<TData, Error, TVariables> & {
    invalidateKey: readonly unknown[];
  },
): UseMutationResult<TData, Error, TVariables> {
  const queryClient = useQueryClient();
  const { invalidateKey, onSuccess, ...rest } = options;
  return useMutation<TData, Error, TVariables>({
    ...rest,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: invalidateKey });
      return onSuccess?.(...args);
    },
  });
}
