import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getAuthUser } from "@/lib/auth";

// Configure Cloudinary using credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    // 1. Authenticate user and verify admin role
    const userPayload = await getAuthUser(request);
    if (!userPayload || userPayload.role !== "admin") {
      return NextResponse.json(
        { error: "No autorizado. Se requieren permisos de administrador." },
        { status: 403 }
      );
    }

    // 2. Parse request form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const productName = formData.get("productName") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No se ha proporcionado ninguna imagen en la petición." },
        { status: 400 }
      );
    }

    // Validate file type (only images)
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "El archivo proporcionado no es una imagen válida." },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "La imagen excede el tamaño máximo permitido de 5MB." },
        { status: 400 }
      );
    }

    // 3. Convert file into a Buffer for streaming
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 4. Sanitize the filename to make it SEO-friendly
    let baseName = "producto";
    if (productName) {
      baseName = productName;
    } else if (file.name) {
      baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
    }
    
    const sanitizedName = baseName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove accents/diacritics
      .replace(/[^a-z0-9]/g, "-")      // replace non-alphanumeric with single hyphen
      .replace(/-+/g, "-")             // collapse multiple hyphens
      .replace(/^-|-$/g, "");          // trim starting or trailing hyphens
      
    const finalFilename = `${sanitizedName || "producto"}-${Date.now()}`;

    // 5. Upload buffer directly to Cloudinary using a stream
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "almarte/productos",
          public_id: finalFilename,
          overwrite: true,
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      uploadStream.end(buffer);
    });

    // 6. Return the secure URL of the uploaded image
    return NextResponse.json(
      {
        message: "Imagen cargada exitosamente a Cloudinary.",
        imageUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al procesar la carga en Cloudinary:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al cargar la imagen a Cloudinary." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    // 1. Authenticate user and verify admin role
    const userPayload = await getAuthUser(request);
    if (!userPayload || userPayload.role !== "admin") {
      return NextResponse.json(
        { error: "No autorizado. Se requieren permisos de administrador." },
        { status: 403 }
      );
    }

    // 2. Parse request body
    const body = await request.json();
    const { imageUrl } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Se requiere la URL de la imagen para eliminarla." },
        { status: 400 }
      );
    }

    // 3. Extract public ID from Cloudinary URL
    const publicId = getPublicIdFromUrl(imageUrl);
    if (!publicId) {
      return NextResponse.json(
        { error: "URL de imagen inválida o no corresponde a Cloudinary." },
        { status: 400 }
      );
    }

    // 4. Destroy asset on Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== "ok") {
      return NextResponse.json(
        { error: "No se pudo eliminar la imagen de Cloudinary. Puede que ya no exista.", result },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Imagen eliminada de Cloudinary exitosamente." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar imagen de Cloudinary:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al eliminar la imagen." },
      { status: 500 }
    );
  }
}

function getPublicIdFromUrl(url: string): string | null {
  try {
    const parts = url.split("/image/upload/");
    if (parts.length < 2) return null;
    
    const afterUpload = parts[1]; // v123456/almarte/productos/filename.ext
    const withoutVersion = afterUpload.replace(/^v\d+\//, ""); // almarte/productos/filename.ext
    
    const lastDotIndex = withoutVersion.lastIndexOf(".");
    if (lastDotIndex === -1) return withoutVersion;
    return withoutVersion.substring(0, lastDotIndex);
  } catch (e) {
    console.error("Error al extraer publicId:", e);
    return null;
  }
}
