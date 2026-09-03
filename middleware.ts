import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "./lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The Stripe webhook and guest checkout endpoints must be public
  if (pathname === "/api/checkout/webhook" || pathname === "/api/checkout/guest-intent") {
    return NextResponse.next();
  }

  const isAdminRoute = pathname.startsWith("/api/admin");
  const isCheckoutRoute = pathname.startsWith("/api/checkout");
  const isOrdersRoute = pathname === "/api/orders" || pathname.startsWith("/api/orders/");
  const isReviewsRoute = pathname.startsWith("/api/reviews");

  const requiresAuth = isAdminRoute || isCheckoutRoute || isOrdersRoute || isReviewsRoute;

  if (requiresAuth) {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Acceso no autorizado. Token faltante o formato incorrecto." },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "almarte-default-jwt-super-secret-key-change-in-env-2026";
    
    if (!token) {
      return NextResponse.json(
        { error: "Acceso no autorizado. Token faltante." },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token, secret);
    if (!payload) {
      return NextResponse.json(
        { error: "Acceso no autorizado. Token inválido o sesión expirada." },
        { status: 401 }
      );
    }

    // Role validation for admin routes
    if (isAdminRoute && payload.role !== "admin") {
      return NextResponse.json(
        { error: "Acceso denegado. Se requieren privilegios de administrador." },
        { status: 403 }
      );
    }
    
    // Inject user info in request headers so API routes can easily retrieve it
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.id.toString());
    requestHeaders.set("x-user-email", payload.email);
    requestHeaders.set("x-user-role", payload.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

// Config to specify matching paths
export const config = {
  matcher: [
    "/api/admin/:path*",
    "/api/checkout/:path*",
    "/api/orders",
    "/api/orders/:path*",
    "/api/reviews/:path*",
  ],
};
