import QRCode from "qrcode";

export interface QRCodeOptions {
  size?: number;
  foreground?: string;
  background?: string;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
}

/**
 * Generate a QR code as a Blob using the qrcode library
 */
export const generateQRCode = async (
  text: string,
  options: QRCodeOptions = {}
): Promise<Blob> => {
  const {
    size = 256,
    foreground = "#000000",
    background = "#ffffff",
    errorCorrectionLevel = "M",
  } = options;

  // Generate QR code as data URL
  const dataUrl = await QRCode.toDataURL(text, {
    width: size,
    margin: 2,
    color: {
      dark: foreground,
      light: background,
    },
    errorCorrectionLevel,
  });

  // Convert data URL to Blob
  const response = await fetch(dataUrl);
  return response.blob();
};

/**
 * Generate QR code directly to a canvas element
 */
export const generateQRCodeToCanvas = async (
  canvas: HTMLCanvasElement,
  text: string,
  options: QRCodeOptions = {}
): Promise<void> => {
  const {
    size = 256,
    foreground = "#000000",
    background = "#ffffff",
    errorCorrectionLevel = "M",
  } = options;

  await QRCode.toCanvas(canvas, text, {
    width: size,
    margin: 2,
    color: {
      dark: foreground,
      light: background,
    },
    errorCorrectionLevel,
  });
};

/**
 * Download a QR code as PNG file
 */
export const downloadQRCode = async (
  text: string,
  filename: string = "qrcode.png",
  options: QRCodeOptions = {}
) => {
  const blob = await generateQRCode(text, { size: 512, ...options });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
