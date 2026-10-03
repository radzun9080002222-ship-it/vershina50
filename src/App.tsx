import Header from "./components/Header";
import Hero from "./components/Hero";
import Manifesto from "./components/Manifesto";
import Calculator from "./components/Calculator";
import Services from "./components/Services";
import Cases from "./components/Cases";
import Process from "./components/Process";
import Trust from "./components/Trust";
import Rent from "./components/Rent";
import Faq from "./components/Faq";
import FinalCta from "./components/FinalCta";
import Footer from "./components/Footer";
import FloatBar from "./components/FloatBar";
import LocalSeo from "./components/LocalSeo";

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Manifesto />
        <Calculator />
        <Services />
        <Cases />
        <Process />
        <Trust />
        <Rent />
        <Faq />
        <LocalSeo />
        <FinalCta />
      </main>
      <Footer />
      <FloatBar />
    </>
  );
}
