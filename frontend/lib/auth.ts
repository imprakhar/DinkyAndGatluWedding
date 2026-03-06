export type AuthRole = "bride" | "groom";

export const AUTH_COOKIE_NAME = "wedding_auth_role";
export const LOGIN_PATH = "/login";
export const DEFAULT_AUTH_REDIRECT = "/dashboard";

const credentials: Array<{
  role: AuthRole;
  username: string;
  password: string;
}> = [
  { role: "groom", username: "Prakhar", password: "Akansha" },
  { role: "bride", username: "Akansha", password: "Prakhar" },
];

export function verifyCredentials(username: string, password: string): AuthRole | null {
  const normalizedUsername = username.trim();
  const normalizedPassword = password.trim();

  const match = credentials.find(
    (item) => item.username === normalizedUsername && item.password === normalizedPassword,
  );

  return match?.role ?? null;
}

export function isValidAuthRole(value: string | undefined): value is AuthRole {
  return value === "bride" || value === "groom";
}
