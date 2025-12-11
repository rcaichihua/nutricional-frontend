import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";

export default function ObservacionModal({
  open,
  onClose,
  fecha,
  observacionInicial = "",
  onSave,
}) {
  const [texto, setTexto] = useState(observacionInicial);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTexto(observacionInicial || "");
    }
  }, [open, observacionInicial]);

  const handleSave = async () => {
    setSaving(true);
    await onSave(texto);
    setSaving(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
        >
          <X size={20} />
        </button>

        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Observación del Día
          <span className="block text-sm font-normal text-gray-500 mt-1">{fecha}</span>
        </h3>

        <textarea
          className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none h-32"
          placeholder="Escribe aquí cualquier observación o nota importante para este día..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          maxLength={500}
        />
        <div className="text-right text-xs text-gray-400 mt-1">
          {texto.length}/500
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}