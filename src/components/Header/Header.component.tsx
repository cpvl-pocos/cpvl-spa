import { useState, useEffect } from "react";
import { Menu, X, Users } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/images/cpvlLogoVet1.png";

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
        ? "bg-card/95 backdrop-blur-md border-b border-border shadow-lg"
        : "bg-transparent border-b border-transparent"
        }`}
    >
      <div className="container mx-auto flex items-center justify-between h-20 px-4 lg:px-8 animate-fade-in">
        <a href="#" className="flex items-center gap-2">
          <img src={logo} alt="CPVL Logo" className="h-18 w-auto" />
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition-colors duration-300 ${scrolled
                ? "text-muted-foreground hover:text-primary"
                : "text-white/80 hover:text-white drop-shadow-md"
                }`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {l.label}
            </a>
          ))}
          <Link
            to="/login"
            className={`inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold transition-all duration-300 ${scrolled
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30"
              }`}
          >
            <Users size={16} />
            Associados
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className={`md:hidden transition-colors duration-300 ${scrolled ? "text-foreground" : "text-white drop-shadow-md"
            }`}
          aria-label="Menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
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
