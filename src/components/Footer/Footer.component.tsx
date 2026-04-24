import { MapPin, Mountain, Compass, Facebook, Instagram } from "lucide-react";
import logo from "@/assets/images/cpvlLogoVet1.png";

export const Footer = () => {
  return (
    <footer className="bg-card text-card-foreground border-t border-border">
      <div className="container mx-auto max-w-6xl px-4 py-20 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Logo & copyright */}
          <div className="space-y-4">
            <img 
              src={logo} 
              alt="CPVL" 
              className="h-21 w-auto transition-all duration-500 dark:brightness-0 dark:invert" 
            />
            <p className="text-sm text-muted-foreground font-body">
              Clube Poçoscaldense de Vôo Livre
            </p>
          </div>
 
          {/* Institucional */}
          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider mb-4 text-foreground/90">
              Institucional
            </h4>
            <ul className="space-y-2 text-sm font-body text-muted-foreground">
              <li><a href="#historia" className="hover:text-primary transition-colors">Nossa História</a></li>
              <li><a href="#diretoria" className="hover:text-primary transition-colors">Diretoria</a></li>
              <li><a href="#espaco-aereo" className="hover:text-primary transition-colors">Espaço Aéreo</a></li>
              <li><a href="#estatuto" className="hover:text-primary transition-colors">Estatuto</a></li>
              <li><a href="#regimento" className="hover:text-primary transition-colors">Regimento Interno</a></li>
            </ul>
          </div>

          {/* Rampa */}
          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider mb-4 text-foreground/90">
              Rampa
            </h4>
            <ul className="space-y-2 text-sm font-body text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <MapPin size={14} className="text-primary" />
                <a
                  href="https://maps.google.com/?q=-21.7715658,-46.5749861"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  Mapa
                </a>
              </li>
              <li className="flex items-center gap-1.5">
                <Mountain size={14} className="text-primary" />
                Altitude: 1480m
              </li>
              <li className="flex items-center gap-1.5">
                <Mountain size={14} className="text-primary" />
                Desnível: 400m
              </li>
              <li className="flex items-center gap-1.5">
                <Compass size={14} className="text-primary" />
                S | NE | N | NW
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider mb-4 text-foreground/90">
              Mídias Sociais
            </h4>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-muted hover:bg-primary text-foreground hover:text-primary-foreground rounded-full p-2.5 transition-all hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-muted hover:bg-primary text-foreground hover:text-primary-foreground rounded-full p-2.5 transition-all hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 text-center text-xs text-muted-foreground font-body">
          © 2026 Clube Poçoscaldense de Vôo Livre — CPVL
        </div>
      </div>
    </footer>
  );
};
