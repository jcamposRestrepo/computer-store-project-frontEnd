export default function AyudaPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-white rounded-2xl shadow-sm p-12">
          <div className="text-6xl mb-6">🛟</div>
          <h1 className="text-4xl font-bold text-primary mb-4">Centro de Ayuda</h1>
          <p className="text-xl text-muted mb-8">
            Estamos aquí para ayudarte. Si tienes alguna pregunta o problema, no dudes en contactarnos.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 bg-gray-50 rounded-xl">
              <div className="text-3xl mb-3">📦</div>
              <h3 className="font-semibold text-lg mb-2">Pedidos</h3>
              <p className="text-muted text-sm">Seguimiento y gestión de tus pedidos</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl">
              <div className="text-3xl mb-3">🔧</div>
              <h3 className="font-semibold text-lg mb-2">Soporte Técnico</h3>
              <p className="text-muted text-sm">Ayuda con productos y configuración</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl">
              <div className="text-3xl mb-3">💳</div>
              <h3 className="font-semibold text-lg mb-2">Pagos</h3>
              <p className="text-muted text-sm">Consultas sobre pagos y facturación</p>
            </div>
          </div>
          <a
            href="/contacto"
            className="bg-gradient-primary text-white px-8 py-3 rounded-lg text-lg font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105 inline-block"
          >
            Contactar Soporte
          </a>
        </div>
      </div>
    </div>
  );
}
