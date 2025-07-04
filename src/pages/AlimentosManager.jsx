import { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash2, X, Save } from "lucide-react";
import { useAlimentos } from "../hooks/useAlimentos";
import AlimentoFormModal from "../components/AlimentoFormModal";
import { crearAlimento, editarAlimento, eliminarAlimento } from "../api/alimentos";
import ConfirmModal from "../components/ConfirmModal";

const ESTADOS = ["ACTIVO", "INACTIVO", "ELIMINADO", "OBSERVADO"];

function normalizar(str) {
  return (str || "")
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export default function AlimentosManager() {

  const { alimentos, loading, error, refetch } = useAlimentos();
  const [alimentoEditando, setAlimentoEditando] = useState(null);
  const [filtro, setFiltro] = useState("");
  const [pagina, setPagina] = useState(1);
  const registrosPorPagina = 10;
  const [errorApi, setErrorApi] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [alimentoAEliminar, setAlimentoAEliminar] = useState(null);

  // --- Guardar alimento (crear o editar) ---
  const handleSave = async (alimento) => {
    setErrorApi(null);
    try {
      if (!alimento.nombreAlimento?.trim()) {
        alert("Debes poner el nombre del alimento");
        return;
      }
      if (!alimento.grupo?.trim()) {
        alert("Selecciona el grupo");
        return;
      }

      if (!alimento.id) {
        // Nuevo alimento: llamar a la API
        try {
          await crearAlimento(alimento);
          refetch(); // Recargar la lista desde la API
        } catch (e) {
          alert("Error al crear el alimento");
        }
      } else {
        // Editar alimento existente
        try {
          await editarAlimento(alimento);
          refetch();
        } catch (e) {
          alert("Error al editar el alimento");
        }
      }
      setAlimentoEditando(null);
    } catch (e) {
      setErrorApi(e.message || "Error inesperado");
    }
  };

  // --- Eliminar alimento ---
  const handleDelete = async (alimento) => {
    if (window.confirm("¿Eliminar alimento?")) {
      try {
        await eliminarAlimento(alimento);
        refetch();
      } catch (e) {
        alert("Error al eliminar el alimento");
      }
    }
  };

  // --- Buscador por nombre, grupo o subgrupo ---
  const filtroNormalizado = normalizar(filtro);
  const alimentosFiltrados = alimentos.filter(a => {
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
  const totalPaginas = Math.ceil(alimentosFiltrados.length / registrosPorPagina);
  const alimentosPagina = alimentosFiltrados.slice(
    (pagina - 1) * registrosPorPagina,
    pagina * registrosPorPagina
  );

  // Reiniciar a la primera página si cambia el filtro
  useEffect(() => { setPagina(1); }, [filtro]);

  const handleConfirmDelete = async () => {
    if (alimentoAEliminar) {
      try {
        await eliminarAlimento(alimentoAEliminar);
        refetch();
      } catch (e) {
        alert("Error al eliminar el alimento");
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
          onClick={() => setAlimentoEditando({ estado: "ACTIVO" })}
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

      {/* Tabla alimentos */}
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
            {alimentosPagina.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400">
                  No hay alimentos registrados.
                </td>
              </tr>
            ) : (
              alimentosPagina.map(a => (
                <tr key={a.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg hover:bg-green-50 transition-all">
                  <td className="p-3 font-bold text-gray-800 align-middle rounded-l-xl">{a.nombre}</td>
                  <td className="p-3 text-gray-700 align-middle">{a.grupo}</td>
                  <td className="p-3 text-gray-700 align-middle">{a.subgrupo || "-"}</td>
                  <td className="p-3 text-green-700 font-semibold align-middle">{a.energiaKcal ?? 0}</td>
                  <td className="p-3 text-blue-700 font-semibold align-middle">{(a.proteinaAnimalG ?? 0) + (a.proteinaVegetalG ?? 0)}</td>
                  <td className="p-3 text-yellow-700 font-semibold align-middle">{a.choCarbohidratoG ?? 0}</td>
                  <td className="p-3 flex gap-2 align-middle rounded-r-xl">
                    <button
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                      onClick={() => setAlimentoEditando(a)}
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
      {alimentoEditando && (
        <AlimentoFormModal
          alimento={alimentoEditando}
          onSave={handleSave}
          onClose={() => setAlimentoEditando(null)}
        />
      )}
      <ConfirmModal
        open={confirmOpen}
        title="¿Eliminar alimento?"
        message="Esta acción marcará el alimento como eliminado. ¿Deseas continuar?"
        onConfirm={handleConfirmDelete}
        onCancel={() => { setConfirmOpen(false); setAlimentoAEliminar(null); }}
      />
    </section>
  );
}
