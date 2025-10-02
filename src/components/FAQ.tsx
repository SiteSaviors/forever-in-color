
import { HelpCircle, Shield, Truck, Palette, Clock, RefreshCw } from "@/components/ui/icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqCategories = [
    {
      id: "process",
      title: "Art Transformation Process",
      icon: Palette,
      color: "from-purple-500 to-pink-500",
      questions: [
        {
          question: "How does the AI art transformation work?",
          answer: "Our advanced AI analyzes your photo and applies artistic filters and techniques to transform it into various art styles. The process preserves the essence of your original image while applying the chosen artistic style, whether it's watercolor, oil painting, pop art, or any of our 10+ available styles."
        },
        {
          question: "What types of photos work best?",
          answer: "High-resolution photos (at least 1024x1024 pixels) work best, but we can work with most photos. Portrait photos, landscapes, pets, and family photos all transform beautifully. Photos with good lighting and clear subjects typically produce the most stunning results."
        },
        {
          question: "Can I see a preview before ordering?",
          answer: "Absolutely! You'll receive a digital preview of your transformed artwork before we proceed with printing. For Premium and Masterpiece packages, you can request revisions or try different styles until you're completely satisfied."
        },
        {
          question: "How many art styles can I choose from?",
          answer: "We offer 10+ unique art styles including Watercolor Dreams, Pop Art Explosion, Oil Painting Classic, Neon Synthwave, Pencil Sketch, Abstract Geometric, Vintage Poster, Digital Glitch, Impressionist, and Minimalist Line Art. New styles are added regularly!"
        }
      ]
    },
    {
      id: "quality",
      title: "Quality & Materials",
      icon: Shield,
      color: "from-blue-500 to-cyan-500",
      questions: [
        {
          question: "What materials do you use for printing?",
          answer: "We use premium canvas materials for all our prints. Essential packages use high-quality canvas, Premium packages use museum-quality canvas, and Masterpiece packages use gallery-grade archival canvas that's designed to last for generations."
        },
        {
          question: "What frame options are available?",
          answer: "Frame options vary by package. Essential includes basic black or white frames, Premium offers 5 premium frame styles, and Masterpiece includes 10+ luxury handcrafted frame options including natural wood, vintage gold, modern silver, and rustic barnwood."
        },
        {
          question: "How long will my artwork last?",
          answer: "Our canvas prints are designed to last. Premium and Masterpiece packages use fade-resistant inks and archival materials that maintain their vibrancy for decades. All packages come with UV protection to prevent fading."
        },
        {
          question: "Can I get my artwork without a frame?",
          answer: "Yes! You can choose to receive just the canvas print without framing. This option is available for all packages and reduces the price accordingly. The canvas comes ready to hang or can be professionally framed later."
        }
      ]
    },
    {
      id: "shipping",
      title: "Shipping & Delivery",
      icon: Truck,
      color: "from-green-500 to-emerald-500",
      questions: [
        {
          question: "How long does shipping take?",
          answer: "Standard shipping takes 7-10 business days within the US. Premium packages include priority processing (3-5 days) plus expedited shipping. Masterpiece packages include white-glove delivery service for ultimate care and handling."
        },
        {
          question: "Do you ship internationally?",
          answer: "Yes! We ship to most countries worldwide. International shipping typically takes 10-15 business days. Shipping costs vary by destination and package size. Contact us for specific international shipping rates."
        },
        {
          question: "How is my artwork packaged?",
          answer: "Your artwork is carefully packaged in protective materials with corner guards and moisture protection. Larger pieces are crated for maximum protection. Masterpiece packages include custom wooden crates for ultimate security."
        },
        {
          question: "Can I track my order?",
          answer: "Absolutely! You'll receive tracking information via email once your order ships. You can track your package in real-time from our facility to your door. Premium and Masterpiece customers get priority customer support for any shipping questions."
        }
      ]
    },
    {
      id: "orders",
      title: "Orders & Pricing",
      icon: Clock,
      color: "from-orange-500 to-red-500",
      questions: [
        {
          question: "Can I make changes after placing my order?",
          answer: "You can make changes within 24 hours of placing your order, before we begin processing. After that, changes may not be possible depending on the production stage. Premium and Masterpiece customers have more flexibility with revisions."
        },
        {
          question: "What sizes are available?",
          answer: "We offer multiple size options: 12x16, 16x20, 20x24, 24x30, and 30x40 inches. Masterpiece packages also include custom sizing options. Our size guide helps you choose the perfect dimensions for your space."
        },
        {
          question: "Are there any hidden fees?",
          answer: "No hidden fees! The price you see includes the art transformation, printing, framing (if selected), and shipping within the US. International orders may have additional customs fees depending on your country's regulations."
        },
        {
          question: "Do you offer bulk discounts?",
          answer: "Yes! We offer discounts for multiple pieces. Contact us for custom pricing on orders of 3 or more artworks. This is perfect for creating a cohesive gallery wall or gifting to multiple family members."
        }
      ]
    },
    {
      id: "support",
      title: "Support & Guarantees",
      icon: RefreshCw,
      color: "from-pink-500 to-purple-500",
      questions: [
        {
          question: "What is your satisfaction guarantee?",
          answer: "We offer different guarantees by package: 30-day satisfaction guarantee for Essential, 60-day for Premium, and lifetime satisfaction guarantee for Masterpiece. If you're not completely happy, we'll make it right or provide a full refund."
        },
        {
          question: "What if my artwork arrives damaged?",
          answer: "We'll replace any damaged artwork at no cost to you. Simply contact us within 7 days of delivery with photos of the damage, and we'll rush a replacement to you. Our packaging is designed to prevent damage, but accidents can happen."
        },
        {
          question: "Can I return or exchange my artwork?",
          answer: "Yes, within our guarantee periods. Original artwork must be returned in its original condition and packaging. We'll provide a prepaid return label and process your refund or exchange once we receive the item."
        },
        {
          question: "How can I contact customer support?",
          answer: "Our customer support team is available via email, live chat, and phone. Premium and Masterpiece customers get priority support with faster response times. We're here to help make your experience perfect from start to finish."
        }
      ]
    }
  ];

  return (
    <section id="faq" className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <HelpCircle className="w-12 h-12 text-purple-600 mr-4" />
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
              Frequently Asked{" "}
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Questions
              </span>
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to know about transforming your photos into stunning framed canvas art
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {faqCategories.map((category) => (
            <div key={category.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Category Header */}
              <div className={`bg-gradient-to-r ${category.color} p-6`}>
                <div className="flex items-center text-white">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                    <category.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold">{category.title}</h3>
                </div>
              </div>

              {/* Questions */}
              <div className="p-6">
                <Accordion type="single" collapsible className="space-y-4">
                  {category.questions.map((faq, index) => (
                    <AccordionItem 
                      key={index} 
                      value={`${category.id}-${index}`}
                      className="border border-gray-200 rounded-lg px-6 data-[state=open]:bg-gray-50"
                    >
                      <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-purple-600 py-4">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600 pb-4 leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Still Have Questions?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our friendly customer support team is here to help! Get in touch and we'll answer any questions about your custom artwork transformation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300">
              Contact Support
            </button>
            <button className="border-2 border-purple-300 text-purple-700 px-6 py-3 rounded-full font-semibold hover:bg-purple-50 transition-all duration-300">
              Live Chat
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
