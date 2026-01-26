import { Session } from "next-auth";

export const isAdmin = (session: Session | null) => {
  return session?.user?.role === 'ADMIN';
};

export const isAuthenticated = (session: Session | null) => {
  return !!session?.user;
};

export const hasValidSession = (session: Session | null) => {
  return isAuthenticated(session) && !!session.expires;
};