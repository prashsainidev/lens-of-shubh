import Navbar from "@/components/public/Navbar";
import Hero from "@/components/public/Hero";
import About from "@/components/public/About";
import Portfolio from "@/components/public/Portfolio";
import Services from "@/components/public/Services";
import Process from "@/components/public/Process";
import Testimonials from "@/components/public/Testimonials";
import Contact from "@/components/public/Contact";
import Footer from "@/components/public/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Portfolio />
        <Services />
        <Process />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
