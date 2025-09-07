import { useState } from "react";
import { BookHeart, Calendar, Apple, Sparkles, HeartPlus, ChartLine, CalendarDays, Wrench, LogOut } from "lucide-react"; // Se añade el ícono LogOut
import MenuPlanner from "./MenuPlanner";
import RecipeManager from "./RecipeManager";
import InsumosManager from "../pages/InsumosManager";
import MenuNutritionalDetail from "../components/MenuNutritionalDetail";
import ComparativoNutricionalLocro from "../pages/ComparativoNutricionalLocro";
import RecetaNutritionalDetail from "../components/RecetaNutritionalDetail";
import Reports from "./Calendar";
import { logout } from "../api/auth";
import { useNavigate } from "react-router-dom";
import ChangePassword from "./ChangePassword";
import MenusManager from "./MenusManager";

export default function Home() {
  const [activeTab, setActiveTab] = useState("planner");
  const [recetaDetalleId, setRecetaDetalleId] = useState(null);
  const [menuDetalleId, setMenuDetalleId] = useState(null);
  const LOGO_URL = "/logo-blima.jpg";
  const navigate = useNavigate();

  // Se renombra la función para que sea específica del logout y no del logo
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col items-center justify-start p-0 md:p-6">
      {/* Banner institucional */}
      <div className="w-full max-w-5xl rounded-2xl shadow-lg mb-6 overflow-hidden flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-blue-800 to-blue-500">
        {/* Lado izquierdo con el título */}
        <div className="flex-1 flex flex-col items-center md:items-start p-4 md:p-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-2 text-center md:text-left">
            Sociedad de Beneficencia de Lima
          </h1>
          <p className="text-base sm:text-lg text-blue-100 mb-2 font-semibold text-center md:text-left">
            Programa Social de Apoyo Alimentario y Nutricional
          </p>
        </div>
        
        {/* --- CONTENEDOR DERECHO MODIFICADO --- */}
        <div className="flex items-center gap-4 m-2 md:m-4">
          {/* --- NUEVO BOTÓN DE LOGOUT --- */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold hover:bg-white/20 transition-colors"
            title="Cerrar Sesión"
          >
            <LogOut size={20} />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>
          
          {/* Logo (se quita el onClick y cursor-pointer para evitar logout accidental) */}
          <img
            src={LOGO_URL}
            alt="Logo Beneficencia"
            className="h-20 sm:h-24 md:h-32 bg-white rounded-xl shadow-lg p-2"
            style={{ objectFit: 'contain' }}
          />
        </div>
      </div>

      {/* Card principal */}
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl flex flex-col items-center">
        {/* Tabs */}
        <div className="w-full flex flex-wrap justify-center gap-2 md:gap-6 mb-0 mt-4">
          <button
            className={`px-6 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all
              ${
                activeTab === "planner"
                  ? "bg-amber-400 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            onClick={() => setActiveTab("planner")}
          >
            <Calendar size={20} /> Planificador
          </button>
          <button
            className={`px-6 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all
              ${
                activeTab === "menus"
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            onClick={() => setActiveTab("menus")}
          >
            <BookHeart size={20} /> Gestor de Menús
          </button>
          <button
            className={`px-6 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all
              ${
                activeTab === "recipes"
                  ? "bg-cyan-500 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            onClick={() => setActiveTab("recipes")}
          >
            <BookHeart size={20} /> Gestor de Recetas
          </button>
          <button
            className={`px-6 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all
              ${
                activeTab === "alimentos"
                  ? "bg-green-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            onClick={() => setActiveTab("alimentos")}
          >
            <Apple size={20} /> Alimentos
          </button>
          <button
            className={`px-6 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all
              ${
                activeTab === "calendar"
                  ? "bg-red-500 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            onClick={() => setActiveTab("calendar")}
          >
            <CalendarDays size={20} /> Calendario
          </button>
          <button
            className={`px-6 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all
              ${
                activeTab === "changepassword"
                  ? "bg-purple-500 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            onClick={() => setActiveTab("changepassword")}
          >
            <Wrench size={20} /> Seguridad
          </button>
        </div>
        {/* Content */}
        <div className="w-full p-4 md:p-8">
          {activeTab === "planner" && <MenuPlanner />}
          {activeTab === "recipes" && (
            <RecipeManager
              onVerDetalle={(id) => {
                setRecetaDetalleId(id);
                setActiveTab("nutrientesReceta");
              }}
            />
          )}
          {activeTab === "nutrientesReceta" &&
            recetaDetalleId && (
              <RecetaNutritionalDetail id={recetaDetalleId} />
            )
          }
          {/* --- */}
          {activeTab === "menus" && (
            <MenusManager
              onVerDetalle={(detalleMenuId) => {
                setMenuDetalleId(detalleMenuId);
                setActiveTab("nutrientesMenu");
              }}
            />
          )}
          {activeTab === "nutrientesMenu" &&
            menuDetalleId && (
              <MenuNutritionalDetail menuId={menuDetalleId} />
            )
          }
          {activeTab === "alimentos" && <InsumosManager />}
          {activeTab === "nutrientes" && <MenuNutritionalDetail />}
          {activeTab === "nutrientes2" && <ComparativoNutricionalLocro />}
          {activeTab === "calendar" && <Reports />}
          {activeTab === "changepassword" && <ChangePassword />}
        </div>
      </div>
    </div>
  );
}