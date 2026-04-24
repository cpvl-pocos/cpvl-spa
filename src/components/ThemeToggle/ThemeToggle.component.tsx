import { Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-10 h-10" />;

  const isDark = theme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        "relative rounded-full w-10 h-10 transition-all duration-300 overflow-hidden group",
        className
      )}
      aria-label="Alternar tema"
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Sun Icon */}
        <Sun 
          className={`absolute h-[1.4rem] w-[1.4rem] transition-all duration-300 transform
            ${isDark 
              ? 'translate-y-10 opacity-0 rotate-90 scale-50' 
              : 'translate-y-0 opacity-100 rotate-0 scale-100'
            }
            group-hover:rotate-45 group-hover:scale-110
          `} 
        />
        
        {/* Moon Icon */}
        <Moon 
          className={`absolute h-[1.3rem] w-[1.3rem] transition-all duration-300 transform
            ${isDark 
              ? 'translate-y-0 opacity-100 rotate-0 scale-100' 
              : '-translate-y-10 opacity-0 -rotate-90 scale-50'
            }
            group-hover:-rotate-12 group-hover:scale-110
          `} 
        />
      </div>
    </Button>
  );
};
