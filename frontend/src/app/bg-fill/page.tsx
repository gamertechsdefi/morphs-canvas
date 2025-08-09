"use client";

import { useState, useEffect, ChangeEvent } from "react";
import Image from "next/image";
import Header from "@/components/Header";

export default function Home() {
  const [projectType] = useState<string>("morph");
  const [backgrounds, setBackgrounds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  type ResultStatus = "processing" | "done" | "error";
  type ResultItem = {
    background: string;
    url?: string;
    status: ResultStatus;
    error?: string;
  };
  const [processedImages, setProcessedImages] = useState<ResultItem[]>([]);
  const overlayLoading =
    !!selectedFile && backgrounds.length > 0 &&
    (processedImages.length === 0 || processedImages.some((it) => it.status === "processing"));

  // Fetch available backgrounds for the selected project type
  useEffect(() => {
    async function fetchBackgrounds() {
      try {
        console.log(`Fetching backgrounds from: /api/background-count?projectType=${projectType}`);
        const response = await fetch(`/api/background-count?projectType=${projectType}`);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch backgrounds: ${response.status} - ${errorText}`);
        }
        const data = await response.json();
        console.log("Backgrounds received:", data);
        setBackgrounds(data.backgrounds || []);
      } catch (err) {
        const errorMessage = (err as Error).message || "Could not fetch backgrounds";
        console.error("Fetch error:", err);
        setError(errorMessage);
        setBackgrounds([]);
      }
    }
    fetchBackgrounds();
  }, [projectType]);

  // Process the uploaded image against all available backgrounds
  const processAllBackgrounds = async () => {
    const file = selectedFile;
    if (!file || backgrounds.length === 0) return;
    setError(null);
    setProcessedImages(backgrounds.map((bg) => ({ background: bg, status: "processing" })));
    try {
      await Promise.all(
        backgrounds.map(async (bg) => {
          const formData = new FormData();
          formData.append("image", file);
          formData.append("projectType", projectType);
          formData.append("backgroundChoice", bg);

          try {
            const response = await fetch(`/api/upload`, { method: "POST", body: formData });
            if (!response.ok) {
              let message = `Failed: ${response.status}`;
              try {
                const errorData = await response.json();
                message = errorData.details || errorData.error || message;
              } catch {}
              throw new Error(message);
            }
            const data = await response.json();
            if (!data.processedImageUrl) throw new Error("No processed image URL returned");
            setProcessedImages((prev) => prev.map((it) => (it.background === bg ? { ...it, url: data.processedImageUrl, status: "done" } : it)));
          } catch (err) {
            const errorMessage = (err as Error).message || "Processing failed";
            setProcessedImages((prev) => prev.map((it) => (it.background === bg ? { ...it, status: "error", error: errorMessage } : it)));
            setError(errorMessage);
          }
        })
      );
    } finally {
      // no-op
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setSelectedFile(file);
    setSelectedImage(URL.createObjectURL(file));
    setProcessedImages([]);
    // processing will start via effect when backgrounds are ready
  };

  // Start processing when we have both the selected file and backgrounds
  useEffect(() => {
    if (selectedFile && backgrounds.length > 0) {
      console.log("Starting processing across backgrounds...", backgrounds);
      void processAllBackgrounds();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFile, backgrounds]);

  const handleDownload = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      setError("Failed to download image");
    }
  };

  return (
    <div>
      <Header />
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow mt-16 px-4 py-8 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-neutral-800 p-6 rounded-lg shadow-md">
              <h1 className="text-3xl font-bold text-green-500 mb-6 text-center">AI Generated Images</h1>

              <div>
                <label htmlFor="images" className="block mb-2 text-white">Upload Images</label>
                <input
                  type="file"
                  id="images"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="w-full p-2 border-2 border-dashed border-green-300 rounded-md text-gray-700 bg-white"
                />
                {backgrounds.length === 0 && (
                  <p className="mt-2 text-sm text-gray-300">No backgrounds found for project type.</p>
                )}
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedImage && (
                  <div className="bg-neutral-900 p-3 rounded-md">
                    <div className="aspect-square bg-white rounded overflow-hidden flex items-center justify-center">
                      <Image src={selectedImage} alt="Original" width={500} height={500} className="w-full h-full object-contain opacity-70" />
                    </div>
                    <div className="mt-3 text-xs text-gray-400">Original</div>
                  </div>
                )}

                {processedImages.map((it) => (
                  <div key={it.background} className="bg-neutral-900 p-3 rounded-md">
                    <div className="aspect-square bg-white rounded overflow-hidden flex items-center justify-center">
                      {it.url ? (
                        <Image src={it.url} alt={`Processed ${it.background}`} width={500} height={500} className="w-full h-full object-contain" />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-500 border-t-transparent mb-2" />
                          <span className="text-xs">{it.status === "error" ? "Failed" : "Processing..."}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-center">
                      {/* <span className="text-xs text-gray-400 truncate" title={it.background}>{it.background}</span> */}
                      {it.url && (
                        <button
                          onClick={() => handleDownload(it.url!, `processed-${it.background}.png`)}
                          className="text-sm px-3 flex py-1 bg-green-700 text-white rounded-md hover:bg-green-800"
                        >
                          Download
                        </button>
                      )}
                    </div>
                    {it.error && <div className="mt-2 text-xs text-red-400">{it.error}</div>}
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="mt-4 text-red-500 text-center">
                Error: {error}
              </div>
            )}
          </div>
        </main>

        {overlayLoading && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
              <p className="text-white">Processing images...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}