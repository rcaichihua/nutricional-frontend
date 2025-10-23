import { PlusCircle, Edit, Eye, X } from "lucide-react";
import { useState } from "react";
import { useMenus } from "../hooks/useMenus";
import { useRecetas } from "../hooks/useRecetas";
import { crearMenu, editarMenu } from "../api/menus";
import SelectRecetaToMenuForm from "../components/SelectRecetaToMenuForm";
import MenuNutritionalDetail from "../components/MenuNutritionalDetail";

// Este es el componente de página completo para gestionar menús.
export default function MenusManager({ onVerDetalle }) {

    // Hook para obtener la lista de menús y la función para refrescarla.
    const { menus, refetch } = useMenus();
    
    // Hook mejorado que nos da la lista filtrada, la completa y las funciones de búsqueda.
    const { filteredRecetas, allRecetasConInsumos, searchTerm, setSearchTerm, loadingAllRecetas } = useRecetas();

    // Estados para controlar la visibilidad de los modales y los datos.
    const [modalOpen, setModalOpen] = useState(false);
    const [menuEdit, setMenuEdit] = useState(null);
    const [detalleMenuId, setDetalleMenuId] = useState(null);
    const [saveError, setSaveError] = useState(null); // Estado para el error de guardado
        
    // Abre el modal de creación/edición.
    const openModal = (menu = null) => {
        setSaveError(null); // Limpia errores previos al abrir el modal.
        setMenuEdit(menu);
        setModalOpen(true);
    };
        
    // Cierra el modal y limpia el estado.
    const closeModal = () => {
        setModalOpen(false);
        setMenuEdit(null);
        setSearchTerm(""); // Importante: Limpia la búsqueda al cerrar el modal.
    };

    /**
     * Maneja la lógica de guardar (crear o editar) un menú.
     * Captura los errores de la API y los muestra al usuario.
     */
    const handleSaveMenu = async (data) => {
        setSaveError(null); // Limpia el error anterior en cada intento.
        const menuRequestDTO = {
            nombreMenu: data.titulo,
            // Campos por defecto si es un menú nuevo
            fechaMenu: menuEdit?.fechaMenu || new Date().toISOString().slice(0, 10),
            descripcion: menuEdit?.descripcion || '',
            tipoMenu: menuEdit?.tipoMenu || 'ESTANDAR',
            recetas: data.recetas.map((receta, idx) => ({
                recetaId: receta.recetaId,
                tipoComida: 'Almuerzo', // Este campo podría ser dinámico en el futuro
                orden: idx,
            })),
            estado: menuEdit?.estado || 'ACTIVO',
        };
        try {
            if (menuEdit?.menuId) {
                // Editando un menú existente
                await editarMenu({ ...menuRequestDTO, menuId: menuEdit.menuId });
            } else {
                // Creando un menú nuevo
                await crearMenu(menuRequestDTO);
            }
            await refetch(); // Refresca la lista de menús para mostrar los cambios
            closeModal(); // Cierra el modal en caso de éxito
            return true; // Indica que el guardado fue exitoso
        } catch (e) {
            console.error('Error guardando menú:', e);
            // Extrae el mensaje de validación específico del backend.
            const errorMessage = e.errors?.fields?.nombreMenu || e.message || "Ocurrió un error inesperado.";
            setSaveError(errorMessage);
            return false; // Indica que hubo un error
        }
    };

    return (
        <div>
            {/* Cabecera con título y botón para crear un nuevo menú */}
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-700 flex items-center">
                    <PlusCircle className="mr-2 text-purple-600" size={26} /> Gestor de Menús
                </h2>
                <button
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-md hover:shadow-lg transition-all"
                    onClick={() => openModal(null)}
                >
                    <PlusCircle size={18} className="mr-2" /> Crear nuevo Menú
                </button>
            </div>

            {/* Contenedor para la lista de menús */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(menus || []).map((menu) => (
                    <div
                        key={menu.menuId}
                        className="border border-gray-200 rounded-xl p-4 bg-white shadow flex flex-col justify-between relative"
                    >
                        <div>
                            <h3 className="font-bold text-lg text-gray-800">
                                {menu.nombreMenu}
                            </h3>
                            <ul className="list-disc list-inside text-sm text-gray-600 my-2 pl-2">
                                {/* Muestra las primeras 5 recetas para no saturar la tarjeta */}
                                {(menu.recetas || []).slice(0, 5).map((receta, i) => (
                                <li key={i} className="truncate">
                                    {receta.nombreReceta}
                                </li>
                                ))}
                                {(menu.recetas?.length || 0) > 5 && <li className="text-gray-500">...y más</li>}
                            </ul>
                        </div>
                        <div className="flex items-center justify-end space-x-2 mt-2">
                            <button
                                className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors"
                                onClick={() => onVerDetalle ? onVerDetalle(menu.menuId) : setDetalleMenuId(menu.menuId)}
                                title="Ver detalle nutricional"
                            >
                                <Eye size={18} />
                            </button>
                            <button
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                                onClick={() => openModal(menu)}
                                title="Editar Menú"
                            >
                                <Edit size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal de Formulario para Crear/Editar Menú */}
            {modalOpen && (
                <SelectRecetaToMenuForm
                    open={modalOpen}
                    onClose={closeModal}
                    // Props para la funcionalidad de búsqueda
                    recetasDisponibles={filteredRecetas || []} // La lista que se filtra
                    allRecetas={allRecetasConInsumos || []}   // La lista completa para inicializar
                    searchTerm={searchTerm}
                    onSearchTermChange={setSearchTerm}
                    isLoading={loadingAllRecetas}
                    // Lógica de guardado y manejo de errores
                    onSave={handleSaveMenu}
                    saveError={saveError} // Pasa el mensaje de error al modal
                    // Datos iniciales para el formulario
                    seleccionadas={menuEdit?.recetas || []}
                    tituloInicial={menuEdit?.nombreMenu || ""}
                />
            )} 

            {/* Modal para ver el Detalle Nutricional */}
            {detalleMenuId && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl w-full relative">
                        <button 
                            onClick={() => setDetalleMenuId(null)} 
                            className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-200 transition-colors"
                            title="Cerrar"
                        >
                            <X size={20} />
                        </button>
                        <MenuNutritionalDetail menuId={detalleMenuId} />
                    </div>
                </div>
            )}
        </div>
    );
}