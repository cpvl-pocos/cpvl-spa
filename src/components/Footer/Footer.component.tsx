import { MapPin, Mountain, Compass, Facebook, Instagram } from "lucide-react";
import logo from "@/assets/images/cpvlLogoVet1.png";

export const Footer = () => {
  return (
    <footer className="bg-radial-[at_9%_-15%] from-background via-navy-light/85 to-navy-light text-primary-foreground">
      <div className="container mx-auto max-w-6xl px-4 py-12 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Logo & copyright */}
          <div className="space-y-4">
            <img src={logo} alt="CPVL" className="h-21 w-auto" />
            <p className="text-sm text-muted-foreground font-body">
              Clube Poçoscaldense de Vôo Livre
            </p>
          </div>

          {/* Institucional */}
          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider mb-4 text-primary-foreground/80">
              Institucional
            </h4>
            <ul className="space-y-2 text-sm font-body text-primary-foreground/60">
              <li><a href="#historia" className="hover:text-primary-foreground transition-colors">Nossa História</a></li>
              <li><a href="#diretoria" className="hover:text-primary-foreground transition-colors">Diretoria</a></li>
              <li><a href="#espaco-aereo" className="hover:text-primary-foreground transition-colors">Espaço Aéreo</a></li>
              <li><a href="#estatuto" className="hover:text-primary-foreground transition-colors">Estatuto</a></li>
              <li><a href="#regimento" className="hover:text-primary-foreground transition-colors">Regimento Interno</a></li>
            </ul>
          </div>

          {/* Rampa */}
          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider mb-4 text-primary-foreground/80">
              Rampa
            </h4>
            <ul className="space-y-2 text-sm font-body text-primary-foreground/60">
              <li className="flex items-center gap-1.5">
                <MapPin size={14} />
                <a
                  href="https://maps.google.com/?q=-21.7715658,-46.5749861"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-foreground transition-colors"
                >
                  Mapa
                </a>
              </li>
              <li className="flex items-center gap-1.5">
                <Mountain size={14} />
                Altitude: 1480m
              </li>
              <li className="flex items-center gap-1.5">
                <Mountain size={14} />
                Desnível: 400m
              </li>
              <li className="flex items-center gap-1.5">
                <Compass size={14} />
                S | NE | N | NW
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider mb-4 text-primary-foreground/80">
              Mídias Sociais
            </h4>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-full p-2.5 transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-full p-2.5 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-10 pt-6 text-center text-xs text-primary-foreground/40 font-body">
          © 2026 Clube Poçoscaldense de Vôo Livre — CPVL
        </div>
      </div>
    </footer>
  );
};
