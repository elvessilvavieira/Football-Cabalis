export const ADMIN_COOKIE_NAME = "admin_session";
export const EDITOR_COOKIE_NAME = "editor_session";
const ADMIN_SESSION_VALUE = "cabalis-admin";
const EDITOR_SESSION_PREFIX = "cabalis-editor:";

function getAdminSecret() {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error("Missing ADMIN_PASSWORD environment variable");
  return secret;
}

function getEditorSecret() {
  const secret = process.env.EDITOR_PASSWORD;
  if (!secret) throw new Error("Missing EDITOR_PASSWORD environment variable");
  return secret;
}

async function hmac(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
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
  return `${ADMIN_SESSION_VALUE}.${await hmac(ADMIN_SESSION_VALUE, getAdminSecret())}`;
}

export async function isValidSessionToken(token: string | null | undefined) {
  if (!token) return false;
  const [value, signature] = token.split(".");
  if (value !== ADMIN_SESSION_VALUE || !signature) return false;
  return timingSafeEqual(signature, await hmac(ADMIN_SESSION_VALUE, getAdminSecret()));
}

export async function checkPassword(password: string) {
  return timingSafeEqual(password, getAdminSecret());
}

export async function createEditorSessionToken(gameId: string) {
  const value = `${EDITOR_SESSION_PREFIX}${gameId}`;
  return `${value}.${await hmac(value, getEditorSecret())}`;
}

export async function isValidEditorSessionToken(token: string | null | undefined, gameId: string) {
  if (!token) return false;
  const separator = token.lastIndexOf(".");
  if (separator === -1) return false;
  const value = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  const expectedValue = `${EDITOR_SESSION_PREFIX}${gameId}`;
  if (value !== expectedValue || !signature) return false;
  return timingSafeEqual(signature, await hmac(expectedValue, getEditorSecret()));
}

export async function checkEditorPassword(password: string) {
  return timingSafeEqual(password, getEditorSecret());
}
