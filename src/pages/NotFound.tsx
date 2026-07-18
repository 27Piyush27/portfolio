import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Animated background blobs */}
      <motion.div
        className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[150px]"
        animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-tech-blue/10 blur-[130px]"
        animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      <div className="relative z-10 text-center px-6">
        {/* Giant 404 with gradient */}
        <motion.h1
          className="text-[10rem] sm:text-[14rem] font-bold leading-none tracking-tighter bg-gradient-to-br from-primary via-tech-blue to-tech-emerald bg-clip-text text-transparent select-none"
          initial={{ opacity: 0, scale: 0.5, filter: "blur(20px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          404
        </motion.h1>

        <motion.p
          className="text-xl sm:text-2xl font-semibold text-foreground mb-3 -mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Page not found
        </motion.p>

        <motion.p
          className="text-muted-foreground max-w-md mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          The page you're looking for doesn't exist or has been moved.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="px-6 py-5 rounded-xl font-semibold border-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          <a href="/">
            <Button className="bg-gradient-to-r from-primary to-tech-purple text-primary-foreground px-6 py-5 rounded-xl font-semibold shadow-lg">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
