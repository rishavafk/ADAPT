import type { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

type AuthedReqUser = {
  claims: {
    sub: string;
    email?: string;
  };
};

declare global {
  namespace Express {
    interface User extends AuthedReqUser {}
  }
}

export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  const authHeader = req.headers.authorization;
  const token = typeof authHeader === "string" && authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : undefined;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  req.user = {
    claims: {
      sub: data.user.id,
      email: data.user.email ?? undefined,
    },
  };

  return next();
};
