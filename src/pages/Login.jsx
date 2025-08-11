import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import './Login.css';

const Login = () => {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      navigate('/'); 
      window.location.reload();

    } catch (err) {
      setError(err.message || 'Error en el inicio de sesión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="grid grid-cols-1 md:grid-cols-5 h-screen w-full">
        {/* Imagen en las primeras 3/5 partes */}
        <div
          className="hidden md:col-span-3 md:flex flex-col items-center justify-center relative h-full"
          style={{
            backgroundImage: "url('/src/assets/login.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Overlay para legibilidad */}
          {/* <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 to-green-900/40 z-0"></div> */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
            
            <h1 className="text-4xl font-extrabold text-white drop-shadow-lg text-center mb-">Programa Social de Apoyo Alimentario y Nutricional</h1>
            <div className="absolute bottom-4 left-0 w-full text-center text-xs text-white opacity-60">© 2025 SBLM</div>
          </div>
        </div>
        {/* Formulario en las últimas 2/5 partes */}
        <div className="md:col-span-2 col-span-1 flex items-center justify-center p-6 h-full bg-white">
          <form className="login-form w-full max-w-xs" onSubmit={handleSubmit}>
              <img
                src="/logo-blima.jpg"
                alt="Logo Beneficencia"
                className="w-2/3 max-w-xs mx-auto"
                style={{ objectFit: 'contain' }}
                />
                {/* <p className="text-lg font-semibold text-center mb-2 text-[#6142de]">Programa Social de Apoyo Alimentario y Nutricional</p> */}
            <h2 className="login-title mb-4">Iniciar Sesión</h2>
            <div className="input-group mb-3">
              <label htmlFor="user">Usuario</label>
              <input
                type="text"
                id="user"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="Usuario"
                required
              />
            </div>
            <div className="input-group mb-3">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            {error && <div className="error-message mb-2">{error}</div>}
            <button type="submit" className="login-btn w-full" disabled={loading}>
              {loading ? 'Cargando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
