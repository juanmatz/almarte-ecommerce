import { prisma } from "../lib/db";
import bcrypt from "bcryptjs";
import readline from "readline";

async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log("==========================================");
  console.log("   CREAR O ACTUALIZAR USUARIO ADMIN       ");
  console.log("==========================================");

  // Read arguments from command line or prompt
  const args = process.argv.slice(2);
  let email = args[0];
  let password = args[1];
  let name = args[2] || "Administrador Almarte";

  if (!email) {
    email = await prompt("Correo electrónico del admin: ");
  }

  if (!password) {
    password = await prompt("Contraseña segura: ");
  }

  if (!email || !password) {
    console.error("❌ Error: Correo y contraseña son obligatorios.");
    process.exit(1);
  }

  if (password.length < 8) {
    console.warn("⚠️ Advertencia: Se recomienda una contraseña de al menos 8 caracteres.");
  }

  const emailNormalized = email.toLowerCase().trim();
  const passwordHash = await bcrypt.hash(password, 10);

  const existingUser = await prisma.user.findUnique({
    where: { email: emailNormalized },
  });

  if (existingUser) {
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        role: "admin",
        passwordHash,
        isGuest: false,
        name: name || existingUser.name,
      },
    });
    console.log(`✅ Usuario existente '${emailNormalized}' actualizado a rol ADMIN exitosamente.`);
  } else {
    await prisma.user.create({
      data: {
        name,
        email: emailNormalized,
        passwordHash,
        role: "admin",
        isGuest: false,
      },
    });
    console.log(`✅ Nuevo usuario ADMIN '${emailNormalized}' creado exitosamente.`);
  }

  console.log("==========================================");
  console.log(`Puedes iniciar sesión en: /cuenta/login`);
  console.log("==========================================");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Error al crear usuario admin:", err);
  process.exit(1);
});
