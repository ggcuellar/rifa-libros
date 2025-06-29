// Rifa de biblioteca - App en React + TailwindCSS conectada a Supabase
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Configura tu Supabase
const supabase = createClient('https://peunuxjyxjajrwybwlnj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBldW51eGp5eGphanJ3eWJ3bG5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNzIwMTksImV4cCI6MjA2NDg0ODAxOX0.JXn4Y-1QJRhTGIVy4o5wQFa4QR9PP92LxLo1lygGHeQ');

const totalLibrosConImagen = 2; // Cambia este valor según vayas subiendo más imágenes

const libros = Array.from({ length: totalLibrosConImagen }, (_, i) => ({
  id: i + 1,
  titulo: `Libro ${i + 1}`,
  imagen: `/Libros/Libro${i + 1}.jpg?${Date.now()}`
}));

export default function App() {
  const [form, setForm] = useState({ nombre: '', correo: '', boleto: '' });
  const [mensaje, setMensaje] = useState('');
  const [numerosDisponibles, setNumerosDisponibles] = useState([]);
  const [loadingBoletos, setLoadingBoletos] = useState(true);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const obtenerBoletos = async () => {
    const todos = Array.from({ length: 100 }, (_, i) => i.toString().padStart(2, '0'));
    const { data, error } = await supabase.from('Participantes').select('boleto');

    if (error) {
      console.error('Error al obtener boletos ocupados', error);
      setLoadingBoletos(false);
      return;
    }

    const ocupados = Array.isArray(data) ? data.map(entry => entry.boleto) : [];
    const disponibles = todos.filter(num => !ocupados.includes(num));

    setNumerosDisponibles(disponibles);
    setLoadingBoletos(false);
  };


  const handleSubmit = async e => {
  e.preventDefault();

  // 1. Validar si el boleto ya fue usado
  const { data: existentes, error: consultaError } = await supabase
    .from('Participantes')
    .select('boleto')
    .eq('boleto', form.boleto);

  if (consultaError) {
    console.error('❌ Error al verificar disponibilidad:', consultaError);
    setMensaje('⚠️ Error al verificar disponibilidad. Intenta nuevamente.');
    return;
  }

  if (existentes.length > 0) {
    setMensaje('🚫 Este número de boleto ya está en uso o en espera de confirmación.');
    return;
  }

  // 2. Insertar el nuevo registro como pendiente
  const fechaRegistro = new Date().toISOString();
  console.log({ ...form, estado: 'pendiente', fecha: fechaRegistro });
  
  const { error: insertError } = await supabase
    .from('Participantes')
    .insert([{ ...form, estado: 'pendiente', fecha: fechaRegistro }]);

  if (insertError) {
    
    setMensaje('❌ Error al registrar. Intenta con otro número de boleto.');
  } else {
    setMensaje(
      `✅ Participación registrada.\nPara confirmar tu inscripción, por favor envía el comprobante de pago al correo: ggcuellarj@yahoo.com.mx indicando tu nombre completo y el número de boleta seleccionado (${form.boleto}).\nRecibirás una confirmación cuando se verifique el pago.`
    );

    setForm({ nombre: '', correo: '', boleto: '' });
    obtenerBoletos(); // 🔄 Actualiza los boletos disponibles
  }
};

useEffect(() => {
  obtenerBoletos();
}, []);

  return (
   <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4 py-6">
      <img src="/logo.png" alt="Logo" className="mx-auto w-24 mb-2" />
      <h1 className="text-2xl font-bold mb-2">🎁 "Gran Rifa de una biblioteca masónica”. Propósito: financiar la elaboración del busto de Manuel Ancízar, que será instalado en los jardines de la casa Koop, con ocasión del cincuentenario de nuestro taller que se celebrará en agosto del año entrante</h1>

      <p className="text-sm mb-4">Participa completando el formulario. ¡Buena suerte!</p>
      {/* Galería de libros */}
   <div className="grid grid-cols-3 gap-2 p-2">
  {libros.map(libro => (
    <div key={libro.id} className="border rounded shadow-sm p-2 bg-white flex flex-col items-center text-center">
      <img
        src={libro.imagen}
        alt={libro.titulo}
        className="w-20 h-20 object-cover rounded mb-1"
      />
      <p className="text-xs">{libro.titulo}</p>
    </div>
    ))}
    </div>

{/* Información de pago */}
<div className="my-6 text-center">
  <p className="text-sm font-semibold mb-2">Valor por boleta: <span className="text-green-600">$70.000 COP</span></p>
  <img
    src="/qr_pago.png"
    alt="Código QR para pago"
    className="mx-auto w-40 h-40 object-contain border p-2 rounded"
  />
  <p className="text-xs text-gray-600 mt-1">Para realizar el pago, escanea este código desde la App de cualquier entidad habilitada</p>
</div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          placeholder="Tu nombre"
          required
          className="w-full border p-2 rounded text-sm"
        />
        <input
          type="email"
          name="correo"
          value={form.correo}
          onChange={handleChange}
          placeholder="Correo electrónico"
          required
          className="w-full border p-2 rounded text-sm"
        />

        {/* Selección de número de boleto */}
        <div className="mb-4">
          <p className="mb-2 font-semibold text-sm">Selecciona tu número de boleto:</p>
          {loadingBoletos ? (
            <p className="text-sm text-gray-500">Cargando boletos disponibles...</p>
          ) : (
            <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto">
              {Array.from({ length: 100 }, (_, i) => {
                const num = i.toString().padStart(2, '0');
                const ocupado = !numerosDisponibles.includes(num);

                return (
                  <button
                    key={num}
                    type="button"
                    disabled={ocupado}
                    className={`text-sm p-2 rounded border transition ${
                      form.boleto === num
                        ? 'bg-blue-600 text-white'
                        : ocupado
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-white hover:bg-blue-100'
                    }`}
                    onClick={() => !ocupado && setForm({ ...form, boleto: num })}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold">
          Participar
        </button>
      </form>

      {mensaje && <p className="mt-4 text-sm text-center">{mensaje}</p>}
    </div>
  );
}
