import { motion } from "framer-motion";
import { History, Clock, FileText, Trash2, Download } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useConversionHistory } from "@/hooks/useConversionHistory";
import { formatFileSize } from "@/utils/fileUtils";
import { format } from "date-fns";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const HistoryPage = () => {
  const { history, clearHistory } = useConversionHistory();

  const handleClearHistory = () => {
    clearHistory();
    toast.success("History cleared");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <History className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold">Conversion History</h1>
                <p className="text-muted-foreground">
                  Your recent file conversions
                </p>
              </div>
            </div>
            {history.length > 0 && (
              <Button variant="outline" onClick={handleClearHistory}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>

          {/* History List */}
          {history.length === 0 ? (
            <div className="glass-card p-16 text-center">
              <Clock className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No history yet</h3>
              <p className="text-muted-foreground mb-6">
                Your file conversions will appear here
              </p>
              <Link to="/">
                <Button>Start Converting</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card p-4 flex items-center gap-4 hover:border-primary/30 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                    <FileText className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.fileName}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{item.toolName}</span>
                      <span>•</span>
                      <span>{formatFileSize(item.fileSize)}</span>
                      <span>•</span>
                      <span>{format(new Date(item.timestamp), "MMM d, yyyy h:mm a")}</span>
                    </div>
                  </div>
                  <Link to={`/tools/${item.toolId}`}>
                    <Button variant="ghost" size="sm">
                      Use Again
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default HistoryPage;
