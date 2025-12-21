import { PDFDocument, degrees } from "pdf-lib";
import { saveAs } from "file-saver";
import JSZip from "jszip";

export const mergePDFs = async (files: File[]): Promise<Blob> => {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const pdfBytes = await mergedPdf.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
};

export const splitPDF = async (
  file: File,
  ranges: { start: number; end: number }[]
): Promise<Blob[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const results: Blob[] = [];

  for (const range of ranges) {
    const newPdf = await PDFDocument.create();
    const pageIndices = [];
    for (let i = range.start - 1; i < range.end && i < pdf.getPageCount(); i++) {
      pageIndices.push(i);
    }
    const copiedPages = await newPdf.copyPages(pdf, pageIndices);
    copiedPages.forEach((page) => newPdf.addPage(page));
    const pdfBytes = await newPdf.save();
    results.push(new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" }));
  }

  return results;
};

export const rotatePDF = async (
  file: File,
  rotation: number,
  pageIndices?: number[]
): Promise<Blob> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const pages = pdf.getPages();

  const indicesToRotate = pageIndices || pages.map((_, i) => i);

  indicesToRotate.forEach((index) => {
    if (index >= 0 && index < pages.length) {
      const page = pages[index];
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees(currentRotation + rotation));
    }
  });

  const pdfBytes = await pdf.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
};

export const compressPDF = async (file: File): Promise<Blob> => {
  // Basic compression by recreating the PDF
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const pdfBytes = await pdf.save({ useObjectStreams: true });
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
};

export const addWatermark = async (
  file: File,
  watermarkText: string,
  options: {
    opacity?: number;
    fontSize?: number;
    rotation?: number;
  } = {}
): Promise<Blob> => {
  const { opacity = 0.3, fontSize = 50, rotation = -45 } = options;
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const pages = pdf.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();
    page.drawText(watermarkText, {
      x: width / 2 - watermarkText.length * (fontSize / 4),
      y: height / 2,
      size: fontSize,
      opacity: opacity,
      rotate: degrees(rotation),
    });
  }

  const pdfBytes = await pdf.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
};

export const addPageNumbers = async (
  file: File,
  options: {
    position?: "top" | "bottom";
    alignment?: "left" | "center" | "right";
    format?: string;
  } = {}
): Promise<Blob> => {
  const { position = "bottom", alignment = "center", format = "Page {n} of {total}" } = options;
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const pages = pdf.getPages();
  const totalPages = pages.length;

  pages.forEach((page, index) => {
    const { width, height } = page.getSize();
    const pageNum = index + 1;
    const text = format.replace("{n}", String(pageNum)).replace("{total}", String(totalPages));

    let x = width / 2 - text.length * 3;
    if (alignment === "left") x = 50;
    if (alignment === "right") x = width - 50 - text.length * 6;

    const y = position === "bottom" ? 30 : height - 30;

    page.drawText(text, {
      x,
      y,
      size: 12,
      opacity: 0.7,
    });
  });

  const pdfBytes = await pdf.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
};

export const downloadBlob = (blob: Blob, filename: string) => {
  saveAs(blob, filename);
};

export const downloadMultipleAsZip = async (
  files: { blob: Blob; name: string }[],
  zipName: string
) => {
  const zip = new JSZip();

  files.forEach(({ blob, name }) => {
    zip.file(name, blob);
  });

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, zipName);
};

export const getPDFPageCount = async (file: File): Promise<number> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  return pdf.getPageCount();
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const getFileExtension = (filename: string): string => {
  return filename.slice(filename.lastIndexOf(".")).toLowerCase();
};

export const generateUniqueId = (): string => {
  return crypto.randomUUID();
};
