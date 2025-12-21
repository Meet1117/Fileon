import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Download, RefreshCw, Check, AlertCircle, Info } from "lucide-react";
import Layout from "@/components/layout/Layout";
import FileDropzone from "@/components/common/FileDropzone";
import ProgressBar from "@/components/common/ProgressBar";
import { Button } from "@/components/ui/button";
import { getToolById } from "@/data/tools";
import { FileWithPreview, ConversionJob } from "@/types/file";
import { 
  mergePDFs, 
  downloadBlob, 
  formatFileSize, 
  rotatePDF, 
  compressPDF, 
  addWatermark, 
  addPageNumbers,
  splitPDF,
  downloadMultipleAsZip
} from "@/utils/fileUtils";
import { imageToPDF, compressImage, resizeImage, convertImage, cropImage, getImageDimensions } from "@/utils/imageUtils";
import { 
  pdfToWord, 
  wordToPDF, 
  pdfToExcel, 
  excelToPDF, 
  pdfToPPT, 
  pptToPDF,
  compareFiles,
  batchConvert
} from "@/utils/documentUtils";
import { useConversionHistory } from "@/hooks/useConversionHistory";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Tools that require backend/server-side processing and are not available in browser-only mode
const UNSUPPORTED_TOOLS = [
  "protect-pdf",
  "unlock-pdf",
];

