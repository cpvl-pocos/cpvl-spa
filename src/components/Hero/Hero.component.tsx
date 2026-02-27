import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import hero0 from "@/assets/images/hero_00.jpg";
import hero1 from "@/assets/images/hero_01.jpg";
import hero2 from "@/assets/images/hero_02.jpg";
import hero3 from "@/assets/images/hero_03.jpg";
import hero4 from "@/assets/images/hero_04.jpg";

const images = [hero0, hero1, hero2, hero3, hero4];

export const Hero = () => {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((p) => (p + 1) % images.length), []);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + images.length) % images.length), []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, current]);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0">
        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`Vôo livre ${i}`}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              opacity: i === current ? 1 : 0,
              transform: i === current ? 'scale(1)' : 'scale(1.15)',
              transitionProperty: 'opacity, transform',
              transitionDuration: '2s, 20s',
              transitionTimingFunction: 'ease-in-out, linear',
              pointerEvents: i === current ? 'auto' : 'none',
            }}
          />
        ))}
        <div className="absolute inset-0 hero-overlay" />
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
        <h4 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-black text-primary-foreground tracking-tight mb-4 drop-shadow-lg">
          Clube Poçoscaldense de Vôo Livre
        </h4>
        <h1 className="text-lg sm:text-xl text-primary-foreground/80 font-body max-w-2xl drop-shadow">
          Desafios e Conquistas
        </h1>
      </div>

      {/* Nav arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-card/15 backdrop-blur-sm hover:bg-card/50 active:scale-90 rounded-full p-2 text-primary-foreground transition-all z-20"
        aria-label="Anterior"
      >
        <ChevronLeft size={21} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-card/15 backdrop-blur-sm hover:bg-card/50 active:scale-90 rounded-full p-2 text-primary-foreground transition-all z-20"
        aria-label="Próximo"
      >
        <ChevronRight size={21} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${i === current ? "bg-primary-foreground w-6" : "bg-primary-foreground/40"
              }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};
