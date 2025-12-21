export interface FileWithPreview extends File {
  preview?: string;
  id: string;
}

export interface ConversionJob {
  id: string;
  files: FileWithPreview[];
  status: "pending" | "processing" | "completed" | "error";
  progress: number;
  result?: Blob;
  resultName?: string;
  error?: string;
}

export interface HistoryItem {
  id: string;
  toolId: string;
  toolName: string;
  fileName: string;
  timestamp: Date;
  fileSize: number;
}
