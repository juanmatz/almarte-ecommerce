import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { Truck, ShieldCheck, Clock, MapPin } from "lucide-react";

export const metadata = {
  title: "Políticas de Envío | Almarte Artesanos",
  description: "Conoce los tiempos de entrega, cobertura y tarifas de envío de Almarte Artesanos en toda Colombia.",
};

export default function EnviosPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-background py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-widest bg-surface/50 px-3 py-1 rounded-full">
              <Truck className="h-3.5 w-3.5" />
              Despachos y Entregas
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-title">
              Políticas de Envío
            </h1>
            <p className="text-sm text-text-secondary max-w-lg mx-auto leading-relaxed">
              Cuidamos cada pieza artesanal para que llegue con su energía intacta a cualquier rincón de Colombia.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-bg-secondary border border-divider/60 rounded-xl p-5 text-center space-y-2">
              <div className="h-10 w-10 mx-auto rounded-full bg-surface flex items-center justify-center text-title">
                <MapPin className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-sm font-bold text-title">Cobertura Nacional</h3>
              <p className="text-xs text-text-secondary">Envíos a todas las ciudades y municipios de Colombia.</p>
            </div>

            <div className="bg-bg-secondary border border-divider/60 rounded-xl p-5 text-center space-y-2">
              <div className="h-10 w-10 mx-auto rounded-full bg-surface flex items-center justify-center text-title">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-sm font-bold text-title">Tiempos de Entrega</h3>
              <p className="text-xs text-text-secondary">2 a 4 días hábiles en ciudades principales.</p>
            </div>

            <div className="bg-bg-secondary border border-divider/60 rounded-xl p-5 text-center space-y-2">
              <div className="h-10 w-10 mx-auto rounded-full bg-surface flex items-center justify-center text-title">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-sm font-bold text-title">Empaque Protegido</h3>
              <p className="text-xs text-text-secondary">Empaques acolchados y sellados para proteger tus cristales.</p>
            </div>
          </div>

          <div className="bg-bg-secondary border border-divider/60 rounded-xl p-8 space-y-6 text-xs sm:text-sm text-text-primary/85 leading-relaxed">
            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-title">1. Procesamiento de Órdenes</h2>
              <p>
                Una vez confirmado tu pago, tu pedido se prepara cuidadosamente en un plazo de 24 horas hábiles. Recibirás un correo electrónico con el número de guía de la transportadora para realizar el seguimiento en tiempo real.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-title">2. Transportadoras Aliadas</h2>
              <p>
                Trabajamos con empresas logísticas reconocidas (Coordinadora, Servientrega, Envía e Inter Rapidísimo) para garantizar un transporte seguro y confiable.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-title">3. Estado del Envío</h2>
              <p>
                Puedes consultar el estado de tu pedido en cualquier momento iniciando sesión en tu cuenta desde la sección <strong>Mis Pedidos</strong>.
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
