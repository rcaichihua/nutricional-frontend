import { useState, useEffect } from "react";

export default function SelectMenuModal({ open, onClose, fechaSeleccionada = "", menus: menusProp = [], seleccionados: seleccionadosProp = [], onSave }) {
    const menus = menusProp;
    const [seleccionados, setSeleccionados] = useState([]);

    // Mejor práctica: sincronizar el estado interno con las props relevantes
    useEffect(() => {
        if (open) {
            setSeleccionados(seleccionadosProp);
        }
    }, [open, seleccionadosProp]);

    if (!open) return null;

    const toggleMenu = (menu) => {
        const existe = seleccionados.some((m) => m.menuId === menu.menuId);
        if (existe) {
            setSeleccionados(seleccionados.filter((m) => m.menuId !== menu.menuId));
        } else {
            setSeleccionados([...seleccionados, menu]);
        }
    };

    const handleGuardar = () => {
        if (typeof onSave === 'function') {
            onSave(seleccionados);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-10 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
                >
                    Cerrar
                </button>
                <h3 className="text-2xl font-bold mb-4">Menú para {fechaSeleccionada}</h3>
                <div className="grid grid-cols-3 gap-3 max-h-72 overflow-y-auto">
                    {menus.length === 0 ? (
                        <div className="text-center text-gray-400 py-6">
                            No hay menus registrados
                        </div>
                    ) : (
                        menus.map((menu) => {
                            const seleccionado = seleccionados.some((m) => m.menuId === menu.menuId);
                            return (
                                <button
                                    key={menu.menuId + '-' + fechaSeleccionada}
                                    className={
                                        "w-full text-left p-4 rounded-xl border border-gray-200 transition font-semibold flex flex-col " +
                                        (seleccionado
                                            ? "bg-blue-100 text-blue-700"
                                            : "hover:bg-blue-50")
                                    }
                                    onClick={() => toggleMenu(menu)}
                                >
                                    <span className="text-lg">{menu.nombreMenu}</span>
                                    <ul className="list-disc list-inside text-sm text-gray-600 my-2 pl-2">
                                        {menu.recetas.map((receta, i) => (
                                            <li key={(receta.recetaId || i) + '-' + menu.menuId}>{receta.nombreReceta}</li>
                                        ))}
                                    </ul>
                                    {seleccionado && (
                                        <span className="text-xs mt-1">Seleccionado</span>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>
                <div className="flex gap-4 mt-6">
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleGuardar}
                        className={
                            "w-full py-3 rounded-xl font-semibold transition " +
                            (seleccionados.length === 0
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700")
                        }
                        disabled={seleccionados.length === 0}
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
}