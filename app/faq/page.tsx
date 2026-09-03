import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { HelpCircle, Sparkles } from "lucide-react";

export const metadata = {
  title: "Preguntas Frecuentes | Almarte Artesanos",
  description: "Encuentra respuestas sobre nuestros productos artesanales, envíos, métodos de pago y cuidado de cristales.",
};

export default function FAQPage() {
  const faqs = [
    {
      question: "¿Cómo sé qué cristal o accesorio es el adecuado para mí?",
      answer: "Recomendamos elegir tu cristal por intuición o según la intención específica que desees trabajar (calma, protección, abundancia, amor propio). Cada producto incluye una descripción detallada de sus propiedades energéticas.",
    },
    {
      question: "¿Cómo debo limpiar y recargar mis cristales?",
      answer: "Puedes limpiar tus cristales mediante el humo de salvia blanca o palo santo, colocándolos bajo la luz de la luna llena o sobre una drusa de cuarzo blanco durante unas horas.",
    },
    {
      question: "¿Cuánto tarda en llegar mi pedido?",
      answer: "Los envíos a ciudades principales en Colombia tardan entre 2 y 4 días hábiles. Para otros municipios, el tiempo estimado es de 3 a 6 días hábiles.",
    },
    {
      question: "¿Qué métodos de pago aceptan?",
      answer: "Aceptamos tarjetas de crédito, débito, PSE y billeteras digitales a través de nuestra pasarela de pagos segura y encriptada.",
    },
    {
      question: "¿Las piezas son auténticas y hechas a mano?",
      answer: "Sí, el 100% de nuestras joyas y accesorios son elaborados a mano por artesanos locales en Colombia, utilizando minerales naturales auténticos y cera de soya pura en nuestras velas.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-background py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-widest bg-surface/50 px-3 py-1 rounded-full">
              <Sparkles className="h-3.5 w-3.5" />
              Centro de Ayuda
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-title">
              Preguntas Frecuentes
            </h1>
            <p className="text-sm text-text-secondary max-w-lg mx-auto leading-relaxed">
              Resolvemos tus dudas sobre nuestras piezas artesanales, envíos y cuidados de tus cristales.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-bg-secondary border border-divider/60 rounded-xl p-6 shadow-xs hover:border-divider transition duration-200"
              >
                <h3 className="font-serif text-base font-bold text-title flex items-start gap-2.5">
                  <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  {faq.question}
                </h3>
                <p className="mt-3 text-xs sm:text-sm text-text-primary/85 leading-relaxed pl-7.5">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
}
