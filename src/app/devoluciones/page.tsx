export default function DevolucionesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm p-12">
          <div className="text-center mb-10">
            <div className="text-6xl mb-6">↩️</div>
            <h1 className="text-4xl font-bold text-primary mb-4">Política de Devoluciones</h1>
            <p className="text-xl text-muted">Tu satisfacción es nuestra prioridad. Proceso de devolución simple y rápido.</p>
          </div>
          <div className="space-y-6 mb-8">
            <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-xl">
              <span className="text-3xl">1️⃣</span>
              <div>
                <h3 className="font-semibold text-lg mb-1">Plazo de 30 días</h3>
                <p className="text-muted">Tienes 30 días desde la recepción para solicitar una devolución por cualquier motivo.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-xl">
              <span className="text-3xl">2️⃣</span>
              <div>
                <h3 className="font-semibold text-lg mb-1">Condiciones del producto</h3>
                <p className="text-muted">El producto debe estar en su estado original, sin uso, con embalaje y accesorios completos.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-xl">
              <span className="text-3xl">3️⃣</span>
              <div>
                <h3 className="font-semibold text-lg mb-1">Proceso de reembolso</h3>
                <p className="text-muted">Una vez recibido el producto, procesamos el reembolso en 3-5 días hábiles al medio de pago original.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-xl">
              <span className="text-3xl">4️⃣</span>
              <div>
                <h3 className="font-semibold text-lg mb-1">Costo del envío de devolución</h3>
                <p className="text-muted">Si el producto tiene defecto, cubrimos el costo del envío. Para devoluciones por cambio de opinión, el costo es del cliente.</p>
              </div>
            </div>
          </div>
          <div className="text-center">
            <a href="/contacto" className="bg-gradient-primary text-white px-8 py-3 rounded-lg text-lg font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105 inline-block">
              Iniciar Devolución
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
