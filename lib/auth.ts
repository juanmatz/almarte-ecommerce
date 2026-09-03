import { NextResponse } from "next/server";

export interface JWTPayload {
  id: number;
  email: string;
  role: "customer" | "admin";
  iat?: number;
  exp?: number;
}

// Decodes a base64url string to Uint8Array
function base64UrlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) {
    str += "=";
  }
  const rawData = atob(str);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Verifies JWT signature using Web Crypto API (HMAC SHA-256)
export async function verifyJWT(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;

    // Import the secret key
    const encoder = new TextEncoder();
    const secretKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    // Recreate the data payload of header + payload
    const data = encoder.encode(`${headerB64}.${payloadB64}`);
    const signatureBytes = base64UrlDecode(signatureB64);

    // Verify signature
    const isValid = await crypto.subtle.verify(
      "HMAC",
      secretKey,
      signatureBytes as any,
      data
    );

    if (!isValid) return null;

    // Decode and parse payload
    const payloadJson = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(payloadJson) as JWTPayload;

    // Check expiration date
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return null;
  }
}

export const JWT_SECRET = process.env.JWT_SECRET || "almarte-default-jwt-super-secret-key-change-in-env-2026";

// Helper to authenticate user from request headers
export async function getAuthUser(request: Request): Promise<JWTPayload | null> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET || JWT_SECRET;
  
  if (!token || !secret) {
    return null;
  }

  return await verifyJWT(token, secret);
}
