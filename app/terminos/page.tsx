import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Términos y Condiciones | Almarte Artesanos",
  description: "Términos de uso, políticas de privacidad y condiciones de compra de Almarte Artesanos.",
};

export default function TerminosPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-background py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-widest bg-surface/50 px-3 py-1 rounded-full">
              <ShieldCheck className="h-3.5 w-3.5" />
              Legal &amp; Transparencia
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-title">
              Términos y Condiciones
            </h1>
            <p className="text-sm text-text-secondary max-w-lg mx-auto leading-relaxed">
              Condiciones de uso y políticas de compra en Almarte Artesanos.
            </p>
          </div>

          <div className="bg-bg-secondary border border-divider/60 rounded-xl p-8 space-y-6 text-xs sm:text-sm text-text-primary/85 leading-relaxed">
            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-title">1. Aceptación de los Términos</h2>
              <p>
                Al acceder y realizar compras en esta plataforma web, aceptas quedar vinculado por estos Términos y Condiciones, así como por las leyes aplicables en Colombia.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-title">2. Naturaleza de los Productos Artesanales</h2>
              <p>
                Nuestras piezas son hechas a mano y utilizan cristales y minerales naturales genuinos. Debido a su origen natural, cada pieza puede presentar sutiles variaciones en tonalidad, forma o veteado, lo que garantiza su carácter único y exclusivo.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-title">3. Precios y Pagos</h2>
              <p>
                Todos los precios están expresados en pesos colombianos (COP). Los pagos son procesados de forma segura mediante encriptación SSL y pasarelas de pago certificadas.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-title">4. Protección de Datos Personales</h2>
              <p>
                Tus datos de contacto y entrega son tratados bajo estrictas medidas de confidencialidad y únicamente con el fin de procesar tus órdenes y mejorar tu experiencia de compra.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
}
