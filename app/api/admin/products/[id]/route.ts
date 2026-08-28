import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate user
    const userPayload = await getAuthUser(request);
    if (!userPayload || userPayload.role !== "admin") {
      return NextResponse.json(
        { error: "No autorizado. Se requieren permisos de administrador." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "ID de producto inválido" },
        { status: 400 }
      );
    }

    // 2. Parse request body
    const body = await request.json();
    const {
      name,
      description,
      price,
      discountPrice,
      isAvailable,
      imageUrl,
      category,
      subcategory,
      imageUrls,
    } = body;

    // 3. Find if product exists
    const existing = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // 4. Update data structure
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description || null;
    
    if (price !== undefined) {
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum <= 0) {
        return NextResponse.json(
          { error: "El precio regular debe ser un número mayor a cero" },
          { status: 400 }
        );
      }
      updateData.price = priceNum;
    }

    if (discountPrice !== undefined) {
      if (discountPrice === null || discountPrice === "") {
        updateData.discountPrice = null;
      } else {
        const discountPriceNum = parseFloat(discountPrice);
        const finalPrice = price !== undefined ? parseFloat(price) : Number(existing.price);
        if (isNaN(discountPriceNum) || discountPriceNum < 0 || discountPriceNum >= finalPrice) {
          return NextResponse.json(
            { error: "El precio de descuento debe ser un número menor al precio regular" },
            { status: 400 }
          );
        }
        updateData.discountPrice = discountPriceNum;
      }
    }

    if (isAvailable !== undefined) {
      updateData.isAvailable = Boolean(isAvailable);
    }

    if (imageUrl !== undefined) {
      if (!imageUrl) {
        return NextResponse.json(
          { error: "La URL de la imagen no puede estar vacía" },
          { status: 400 }
        );
      }
      updateData.imageUrl = imageUrl;
    }

    if (category !== undefined) {
      if (!category) {
        return NextResponse.json(
          { error: "La categoría no puede estar vacía" },
          { status: 400 }
        );
      }
      updateData.category = category;
    }

    if (subcategory !== undefined) {
      updateData.subcategory = subcategory || null;
    }

    if (imageUrls !== undefined) {
      if (!Array.isArray(imageUrls) || imageUrls.length > 5 || imageUrls.some((url) => typeof url !== "string" || !url)) {
        return NextResponse.json({ error: "Cada producto puede tener como máximo 6 imágenes." }, { status: 400 });
      }
      await prisma.productImage.deleteMany({ where: { productId } });
      await prisma.productImage.createMany({
        data: imageUrls.map((url: string, index: number) => ({ productId, url, sortOrder: index + 1 })),
      });
    }

    // 5. Update in DB
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: { images: { orderBy: { sortOrder: "asc" } } },
    });

    return NextResponse.json(
      {
        message: "Producto actualizado exitosamente",
        product: {
          ...updatedProduct,
          price: Number(updatedProduct.price),
          discountPrice: updatedProduct.discountPrice ? Number(updatedProduct.discountPrice) : undefined,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al actualizar el producto" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate user
    const userPayload = await getAuthUser(request);
    if (!userPayload || userPayload.role !== "admin") {
      return NextResponse.json(
        { error: "No autorizado. Se requieren permisos de administrador." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "ID de producto inválido" },
        { status: 400 }
      );
    }

    // 2. Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // 3. Attempt to delete
    try {
      await prisma.product.delete({
        where: { id: productId },
      });
      return NextResponse.json(
        { message: "Producto eliminado definitivamente de la base de datos." },
        { status: 200 }
      );
    } catch (dbErr: any) {
      // Prisma error code P2003 corresponds to foreign key constraint failure
      if (dbErr.code === "P2003" || dbErr.message.includes("ForeignKeyConstraintViolation")) {
        // Soft delete: turn isAvailable = false
        const softDeleted = await prisma.product.update({
          where: { id: productId },
          data: { isAvailable: false },
        });
        return NextResponse.json(
          {
            message: "El producto no se pudo eliminar definitivamente porque forma parte de un historial de órdenes de compra. Se ha marcado automáticamente como 'Agotado' y retirado de la venta al público.",
            product: {
              ...softDeleted,
              price: Number(softDeleted.price),
              discountPrice: softDeleted.discountPrice ? Number(softDeleted.discountPrice) : undefined,
            },
          },
          { status: 200 }
        );
      }
      throw dbErr;
    }
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al eliminar el producto" },
      { status: 500 }
    );
  }
}
