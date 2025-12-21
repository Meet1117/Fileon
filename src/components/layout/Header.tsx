import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Menu, X, Zap, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categories } from "@/data/tools";
import { cn } from "@/lib/utils";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  /**
   * Handle click on a category/tool item.
   * If already on index route -> replace URL to include category (if provided) and smooth scroll to #tools.
   * If on another route -> navigate to index with state; index will pick it up and scroll.
   */
  const handleNavigateToTools = (categoryId = null) => {
    // close menus
    setIsToolsOpen(false);
    setIsMobileMenuOpen(false);

    // Always navigate to "/" with state that tells index to scroll.
    // Even if already on "/", this will update location and trigger effect below.
    navigate("/", { state: { scrollTo: "tools", category: categoryId } });
  };

  /**
   * When location changes, check if we landed on index with a scroll request in state.
   * If so: replace the URL to include ?category=... (or plain /) and perform smooth scroll.
   * After doing that, clear the state by replacing history (so we don't scroll repeatedly).
   */
  useEffect(() => {
    // Only act when we're on the index path and there's a scroll request
    if (location.pathname === "/" && location.state && (location.state.scrollTo === "tools")) {
      const cat = location.state.category;

      // Replace the URL to show the category query (optional) and clear state
      const newPath = cat && cat !== "all" ? `/?category=${encodeURIComponent(cat)}` : "/";

      // Replace URL (clears location.state) and do scroll after next tick
      navigate(newPath, { replace: true, state: {} });

      // small delay to let the DOM render (safe and common)
      // then smooth scroll to #tools
      setTimeout(() => {
        const el = document.getElementById("tools");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          // fallback: scroll to top if element not found
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 60);
    }
    // We only want to run this when location changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key, location.pathname, location.state, navigate]);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "glass py-3" : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
            >
              <Zap className="w-5 h-5 text-primary-foreground" />
            </motion.div>
            <span className="text-xl font-display font-bold text-gradient-primary">
              fileon
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <div
              className="relative"
              onMouseEnter={() => setIsToolsOpen(true)}
              onMouseLeave={() => setIsToolsOpen(false)}
            >
              <button
                className="flex items-center gap-1 text-foreground/80 hover:text-primary transition-colors font-medium"
                aria-haspopup="true"
                aria-expanded={isToolsOpen}
                onClick={() => setIsToolsOpen((v) => !v)}
              >
                All Tools
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform",
                    isToolsOpen && "rotate-180"
                  )}
                />
              </button>

              <AnimatePresence>
                {isToolsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-2 glass-card p-4 min-w-[200px]"
                  >
                    {categories.slice(1).map((cat) => {
                      // Render as button so we can handle "go to index then scroll" logic
                      const Icon = cat.icon;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => handleNavigateToTools(cat.id)}
                          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-muted transition-colors w-full text-left"
                        >
                          <Icon className="w-4 h-4 text-primary" />
                          <span>{cat.name}</span>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Direct links that should behave similarly (scroll to tools if clicked) */}
            <button
              onClick={() => handleNavigateToTools("pdf")}
              className="text-foreground/80 hover:text-primary transition-colors font-medium"
            >
              PDF Tools
            </button>
            <button
              onClick={() => handleNavigateToTools("image")}
              className="text-foreground/80 hover:text-primary transition-colors font-medium"
            >
              Image Tools
            </button>
            <Link
              to="/history"
              className="text-foreground/80 hover:text-primary transition-colors font-medium"
            >
              History
            </Link>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button
              variant="default"
              className="bg-gradient-to-r from-primary to-primary-light hover:shadow-glow transition-shadow"
              onClick={() => handleNavigateToTools(null)} // main CTA goes to tools section
            >
              Get Started Free
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 overflow-hidden"
            >
              <nav className="glass-card p-4 flex flex-col gap-2">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleNavigateToTools(cat.id === "all" ? null : cat.id)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors text-left"
                    >
                      <Icon className="w-5 h-5 text-primary" />
                      <span className="font-medium">{cat.name}</span>
                    </button>
                  );
                })}
                <Link
                  to="/history"
                  className="px-4 py-3 rounded-lg hover:bg-muted transition-colors font-medium"
                >
                  History
                </Link>
                <Button
                  className="mt-2 w-full bg-gradient-to-r from-primary to-primary-light"
                  onClick={() => handleNavigateToTools(null)}
                >
                  Get Started Free
                </Button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;
