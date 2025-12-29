import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

type User = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  createdAt: unknown;
  updatedAt: unknown;
};

function mapSupabaseUser(user: any): User {
  const meta = (user?.user_metadata ?? {}) as Record<string, any>;
  return {
    id: user.id,
    email: user.email ?? null,
    firstName: meta.first_name ?? meta.firstName ?? null,
    lastName: meta.last_name ?? meta.lastName ?? null,
    profileImageUrl: meta.avatar_url ?? meta.profileImageUrl ?? null,
    createdAt: null as any,
    updatedAt: null as any,
  };
}

async function fetchUser(): Promise<User | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return mapSupabaseUser(data.user);
}

async function signInWithPassword(input: { email: string; password: string }): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });
  if (error) throw new Error(error.message);
}

async function signUp(input: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}): Promise<void> {
  const emailRedirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback`
      : undefined;
  const { error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      ...(emailRedirectTo ? { emailRedirectTo } : {}),
      data: {
        first_name: input.firstName,
        last_name: input.lastName,
      },
    },
  });
  if (error) throw new Error(error.message);
}

async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

async function resendConfirmation(input: { email: string }): Promise<void> {
  const emailRedirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback`
      : undefined;
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: input.email,
    ...(emailRedirectTo ? { options: { emailRedirectTo } } : {}),
  });
  if (error) throw new Error(error.message);
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["auth:user"],
    queryFn: fetchUser,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const loginMutation = useMutation({
    mutationFn: signInWithPassword,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth:user"] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: signUp,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth:user"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(["auth:user"], null);
    },
  });

  const resendConfirmationMutation = useMutation({
    mutationFn: resendConfirmation,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    resendConfirmation: resendConfirmationMutation.mutate,
    isResendingConfirmation: resendConfirmationMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
