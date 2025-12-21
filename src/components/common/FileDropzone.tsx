import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, Image as ImageIcon, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { FileWithPreview } from "@/types/file";
import { formatFileSize, generateUniqueId } from "@/utils/fileUtils";

interface FileDropzoneProps {
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  onFilesChange: (files: FileWithPreview[]) => void;
  files: FileWithPreview[];
  className?: string;
}

const FileDropzone = ({
  accept,
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024, // 50MB
  onFilesChange,
  files,
  className,
}: FileDropzoneProps) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles: FileWithPreview[] = acceptedFiles.map((file) => {
        const fileWithPreview = file as FileWithPreview;
        fileWithPreview.id = generateUniqueId();
        if (file.type.startsWith("image/")) {
          fileWithPreview.preview = URL.createObjectURL(file);
        }
        return fileWithPreview;
      });
      onFilesChange([...files, ...newFiles].slice(0, maxFiles));
    },
    [files, maxFiles, onFilesChange]
  );

  const { getRootProps, getInputProps, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxFiles: maxFiles - files.length,
    maxSize,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  const removeFile = (id: string) => {
    const file = files.find((f) => f.id === id);
    if (file?.preview) {
      URL.revokeObjectURL(file.preview);
    }
    onFilesChange(files.filter((f) => f.id !== id));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return ImageIcon;
    if (file.type === "application/pdf") return FileText;
    return File;
  };

  const dropzoneProps = getRootProps();

  return (
    <div className={cn("space-y-4", className)}>
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={dropzoneProps.onClick}
        onKeyDown={dropzoneProps.onKeyDown}
        onFocus={dropzoneProps.onFocus}
        onBlur={dropzoneProps.onBlur}
        tabIndex={dropzoneProps.tabIndex}
        role={dropzoneProps.role}
        className={cn(
          "dropzone relative",
          isDragActive && "active",
          isDragReject && "border-destructive bg-destructive/5"
        )}
        onDragEnter={dropzoneProps.onDragEnter}
        onDragOver={dropzoneProps.onDragOver}
        onDragLeave={dropzoneProps.onDragLeave}
        onDrop={dropzoneProps.onDrop}
      >
        <input {...getInputProps()} />

        <motion.div
          initial={false}
          animate={{ scale: isDragActive ? 1.1 : 1 }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <motion.div
            animate={{
              y: isDragActive ? -10 : 0,
              rotate: isDragActive ? 10 : 0,
            }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center"
          >
            <Upload className="w-10 h-10 text-primary" />
          </motion.div>

          <div>
            <h3 className="text-lg font-semibold mb-1">
              {isDragActive
                ? "Drop your files here!"
                : "Drag & drop files here"}
            </h3>
            <p className="text-muted-foreground text-sm">
              or click to browse from your computer
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Max {maxFiles} files</span>
            <span>•</span>
            <span>Up to {formatFileSize(maxSize)} each</span>
          </div>
        </motion.div>

        {/* Decorative corners */}
        <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary/30 rounded-tl-lg" />
        <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-primary/30 rounded-tr-lg" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-primary/30 rounded-bl-lg" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary/30 rounded-br-lg" />
      </motion.div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {files.map((file, index) => {
              const FileIcon = getFileIcon(file);
              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 group hover:border-primary/30 transition-colors"
                >
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                      <FileIcon className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeFile(file.id)}
                    className="p-2 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileDropzone;
