from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from rembg import remove, new_session
from PIL import Image
import io
import base64
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Morph Canvas Backend", version="0.1.0")

# CORS (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://morphs-canvas.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a session for the model
session = new_session("silueta")

def _to_png_bytes(image: Image.Image) -> bytes:
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return buffer.getvalue()

def _bytes_to_data_url_png(data: bytes) -> str:
    b64 = base64.b64encode(data).decode("ascii")
    return f"data:image/png;base64,{b64}"

@app.get("/health")
async def health() -> dict:
    logger.info("Health endpoint called")
    return {"status": "ok"}

@app.post("/remove-background")
async def remove_background_endpoint(image: UploadFile = File(...)) -> JSONResponse:
    try:
        content = await image.read()
        if not content:
            raise HTTPException(status_code=400, detail="Empty file uploaded")

        logger.info("Processing image with rembg")
        output_bytes = remove(content, session=session)  # Use session
        if not output_bytes:
            raise HTTPException(status_code=500, detail="rembg produced empty output")

        try:
            img = Image.open(io.BytesIO(output_bytes)).convert("RGBA")
            output_bytes = _to_png_bytes(img)
        except Exception:
            pass

        return JSONResponse({"processedImageUrl": _bytes_to_data_url_png(output_bytes)})
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Background removal failed: {exc}")
        raise HTTPException(status_code=500, detail=f"Background removal failed: {exc}")

@app.post("/tint")
async def tint_endpoint(
    image: UploadFile = File(...),
    r: int = 102,
    g: int = 212,
    b: int = 255,
    factor: float = 0.2,
) -> JSONResponse:
    try:
        content = await image.read()
        if not content:
            raise HTTPException(status_code=400, detail="Empty file uploaded")

        base = Image.open(io.BytesIO(content)).convert("RGBA")

        pixels = base.load()
        width, height = base.size
        for y in range(height):
            for x in range(width):
                pr, pg, pb, pa = pixels[x, y]
                if pa > 0:
                    nr = int(round(pr * (1 - factor) + r * factor))
                    ng = int(round(pg * (1 - factor) + g * factor))
                    nb = int(round(pb * (1 - factor) + b * factor))
                    pixels[x, y] = (min(255, nr), min(255, ng), min(255, nb), pa)

        out_bytes = _to_png_bytes(base)
        return JSONResponse({"processedImageUrl": _bytes_to_data_url_png(out_bytes)})
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Tinting failed: {exc}")
        raise HTTPException(status_code=500, detail=f"Tinting failed: {exc}")

# Optional: For local testing only
if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    logger.info(f"Starting server on 0.0.0.0:{port}")
    uvicorn.run(app, host="0.0.0.0", port=port)