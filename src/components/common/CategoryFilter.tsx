import { useState } from "react";
import { motion } from "framer-motion";
import { categories, CategoryId } from "@/data/tools";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  activeCategory: CategoryId;
  onCategoryChange: (category: CategoryId) => void;
}

const CategoryFilter = ({
  activeCategory,
  onCategoryChange,
}: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {categories.map((category) => {
        const isActive = activeCategory === category.id;
        return (
          <motion.button
            key={category.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              "relative px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-300",
              "flex items-center gap-2",
              isActive
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeCategory"
                className="absolute inset-0 bg-gradient-to-r from-primary to-primary-light rounded-full"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <category.icon className="w-4 h-4" />
              {category.name}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
