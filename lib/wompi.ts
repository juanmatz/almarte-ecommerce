import crypto from "crypto";

export interface WompiConfig {
  publicKey: string;
  privateKey?: string;
  integritySecret?: string;
  eventsSecret?: string;
  baseUrl: string;
  checkoutUrl: string;
  widgetScriptUrl: string;
  isSandbox: boolean;
}

export interface WompiTransaction {
  id: string;
  created_at: string;
  finalized_at?: string;
  amount_in_cents: number;
  reference: string;
  customer_email: string;
  currency: string;
  payment_method_type: string;
  status: "APPROVED" | "DECLINED" | "VOIDED" | "ERROR" | "PENDING";
  status_message?: string | null;
  payment_method?: {
    type: string;
    extra?: Record<string, any>;
  };
}

export interface WompiWebhookPayload {
  event: string;
  data: {
    transaction: WompiTransaction;
    [key: string]: any;
  };
  signature: {
    checksum: string;
    properties: string[];
  };
  sent_at: string;
  timestamp?: number;
  environment?: string;
}

/**
 * Obtiene la configuración del entorno para Wompi (Sandbox vs Producción).
 */
export function getWompiConfig(): WompiConfig {
  const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || "";
  const privateKey = process.env.WOMPI_PRIVATE_KEY || "";
  const integritySecret = process.env.WOMPI_INTEGRITY_SECRET || "";
  const eventsSecret = process.env.WOMPI_EVENTS_SECRET || "";

  const isSandbox = !publicKey.startsWith("pub_prod_");
  const baseUrl = isSandbox
    ? "https://sandbox.wompi.co/v1"
    : "https://production.wompi.co/v1";

  return {
    publicKey,
    privateKey,
    integritySecret,
    eventsSecret,
    baseUrl,
    checkoutUrl: "https://checkout.wompi.co/p/",
    widgetScriptUrl: "https://checkout.wompi.co/widget.js",
    isSandbox,
  };
}

/**
 * Genera la firma de integridad de Wompi requerida para transacciones en el Checkout o Widget.
 * Fórmula: SHA256(reference + amountInCents + currency + [expirationTime] + integritySecret)
 */
export function generateWompiSignature(
  reference: string,
  amountInCents: number,
  currency = "COP",
  expirationTime?: string | null
): string {
  const { integritySecret } = getWompiConfig();
  if (!integritySecret) {
    throw new Error(
      "WOMPI_INTEGRITY_SECRET no está configurada en las variables de entorno."
    );
  }

  const parts = [reference, String(amountInCents), currency];
  if (expirationTime) {
    parts.push(expirationTime);
  }
  parts.push(integritySecret);

  const rawString = parts.join("");
  return crypto.createHash("sha256").update(rawString).digest("hex");
}

/**
 * Valida la firma criptográfica (checksum) de un webhook entrante de Wompi.
 * La lista de propiedades de firma es dinámica (`signature.properties`).
 * Comparación segura contra ataques de temporización (timing attack resistant).
 */
export function validateWompiEventSignature(
  body: any,
  overrideSecret?: string
): boolean {
  const eventsSecret = overrideSecret || process.env.WOMPI_EVENTS_SECRET;
  if (!eventsSecret) {
    console.error("WOMPI_EVENTS_SECRET no configurada para validar webhook.");
    return false;
  }

  const signature = body?.signature;
  const data = body?.data;

  if (!signature?.checksum || !Array.isArray(signature.properties) || !data) {
    return false;
  }

  try {
    // Extraer en orden exacto cada propiedad definida en signature.properties
    const values = signature.properties.map((prop: string) => {
      const keys = prop.split(".");
      let current: any = data;
      for (const key of keys) {
        if (current === undefined || current === null) break;
        current = current[key];
      }
      return current !== undefined && current !== null ? String(current) : "";
    });

    const concatenated = [...values, eventsSecret].join("");
    const expectedChecksum = crypto
      .createHash("sha256")
      .update(concatenated)
      .digest("hex");

    const checksumBuffer = Buffer.from(signature.checksum, "hex");
    const expectedBuffer = Buffer.from(expectedChecksum, "hex");

    if (checksumBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(checksumBuffer, expectedBuffer);
  } catch (error) {
    console.error("Error al validar firma de webhook Wompi:", error);
    return false;
  }
}

/**
 * Consulta el estado actualizado de una transacción directamente en la API de Wompi.
 */
export async function getWompiTransaction(
  transactionId: string
): Promise<WompiTransaction> {
  const { baseUrl, privateKey } = getWompiConfig();
  if (!privateKey) {
    throw new Error("WOMPI_PRIVATE_KEY no está configurada.");
  }

  const res = await fetch(`${baseUrl}/transactions/${encodeURIComponent(transactionId)}`, {
    headers: {
      Authorization: `Bearer ${privateKey}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(
      json.error?.type ||
        json.error?.reason ||
        `Error al consultar transacción en Wompi (${res.status})`
    );
  }

  return json.data as WompiTransaction;
}
