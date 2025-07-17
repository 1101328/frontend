// app/utils/session.server.ts
import { createCookieSessionStorage } from "@remix-run/node";

const sessionSecret = process.env.SESSION_SECRET || "super-secret-default";
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  },
});

export const getSession = (cookieHeader?: string | null) => {
  return sessionStorage.getSession(cookieHeader);
};

export const commitSession = sessionStorage.commitSession;
export const destroySession = sessionStorage.destroySession;
