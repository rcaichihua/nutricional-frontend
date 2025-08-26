import { useState, useEffect } from "react";
import { Save, X, PlusCircle, Trash2 } from "lucide-react";
import { useInsumos } from "../hooks/useInsumos";
import { UNITS, SUBGRUPOS } from "../config/constants";

export default function RecetaFormModal({ 
  receta, 
  onSave, 
  onClose, 
  isOpen = false 
}) {
  const { insumos, loading: insumosLoading } = useInsumos();

  // Estado para filtro de subgrupos por ingrediente
  const [subgrupoFilters, setSubgrupoFilters] = useState([""]);
  
  // Estado del formulario
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    instrucciones: "",
    porciones: 1,
    tiempoPreparacion: 30,
    ingredientes: [{ insumo: null, cantidad: "", unidad: "g" }]
  });

  // Estado de validación
  const [errors, setErrors] = useState({});

  // Inicializar formulario cuando cambia la receta
  useEffect(() => {
    if (receta) {
      setForm({
        nombre: receta.nombre || "",
        descripcion: receta.descripcion || "",
        instrucciones: receta.instrucciones || "",
        porciones: receta.porciones || 1,
        tiempoPreparacion: receta.tiempoPreparacionMinutos || 30,
        ingredientes: receta.insumos?.length > 0 
          ? receta.insumos.map(ing => ({
              insumo: { 
                insumoId: ing.insumoId,
                nombre: ing.nombreInsumo
              },
              cantidad: ing.cantidad || "",
              unidad: ing.unidadMedida || "g"
            }))
          : [{ insumo: null, cantidad: "", unidad: "g" }]
      });
      setSubgrupoFilters(
        receta.insumos?.length > 0
          ? receta.insumos.map(() => "")
          : [""]
      );
    } else {
      setForm({
        nombre: "",
        descripcion: "",
        instrucciones: "",
        porciones: 1,
        tiempoPreparacion: 30,
        ingredientes: [{ insumo: null, cantidad: "", unidad: "g" }]
      });
      setSubgrupoFilters([""]);
    }
    setErrors({});
  }, [receta]);

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!form.nombre.trim()) {
      newErrors.nombre = "El nombre de la receta es requerido";
    }

    if (form.porciones < 1) {
      newErrors.porciones = "Debe tener al menos 1 porción";
    }

    if (form.tiempoPreparacion < 1) {
      newErrors.tiempoPreparacion = "El tiempo de preparación debe ser al menos 1 minuto";
    }

    if (!form.ingredientes.every(ing => ing.insumo && ing.cantidad > 0)) {
      newErrors.ingredientes = "Todos los ingredientes deben tener insumo y cantidad válida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en el formulario
  const handleChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo si existe
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Manejar cambios en ingredientes
  const handleIngredientChange = (index, field, value) => {
    setForm(prev => ({
      ...prev,
      ingredientes: prev.ingredientes.map((ing, i) => 
        i === index ? { ...ing, [field]: value } : ing
      )
    }));

    // Limpiar error de ingredientes si existe
    if (errors.ingredientes) {
      setErrors(prev => ({
        ...prev,
        ingredientes: undefined
      }));
    }
  };

  // Manejar cambio de filtro de subgrupo para un ingrediente
  const handleSubgrupoFilterChange = (index, value) => {
    setSubgrupoFilters(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  // Agregar ingrediente
  const addIngredient = () => {
    setForm(prev => ({
      ...prev,
      ingredientes: [...prev.ingredientes, { insumo: null, cantidad: "", unidad: "g" }]
    }));
    setSubgrupoFilters(prev => [...prev, ""]);
    setTimeout(() => {
      const formContainer = document.querySelector('.receta-form-content');
      if (formContainer) {
        const scrollPosition = Math.min(
          formContainer.scrollHeight - formContainer.clientHeight,
          formContainer.scrollTop + 200
        );
        formContainer.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  // Remover ingrediente
  const removeIngredient = (index) => {
    if (form.ingredientes.length > 1) {
      setForm(prev => ({
        ...prev,
        ingredientes: prev.ingredientes.filter((_, i) => i !== index)
      }));
      setSubgrupoFilters(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Guardar receta
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const recetaData = {
      ...form,
      ...(receta && receta.recetaId ? { recetaId: receta.recetaId } : {}),
      tiempoPreparacionMinutos: form.tiempoPreparacion,
      insumos: form.ingredientes
        .filter(ing => ing.insumo && ing.cantidad > 0)
        .map(ing => ({
          insumoId: ing.insumo.insumoId,
          cantidad: parseFloat(ing.cantidad),
          unidadMedida: ing.unidad
        }))
    };

    onSave(recetaData);
  };

  // Si no está abierto, no renderizar nada
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col relative">
        {/* Header fijo */}
        <div className="p-6 md:p-8 pb-4 border-b border-gray-200">
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
            onClick={onClose}
          >
            <X size={28} />
          </button>
          
          <h3 className="text-2xl font-bold text-gray-800">
            {receta ? "Editar receta" : "Crear nueva receta"}
          </h3>
        </div>

        {/* Contenido scrolleable */}
        <div 
          className="flex-1 overflow-y-auto p-6 md:p-8 pt-4 receta-form-content"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#cbd5e0 #f7fafc'
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre de la receta */}
          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              Nombre de la receta *
            </label>
            <input
              type="text"
              className={`border rounded-lg w-full py-3 px-4 ${
                errors.nombre ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              value={form.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              placeholder="Ej: Lentejas con arroz"
            />
            {errors.nombre && (
              <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
            )}
          </div>

          {/* Descripción */}
          {/* <div>
            <label className="block mb-2 font-semibold text-gray-700">
              Descripción
            </label>
            <textarea
              className="border border-gray-300 rounded-lg w-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              placeholder="Descripción de la receta"
              rows={3}
            />
          </div> */}

          {/* Instrucciones */}
          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              Instrucciones / Observaciones
            </label>
            <textarea
              className="border border-gray-300 rounded-lg w-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.instrucciones || ""}
              onChange={(e) => handleChange('instrucciones', e.target.value)}
              placeholder="Instrucciones para la preparación"
              rows={3}
            />
          </div>

          {/* Porciones y Tiempo de Preparación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                Número de raciones *
              </label>
              <input
                type="number"
                min="1"
                className={`border rounded-lg w-full py-3 px-4 ${
                  errors.porciones ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                value={form.porciones}
                onChange={(e) => handleChange('porciones', parseInt(e.target.value) || 1)}
              />
              {errors.porciones && (
                <p className="text-red-500 text-sm mt-1">{errors.porciones}</p>
              )}
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                Tiempo de preparación (minutos) *
              </label>
              <input
                type="number"
                min="1"
                className={`border rounded-lg w-full py-3 px-4 ${
                  errors.tiempoPreparacion ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                value={form.tiempoPreparacion}
                onChange={(e) => handleChange('tiempoPreparacion', parseInt(e.target.value) || 1)}
                placeholder="30"
              />
              {errors.tiempoPreparacion && (
                <p className="text-red-500 text-sm mt-1">{errors.tiempoPreparacion}</p>
              )}
            </div>
          </div>

          {/* Ingredientes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-gray-700">
                Ingredientes *
              </label>
              {form.ingredientes.length > 3 && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {form.ingredientes.length} ingredientes
                </span>
              )}
            </div>
            
            {insumosLoading ? (
              <div className="text-center py-4 text-gray-500">
                Cargando insumos...
              </div>
            ) : (
              <div className="space-y-3">
                {form.ingredientes.map((ingrediente, index) => {
                  // Filtrar insumos por subgrupo seleccionado
                  const subgrupoValue = subgrupoFilters[index] || "";
                  const filteredInsumos = subgrupoValue
                    ? insumos.filter(insumo => insumo.subgrupo === subgrupoValue)
                    : insumos;
                  return (
                    <div
                      key={index}
                      className="flex flex-col gap-1 bg-gray-50 p-3 rounded-lg"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
                        {/* Filtro de subgrupo */}
                        <select
                          className="border border-gray-300 rounded-lg px-2 py-2 text-xs w-full sm:max-w-[160px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={subgrupoValue}
                          onChange={e => handleSubgrupoFilterChange(index, e.target.value)}
                        >
                          <option value="">Todos los subgrupos</option>
                          {Object.entries(SUBGRUPOS).map(([key, value]) => (
                            <option key={key} value={value}>{value}</option>
                          ))}
                        </select>

                        {/* Select insumo */}
                        <select
                          className="border border-gray-300 rounded-lg px-3 py-2 w-full sm:flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={ingrediente.insumo?.insumoId || ""}
                          onChange={(e) => {
                            const selectedInsumo = insumos.find(
                              insumo => insumo.insumoId === parseInt(e.target.value)
                            );
                            handleIngredientChange(index, "insumo", selectedInsumo);
                          }}
                        >
                          <option value="">Selecciona insumo</option>
                          {filteredInsumos.map((insumo) => (
                            <option value={insumo.insumoId} key={insumo.insumoId}>
                              {insumo.nombre}
                            </option>
                          ))}
                        </select>

                        {/* Cantidad */}
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          className="border border-gray-300 rounded-lg w-full sm:w-24 px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Cantidad"
                          value={ingrediente.cantidad}
                          onChange={(e) => handleIngredientChange(index, "cantidad", parseFloat(e.target.value) || "")}
                        />

                        {/* Unidad */}
                        <select
                          className="border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={ingrediente.unidad}
                          onChange={(e) => handleIngredientChange(index, "unidad", e.target.value)}
                        >
                          {Object.entries(UNITS).map(([key, value]) => (
                            <option key={key} value={value}>
                              {value}
                            </option>
                          ))}
                        </select>

                        {/* Botón eliminar */}
                        {form.ingredientes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeIngredient(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 size={20} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Botón agregar ingrediente */}
                <button
                  type="button"
                  onClick={addIngredient}
                  className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800 font-semibold"
                >
                  <PlusCircle size={18} className="mr-2" />
                  Añadir ingrediente
                </button>

                {errors.ingredientes && (
                  <p className="text-red-500 text-sm mt-1">{errors.ingredientes}</p>
                )}
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg flex items-center shadow-md transition-colors"
            >
              <Save size={18} className="mr-2" />
              {receta ? "Actualizar receta" : "Guardar receta"}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
