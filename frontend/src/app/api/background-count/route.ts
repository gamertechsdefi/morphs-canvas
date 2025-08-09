import { NextRequest, NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import path from 'path';

// Endpoint to get background count and list available backgrounds
export async function GET(request: NextRequest) {
  // For the new UX, backgrounds are sourced from public/images
  const imagesDir = path.join(process.cwd(), 'public', 'images');

  try {
    const files = await readdir(imagesDir);
    const pngFiles = files.filter(file => file.endsWith('.png'));
    return NextResponse.json({ count: pngFiles.length, backgrounds: pngFiles });
  } catch (error) {
    console.error("Error fetching background count:", error);
    return NextResponse.json({ error: "Failed to fetch background count" }, { status: 500 });
  }
}