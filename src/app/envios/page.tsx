export default function EnviosPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm p-12">
          <div className="text-center mb-10">
            <div className="text-6xl mb-6">🚚</div>
            <h1 className="text-4xl font-bold text-primary mb-4">Política de Envíos</h1>
            <p className="text-xl text-muted">Enviamos a todo el país con los mejores tiempos de entrega.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
              <h2 className="text-xl font-semibold text-primary mb-3">⚡ Envío Express</h2>
              <p className="text-muted mb-2">Entrega en 24-48 horas hábiles</p>
              <p className="text-muted mb-2">Disponible para ciudades principales</p>
              <p className="font-semibold text-primary">Desde $15.000</p>
            </div>
            <div className="p-6 bg-green-50 rounded-xl border border-green-100">
              <h2 className="text-xl font-semibold mb-3" style={{color: 'var(--secondary)'}}>🎁 Envío Gratis</h2>
              <p className="text-muted mb-2">En compras superiores a $500.000</p>
              <p className="text-muted mb-2">Aplica para todo el país</p>
              <p className="font-semibold" style={{color: 'var(--secondary)'}}>¡Sin costo adicional!</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
              <h2 className="text-xl font-semibold mb-3">📦 Envío Estándar</h2>
              <p className="text-muted mb-2">Entrega en 3-5 días hábiles</p>
              <p className="text-muted mb-2">Todo el territorio nacional</p>
              <p className="font-semibold">Desde $8.000</p>
            </div>
            <div className="p-6 bg-purple-50 rounded-xl border border-purple-100">
              <h2 className="text-xl font-semibold mb-3" style={{color: 'var(--accent)'}}>🏪 Recogida en Tienda</h2>
              <p className="text-muted mb-2">Disponible inmediatamente</p>
              <p className="text-muted mb-2">Sin costo de envío</p>
              <p className="font-semibold" style={{color: 'var(--accent)'}}>¡Gratis!</p>
            </div>
          </div>
          <div className="text-center">
            <a href="/contacto" className="bg-gradient-primary text-white px-8 py-3 rounded-lg text-lg font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105 inline-block">
              Consultar Envío
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
