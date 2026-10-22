import fs from "fs";
import path from "path";

// Leer .env directamente
const envPath = path.resolve(process.cwd(), ".env");
if (!fs.existsSync(envPath)) {
  console.error("❌ No se encontró el archivo .env");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf-8");
const envVars = {};
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const match = trimmed.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let val = match[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    envVars[key] = val;
  }
}

const pubKey = envVars.NEXT_PUBLIC_WOMPI_PUBLIC_KEY;
const prvKey = envVars.WOMPI_PRIVATE_KEY;
const integritySecret = envVars.WOMPI_INTEGRITY_SECRET;
const eventsSecret = envVars.WOMPI_EVENTS_SECRET;

console.log("🔍 Validando configuración de Wompi en .env...\n");

let hasErrors = false;

// 1. Validar Llave Pública
if (!pubKey) {
  console.log("❌ NEXT_PUBLIC_WOMPI_PUBLIC_KEY no está definida.");
  hasErrors = true;
} else if (!pubKey.startsWith("pub_test_") && !pubKey.startsWith("pub_prod_")) {
  console.log(`❌ NEXT_PUBLIC_WOMPI_PUBLIC_KEY debe iniciar con 'pub_test_' (modo prueba) o 'pub_prod_' (producción). Valor actual: ${pubKey.slice(0, 12)}...`);
  hasErrors = true;
} else {
  console.log(`✅ Prefijo de Llave Pública correcto (${pubKey.startsWith("pub_test_") ? "Sandbox / Pruebas" : "Producción"}).`);
}

// 2. Validar Llave Privada
if (!prvKey) {
  console.log("❌ WOMPI_PRIVATE_KEY no está definida.");
  hasErrors = true;
} else if (!prvKey.startsWith("prv_test_") && !prvKey.startsWith("prv_prod_")) {
  console.log(`❌ WOMPI_PRIVATE_KEY debe iniciar con 'prv_test_' o 'prv_prod_'. Valor actual: ${prvKey.slice(0, 12)}...`);
  hasErrors = true;
} else {
  console.log(`✅ Prefijo de Llave Privada correcto.`);
}

// 3. Validar Secreto de Integridad
if (!integritySecret) {
  console.log("❌ WOMPI_INTEGRITY_SECRET no está definida.");
  hasErrors = true;
} else if (!integritySecret.startsWith("test_integrity_") && !integritySecret.startsWith("prod_integrity_")) {
  console.log(`⚠️ WOMPI_INTEGRITY_SECRET suele iniciar con 'test_integrity_' o 'prod_integrity_'.`);
} else {
  console.log(`✅ Prefijo de Secreto de Integridad correcto.`);
}

// 4. Validar Secreto de Eventos
if (!eventsSecret) {
  console.log("❌ WOMPI_EVENTS_SECRET no está definida.");
  hasErrors = true;
} else if (!eventsSecret.startsWith("test_events_") && !eventsSecret.startsWith("prod_events_")) {
  console.log(`⚠️ WOMPI_EVENTS_SECRET suele iniciar con 'test_events_' o 'prod_events_'.`);
} else {
  console.log(`✅ Prefijo de Secreto de Eventos correcto.`);
}

// 5. Test en vivo contra API Sandbox de Wompi
if (pubKey && pubKey.startsWith("pub_test_")) {
  console.log("\n🌐 Probando conexión en vivo con API Sandbox de Wompi...");
  try {
    const res = await fetch(`https://sandbox.wompi.co/v1/merchants/${pubKey}`);
    const json = await res.json();
    if (res.ok) {
      console.log(`✅ ¡Conexión exitosa con Wompi!`);
      console.log(`   Nombre del Comercio: ${json.data?.name || "Sin nombre"}`);
      console.log(`   Email registrado: ${json.data?.email || "Sin email"}`);
      console.log(`   Moneda: ${json.data?.currency || "COP"}`);
    } else {
      console.log(`❌ La API de Wompi rechazó la llave pública:`);
      console.log(`   Código HTTP: ${res.status}`);
      console.log(`   Respuesta:`, JSON.stringify(json.error || json, null, 2));
    }
  } catch (err) {
    console.log(`❌ Error de red al consultar Wompi: ${err.message}`);
  }
}
