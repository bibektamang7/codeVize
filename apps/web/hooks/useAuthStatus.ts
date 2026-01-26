import { useSession } from "next-auth/react";
import { useEffect } from "react";

export const useAuthStatus = () => {
  const { data: session, status, update } = useSession();

  useEffect(() => {
    // Check if session has expired by comparing with stored expiry time
    if (session && status === "authenticated") {
      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
      const sessionExpiry = new Date(session.expires).getTime() / 1000; // Session expiry in seconds
      
      // If session is close to expiring (within 5 minutes), refresh it
      if (sessionExpiry - currentTime < 300) {
        update(); // Refresh the session
      }
    }
  }, [session, status, update]);

  return { session, status };
};