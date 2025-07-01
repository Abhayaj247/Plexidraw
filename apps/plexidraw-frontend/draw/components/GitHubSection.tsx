import React from "react";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GitHubSection() {
  return (
    <div className="px-4 py-2 flex justify-center">
      <Button
        asChild
        variant="outline"
        size="sm"
        className="w-full flex items-center gap-2 justify-center"
      >
        <a href="https://github.com" target="_blank" rel="noopener noreferrer">
          <Github size={18} />
          <span className="font-medium">GitHub</span>
        </a>
      </Button>
    </div>
  );
} 