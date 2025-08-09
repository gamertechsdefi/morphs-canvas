import { NextRequest, NextResponse } from "next/server";
import { Jimp } from "jimp";
import path from "path";
import fs from "fs/promises";

// API Route Handler
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("image") as File;
  const projectType = formData.get("projectType")?.toString() || "base";
  const backgroundChoice = formData.get("backgroundChoice")?.toString() || "background1.png";

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const fileBuffer = Buffer.from(await file.arrayBuffer());

  try {
    console.log("Delegating background removal to backend...");

    const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
    const forwardForm = new FormData();
  let safeFileName = "upload.png";
  let safeMimeType = "image/png";
  if (typeof file === "object" && file !== null && "name" in file && typeof (file as File).name === "string") {
    safeFileName = (file as File).name;
  }
  if (typeof file === "object" && file !== null && "type" in file && typeof (file as File).type === "string") {
    safeMimeType = (file as File).type;
  }
  forwardForm.append("image", new Blob([fileBuffer], { type: safeMimeType }), safeFileName);

    const bgRes = await fetch(`${backendUrl}/remove-background`, {
      method: "POST",
      body: forwardForm,
    });

    if (!bgRes.ok) {
      const text = await bgRes.text();
      throw new Error(`Backend background removal failed: ${bgRes.status} - ${text}`);
    }

    const bgJson = await bgRes.json();
    const processedDataUrl = bgJson?.processedImageUrl as string | undefined;
    if (!processedDataUrl) {
      throw new Error("Backend did not return processedImageUrl");
    }

    // Convert data URL to buffer to continue local composition
    const dataFetch = await fetch(processedDataUrl);
    const subjectArrayBuffer = await dataFetch.arrayBuffer();
    const subjectBuffer = Buffer.from(subjectArrayBuffer);

    const image = await Jimp.read(subjectBuffer);
    // Backgrounds now sourced from public/images (UI supplies filename)
    const backgroundPath = path.resolve(process.cwd(), "public", "images", backgroundChoice);

    try {
      await fs.access(backgroundPath);
    } catch {
      throw new Error(`Background image not found: ${backgroundPath}`);
    }

    console.log("Loading background image...");
    const background = await Jimp.read(backgroundPath);

    background.resize({ w: image.bitmap.width, h: image.bitmap.height });
    background.composite(image, 0, 0);

    const outputBuffer = await background.getBuffer("image/png");
    const base64Image = `data:image/png;base64,${outputBuffer.toString("base64")}`;

    console.log("Image processing complete.");
    return NextResponse.json({ processedImageUrl: base64Image });
  } catch (error) {
    console.error("Image processing failed:", error);
    return NextResponse.json(
      { 
        error: "Image processing failed", 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}
