import { Header } from "@/components/Header/";
import { Hero } from "@/components/Hero/";
import { Historia } from "@/components/Historia/";
import { Diretoria } from "@/components/Diretoria/";
import { EspacoAereo } from "@/components/EspacoAereo/";
import { Documentos } from "@/components/Documentos/";
import { Footer } from "@/components/Footer/";

export const Home = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Historia />
      <Diretoria />
      <EspacoAereo />
      <Documentos />
      <Footer />
    </div>
  );
};
