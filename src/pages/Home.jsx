import { useState } from "react";
import { BookHeart, Calendar, Apple, Sparkles, HeartPlus } from "lucide-react";
import MenuPlanner from "../components/MenuPlanner";
import RecipeManager from "./RecipeManager";
import InsumosManager from "../pages/InsumosManager";
import MenuNutritionalDetail from "../components/MenuNutritionalDetail";
import ComparativoNutricionalLocro from "../pages/ComparativoNutricionalLocro";
import RecetaNutritionalDetail from "../components/RecetaNutritionalDetail";

export default function Home() {
  const [activeTab, setActiveTab] = useState("planner");
  const [recetaDetalleId, setRecetaDetalleId] = useState(null); // Nuevo estado para el id de receta
  const LOGO_URL = "/logo-blima.jpg";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col items-center justify-start p-0 md:p-6">
      {/* Banner institucional */}
      <div className="w-full max-w-5xl rounded-2xl shadow-lg mb-6 overflow-hidden flex flex-col md:flex-row items-center bg-gradient-to-r from-blue-800 to-blue-500">
        {/* Responsive: stack logo/heading en mobile */}
        <div className="flex-1 flex flex-col items-center md:items-start p-4 md:p-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-2 text-center md:text-left">
            Sociedad de Beneficencia de Lima
          </h1>
          <p className="text-base sm:text-lg text-blue-100 mb-2 font-semibold text-center md:text-left">
          Programa Social de Apoyo Alimentario y Nutricional
          </p>
        </div>
        <div className="w-full md:w-auto flex justify-center md:justify-end">
          <img
            src={LOGO_URL}
            alt="Logo Beneficencia"
            className="h-20 sm:h-24 md:h-36 m-2 bg-white rounded-xl shadow-lg"
            style={{ objectFit: "contain", padding: 10, maxWidth: 120 }}
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
                activeTab === "recipes"
                  ? "bg-purple-600 text-white shadow-lg"
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
          {/* <button
            className={`px-6 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all
              ${
                activeTab === "nutrientes"
                  ? "bg-cyan-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            onClick={() => setActiveTab("nutrientes")}
          >
            <Sparkles size={20} /> Nutrientes
          </button> */}
          {/* <button
            className={`px-6 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all
              ${
                activeTab === "nutrientesReceta"
                  ? "bg-cyan-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            onClick={() => setActiveTab("nutrientesReceta")}
          >
            <Sparkles size={20} /> Nutrientes Receta
          </button> */}
          <button
            className={`px-6 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all
              ${
                activeTab === "nutrientes2"
                  ? "bg-cyan-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            onClick={() => setActiveTab("nutrientes2")}
          >
            <HeartPlus size={20} /> Mejoras
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
          {activeTab === "alimentos" && <InsumosManager />}
          {activeTab === "nutrientes" && <MenuNutritionalDetail />}
          {activeTab === "nutrientesReceta" &&
            recetaDetalleId && (
              <RecetaNutritionalDetail id={recetaDetalleId} />
            )}
          {activeTab === "nutrientes2" && <ComparativoNutricionalLocro />}
        </div>
      </div>
    </div>
  );
}
