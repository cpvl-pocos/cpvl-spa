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
            O Clube Poçoscaldense de Voo Livre, designado pela sigla CPVL, fundado em 2 de fevereiro de 1996, é uma associação civil de direito privado, sem fins lucrativos e de caráter esportivo, com sede e foro na cidade de Poços de Caldas, Estado de Minas Gerais, constituída por prazo indeterminado e com personalidade jurídica distinta da de seus associados. Tem como atividade principal a prática do desporto de voo livre.
          </p>

          <p className="space-y-4 text-lg text-muted-foreground text-justify font-body leading-relaxed max-w-6xl sm:mx-6 mx-auto mb-12">
            O CPVL, nos termos do art. 217, inciso I, da Constituição Federal e dos arts. 26, 27 e 28 da Lei nº 14.597/2023, goza de autonomia perante o Poder Público no que se refere à sua organização, gestão, administração e regulamentação, observando exclusivamente as normas nacionais e internacionais e as regras de prática esportiva aplicáveis ao voo livre.
          </p>

          <p className="space-y-4 text-lg text-muted-foreground text-justify font-body leading-relaxed max-w-6xl sm:mx-6 mx-auto mb-12">
            O CPVL é formado por atletas de voo livre nas modalidades de Asa Delta e Parapente e tem por finalidade proporcionar aos seus associados a prática de atividades esportivas, sociais, educacionais e recreativas relacionadas ao voo livre nessas modalidades.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};
