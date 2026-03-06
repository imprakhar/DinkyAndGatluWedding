import { NextResponse } from "next/server";

import {
  AUTH_COOKIE_NAME,
  type AuthRole,
  verifyCredentials,
} from "@/lib/auth";

type LoginPayload = {
  username?: string;
  password?: string;
};

export async function POST(request: Request) {
  let payload: LoginPayload;

  try {
    payload = (await request.json()) as LoginPayload;
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const role = verifyCredentials(payload.username ?? "", payload.password ?? "");

  if (!role) {
    return NextResponse.json({ message: "Invalid username or password" }, { status: 401 });
  }

  const response = NextResponse.json({ role: role as AuthRole });
  response.cookies.set(AUTH_COOKIE_NAME, role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return response;
}
