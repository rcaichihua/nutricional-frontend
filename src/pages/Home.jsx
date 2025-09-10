import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { BookHeart, Calendar, Apple, Sparkles, HeartPlus, ChartLine, CalendarDays, Wrench, LogOut, UserCircle } from "lucide-react";
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

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const username = "Usuario";

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col items-center justify-start p-0 md:p-6">
      {/* --- CABECERA MODIFICADA --- */}
      {/* Se elimina la clase 'overflow-hidden' para permitir que el dropdown sea visible */}
      <div className="w-full max-w-7xl rounded-2xl shadow-lg mb-6 flex items-center justify-between bg-gradient-to-r from-blue-800 to-blue-500 p-4">
        {/* Lado izquierdo: Logo y Título */}
        <div className="flex items-center gap-4">
          <img
            src={LOGO_URL}
            alt="Logo Beneficencia"
            className="h-16 w-16 bg-white rounded-xl shadow-lg p-1"
            style={{ objectFit: 'contain' }}
          />
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white drop-shadow-lg">
              Sociedad de Beneficencia de Lima
            </h1>
            <p className="text-sm sm:text-base text-blue-100 font-semibold">
              Programa Social de Apoyo Alimentario y Nutricional
            </p>
          </div>
        </div>

        {/* Lado derecho: Menú de Usuario */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold hover:bg-white/20 transition-colors"
          >
            <UserCircle size={24} />
            <span className="hidden sm:inline">{username}</span>
          </button>

          {/* Menú desplegable */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50 py-1">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <LogOut size={16} />
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>

      {/* El resto de tu componente (Tabs y contenido dinámico) se mantiene exactamente igual */}
      <div className="w-full max-w-7xl bg-white rounded-2xl shadow-2xl flex flex-col items-center">
        <div className="w-full flex flex-wrap justify-center gap-2 md:gap-6 mb-0 mt-4 px-4">
          <button
            className={`px-6 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all
              ${activeTab === "planner"
                ? "bg-amber-400 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            onClick={() => setActiveTab("planner")}
          >
            <Calendar size={20} /> Planificador
          </button>
          <button
            className={`px-6 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all
              ${activeTab === "menus"
                ? "bg-purple-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            onClick={() => setActiveTab("menus")}
          >
            <BookHeart size={20} /> Gestor de Menús
          </button>
          <button
            className={`px-6 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all
              ${activeTab === "recipes"
                ? "bg-cyan-500 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            onClick={() => setActiveTab("recipes")}
          >
            <BookHeart size={20} /> Gestor de Recetas
          </button>
          <button
            className={`px-6 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all
              ${activeTab === "alimentos"
                ? "bg-green-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            onClick={() => setActiveTab("alimentos")}
          >
            <Apple size={20} /> Alimentos
          </button>
          <button
            className={`px-6 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all
              ${activeTab === "calendar"
                ? "bg-red-500 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            onClick={() => setActiveTab("calendar")}
          >
            <CalendarDays size={20} /> Calendario
          </button>
          <button
            className={`px-6 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all
              ${activeTab === "changepassword"
                ? "bg-purple-500 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            onClick={() => setActiveTab("changepassword")}
          >
            <Wrench size={20} /> Seguridad
          </button>
        </div>
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