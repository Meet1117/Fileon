import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState, useMemo } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Sparkles, ArrowDown, Zap, Shield, Clock, Search, X } from "lucide-react";
import Layout from "@/components/layout/Layout";
import ToolCard from "@/components/common/ToolCard";
import CategoryFilter from "@/components/common/CategoryFilter";
import { tools, getToolsByCategory, CategoryId } from "@/data/tools";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

gsap.registerPlugin(ScrollTrigger);

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") as CategoryId | null;
  const [activeCategory, setActiveCategory] = useState<CategoryId>(
    categoryParam || "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredTools = useMemo(() => {
    let result = getToolsByCategory(activeCategory);
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (tool) =>
          tool.name.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query) ||
          tool.inputFormats?.some((f) => f.toLowerCase().includes(query)) ||
          tool.outputFormats?.some((f) => f.toLowerCase().includes(query))
      );
    }
    
    return result;
  }, [activeCategory, searchQuery]);

  const clearSearch = () => {
    setSearchQuery("");
    searchInputRef.current?.focus();
  };

  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
  }, [categoryParam]);

  useEffect(() => {
    // Hero animations
    const ctx = gsap.context(() => {
      // Floating shapes animation
      gsap.to(".float-shape", {
        y: -30,
        duration: 3,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        stagger: {
          each: 0.5,
          from: "random",
        },
      });

      // Stats counter animation
      if (statsRef.current) {
        gsap.from(".stat-number", {
          textContent: 0,
          duration: 2,
          ease: "power1.out",
          snap: { textContent: 1 },
          scrollTrigger: {
            trigger: statsRef.current,
            start: "top 80%",
          },
        });
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const handleCategoryChange = (category: CategoryId) => {
    setActiveCategory(category);
    if (category === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ category });
    }
  };

  const stats = [
    { number: 100, suffix: "%", label: "Browser side Conversion" },
    { number: 20, suffix: "+", label: "Tools Available" },
    { number: 99, suffix: "%", label: "Success Rate" },
    { number: 150, suffix: "+", label: "Countries" },
  ];

  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Convert files in seconds with our optimized engine",
    },
    {
      icon: Shield,
      title: "100% Secure",
      description: "Your files are encrypted and auto-deleted after processing",
    },
    {
      icon: Clock,
      title: "No Waiting",
      description: "Process multiple files simultaneously without delays",
    },
  ];

  return (
    <Layout>
      <div ref={heroRef} className="animated-bg">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          {/* Floating decorative shapes */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="float-shape absolute top-20 left-[10%] w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent rotate-12" />
            <div className="float-shape absolute top-40 right-[15%] w-16 h-16 rounded-full bg-gradient-to-br from-secondary/20 to-transparent" />
            <div className="float-shape absolute bottom-32 left-[20%] w-24 h-24 rounded-3xl bg-gradient-to-br from-accent/15 to-transparent -rotate-12" />
            <div className="float-shape absolute bottom-40 right-[25%] w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-transparent rotate-45" />
          </div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  New: Batch Processing Available
                </span>
              </motion.div>

              {/* Heading */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6 leading-tight">
                <span className="text-foreground">Transform Your Files</span>
                <br />
                <span className="text-gradient-hero">With One Click</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                The most powerful file conversion platform. PDF, images, documents
                — convert, compress, and transform anything in seconds.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                <Button
                    size="lg"
                    onClick={() => {
                      document.getElementById("tools")?.scrollIntoView({
                        behavior: "smooth",
                      });
                    }}
                    className="bg-gradient-to-r from-primary to-primary-light hover:shadow-glow transition-all text-lg px-8 py-6"
                  >
                    Start Converting — It's Free
                </Button>

              </div>

              {/* Scroll indicator */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex flex-col items-center gap-2 text-muted-foreground"
              >
                <span className="text-sm">Scroll to explore</span>
                <ArrowDown className="w-5 h-5" />
              </motion.div>
            </motion.div>
          </div>
        </section>

         {/* Tools Section */}
        <section id="tools">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                All The Tools You Need
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Over 25 powerful tools to handle all your file conversion needs.
                From PDF to images, documents to spreadsheets — we've got you covered.
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-xl mx-auto mb-8"
            >
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search tools... (e.g., PDF, compress, merge)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-12 py-6 text-base rounded-xl border-2 border-border/50 bg-card/50 backdrop-blur-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <AnimatePresence>
                  {searchQuery && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={clearSearch}
                      className="absolute right-4 top-4 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
              {searchQuery && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-muted-foreground mt-2 text-center"
                >
                  Found {filteredTools.length} tool{filteredTools.length !== 1 ? "s" : ""} matching "{searchQuery}"
                </motion.p>
              )}
            </motion.div>

            {/* Category Filter */}
            <div className="mb-12">
              <CategoryFilter
                activeCategory={activeCategory}
                onCategoryChange={handleCategoryChange}
              />
            </div>

            {/* Tools Grid */}
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredTools.map((tool, index) => (
                  <ToolCard key={tool.id} tool={tool} index={index} />
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section ref={statsRef} className="py-16 bg-card/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-display font-bold text-gradient-primary mb-2">
                    <span className="stat-number">{stat.number}</span>
                    {stat.suffix}
                  </div>
                  <p className="text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mx-auto mb-6">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-display font-semibold mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
