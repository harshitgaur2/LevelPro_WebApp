export type OtpPurpose = "signup" | "login";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function otpIdentifier(purpose: OtpPurpose, email: string) {
  return `${purpose}:${normalizeEmail(email)}`;
}

export async function hashOtp(email: string, code: string, purpose: OtpPurpose) {
  const secret = process.env.AUTH_SECRET || "levelpro-dev-secret";
  const payload = `${purpose}:${normalizeEmail(email)}:${code}:${secret}`;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload));

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
