import React, { useState } from 'react';
//import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth.ts';
import { User, Lock, LoaderCircle } from 'lucide-react';

const Login = () => {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  //const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!user || !password) {
      setError('Por favor, ingresa tu usuario y contraseña.');
      return;
    }

    setLoading(true);
    try {
      await login(user, password);    

      window.location.href = '/'; 

    } catch (err) {
      setError(err.message || 'Error en el inicio de sesión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 h-screen w-full">
        
        {/* --- LADO IZQUIERDO: IMAGEN Y MARCA --- */}
        <div className="hidden md:flex flex-col items-center justify-center relative bg-cover bg-center" style={{ backgroundImage: "url('/login.jpg')" }}>
          <div className="absolute inset-0 bg-blue-900 bg-opacity-60 z-0"></div>
          <div className="relative z-10 flex flex-col items-center text-center p-12">
             <img
                src="/logo-blima.jpg"
                alt="Logo Beneficencia Blanco"
                className="w-32 h-32 mb-6 bg-white rounded-full p-2 shadow-2xl"
              />
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white drop-shadow-lg leading-tight">
              Programa Social de Apoyo Alimentario y Nutricional
            </h1>
            <p className="text-xl text-blue-200 mt-4 max-w-lg">
              Gestionando la nutrición para un futuro más saludable.
            </p>
            <div className="absolute bottom-8 left-0 w-full text-xs text-white opacity-70">
              © 2025 Sociedad de Beneficencia de Lima Metropolitana
            </div>
          </div>
        </div>
        
        {/* --- LADO DERECHO: FORMULARIO DE LOGIN --- */}
        <div className="flex flex-col items-center justify-center p-6 sm:p-12 bg-white">
          <div className="w-full max-w-sm">
            <div className="text-center mb-8">
              <img
                src="/logo-blima.jpg"
                alt="Logo Beneficencia"
                className="w-24 h-24 mx-auto mb-4"
                style={{ objectFit: 'contain' }}
              />
              <h2 className="text-3xl font-bold text-gray-800">Acceso al Sistema</h2>
              <p className="text-gray-500 mt-2">Ingresa tus credenciales para continuar.</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Campo de Usuario */}
              <div>
                <label htmlFor="user" className="block text-sm font-medium text-gray-700">Usuario</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="user"
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                    placeholder="Tu nombre de usuario"
                    required
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Campo de Contraseña */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Mensaje de Error */}
              {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md text-sm">
                  <p>{error}</p>
                </div>
              )}

              {/* Botón de Ingresar */}
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105 disabled:bg-blue-300 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <LoaderCircle className="animate-spin mr-2" />
                      Ingresando...
                    </>
                  ) : (
                    'Ingresar'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;