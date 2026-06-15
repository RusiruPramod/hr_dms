import { createMiddleware } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { getIdToken } from "@/hooks/use-auth";
import { verifyIdToken, getTokenFromHeader } from "../auth-server";

export const serverAuthMiddleware = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    let token: string | null = null;
    if (typeof window !== "undefined") {
      try {
        token = await getIdToken();
      } catch (err) {
        console.error("Client middleware failed to get ID token", err);
      }
    }
    return next({
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  })
  .server(async ({ next }) => {
    const headers = getRequestHeaders();
    const authHeader = headers["authorization"];
    const token = getTokenFromHeader(authHeader);

    if (!token) {
      throw new Error("Unauthorized: No authentication token provided");
    }

    try {
      const decodedUser = await verifyIdToken(token);
      return next({
        context: {
          user: decodedUser,
        },
      });
    } catch (err) {
      console.error("Server middleware token verification failed", err);
      throw new Error("Unauthorized: Invalid token");
    }
  });
export default serverAuthMiddleware;
