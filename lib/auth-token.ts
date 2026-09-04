export const ADMIN_COOKIE_NAME = "admin_session";
const SESSION_VALUE = "cabalis-admin";

function getSecret() {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error("Missing ADMIN_PASSWORD environment variable");
  return secret;
}

async function hmac(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

export async function createSessionToken() {
  return `${SESSION_VALUE}.${await hmac(SESSION_VALUE)}`;
}

export async function isValidSessionToken(token: string | null | undefined) {
  if (!token) return false;
  const [value, signature] = token.split(".");
  if (value !== SESSION_VALUE || !signature) return false;
  return timingSafeEqual(signature, await hmac(SESSION_VALUE));
}

export async function checkPassword(password: string) {
  return timingSafeEqual(password, getSecret());
}
