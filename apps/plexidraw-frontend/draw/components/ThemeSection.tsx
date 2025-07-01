import React from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ThemeSection() {
  return (
    <div className="px-4 py-2">
      <Card className="bg-transparent border-none shadow-none">
        <CardHeader className="p-0 pb-2">
          <CardTitle className="text-sm text-gray-400">Theme</CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex justify-center">
          <ThemeToggle />
        </CardContent>
      </Card>
    </div>
  );
} 