import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getAuthUser } from "@/lib/auth";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(request: Request) {
  try {
    // 1. Authenticate user and verify admin privileges
    const userPayload = await getAuthUser(request);
    if (!userPayload || userPayload.role !== "admin") {
      return NextResponse.json(
        { error: "No autorizado. Se requieren permisos de administrador." },
        { status: 403 }
      );
    }

    // 2. Extract form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const productName = (formData.get("productName") as string | null) || "producto";

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo de imagen." },
        { status: 400 }
      );
    }

    // 3. Strict MIME type validation
    const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedMimes.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato no permitido. Solo se aceptan imágenes JPG, PNG y WEBP." },
        { status: 400 }
      );
    }

    // 4. File size validation (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "La imagen excede el límite máximo de 5MB." },
        { status: 400 }
      );
    }

    // 5. Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 6. Sanitize product name for clean Cloudinary public_id
    const sanitizedSlug = productName
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const publicId = `${sanitizedSlug || "producto"}-${Date.now()}`;

    // 7. Upload to Cloudinary inside almarte/productos folder
    const uploadResult = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "almarte/productos",
          public_id: publicId,
          resource_type: "image",
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error("Fallo al subir la imagen a Cloudinary."));
          } else {
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
            });
          }
        }
      );

      uploadStream.end(buffer);
    });

    return NextResponse.json({
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      message: "Imagen subida exitosamente a Cloudinary.",
    });

  } catch (error: any) {
    console.error("Error en upload:", error);
    return NextResponse.json(
      { error: "Error interno al procesar la subida de la imagen." },
      { status: 500 }
    );
  }
}
