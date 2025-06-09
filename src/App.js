// Rifa de biblioteca - App en React + TailwindCSS conectada a Supabase
// Se adapta a móviles, incluye galería, formulario y control de boletos

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// 🔁 Reemplaza estas líneas con tu URL y clave pública de Supabase:
const supabase = createClient(
  'https://TU_PROYECTO.supabase.co',
  'TU_PUBLIC_ANON_KEY'
);

// 📚 Lista de libros (puedes reemplazar imágenes reales si las tienes)
const totalLibrosConImagen = 2; // actualiza este número cuando subas más

const libros = Array.from({ length: totalLibrosConImagen }, (_, i) => ({
  id: i + 1,
  titulo: `Libro ${i + 1}`,
  imagen: `/Libros/Libro${i + 1}.jpg`
}));


const totalBoletos = 100;

export default function App() {
  const [participantes, setParticipantes] = useState([]);
  const [formData, setFormData] = useState({ nombre: '', correo: '', whatsapp: '', boleto: '' });
  const [estado, setEstado] = useState('');

  useEffect(() => {
    supabase.from('Participantes').select('*').then(({ data }) => {
      if (data) setParticipantes(data);
    });
  }, []);

  const boletosDisponibles = Array.from({ length: totalBoletos }, (_, i) => {
    const num = String(i + 1).padStart(3, '0');
    return !participantes.find(p => p['Boleto Elegido'] === num) ? num : null;
  }).filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEstado('');

    const yaUsado = participantes.find(p => p['Boleto Elegido'] === formData.boleto);
    if (yaUsado) return setEstado('❌ Boleto ya reservado. Elige otro.');

    const { error } = await supabase.from('Participantes').insert([{
      "Nombres y apellidos": formData.nombre,
      "Correo": formData.correo,
      "WhatsApp": formData.whatsapp,
      "Boleto Elegido": formData.boleto,
      "Fecha": new Date().toISOString()
    }]);

    if (error) {
      setEstado('❌ Error al registrar.');
    } else {
      setParticipantes([...participantes, { ...formData }]);
      setFormData({ nombre: '', correo: '', whatsapp: '', boleto: '' });
      setEstado('✅ Registro exitoso. ¡Gracias por participar!');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 text-center">
      <img src="/logo.png" alt="Logo" className="mx-auto w-28 mb-4" />
      <h1 className="text-3xl font-bold mb-2">🎁 Rifa de 30 libros</h1>
      <p className="mb-6">Participa llenando el siguiente formulario. ¡Buena suerte!</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {libros.map(libro => (
          <div key={libro.id} className="border rounded p-2 shadow">
            <img src={libro.imagen} alt={libro.titulo} className="w-full h-24 object-cover rounded" />
            <p className="text-sm mt-1">{libro.titulo}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-100 p-4 rounded-xl shadow mb-4 text-left">
        <div className="grid gap-3">
          <input placeholder="Nombres y apellidos" className="p-2 rounded" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} />
          <input type="email" placeholder="Correo" className="p-2 rounded" value={formData.correo} onChange={e => setFormData({ ...formData, correo: e.target.value })} />
          <input type="tel" placeholder="WhatsApp" className="p-2 rounded" value={formData.whatsapp} onChange={e => setFormData({ ...formData, whatsapp: e.target.value })} />
          <select className="p-2 rounded" value={formData.boleto} onChange={e => setFormData({ ...formData, boleto: e.target.value })}>
            <option value="">Selecciona tu número de boleto</option>
            {boletosDisponibles.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Registrar</button>
        </div>
        {estado && <p className="mt-3 font-semibold text-center">{estado}</p>}
      </form>
    </div>
  );
}
