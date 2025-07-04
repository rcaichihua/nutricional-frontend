import { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { useInsumos } from "../hooks/useInsumos";
import InsumoFormModal from "../components/InsumoFormModal";
import { crearInsumo, editarInsumo, eliminarInsumo } from "../api/insumos";
import ConfirmModal from "../components/ConfirmModal";

const ESTADOS = ["ACTIVO", "INACTIVO", "ELIMINADO", "OBSERVADO"];

function normalizar(str) {
  return (str || "")
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export default function InsumoManager() {

  const { insumos, loading, error, refetch } = useInsumos();
  const [insumoEditando, setInsumoEditando] = useState(null);
  const [filtro, setFiltro] = useState("");
  const [pagina, setPagina] = useState(1);
  const registrosPorPagina = 10;
  const [errorApi, setErrorApi] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [insumoAEliminar, setAlimentoAEliminar] = useState(null);

  // --- Guardar insumo (crear o editar) ---
  const handleSave = async (insumo) => {
    setErrorApi(null);
    try {
      if (!insumo.nombre?.trim()) {
        alert("Debes poner el nombre del insumo");
        return;
      }
      if (!insumo.grupo?.trim()) {
        alert("Selecciona el grupo");
        return;
      }

      if (!insumo.insumoId) {
        // Nuevo insumo: llamar a la API
        try {
          await crearInsumo(insumo);
          refetch(); // Recargar la lista desde la API
        } catch (e) {
          alert("Error al crear el insumo");
        }
      } else {
        // Editar insumo existente
        try {
          await editarInsumo(insumo);
          refetch();
        } catch (e) {
          alert("Error al editar el insumo");
        }
      }
      setInsumoEditando(null);
    } catch (e) {
      setErrorApi(e.message || "Error inesperado");
    }
  };

  // --- Eliminar insumo ---
  const handleDelete = async (insumo) => {
    if (window.confirm("¿Eliminar insumo?")) {
      try {
        await eliminarInsumo(insumo);
        refetch();
      } catch (e) {
        alert("Error al eliminar el insumo");
      }
    }
  };

  // --- Buscador por nombre, grupo o subgrupo ---
  const filtroNormalizado = normalizar(filtro);
  const insumosFiltrados = insumos.filter(a => {
    const nombre = normalizar(a.nombre);
    const grupo = normalizar(a.grupo);
    const subgrupo = normalizar(a.subgrupo);
    return (
      nombre.includes(filtroNormalizado) ||
      grupo.includes(filtroNormalizado) ||
      subgrupo.includes(filtroNormalizado)
    );
  });

  // --- Paginación ---
  const totalPaginas = Math.ceil(insumosFiltrados.length / registrosPorPagina);
  const insumosPagina = insumosFiltrados.slice(
    (pagina - 1) * registrosPorPagina,
    pagina * registrosPorPagina
  );

  // Reiniciar a la primera página si cambia el filtro
  useEffect(() => { setPagina(1); }, [filtro]);

  const handleConfirmDelete = async () => {
    if (insumoAEliminar) {
      try {
        await eliminarInsumo(insumoAEliminar);
        refetch();
      } catch (e) {
        alert("Error al eliminar el insumo");
      }
      setAlimentoAEliminar(null);
      setConfirmOpen(false);
    }
  };

  return (
    <section>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-700 flex items-center">
          <PlusCircle className="mr-2 text-green-600" size={26} /> Mantenimiento de Alimentos
        </h2>
        <button
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-md hover:shadow-lg transition-all"
          onClick={() => setInsumoEditando({ estado: "ACTIVO" })}
        >
          <PlusCircle size={18} className="mr-2" /> Nuevo alimento
        </button>
      </div>
      <input
        type="text"
        className="mb-6 w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-300"
        placeholder="Buscar por nombre, grupo o subgrupo"
        value={filtro}
        onChange={e => setFiltro(e.target.value)}
      />

      {/* Tabla insumos */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-md border border-gray-200">
        <table className="min-w-full text-xs md:text-sm text-left border-separate border-spacing-y-1">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 font-semibold text-gray-700 rounded-tl-2xl">Nombre</th>
              <th className="p-3 font-semibold text-gray-700">Grupo</th>
              <th className="p-3 font-semibold text-gray-700">Subgrupo</th>
              <th className="p-3 font-semibold text-gray-700">Kcal</th>
              <th className="p-3 font-semibold text-gray-700">Proteína (g)</th>
              <th className="p-3 font-semibold text-gray-700">Carbohidrato (g)</th>
              <th className="p-3 font-semibold text-gray-700 rounded-tr-2xl">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {insumosPagina.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400">
                  No hay insumos registrados.
                </td>
              </tr>
            ) : (
              insumosPagina.map(a => (
                <tr key={a.insumoId} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg hover:bg-green-50 transition-all">
                  <td className="p-3 font-bold text-gray-800 align-middle rounded-l-xl">{a.nombre}</td>
                  <td className="p-3 text-gray-700 align-middle">{a.grupo}</td>
                  <td className="p-3 text-gray-700 align-middle">{a.subgrupo || "-"}</td>
                  <td className="p-3 text-green-700 font-semibold align-middle">{a.energiaKcal ?? 0}</td>
                  <td className="p-3 text-blue-700 font-semibold align-middle">{(a.proteinaAnimalG ?? 0) + (a.proteinaVegetalG ?? 0)}</td>
                  <td className="p-3 text-yellow-700 font-semibold align-middle">{a.choCarbohidratoG ?? 0}</td>
                  <td className="p-3 flex gap-2 align-middle rounded-r-xl">
                    <button
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                      onClick={() => setInsumoEditando(a)}
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                      onClick={() => {
                        setAlimentoAEliminar(a);
                        setConfirmOpen(true);
                      }}
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Controles de paginación */}
      <div className="flex justify-center mt-4 gap-2 items-center">
        <button
          onClick={() => setPagina(p => Math.max(1, p - 1))}
          disabled={pagina === 1}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        >Anterior</button>
        <span className="mx-2">Página {pagina} de {totalPaginas}</span>
        <button
          onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
          disabled={pagina === totalPaginas || totalPaginas === 0}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        >Siguiente</button>
      </div>
      {/* Modal */}
      {insumoEditando && (
        <InsumoFormModal
          insumo={insumoEditando}
          onSave={handleSave}
          onClose={() => setInsumoEditando(null)}
        />
      )}
      <ConfirmModal
        open={confirmOpen}
        title="¿Eliminar insumo?"
        message="Esta acción marcará el insumo como eliminado. ¿Deseas continuar?"
        onConfirm={handleConfirmDelete}
        onCancel={() => { setConfirmOpen(false); setAlimentoAEliminar(null); }}
      />
    </section>
  );
}
