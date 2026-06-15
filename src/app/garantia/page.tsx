export default function GarantiaPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm p-12">
          <div className="text-center mb-10">
            <div className="text-6xl mb-6">🛡️</div>
            <h1 className="text-4xl font-bold text-primary mb-4">Política de Garantía</h1>
            <p className="text-xl text-muted">Todos nuestros productos cuentan con garantía oficial del fabricante.</p>
          </div>
          <div className="space-y-6">
            <div className="border-l-4 border-primary pl-6">
              <h2 className="text-xl font-semibold mb-2">Garantía General</h2>
              <p className="text-muted">Todos los productos tienen mínimo 12 meses de garantía contra defectos de fabricación.</p>
            </div>
            <div className="border-l-4 border-secondary pl-6">
              <h2 className="text-xl font-semibold mb-2">¿Qué cubre?</h2>
              <p className="text-muted">Defectos de fabricación, fallas técnicas del producto en condiciones normales de uso.</p>
            </div>
            <div className="border-l-4 border-accent pl-6">
              <h2 className="text-xl font-semibold mb-2">¿Qué no cubre?</h2>
              <p className="text-muted">Daños físicos, derrames de líquidos, mal uso o modificaciones no autorizadas del producto.</p>
            </div>
            <div className="border-l-4 border-primary pl-6">
              <h2 className="text-xl font-semibold mb-2">Proceso de Garantía</h2>
              <p className="text-muted">Contacta nuestro soporte con tu número de orden y descripción del problema. Tiempo de respuesta: 24-48 horas hábiles.</p>
            </div>
          </div>
          <div className="text-center mt-10">
            <a href="/contacto" className="bg-gradient-primary text-white px-8 py-3 rounded-lg text-lg font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105 inline-block">
              Solicitar Garantía
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
