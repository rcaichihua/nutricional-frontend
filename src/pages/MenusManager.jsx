import { PlusCircle, Edit, Trash2, Eye, X, Printer } from "lucide-react";
import { useMenus } from "../hooks/useMenus";
import { crearMenu, editarMenu } from "../api/menus";
import { useState } from "react";
import SelectRecipeModal from "../components/SelectRecipeModal";
import SelectRecetaToMenuForm from "../components/SelectRecetaToMenuForm";
import { useRecetas } from "../hooks/useRecetas";
import MenuNutritionalDetail from "../components/MenuNutritionalDetail";

export default function MenusManager({ onVerDetalle }) {

    const { menus, refetch } = useMenus();

    const { recetasConInsumos } = useRecetas();

    const [modalOpen, setModalOpen] = useState(false);
    const [menuEdit, setMenuEdit] = useState(null);

    const [detalleMenuId, setDetalleMenuId] = useState(null);
        
    // Modal para crear/editar menu
    const openModal = (menu = null) => {
        setMenuEdit(menu);
        setModalOpen(true);
    };
        
    const closeModal = () => {
        setModalOpen(false);
        setMenuEdit(null);
    };
 
    return (
        <div>
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

        {/* Lista de menus */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {menus.map((menu) => (
                <div
                    key={menu.menuId}
                    className="border border-gray-200 rounded-xl p-4 bg-white shadow flex flex-col justify-between relative"
                >
                    <div>
                        <h3 className="font-bold text-lg text-gray-800">
                            {menu.nombreMenu}
                        </h3>
                        <ul className="list-disc list-inside text-sm text-gray-600 my-2 pl-2">
                            {menu.recetas.map((receta, i) => (
                            <li key={i}>
                                {receta.nombreReceta}
                            </li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex items-center justify-end space-x-2 mt-2">
                        <button
                            className="p-2 text-green-600 hover:bg-green-100 rounded-full"
                            onClick={() => onVerDetalle ? onVerDetalle(menu.menuId) : setDetalleMenuId(menu.menuId)}
                            title="Ver detalle"
                        >
                            <Eye size={18} />
                        </button>
                        <button
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
                            onClick={() => openModal(menu)}
                            title="Editar"
                        >
                            <Edit size={18} />
                        </button>
                    </div>
                </div>
            ))}
        </div>

        {/* MODAL DE FORMULARIO */}
        {modalOpen && (
            <SelectRecetaToMenuForm
                open={modalOpen}
                    onClose={closeModal}
                    recetas={recetasConInsumos}
                    onSave={async (data) => {
                    // Detecta si es edición o creación
                    const menuRequestDTO = {
                        nombreMenu: data.titulo,
                        fechaMenu: menuEdit?.fechaMenu || new Date().toISOString().slice(0, 10),
                        descripcion: menuEdit?.descripcion || '',
                        tipoMenu: menuEdit?.tipoMenu || '',
                        recetas: data.recetas.map((receta, idx) => ({
                        recetaId: receta.recetaId,
                        tipoComida: 'Almuerzo',
                        orden: idx,
                        })),
                        estado: menuEdit?.estado || 'ACTIVO',
                    };
                    try {
                        if (menuEdit?.menuId) {
                        await editarMenu({ ...menuEdit, ...menuRequestDTO, menuId: menuEdit.menuId });
                        } else {
                        await crearMenu(menuRequestDTO);
                        }
                        await refetch();
                        return true;
                    } catch (e) {
                        console.error('Error guardando menú', e);
                        return false;
                    }
                    }}
                    seleccionadas={menuEdit?.recetas || []}
                tituloInicial={menuEdit?.nombreMenu || ""}
            />
        )} 

        {/* MODAL DE DETALLE */}
        {detalleMenuId && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl w-full relative">             
                <MenuNutritionalDetail menuId={detalleMenuId} />
            </div>
          </div>
        )}              
    </div>
  );
}
