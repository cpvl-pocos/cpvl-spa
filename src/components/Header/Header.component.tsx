import { useState, useEffect } from "react";
import { Menu, X, Users } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/images/cpvlLogoVet1.png";
import { ThemeToggle } from "@/components/ThemeToggle";

export const navLinks = [
  { label: "História", href: "#historia" },
  { label: "Diretoria", href: "#diretoria" },
  { label: "Espaço Aéreo", href: "#espaco-aereo" },
  { label: "Estatuto", href: "#estatuto" },
  { label: "Regimento", href: "#regimento" },
];

export const Header = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${scrolled
        ? "bg-background/95 backdrop-blur-md border-b border-border shadow-lg"
        : "bg-transparent border-b border-transparent"
        }`}
    >
      <div className="container mx-auto flex items-center justify-between h-20 px-4 lg:px-8 animate-fade-in">
        <a href="#" className="flex items-center gap-2 hover:scale-105 transition-transform">
          <img 
            src={logo} 
            alt="CPVL Logo" 
            className={`h-18 w-auto transition-all duration-500 ${
              !scrolled 
                ? "brightness-0 invert opacity-100" 
                : "dark:brightness-0 dark:invert"
            }`} 
          />
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-4">
          {navLinks.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              className={`text-sm font-bold transition-colors duration-300 ${scrolled
                ? "text-muted-foreground hover:text-primary"
                : "text-white/90 hover:text-white drop-shadow-md"
                }`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {l.label}
            </a>
          ))}
          
          <div className="flex items-center gap-2 ml-4">
            <ThemeToggle 
              className={scrolled 
                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft" 
                : "bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-primary"
              }
            />
            
            <Link
              to="/login"
              className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-black uppercase tracking-wider transition-all duration-300 ${scrolled
                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft"
                : "bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-primary"
                }`}
            >
              <Users size={16} />
              Associados
            </Link>
          </div>
        </nav>

        {/* Mobile toggle & Theme */}
        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle 
            className={scrolled 
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft" 
              : "bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-primary"
            }
          />
          <button
            onClick={() => setOpen(!open)}
            className={`transition-colors duration-300 ${scrolled ? "text-foreground" : "text-white drop-shadow-md"
              }`}
            aria-label="Menu"
          >
            {open ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav className="md:hidden bg-card/95 backdrop-blur-md border-b border-border px-4 pb-4 space-y-2 animate-fade-in">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {l.label}
            </a>
          ))}
          <Link
            to="/login"
            onClick={() => setOpen(false)}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground w-full justify-center"
          >
            <Users size={16} />
            Associados
          </Link>
        </nav>
      )}
    </header>

  );
};
