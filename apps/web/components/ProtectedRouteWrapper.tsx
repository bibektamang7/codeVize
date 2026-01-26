"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import LoaderComponent from "@/components/Loader";

interface ProtectedRouteWrapperProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRouteWrapper = ({ children, requireAdmin = false }: ProtectedRouteWrapperProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading, don't redirect yet

    if (!session) {
      // Session expired or not authenticated
      router.push("/login");
      return;
    }

    if (requireAdmin && session.user?.role !== "ADMIN") {
      // User is not admin but admin access is required
      router.push("/dashboard");
      return;
    }
  }, [session, status, router, requireAdmin]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoaderComponent />
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect via useEffect
  }

  if (requireAdmin && session.user?.role !== "ADMIN") {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
};

export default ProtectedRouteWrapper;