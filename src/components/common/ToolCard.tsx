import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Tool } from "@/data/tools";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface ToolCardProps {
  tool: Tool;
  index?: number;
}

const ToolCard = ({ tool, index = 0 }: ToolCardProps) => {
  const categoryStyles = {
    pdf: "from-tool-pdf/10 to-tool-pdf/5 border-tool-pdf/20 hover:border-tool-pdf/40",
    image: "from-tool-image/10 to-tool-image/5 border-tool-image/20 hover:border-tool-image/40",
    document: "from-tool-document/10 to-tool-document/5 border-tool-document/20 hover:border-tool-document/40",
    convert: "from-tool-convert/10 to-tool-convert/5 border-tool-convert/20 hover:border-tool-convert/40",
    utility: "from-tool-utility/10 to-tool-utility/5 border-tool-utility/20 hover:border-tool-utility/40",
  };

  const iconStyles = {
    pdf: "bg-tool-pdf/10 text-tool-pdf",
    image: "bg-tool-image/10 text-tool-image",
    document: "bg-tool-document/10 text-tool-document",
    convert: "bg-tool-convert/10 text-tool-convert",
    utility: "bg-tool-utility/10 text-tool-utility",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="gsap-stagger-item"
    >
      <Link to={tool.path}>
        <motion.div
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "relative overflow-hidden rounded-2xl p-6 h-full",
            "bg-gradient-to-br border transition-all duration-300",
            "group cursor-pointer",
            categoryStyles[tool.category]
          )}
        >
          {/* Background glow on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            {/* Icon */}
            <motion.div
              whileHover={{ rotate: 5, scale: 1.1 }}
              className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center mb-4",
                iconStyles[tool.category]
              )}
            >
              <tool.icon className="w-7 h-7" />
            </motion.div>

            {/* Content */}
            <h3 className="text-lg font-display font-semibold mb-2 group-hover:text-primary transition-colors">
              {tool.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {tool.description}
            </p>

            {/* Formats */}
            <div className="flex flex-wrap gap-1 mb-4">
              {tool.inputFormats.slice(0, 3).map((format) => (
                <span
                  key={format}
                  className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                >
                  {format}
                </span>
              ))}
              {tool.inputFormats.length > 3 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  +{tool.inputFormats.length - 3}
                </span>
              )}
            </div>

            {/* Arrow */}
            <div className="flex items-center gap-2 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
              <span>Use Tool</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
};

export default ToolCard;
