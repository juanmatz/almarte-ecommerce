import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/db";
import { getJwtSecret } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "El correo electrónico no es válido" },
        { status: 400 }
      );
    }

    // Check if user already exists (registered or guest)
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "El correo electrónico ya está registrado o asociado a un pedido previo. Inicia sesión o solicita asistencia." },
        { status: 400 }
      );
    }

    // Hash password once
    const passwordHash = await bcrypt.hash(password, 10);

    // Create new user in database
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: "customer", // Default role
        isGuest: false,
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      getJwtSecret(),
      { expiresIn: "7d" }
    );

    // Return response
    return NextResponse.json(
      {
        message: "Usuario registrado con éxito",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en registro de usuario:", error);
    return NextResponse.json(
      { error: "Ha ocurrido un error interno en el servidor" },
      { status: 500 }
    );
  }
}
