import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, isValidSessionToken } from "@/lib/auth-token";

export async function isAuthenticated() {
  const store = await cookies();
  return isValidSessionToken(store.get(ADMIN_COOKIE_NAME)?.value);
}

export async function requireAdmin() {
  if (!(await isAuthenticated())) redirect("/admin/login");
}
