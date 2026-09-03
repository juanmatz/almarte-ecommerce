import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { Mail, MessageCircle, MapPin, Clock } from "lucide-react";

export const metadata = {
  title: "Contacto Directo | Almarte Artesanos",
  description: "Ponte en contacto con el equipo de Almarte Artesanos. Atención personalizada y asesoría en cristales.",
};

export default function ContactoPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-background py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-widest bg-surface/50 px-3 py-1 rounded-full">
              <MessageCircle className="h-3.5 w-3.5" />
              Estamos para Acompañarte
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-title">
              Contacto Directo
            </h1>
            <p className="text-sm text-text-secondary max-w-lg mx-auto leading-relaxed">
              ¿Tienes preguntas sobre una pieza o necesitas una recomendación energética personalizada? Escríbenos con gusto.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-bg-secondary border border-divider/60 rounded-xl p-6 space-y-3 shadow-xs">
              <div className="h-10 w-10 rounded-full bg-surface flex items-center justify-center text-title">
                <Mail className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-title">Correo Electrónico</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Escríbenos para consultas sobre pedidos o información general:
              </p>
              <a
                href="mailto:almarte.accesorios@gmail.com"
                className="text-xs font-bold text-primary hover:text-primary-hover transition block"
              >
                almarte.accesorios@gmail.com
              </a>
            </div>

            <div className="bg-bg-secondary border border-divider/60 rounded-xl p-6 space-y-3 shadow-xs">
              <div className="h-10 w-10 rounded-full bg-surface flex items-center justify-center text-title">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-title">Horario de Atención</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Lunes a Sábado: 8:00 AM – 6:00 PM (Hora Colombia).
              </p>
              <p className="text-[11px] text-text-secondary/70">
                Respondemos tus mensajes en menos de 24 horas.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
}
