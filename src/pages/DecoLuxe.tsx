
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DecoLuxeHero from "@/components/deco-luxe/DecoLuxeHero";
import DecoLuxeGallery from "@/components/deco-luxe/DecoLuxeGallery";
import DecoLuxeFeatures from "@/components/deco-luxe/DecoLuxeFeatures";
import DecoLuxeHowItWorks from "@/components/deco-luxe/DecoLuxeHowItWorks";
import DecoLuxeARPreview from "@/components/deco-luxe/DecoLuxeARPreview";
import DecoLuxeTestimonials from "@/components/deco-luxe/DecoLuxeTestimonials";

const DecoLuxe = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-stone-50">
      <Header />
      <DecoLuxeHero />
      <DecoLuxeGallery />
      <DecoLuxeFeatures />
      <DecoLuxeHowItWorks />
      <DecoLuxeARPreview />
      <DecoLuxeTestimonials />
      <Footer />
    </div>
  );
};

export default DecoLuxe;
