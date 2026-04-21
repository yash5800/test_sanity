"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

import { Button } from "@/app/components/ui/button";

const ScrollToTopButton = () => {
  const [isVisible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 320);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Button
      type="button"
      variant="default"
      size="icon"
      aria-label="Scroll to top"
      onClick={scrollToTop}
      className={`fixed bottom-24 right-6 z-40 h-12 w-12 rounded-full border border-border/70 bg-gradient-to-br from-primary via-primary to-chart-2 shadow-xl shadow-primary/20 backdrop-blur transition-all duration-200 hover:scale-105 hover:shadow-primary/30 ${
        isVisible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <ArrowUp className="h-4 w-4" />
    </Button>
  );
};

export default ScrollToTopButton;