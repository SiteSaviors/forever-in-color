
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ARHero from '@/components/ar-experience/ARHero';
import ARWhatIs from '@/components/ar-experience/ARWhatIs';
import ARTestimonials from '@/components/ar-experience/ARTestimonials';
import ARHowItWorks from '@/components/ar-experience/ARHowItWorks';
import ARCallToAction from '@/components/ar-experience/ARCallToAction';

const ARExperience = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <ARHero />
      <ARWhatIs />
      <ARTestimonials />
      <ARHowItWorks />
      <ARCallToAction />
      <Footer />
    </div>
  );
};

export default ARExperience;