const ToolPage = () => {
  const { toolId } = useParams<{ toolId: string }>();
  const tool = getToolById(toolId || "");
  const { addToHistory } = useConversionHistory();

  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [job, setJob] = useState<ConversionJob | null>(null);
  const [options, setOptions] = useState<Record<string, any>>({});
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  // Load image dimensions when file is selected (for crop tool)
  useEffect(() => {
    if (files.length > 0 && (toolId === "crop-image" || toolId === "resize-image")) {
      getImageDimensions(files[0]).then(setImageDimensions);
    }
  }, [files, toolId]);

  const isUnsupported = UNSUPPORTED_TOOLS.includes(toolId || "");

  // Tool-specific options
  const renderToolOptions = () => {
    if (isUnsupported) {
      return (
        <Alert className="bg-amber-500/10 border-amber-500/30">
          <Info className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-600 dark:text-amber-400">
            This tool requires server-side processing and is coming soon. Check back later!
          </AlertDescription>
        </Alert>
      );
    }

    switch (toolId) {
      case "split-pdf":
        return (
          <div className="space-y-4">
            <div>
              <Label>Split Mode</Label>
              <Select
                value={options.splitMode || "pages"}
                onValueChange={(value) => setOptions({ ...options, splitMode: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select split mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pages">Extract specific pages</SelectItem>
                  <SelectItem value="range">Extract page range</SelectItem>
                  <SelectItem value="each">Split each page</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {options.splitMode === "pages" && (
              <div>
                <Label>Page Numbers (comma-separated)</Label>
                <Input
                  value={options.pages || ""}
                  onChange={(e) => setOptions({ ...options, pages: e.target.value })}
                  placeholder="e.g., 1, 3, 5"
                />
              </div>
            )}
            {options.splitMode === "range" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Page</Label>
                  <Input
                    type="number"
                    min="1"
                    value={options.startPage || 1}
                    onChange={(e) => setOptions({ ...options, startPage: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>End Page</Label>
                  <Input
                    type="number"
                    min="1"
                    value={options.endPage || 1}
                    onChange={(e) => setOptions({ ...options, endPage: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            )}
          </div>
        );
      case "rotate-pdf":
        return (
          <div className="space-y-4">
            <Label>Rotation Angle</Label>
            <Select
              value={options.rotation || "90"}
              onValueChange={(value) => setOptions({ ...options, rotation: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select rotation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="90">90° Clockwise</SelectItem>
                <SelectItem value="180">180°</SelectItem>
                <SelectItem value="270">270° (90° Counter-clockwise)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      case "watermark-pdf":
        return (
          <div className="space-y-4">
            <div>
              <Label>Watermark Text</Label>
              <Input
                value={options.watermarkText || ""}
                onChange={(e) => setOptions({ ...options, watermarkText: e.target.value })}
                placeholder="Enter watermark text..."
              />
            </div>
            <div>
              <Label>Opacity ({Math.round((options.opacity || 0.3) * 100)}%)</Label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={options.opacity || 0.3}
                onChange={(e) => setOptions({ ...options, opacity: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        );
      case "resize-image":
        return (
          <div className="space-y-4">
            {imageDimensions && (
              <p className="text-sm text-muted-foreground">
                Original: {imageDimensions.width} × {imageDimensions.height} px
              </p>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Width (px)</Label>
                <Input
                  type="number"
                  value={options.width || 800}
                  onChange={(e) => setOptions({ ...options, width: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label>Height (px)</Label>
                <Input
                  type="number"
                  value={options.height || 600}
                  onChange={(e) => setOptions({ ...options, height: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="maintainAspect"
                checked={options.maintainAspect !== false}
                onChange={(e) => setOptions({ ...options, maintainAspect: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="maintainAspect">Maintain aspect ratio</Label>
            </div>
          </div>
        );
      case "compress-image":
        return (
          <div className="space-y-4">
            <Label>Quality ({Math.round((options.quality || 0.7) * 100)}%)</Label>
            <input
              type="range"
              min="0.1"
              max="0.95"
              step="0.05"
              value={options.quality || 0.7}
              onChange={(e) => setOptions({ ...options, quality: parseFloat(e.target.value) })}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Lower quality = smaller file size. Recommended: 60-80%
            </p>
          </div>
        );
      case "convert-image":
        return (
          <div className="space-y-4">
            <Label>Output Format</Label>
            <Select
              value={options.format || "png"}
              onValueChange={(value) => setOptions({ ...options, format: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jpeg">JPEG (smaller, no transparency)</SelectItem>
                <SelectItem value="png">PNG (lossless, with transparency)</SelectItem>
                <SelectItem value="webp">WebP (modern, best compression)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      case "crop-image":
        return (
          <div className="space-y-4">
            {imageDimensions && (
              <p className="text-sm text-muted-foreground">
                Original: {imageDimensions.width} × {imageDimensions.height} px
              </p>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>X Position</Label>
                <Input
                  type="number"
                  min="0"
                  value={options.cropX || 0}
                  onChange={(e) => setOptions({ ...options, cropX: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label>Y Position</Label>
                <Input
                  type="number"
                  min="0"
                  value={options.cropY || 0}
                  onChange={(e) => setOptions({ ...options, cropY: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label>Width</Label>
                <Input
                  type="number"
                  min="1"
                  value={options.cropWidth || imageDimensions?.width || 100}
                  onChange={(e) => setOptions({ ...options, cropWidth: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label>Height</Label>
                <Input
                  type="number"
                  min="1"
                  value={options.cropHeight || imageDimensions?.height || 100}
                  onChange={(e) => setOptions({ ...options, cropHeight: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </div>
        );
      case "pdf-to-image":
        return (
          <div className="space-y-4">
            <Label>Output Format</Label>
            <Select
              value={options.imageFormat || "png"}
              onValueChange={(value) => setOptions({ ...options, imageFormat: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="jpeg">JPEG</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Each PDF page will be converted to a separate image.
            </p>
          </div>
        );
      case "pdf-stamp":
        return (
          <div className="space-y-4">
            <div>
              <Label>Stamp Text</Label>
              <Input
                value={options.stampText || ""}
                onChange={(e) => setOptions({ ...options, stampText: e.target.value })}
                placeholder="e.g., APPROVED, CONFIDENTIAL"
              />
            </div>
            <div>
              <Label>Position</Label>
              <Select
                value={options.stampPosition || "center"}
                onValueChange={(value) => setOptions({ ...options, stampPosition: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top-left">Top Left</SelectItem>
                  <SelectItem value="top-right">Top Right</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case "file-compare":
        return (
          <div className="space-y-4">
            <Alert className="bg-blue-500/10 border-blue-500/30">
              <Info className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-blue-600 dark:text-blue-400">
                Upload two files to compare. Text differences will be highlighted.
              </AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground">
              Supports: PDF files (basic text) and text files
            </p>
          </div>
        );
      case "batch-convert":
        return (
          <div className="space-y-4">
            <div>
              <Label>Target Format</Label>
              <Select
                value={options.targetFormat || "pdf"}
                onValueChange={(value) => setOptions({ ...options, targetFormat: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="jpg">JPEG</SelectItem>
                  <SelectItem value="png">PNG</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              Batch convert supports: Images ↔ PDF, Image format conversions
            </p>
          </div>
        );
      case "pdf-to-word":
      case "word-to-pdf":
      case "pdf-to-excel":
      case "excel-to-pdf":
      case "pdf-to-ppt":
      case "ppt-to-pdf":
        return (
          <Alert className="bg-blue-500/10 border-blue-500/30">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-600 dark:text-blue-400">
              Browser-based conversion extracts basic text structure.
            </AlertDescription>
          </Alert>
        );
      default:
        return null;
    }
  };

  const handleProcess = async () => {
    if (files.length === 0) {
      toast.error("Please add files first");
      return;
    }

    if (isUnsupported) {
      toast.error("This tool is not yet available");
      return;
    }

    setJob({
      id: crypto.randomUUID(),
      files,
      status: "processing",
      progress: 0,
    });

    try {
      let result: Blob | Blob[] | null = null;
      let resultName = "result";
      let isMultiple = false;

      // Simulate progress
      const progressInterval = setInterval(() => {
        setJob((prev) =>
          prev && prev.progress < 90
            ? { ...prev, progress: prev.progress + 10 }
            : prev
        );
      }, 200);

      switch (toolId) {
        case "merge-pdf":
          result = await mergePDFs(files);
          resultName = "merged.pdf";
          break;
        case "split-pdf": {
          const mode = options.splitMode || "each";
          let ranges: { start: number; end: number }[] = [];
          
          if (mode === "each") {
            // Split into individual pages - we'll handle this specially
            const { PDFDocument } = await import("pdf-lib");
            const arrayBuffer = await files[0].arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            const pageCount = pdf.getPageCount();
            ranges = Array.from({ length: pageCount }, (_, i) => ({ start: i + 1, end: i + 1 }));
          } else if (mode === "pages") {
            const pages = (options.pages || "1").split(",").map((p: string) => parseInt(p.trim())).filter((p: number) => !isNaN(p));
            ranges = pages.map((p: number) => ({ start: p, end: p }));
          } else if (mode === "range") {
            ranges = [{ start: options.startPage || 1, end: options.endPage || 1 }];
          }
          
          result = await splitPDF(files[0], ranges);
          isMultiple = true;
          resultName = "split-pages.zip";
          break;
        }
        case "rotate-pdf":
          result = await rotatePDF(files[0], parseInt(options.rotation || "90"));
          resultName = "rotated.pdf";
          break;
        case "compress-pdf":
          result = await compressPDF(files[0]);
          resultName = "compressed.pdf";
          break;
        case "watermark-pdf":
          result = await addWatermark(files[0], options.watermarkText || "WATERMARK", {
            opacity: options.opacity || 0.3,
          });
          resultName = "watermarked.pdf";
          break;
        case "page-numbers":
          result = await addPageNumbers(files[0]);
          resultName = "numbered.pdf";
          break;
        case "image-to-pdf":
          result = await imageToPDF(files);
          resultName = "images.pdf";
          break;
        case "pdf-to-image": {
          // Render PDF pages to canvas using pdf.js concepts (simplified)
          // For now, show a message that this requires more complex setup
          toast.info("PDF to Image requires additional setup. Coming soon!");
          clearInterval(progressInterval);
          setJob(null);
          return;
        }
        case "compress-image":
          result = await compressImage(files[0], options.quality || 0.7);
          const ext = files[0].type === "image/png" ? "png" : "jpg";
          resultName = `compressed.${ext}`;
          break;
        case "resize-image":
          result = await resizeImage(
            files[0], 
            options.width || 800, 
            options.height || 600,
            options.maintainAspect !== false
          );
          resultName = `resized.${files[0].type === "image/png" ? "png" : "jpg"}`;
          break;
        case "convert-image":
          result = await convertImage(files[0], options.format || "png");
          resultName = `converted.${options.format || "png"}`;
          break;
        case "crop-image":
          result = await cropImage(files[0], {
            x: options.cropX || 0,
            y: options.cropY || 0,
            width: options.cropWidth || imageDimensions?.width || 100,
            height: options.cropHeight || imageDimensions?.height || 100,
          });
          resultName = `cropped.${files[0].type === "image/png" ? "png" : "jpg"}`;
          break;
        case "pdf-stamp":
          // Use watermark function with different positioning
          result = await addWatermark(files[0], options.stampText || "STAMP", {
            opacity: 0.8,
            fontSize: 40,
          });
          resultName = "stamped.pdf";
          break;
        case "pdf-to-word":
          result = await pdfToWord(files[0]);
          resultName = "converted.docx";
          break;
        case "word-to-pdf":
          result = await wordToPDF(files[0]);
          resultName = "converted.pdf";
          break;
        case "pdf-to-excel":
          result = await pdfToExcel(files[0]);
          resultName = "converted.xlsx";
          break;
        case "excel-to-pdf":
          result = await excelToPDF(files[0]);
          resultName = "converted.pdf";
          break;
        case "pdf-to-ppt":
          result = await pdfToPPT(files[0]);
          resultName = "converted.pptx";
          break;
        case "ppt-to-pdf":
          result = await pptToPDF(files[0]);
          resultName = "converted.pdf";
          break;
        case "file-compare": {
          if (files.length < 2) {
            throw new Error("Please upload two files to compare");
          }
          const comparison = await compareFiles(files[0], files[1]);
          
          // Create a text report of the differences
          let report = `File Comparison Report\n`;
          report += `======================\n\n`;
          report += `File 1: ${files[0].name}\n`;
          report += `File 2: ${files[1].name}\n\n`;
          report += `Summary:\n`;
          report += `- Additions: ${comparison.summary.additions}\n`;
          report += `- Deletions: ${comparison.summary.deletions}\n`;
          report += `- Unchanged sections: ${comparison.summary.unchanged}\n\n`;
          report += `Differences:\n`;
          report += `------------\n\n`;
          
          for (const diff of comparison.differences) {
            if (diff.type === 'added') {
              report += `+ ${diff.value}`;
            } else if (diff.type === 'removed') {
              report += `- ${diff.value}`;
            }
          }
          
          result = new Blob([report], { type: 'text/plain' });
          resultName = "comparison-report.txt";
          break;
        }
        case "batch-convert": {
          const targetFormat = options.targetFormat || 'pdf';
          const convertedFiles = await batchConvert(files, targetFormat);
          
          if (convertedFiles.length === 0) {
            throw new Error("No files could be converted. Make sure you're using supported formats.");
          }
          
          if (convertedFiles.length === 1) {
            result = convertedFiles[0].blob;
            resultName = convertedFiles[0].name;
          } else {
            await downloadMultipleAsZip(convertedFiles, "batch-converted.zip");
            clearInterval(progressInterval);
            
            setJob({
              id: crypto.randomUUID(),
              files,
              status: "completed",
              progress: 100,
            });

            addToHistory({
              toolId: toolId || "",
              toolName: tool?.name || "",
              fileName: "batch-converted.zip",
              fileSize: convertedFiles.reduce((acc, f) => acc + f.blob.size, 0),
            });

            toast.success(`Batch conversion complete! ${convertedFiles.length} files converted.`);
            return;
          }
          break;
        }
        default:
          throw new Error("Tool not implemented yet");
      }

      clearInterval(progressInterval);

      if (result) {
        if (isMultiple && Array.isArray(result)) {
          // Download multiple files as zip
          const filesForZip = result.map((blob, i) => ({
            blob,
            name: `page-${i + 1}.pdf`
          }));
          await downloadMultipleAsZip(filesForZip, resultName);
          
          setJob({
            id: crypto.randomUUID(),
            files,
            status: "completed",
            progress: 100,
          });

          addToHistory({
            toolId: toolId || "",
            toolName: tool?.name || "",
            fileName: resultName,
            fileSize: result.reduce((acc, b) => acc + b.size, 0),
          });

          toast.success("Split complete! Download started.");
        } else {
          const singleResult = Array.isArray(result) ? result[0] : result;
          setJob({
            id: crypto.randomUUID(),
            files,
            status: "completed",
            progress: 100,
            result: singleResult,
            resultName,
          });

          addToHistory({
            toolId: toolId || "",
            toolName: tool?.name || "",
            fileName: resultName,
            fileSize: singleResult.size,
          });

          toast.success("Conversion completed!");
        }
      }
    } catch (error) {
      console.error(error);
      setJob((prev) =>
        prev
          ? { ...prev, status: "error", error: (error as Error).message }
          : null
      );
      toast.error("Conversion failed. Please try again.");
    }
  };

  const handleDownload = () => {
    if (job?.result && job.resultName) {
      downloadBlob(job.result, job.resultName);
      toast.success("Download started!");
    }
  };

  const handleReset = () => {
    setFiles([]);
    setJob(null);
    setOptions({});
    setImageDimensions(null);
  };

  if (!tool) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-display font-bold mb-4">Tool Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The tool you're looking for doesn't exist.
          </p>
          <Link to="/">
            <Button>Go Back Home</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const acceptedFormats: Record<string, string[]> = {};
  tool.inputFormats.forEach((format) => {
    const mimeTypes: Record<string, string[]> = {
      ".pdf": ["application/pdf"],
      ".jpg": ["image/jpeg"],
      ".jpeg": ["image/jpeg"],
      ".png": ["image/png"],
      ".gif": ["image/gif"],
      ".webp": ["image/webp"],
      ".bmp": ["image/bmp"],
      ".txt": ["text/plain"],
      ".doc": ["application/msword"],
      ".docx": ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
      ".xls": ["application/vnd.ms-excel"],
      ".xlsx": ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
      ".ppt": ["application/vnd.ms-powerpoint"],
      ".pptx": ["application/vnd.openxmlformats-officedocument.presentationml.presentation"],
    };
    if (mimeTypes[format]) {
      mimeTypes[format].forEach((mime) => {
        if (!acceptedFormats[mime]) {
          acceptedFormats[mime] = [];
        }
        acceptedFormats[mime].push(format);
      });
    }
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Tools
          </Link>

          <div className="flex items-start gap-6">
            <div className={`w-16 h-16 rounded-2xl bg-${tool.color}/10 flex items-center justify-center`}>
              <tool.icon className={`w-8 h-8 text-${tool.color}`} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
                {tool.name}
              </h1>
              <p className="text-lg text-muted-foreground">{tool.description}</p>
              {isUnsupported && (
                <span className="inline-block mt-2 px-3 py-1 bg-amber-500/20 text-amber-600 dark:text-amber-400 text-sm rounded-full">
                  Coming Soon
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Dropzone / Processing Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="glass-card p-8">
              {isUnsupported ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
                    <Info className="w-10 h-10 text-amber-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    This tool requires server-side processing capabilities. 
                    We're working on bringing this feature to you soon!
                  </p>
                  <Link to="/">
                    <Button variant="outline">Browse Available Tools</Button>
                  </Link>
                </div>
              ) : job?.status === "completed" ? (
                <div className="text-center py-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-6"
                  >
                    <Check className="w-10 h-10 text-secondary" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2">Conversion Complete!</h3>
                  <p className="text-muted-foreground mb-6">
                    Your file is ready: {job.resultName} 
                    {job.result ? ` (${formatFileSize(job.result.size)})` : ""}
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    {job.result && (
                      <Button onClick={handleDownload} size="lg">
                        <Download className="w-4 h-4 mr-2" />
                        Download File
                      </Button>
                    )}
                    <Button variant="outline" onClick={handleReset} size="lg">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Convert Another
                    </Button>
                  </div>
                </div>
              ) : job?.status === "error" ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-10 h-10 text-destructive" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Conversion Failed</h3>
                  <p className="text-muted-foreground mb-6">{job.error}</p>
                  <Button onClick={handleReset}>Try Again</Button>
                </div>
              ) : job?.status === "processing" ? (
                <div className="py-12">
                  <div className="text-center mb-8">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4"
                    >
                      <RefreshCw className="w-8 h-8 text-primary" />
                    </motion.div>
                    <h3 className="text-xl font-semibold">Processing...</h3>
                  </div>
                  <ProgressBar progress={job.progress} className="max-w-md mx-auto" />
                </div>
              ) : (
                <FileDropzone
                  files={files}
                  onFilesChange={setFiles}
                  accept={acceptedFormats}
                  maxFiles={tool.id === "merge-pdf" || tool.id === "image-to-pdf" || tool.id === "batch-convert" ? 20 : tool.id === "file-compare" ? 2 : 1}
                />
              )}
            </div>
          </motion.div>

          {/* Options Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="glass-card p-6 space-y-6">
              <h3 className="font-display font-semibold text-lg">Options</h3>

              {renderToolOptions()}

              <div className="pt-4 border-t border-border">
                <Button
                  onClick={handleProcess}
                  disabled={files.length === 0 || job?.status === "processing" || isUnsupported}
                  className="w-full bg-gradient-to-r from-primary to-primary-light hover:shadow-glow transition-shadow"
                  size="lg"
                >
                  {job?.status === "processing" ? "Processing..." : `Convert ${files.length > 0 ? `(${files.length})` : ""}`}
                </Button>
              </div>

              {/* Supported formats */}
              <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-medium mb-2">Supported Formats</h4>
                <div className="flex flex-wrap gap-1">
                  {tool.inputFormats.map((format) => (
                    <span
                      key={format}
                      className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground"
                    >
                      {format}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default ToolPage;
