import Link from 'next/link';
import { Moon, Sun, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before showing theme toggle
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="border-b sticky top-0 z-50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
      <div className="lg:max-w-[85vw] max-w-[95vw] mx-auto h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-semibold text-xl">
            RoadmapBP
          </Link>
        </div>
        <div className="flex items-center gap-4">
          
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
} 