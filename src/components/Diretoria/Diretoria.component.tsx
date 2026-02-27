import dirImage from "@/assets/images/diretoria_2024-2025.jpg";
import { ScrollReveal } from "../ScrollReveal/";

interface Gestao {
  periodo: string;
  membros: { cargo: string; nome: string }[];
}

const gestoes: Gestao[] = [
  {
    periodo: "2026/2027",
    membros: [
      { cargo: "Presidente", nome: "Gilberto Raposo" },
      { cargo: "Vice Presidente", nome: "Cássio Sarti" },
      { cargo: "Tesoureiro", nome: "Talyson M Bolleli" },
      { cargo: "Diretor Técnico", nome: "Gustavo Borges" },
      { cargo: "Diretor Social", nome: "Gustavo Garcia" },
    ],
  },
  {
    periodo: "2024/2025",
    membros: [
      { cargo: "Presidente", nome: "Gilberto Raposo" },
      { cargo: "Vice Presidente", nome: "Cássio Sarti" },
      { cargo: "Tesoureiro", nome: "Cláudio Lellis" },
      { cargo: "Diretor Técnico", nome: "Gustavo Borges" },
      { cargo: "Diretor Social", nome: "Gustavo Garcia" },
    ],
  },
  {
    periodo: "2021/2023",
    membros: [
      { cargo: "Presidente", nome: "Cristiano Ricci" },
      { cargo: "Vice Presidente", nome: "Juliano de Vito" },
      { cargo: "Tesoureiro", nome: "Fernando C. Filho" },
      { cargo: "Diretor Técnico", nome: "Walter Moraes" },
      { cargo: "Diretor Social", nome: "Leonardo Santos" },
    ],
  }
];

export const Diretoria = () => {
  return (
    <section id="diretoria" className="section-padding bg-muted">
      <div className="container mx-auto max-w-6xl">
        <ScrollReveal>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4 text-center">
            <span className="text-primary">Diretoria</span>
          </h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12 font-body">
            Conheça os membros dedicados que lideram o CPVL, garantindo a segurança, o desenvolvimento
            e a transparência do nosso clube.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <div className="mb-12">
            <img
              src={dirImage}
              alt="Diretoria CPVL 2024-2025"
              className="rounded-xl shadow-lg w-full max-h-120 object-cover"
            />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <h3 className="text-2xl font-heading font-semibold text-foreground mb-8 text-center">
            Gestões
          </h3>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gestoes.map((g, i) => (
            <ScrollReveal key={g.periodo} delay={300 + i * 100}>
              <div className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow h-full">
                <h4 className="text-lg font-heading font-bold text-primary mb-4">{g.periodo}</h4>
                <ul className="space-y-2">
                  {g.membros.map((m) => (
                    <li key={m.cargo} className="font-body">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground">
                        {m.cargo}
                      </span>
                      <p className="text-sm font-semibold text-foreground">{m.nome}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
