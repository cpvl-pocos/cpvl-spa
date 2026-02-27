import bainaoImage from "@/assets/images/baianoVoandoSul.jpg";
import { ScrollReveal } from "../ScrollReveal/";

export const Historia = () => {
  return (
    <section id="historia" className="section-padding bg-background overflow-hidden">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <ScrollReveal>
            <div className="space-y-6">
              <h2 className="text-4xl sm:text-5xl font-heading font-black text-foreground tracking-tight leading-none mb-4">
                Nossa <span className="text-primary">História</span>
              </h2>
              <div className="space-y-4 text-lg text-muted-foreground font-body leading-relaxed text-justify">
                <p>
                  O Clube Poçoscaldense de Vôo Livre (CPVL) nasceu da paixão de pioneiros que descobriram no
                  Sul de Minas Gerais um dos melhores cenários do mundo para o voo livre.
                </p>
                <p>
                  Fundado com o objetivo de fomentar o esporte e garantir a segurança dos praticantes, o
                  clube tornou-se referência nacional em infraestrutura e gestão ambiental.
                </p>
                <p>
                  Hoje, o CPVL atrai pilotos de todas as partes, oferecendo suporte completo e uma
                  comunidade vibrante que compartilha o amor pela liberdade nos céus.
                </p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/10 rounded-3xl -rotate-2" />
              <div className="relative bg-card border border-border rounded-2xl overflow-hidden shadow-elevated">
                <div className="p-8 space-y-4">
                  <div className="flex items-center gap-4 border-b border-border pb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-heading font-bold text-primary text-xl">
                      1995
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-foreground">Fundação</h4>
                      <p className="text-sm text-muted-foreground">Início oficial das atividades</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 border-b border-border pb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-heading font-bold text-primary text-xl">
                      30y+
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-foreground">Tradição</h4>
                      <p className="text-sm text-muted-foreground">Décadas de história no céu</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <ScrollReveal delay={150}>
              <div className="my-12">
                <img
                  src={bainaoImage}
                  alt="Diretoria CPVL 2024-2025"
                  className="rounded-xl shadow-lg w-full max-h-80 object-cover"
                />
              </div>
            </ScrollReveal>
          </ScrollReveal>
        </div>

      </div>
    </section>
  );
};
