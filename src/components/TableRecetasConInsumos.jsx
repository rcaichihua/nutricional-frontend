import { useState } from "react";
import { useRecetas } from "../hooks/useRecetas";

export function TablaRecetasConInsumos() {
  const {
    recetasConInsumos,
    loadingRecetasConInsumos: loading,
    errorRecetasConInsumos: error,
  } = useRecetas();
  const [recetaExpandida, setRecetaExpandida] = useState(null);

  if (loading) return <div className="text-center py-8">Cargando...</div>;
  if (error)
    return (
      <div className="text-center text-red-500 py-8">
        Error al cargar recetas
      </div>
    );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200 rounded-lg shadow-sm bg-white">
        <thead>
          <tr className="bg-blue-100 text-gray-700">
            <th className="px-4 py-2 text-left">Receta</th>
            <th className="px-4 py-2 text-left">Porciones</th>
            <th className="px-4 py-2 text-left">Descripción</th>
            <th className="px-4 py-2 text-left">Insumos</th>
          </tr>
        </thead>
        <tbody>
          {recetasConInsumos.map((receta) => (
            <tr
              key={receta.recetaId}
              className="border-b hover:bg-blue-50 transition"
            >
              <td className="px-4 py-2 font-semibold">{receta.nombre}</td>
              <td className="px-4 py-2">{receta.porciones}</td>
              <td className="px-4 py-2">
                {receta.descripcion ?? <span className="text-gray-400">-</span>}
              </td>
              <td className="px-4 py-2">
                <button
                  className="text-blue-600 hover:underline font-medium"
                  onClick={() =>
                    setRecetaExpandida(
                      recetaExpandida === receta.recetaId
                        ? null
                        : receta.recetaId
                    )
                  }
                >
                  {receta.insumos.length > 0
                    ? recetaExpandida === receta.recetaId
                      ? "Ocultar insumos"
                      : "Ver insumos"
                    : "Sin insumos"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Tabla de insumos expandida */}
      {recetasConInsumos.map(
        (receta) =>
          recetaExpandida === receta.recetaId &&
          receta.insumos.length > 0 && (
            <div
              key={receta.recetaId + "-insumos"}
              className="my-2 mx-2 p-4 border border-blue-200 rounded-lg bg-blue-50"
            >
              <h4 className="font-bold mb-2 text-blue-700">
                Insumos de {receta.nombre}
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-blue-200">
                      <th className="px-2 py-1">Nombre</th>
                      <th className="px-2 py-1">Cantidad</th>
                      <th className="px-2 py-1">Kcal/100g</th>
                      <th className="px-2 py-1">Prot. animal</th>
                      <th className="px-2 py-1">Prot. vegetal</th>
                      <th className="px-2 py-1">CHO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receta.insumos.map((insumo) => (
                      <tr key={insumo.insumoId} className="border-b">
                        <td className="px-2 py-1">{insumo.nombreInsumo}</td>
                        <td className="px-2 py-1">
                          {insumo.cantidadEnReceta} g
                        </td>
                        <td className="px-2 py-1">
                          {insumo.energiaKcalPor100g ?? "-"}
                        </td>
                        <td className="px-2 py-1">
                          {insumo.proteinaAnimalGPor100g ?? "-"}
                        </td>
                        <td className="px-2 py-1">
                          {insumo.proteinaVegetalGPor100g ?? "-"}
                        </td>
                        <td className="px-2 py-1">
                          {insumo.choCarbohidratoGPor100g ?? "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
      )}
    </div>
  );
}
