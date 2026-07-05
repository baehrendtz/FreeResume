/**
 * Read an image file as a data URL, downscaled so its longest side is at most
 * `maxDimension` px. Keeps the base64 payload small enough that the CV (which
 * is persisted to sessionStorage on every change) stays well under the quota.
 */
export async function readPhotoAsDataUrl(file: File, maxDimension: number): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = dataUrl;
  });

  const largestSide = Math.max(img.width, img.height);
  if (largestSide <= maxDimension) return dataUrl;

  const scale = maxDimension / largestSide;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;

  // JPEG has no alpha channel, paint white so transparent PNGs don't turn black
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.85);
}
