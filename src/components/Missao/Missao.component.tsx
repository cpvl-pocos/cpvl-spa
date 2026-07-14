import { ScrollReveal } from "../ScrollReveal";

export const Missao = () => {
  return (
    <section id="missao" className="section-padding bg-card text-card-foreground overflow-hidden">
      <div className="container mx-auto lg:max-w-6xl px-6 bg-card">
        <ScrollReveal>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4 text-center">
            <span className="text-primary">Missão</span>
          </h2>
          <p className="space-y-4 text-lg text-muted-foreground text-justify font-body leading-relaxed max-w-6xl sm:mx-6 mx-auto mb-12">
            A missão do Clube Poçoscaldense de Voolivre (CPVL) é promover, desenvolver e incentivar o desporto de voolivre nas modalidades de asa delta e parapente.
          </p>

          <p className="space-y-4 text-lg text-muted-foreground text-justify font-body leading-relaxed max-w-6xl sm:mx-6 mx-auto mb-12">
            O clube atua para congregar atletas e proporcionar aos seus sócios um ambiente completo para a prática segura de atividades esportivas, recreativas, educacionais e sociais.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};
