"use client";

export async function uploadToCloudinary(
  file: File,
  folder: string = "waste-submissions"
): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary config missing. Check NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Cloudinary upload failed");
  }

  const data = await response.json();
  return data.secure_url;
}

export async function uploadMultipleToCloudinary(
  files: File[],
  folder: string = "waste-submissions",
  onProgress?: (completed: number, total: number) => void
): Promise<string[]> {
  const urls: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const url = await uploadToCloudinary(files[i], folder);
    urls.push(url);
    onProgress?.(i + 1, files.length);
  }
  return urls;
}