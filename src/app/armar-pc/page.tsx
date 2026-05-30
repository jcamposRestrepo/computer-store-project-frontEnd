export default function ArmarPCPage() {
  const steps = [
    {
      step: 1,
      title: 'Selecciona tu Presupuesto',
      description: 'Define cuánto quieres invertir en tu nueva PC',
      icon: '💰'
    },
    {
      step: 2,
      title: 'Elige el Uso Principal',
      description: 'Gaming, trabajo, streaming o uso general',
      icon: '🎯'
    },
    {
      step: 3,
      title: 'Selecciona Componentes',
      description: 'Nuestro sistema te recomienda los mejores componentes',
      icon: '🔧'
    },
    {
      step: 4,
      title: 'Revisa y Personaliza',
      description: 'Ajusta tu configuración según tus preferencias',
      icon: '⚙️'
    },
    {
      step: 5,
      title: 'Finaliza tu Pedido',
      description: 'Confirma tu compra y nosotros armamos tu PC',
      icon: '✅'
    }
  ];

  const presupuestos = [
    { range: '$800.000 - $1.200.000', description: 'PC Básica para oficina y navegación', popular: false },
    { range: '$1.200.000 - $2.000.000', description: 'PC Gaming de entrada', popular: true },
    { range: '$2.000.000 - $3.500.000', description: 'PC Gaming de gama media', popular: false },
    { range: '$3.500.000 - $5.000.000', description: 'PC Gaming de gama alta', popular: false },
    { range: '$5.000.000+', description: 'PC Gaming premium', popular: false }
  ];

  const usos = [
    { name: 'Gaming', description: 'Para jugar los últimos títulos en alta calidad', icon: '🎮' },
    { name: 'Trabajo', description: 'Productividad, diseño gráfico y desarrollo', icon: '💼' },
    { name: 'Streaming', description: 'Transmitir en vivo y crear contenido', icon: '📹' },
    { name: 'Uso General', description: 'Navegación, multimedia y tareas básicas', icon: '🏠' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Arma tu PC</h1>
          <p className="text-xl opacity-90 max-w-2xl">
            Crea tu computadora ideal paso a paso. Nuestro sistema te guía para 
            encontrar los componentes perfectos según tu presupuesto y necesidades.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Steps */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-gradient">
            ¿Cómo funciona?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="bg-gradient-accent w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                  {step.icon}
                </div>
                <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Budget Selection */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-gradient">
            Selecciona tu Presupuesto
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {presupuestos.map((presupuesto, index) => (
              <div
                key={index}
                className={`bg-white rounded-lg shadow-custom p-6 cursor-pointer hover:shadow-xl transition-all duration-200 border-2 ${
                  presupuesto.popular ? 'border-accent' : 'border-transparent hover:border-primary'
                }`}
              >
                {presupuesto.popular && (
                  <div className="bg-accent text-white text-xs font-semibold px-2 py-1 rounded-full inline-block mb-3">
                    Más Popular
                  </div>
                )}
                <h3 className="text-lg font-semibold mb-2">{presupuesto.range}</h3>
                <p className="text-muted text-sm">{presupuesto.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Use Case Selection */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-gradient">
            ¿Para qué usarás tu PC?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {usos.map((uso, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-custom p-6 cursor-pointer hover:shadow-xl transition-all duration-200 hover:border-primary border-2 border-transparent"
              >
                <div className="text-4xl mb-4">{uso.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{uso.name}</h3>
                <p className="text-muted text-sm">{uso.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-white rounded-lg shadow-custom p-12">
          <h2 className="text-3xl font-bold mb-4 text-gradient">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xl text-muted mb-8 max-w-2xl mx-auto">
            Nuestro configurador inteligente te ayudará a encontrar los componentes 
            perfectos para tu presupuesto y necesidades.
          </p>
          <button className="bg-gradient-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-lg transition-all duration-200">
            Comenzar Configuración
          </button>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-gradient-accent w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Garantía de Compatibilidad</h3>
            <p className="text-muted">Todos los componentes son verificados para asegurar compatibilidad total.</p>
          </div>
          
          <div className="text-center">
            <div className="bg-gradient-accent w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Armado Profesional</h3>
            <p className="text-muted">Tu PC será armada por técnicos especializados con años de experiencia.</p>
          </div>
          
          <div className="text-center">
            <div className="bg-gradient-accent w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 11-9.75 9.75 9.75 9.75 0 019.75-9.75z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Soporte Técnico</h3>
            <p className="text-muted">Asistencia técnica especializada durante y después de la compra.</p>
          </div>
        </div>
      </div>
    </div>
  );
}








