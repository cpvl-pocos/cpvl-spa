import { useState, useEffect, useRef } from "react";
import { MapPin, Download } from "lucide-react";
import { ScrollReveal } from "../ScrollReveal";

import espacoSulMinas1 from "@/assets/images/EspacoAereoCPVL_SulMinas1.jpg";
import espacoSulMinas2 from "@/assets/images/EspacoAereoCPVL_SulMinas2.png";
import espacoCPVL1 from "@/assets/images/EspacoAereoCPVL1.jpg";

const waypoints = [
  { name: "CPVL e Região", file: "espaco_aereo_condicionado_permanente_sul_de_minas.air" },
  { name: "Pico do Gavião - MG", file: "SBD326-PicodoGaviao.air" },
  { name: "Poços de Caldas - MG", file: "SBD357-PocosdeCaldasMG.air" },
  { name: "Cambuí - MG", file: "SBD425-CambuiMG.air" },
  { name: "Santa Rita do Sapucaí - MG", file: "SBR456-SantaRitadoSapucaiMG.air" },
  { name: "Albertina - MG", file: "SBR492-AlbertinaMG.air" },
];

export const EspacoAereo = () => {
  const parallaxRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        if (!parallaxRef.current) { ticking = false; return; }
        const rect = parallaxRef.current.getBoundingClientRect();
        const windowH = window.innerHeight;
        if (rect.bottom > -100 && rect.top < windowH + 100) {
          // progress goes from 0 (entering bottom) to 1 (leaving top)
          const progress = 1 - (rect.bottom / (windowH + rect.height));
          setOffset((progress - 0.5) * 150);
        }
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="espaco-aereo" className="bg-background">
      {/* Parallax hero image */}
      <div ref={parallaxRef} className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <img
          src={espacoSulMinas2}
          alt="Espaço Aéreo CPVL - Sul de Minas (vista satélite)"
          className="absolute -top-[15%] left-0 w-full h-[130%] object-cover will-change-transform transition-transform duration-75 ease-out"
          style={{ transform: `translate3d(0, ${offset}px, 0)` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background" />
        <div className="absolute inset-0 flex items-center justify-center">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-5xl font-heading font-bold text-white drop-shadow-lg text-center">
              Espaço <span>Aéreo</span>
            </h2>
          </ScrollReveal>
        </div>
      </div>

      {/* Content */}
      <div className="section-padding">
        <div className="container mx-auto max-w-6xl">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center mb-12 space-y-4 font-body text-muted-foreground">
              <p>
                Desde 1986, o Código Brasileiro de Aeronáutica estabelece que o aerodesporto deverá ser
                praticado em áreas determinadas pela autoridade aeronáutica.
              </p>
              <p>
                A prática só é regular quando realizada dentro do Espaço Aéreo Condicionado (EAC), em
                áreas estabelecidas pelo DECEA.
              </p>
            </div>
          </ScrollReveal>

          {/* Map images grid */}
          <ScrollReveal delay={100}>
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div className="rounded-xl overflow-hidden border border-border shadow-sm">
                <img
                  src={espacoCPVL1}
                  alt="Espaço Aéreo Condicionado - Sul de Minas (mapa)"
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="rounded-xl overflow-hidden border border-border shadow-sm">
                <img
                  src={espacoSulMinas1}
                  alt="Espaço Aéreo CPVL - Poços de Caldas"
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Waypoints Flymaster/XCTrack */}
            <ScrollReveal delay={200}>
              <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
                <h3 className="text-lg font-heading font-bold text-foreground mb-1 flex items-center gap-2">
                  <MapPin size={18} className="text-secondary" />
                  Flymaster &amp; XCTrack
                </h3>
                <p className="text-xs text-muted-foreground mb-4">Way Points</p>
                <ul className="space-y-2">
                  {waypoints.map((wp) => (
                    <li
                      key={wp.file}
                      className="group flex items-center justify-between text-sm font-body text-foreground bg-muted hover:bg-muted/80 rounded-md px-3 py-2 transition-colors"
                    >
                      <span>{wp.name}</span>
                      <a
                        href={`/wp/flymaster-xctrack/${wp.file}`}
                        download
                        className="p-1 hover:text-secondary transition-colors"
                        title={`Download ${wp.name}`}
                      >
                        <Download size={14} className="text-muted-foreground group-hover:text-secondary" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>

            {/* Naviter */}
            <ScrollReveal delay={300}>
              <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
                <h3 className="text-lg font-heading font-bold text-foreground mb-1 flex items-center gap-2">
                  <MapPin size={18} className="text-secondary" />
                  Naviter (SeeYou)
                </h3>
                <p className="text-xs text-muted-foreground mb-4">Espaço Aéreo Condicionado</p>
                <div className="group bg-muted hover:bg-muted/80 rounded-md px-3 py-2 text-sm font-body text-foreground flex items-center justify-between transition-colors">
                  <span>Espaço Aéreo Sul de Minas</span>
                  <a
                    href="/wp/naviter/eacp_sul_de_minas.txt"
                    download
                    className="p-1 hover:text-secondary transition-colors"
                    title="Download Espaço Aéreo Sul de Minas"
                  >
                    <Download size={14} className="text-muted-foreground group-hover:text-secondary" />
                  </a>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
};

