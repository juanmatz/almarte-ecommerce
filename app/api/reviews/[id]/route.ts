import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reviewId = parseInt(id);

    if (isNaN(reviewId)) {
      return NextResponse.json(
        { error: "ID de reseña inválido" },
        { status: 400 }
      );
    }

    // 1. Authenticate user from JWT token
    const userPayload = await getAuthUser(request);
    if (!userPayload) {
      return NextResponse.json(
        { error: "No autorizado. Inicie sesión para realizar esta acción." },
        { status: 401 }
      );
    }

    // 2. Find review in DB
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json(
        { error: "La reseña no existe o ya fue eliminada." },
        { status: 404 }
      );
    }

    // 3. Verify permissions (must be admin or the author of the review)
    if (userPayload.role !== "admin" && review.userId !== userPayload.id) {
      return NextResponse.json(
        { error: "No tienes permisos para eliminar esta reseña." },
        { status: 403 }
      );
    }

    // 4. Delete review
    await prisma.review.delete({
      where: { id: reviewId },
    });

    return NextResponse.json(
      { message: "Reseña eliminada correctamente." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar reseña:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al eliminar la valoración" },
      { status: 500 }
    );
  }
}
