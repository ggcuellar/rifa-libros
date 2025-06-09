import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Configura tu Supabase
const supabase = createClient('https://peunuxjyxjajrwybwlnj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBldW51eGp5eGphanJ3eWJ3bG5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNzIwMTksImV4cCI6MjA2NDg0ODAxOX0.JXn4Y-1QJRhTGIVy4o5wQFa4QR9PP92LxLo1lygGHeQ');

const totalLibrosConImagen = 2; // Cambia este valor según vayas subiendo más imágenes

const libros = Array.from({ length: totalLibrosConImagen }, (_, i) => ({
  id: i + 1,
  titulo: `Libro ${i + 1}`,
  imagen: `/Libros/Libro${i + 1}.jpg`
}));

export default function App() {
  const [form, setForm] = useState({ nombre: '', correo: '', boleto: '' });
  const [mensaje, setMensaje] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const { data, error } = await supabase.from('Participantes').insert([form]);
    if (error) {
      setMensaje('❌ Error al registrar. Intenta con otro número de boleto.');
    } else {
      setMensaje('✅ Participación registrada con éxito.');
      setForm({ nombre: '', correo: '', boleto: '' });
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 text-center font-sans">
      <img src="/logo.png" alt="Logo" className="mx-auto w-24 mb-2" />
      <h1 className="text-2xl font-bold mb-2">🎁 Rifa de 30 Libros</h1>
      <p className="text-sm mb-4">Participa completando el formulario. ¡Buena suerte!</p>

      {/* Galería de libros */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 p-2">
  {libros.map(libro => (
    <div
      key={libro.id}
      className="bg-white border rounded-lg p-1 shadow-sm flex flex-col items-center text-center"
    >
      <img
        src={libro.imagen}
        alt={libro.titulo}
        className="w-16 h-16 object-cover rounded mb-1"
      />
      <p className="text-[10px] leading-tight">{libro.titulo}</p>
    </div>
  ))}
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
        <input
          type="number"
          name="boleto"
          value={form.boleto}
          onChange={handleChange}
          placeholder="Número de boleto (1-30)"
          required
          min="1"
          max="30"
          className="w-full border p-2 rounded text-sm"
        />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold">
          Participar
        </button>
      </form>

      {mensaje && <p className="mt-4 text-sm text-center">{mensaje}</p>}
    </div>
  );
}
