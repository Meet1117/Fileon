export const imageToPDF = async (files: File[]): Promise<Blob> => {
  const { PDFDocument } = await import("pdf-lib");
  const pdfDoc = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    let image;
    if (file.type === "image/jpeg" || file.type === "image/jpg") {
      image = await pdfDoc.embedJpg(uint8Array);
    } else if (file.type === "image/png") {
      image = await pdfDoc.embedPng(uint8Array);
    } else {
      // Convert other formats to PNG via canvas
      const img = await createImageFromFile(file);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const pngDataUrl = canvas.toDataURL("image/png");
      const pngBase64 = pngDataUrl.split(",")[1];
      const pngBytes = Uint8Array.from(atob(pngBase64), (c) => c.charCodeAt(0));
      image = await pdfDoc.embedPng(pngBytes);
    }

    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
};

/**
 * Compress image by reducing quality and optionally resizing
 * This actually reduces file size by using lower JPEG quality
 */
export const compressImage = async (
  file: File,
  quality: number = 0.7,
  maxWidth?: number,
  maxHeight?: number
): Promise<Blob> => {
  const img = await createImageFromFile(file);

  let width = img.width;
  let height = img.height;

  // Apply max dimension constraints if provided
  if (maxWidth && width > maxWidth) {
    height = Math.round((height * maxWidth) / width);
    width = maxWidth;
  }

  if (maxHeight && height > maxHeight) {
    width = Math.round((width * maxHeight) / height);
    height = maxHeight;
  }

  // For better compression, also scale down large images
  const maxDimension = 2000;
  if (width > maxDimension || height > maxDimension) {
    const scale = maxDimension / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d")!;
  
  // Use better image smoothing for quality
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  
  ctx.drawImage(img, 0, 0, width, height);

  // Always output as JPEG for compression (except PNG with transparency)
  // JPEG compression is much more effective for reducing file size
  const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
  const outputQuality = outputType === "image/png" ? undefined : quality;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to compress image"));
        }
      },
      outputType,
      outputQuality
    );
  });
};

export const resizeImage = async (
  file: File,
  width: number,
  height: number,
  maintainAspect: boolean = true
): Promise<Blob> => {
  const img = await createImageFromFile(file);

  let newWidth = width;
  let newHeight = height;

  if (maintainAspect) {
    const aspectRatio = img.width / img.height;
    if (width / height > aspectRatio) {
      newWidth = Math.round(height * aspectRatio);
    } else {
      newHeight = Math.round(width / aspectRatio);
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = newWidth;
  canvas.height = newHeight;

  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, newWidth, newHeight);

  // Determine output format based on input
  const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to resize image"));
        }
      },
      outputType,
      0.92
    );
  });
};

export const convertImage = async (
  file: File,
  targetFormat: "jpeg" | "png" | "webp"
): Promise<Blob> => {
  const img = await createImageFromFile(file);

  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext("2d")!;
  
  // For JPEG, fill background with white since it doesn't support transparency
  if (targetFormat === "jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  
  ctx.drawImage(img, 0, 0);

  const mimeType = `image/${targetFormat}`;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to convert image"));
        }
      },
      mimeType,
      0.92
    );
  });
};

export const cropImage = async (
  file: File,
  cropArea: { x: number; y: number; width: number; height: number }
): Promise<Blob> => {
  const img = await createImageFromFile(file);

  const canvas = document.createElement("canvas");
  canvas.width = cropArea.width;
  canvas.height = cropArea.height;

  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(
    img,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    cropArea.width,
    cropArea.height
  );

  const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to crop image"));
        }
      },
      outputType,
      0.92
    );
  });
};

export const createImageFromFile = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
};

export const getImageDimensions = async (
  file: File
): Promise<{ width: number; height: number }> => {
  const img = await createImageFromFile(file);
  return { width: img.width, height: img.height };
};
