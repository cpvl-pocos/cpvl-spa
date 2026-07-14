import { Header } from "@/components/Header/";
import { Hero } from "@/components/Hero/";
import { Historia } from "@/components/Historia/";
import { Diretoria } from "@/components/Diretoria/";
import { EspacoAereo } from "@/components/EspacoAereo/";
import { Missao } from "@/components/Missao/";
import { Footer } from "@/components/Footer/";
import { useSEO } from "@/hooks/useSEO";


export const Home = () => {
  useSEO({
    title: "Início",
    description: "Bem-vindo ao Clube Poços-Caldense de Voo Livre (CPVL). Pratique parapente e asa delta em um dos melhores pontos de voo livre do Brasil.",
    keywords: "CPVL, voo livre, parapente, asa delta, Poços de Caldas, rampas de voo"
  });

  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Historia />
      <Missao />
      <Diretoria />
      <EspacoAereo />
      <Footer />
    </div>
  );
};
