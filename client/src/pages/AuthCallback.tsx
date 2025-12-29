import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const run = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }

        toast({
          title: "Email confirmed",
          description: "You can now sign in.",
        });
      } catch (e) {
        toast({
          title: "Confirmation failed",
          description: (e as Error).message,
          variant: "destructive",
        });
      } finally {
        setLocation("/login");
      }
    };

    void run();
  }, [setLocation, toast]);

  return null;
}
