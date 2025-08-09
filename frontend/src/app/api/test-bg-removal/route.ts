import { NextRequest, NextResponse } from "next/server";
// Frontend test route now delegates to backend regardless of method

// API Route Handler for testing background removal methods
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("image") as File;
  const method = formData.get("method")?.toString() || "robust";

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  try {
    console.log(`Delegating background removal (method: ${method}) to backend...`);

    const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
    const forwardForm = new FormData();
  let fileName = "upload.png";
  let mimeType = "image/png";
  // Type guard for File
  if (typeof file === "object" && file !== null && "name" in file && typeof (file as File).name === "string") {
    fileName = (file as File).name;
  }
  if (typeof file === "object" && file !== null && "type" in file && typeof (file as File).type === "string") {
    mimeType = (file as File).type;
  }
    forwardForm.append("image", new Blob([await file.arrayBuffer()], { type: mimeType }), fileName);

    const bgRes = await fetch(`${backendUrl}/remove-background`, {
      method: "POST",
      body: forwardForm,
    });

    if (!bgRes.ok) {
      const text = await bgRes.text();
      throw new Error(`Backend background removal failed: ${bgRes.status} - ${text}`);
    }

    const bgJson = await bgRes.json();
    const base64Image = bgJson?.processedImageUrl as string | undefined;
    if (!base64Image) {
      throw new Error("Backend did not return processedImageUrl");
    }

    console.log(`Background removal delegated to backend successfully.`);
    return NextResponse.json({ 
      processedImageUrl: base64Image,
      method: method,
      success: true
    });
  } catch (error) {
    console.error(`Background removal with method '${method}' failed:`, error);
    return NextResponse.json(
      { 
        error: "Background removal failed", 
        details: error instanceof Error ? error.message : String(error),
        method: method,
        success: false
      },
      { status: 500 }
    );
  }
} 