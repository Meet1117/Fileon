import { useState } from "react";
import { motion } from "framer-motion";
import { QrCode, Download, Copy, Check, Palette } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateQRCode } from "@/utils/qrUtils";
import { downloadBlob } from "@/utils/fileUtils";
import { toast } from "sonner";

const QRGenerator = () => {
  const [text, setText] = useState("");
  const [qrBlob, setQrBlob] = useState<Blob | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState({
    size: 256,
    foreground: "#000000",
    background: "#ffffff",
  });

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast.error("Please enter text or URL");
      return;
    }

    setIsGenerating(true);
    try {
      const blob = await generateQRCode(text, options);
      setQrBlob(blob);
      setQrUrl(URL.createObjectURL(blob));
      toast.success("QR Code generated!");
    } catch (error) {
      toast.error("Failed to generate QR code");
    }
    setIsGenerating(false);
  };

  const handleDownload = () => {
    if (qrBlob) {
      downloadBlob(qrBlob, "qrcode.png");
      toast.success("Download started!");
    }
  };

  const handleCopy = async () => {
    if (qrBlob) {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": qrBlob }),
        ]);
        setCopied(true);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error("Failed to copy");
      }
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-tool-utility/10 to-tool-utility/5 flex items-center justify-center mx-auto mb-6">
              <QrCode className="w-10 h-10 text-tool-utility" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
              QR Code Generator
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Generate QR codes from any text, URL, or data. Customize colors and download in high quality.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="glass-card p-6 space-y-6">
              <div>
                <Label className="text-base mb-2 block">Enter Text or URL</Label>
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="https://example.com or any text..."
                  className="text-lg py-6"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block">Foreground</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={options.foreground}
                      onChange={(e) =>
                        setOptions({ ...options, foreground: e.target.value })
                      }
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={options.foreground}
                      onChange={(e) =>
                        setOptions({ ...options, foreground: e.target.value })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">Background</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={options.background}
                      onChange={(e) =>
                        setOptions({ ...options, background: e.target.value })
                      }
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={options.background}
                      onChange={(e) =>
                        setOptions({ ...options, background: e.target.value })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Size: {options.size}px</Label>
                <input
                  type="range"
                  min="128"
                  max="512"
                  step="64"
                  value={options.size}
                  onChange={(e) =>
                    setOptions({ ...options, size: parseInt(e.target.value) })
                  }
                  className="w-full"
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !text.trim()}
                className="w-full bg-gradient-to-r from-primary to-primary-light hover:shadow-glow"
                size="lg"
              >
                {isGenerating ? "Generating..." : "Generate QR Code"}
              </Button>
            </div>

            {/* Preview Section */}
            <div className="glass-card p-6">
              <div className="aspect-square rounded-xl bg-muted/50 flex items-center justify-center overflow-hidden">
                {qrUrl ? (
                  <motion.img
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    src={qrUrl}
                    alt="Generated QR Code"
                    className="max-w-full max-h-full p-4"
                  />
                ) : (
                  <div className="text-center text-muted-foreground p-8">
                    <QrCode className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>Your QR code will appear here</p>
                  </div>
                )}
              </div>

              {qrUrl && (
                <div className="flex gap-3 mt-6">
                  <Button onClick={handleDownload} className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download PNG
                  </Button>
                  <Button variant="outline" onClick={handleCopy}>
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default QRGenerator;
