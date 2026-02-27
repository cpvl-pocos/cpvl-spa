import { FileText } from "lucide-react";
import { ScrollReveal } from "../ScrollReveal/";

export const Documentos = () => {
  return (
    <section id="estatuto" className="section-padding bg-muted">
      <div className="container mx-auto max-w-4xl space-y-16">
        <ScrollReveal>
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground">
              <span className="text-primary">Estatuto</span>
            </h2>
            <p className="text-muted-foreground font-body max-w-2xl mx-auto">
              Na Assembleia Geral Extraordinária (AGE) de 20 de novembro de 2023, foram definidos os
              tópicos anteriormente debatidos. Assim, o CPVL tem um novo Estatuto aprovado na gestão
              2022/2023 e registrado em cartório no dia 21 de novembro de 2023.
            </p>
            <p className="text-muted-foreground font-body text-sm">
              O CPVL agradece a todos que contribuíram para a atualização do estatuto e reforça que a
              participação de todos é fundamental.
            </p>
            <a
              href="/docs/EstatutoCPVL_2023.pdf"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors mt-2"
            >
              <FileText size={16} />
              Baixar Estatuto
            </a>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <div id="regimento" className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground">
              Regimento <span className="text-primary">Interno</span>
            </h2>
            <p className="text-muted-foreground font-body max-w-2xl mx-auto">
              Na Assembleia Geral Extraordinária (AGE) de 21 de setembro de 2023, foram debatidos
              novos tópicos importantes para a atualização do Regimento Interno (RI) do Clube
              Poçoscaldense de Vôo Livre — CPVL.
            </p>
            <p className="text-muted-foreground font-body text-sm">
              O CPVL agradece a todos que contribuíram para a atualização do estatuto e reforça que a
              participação dos associados nas assembleias é de extrema importância.
            </p>
            <a
              href="/docs/RegimentoInternoCPVL_2024.pdf"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors mt-2"
            >
              <FileText size={16} />
              Baixar Regimento Interno
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

