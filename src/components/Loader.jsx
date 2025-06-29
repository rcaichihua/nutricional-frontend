import { Loader2 } from "lucide-react";

export default function Loader({ text = "Cargando..." }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-white bg-opacity-60 backdrop-blur-sm">
      {/* Glowing spinning icon */}
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-full bg-blue-300 opacity-60 blur-xl" style={{ width: 70, height: 70, left: -10, top: -10, zIndex: 0 }}></div>
        <div className="relative z-10">
          <Loader2 className="animate-spin text-blue-700" size={48} />
        </div>
      </div>
      <div className="mt-8 text-xl font-bold text-blue-700 tracking-wide animate-pulse drop-shadow-lg">
        {text}
      </div>
      <div className="mt-3 text-gray-500 text-sm animate-fade-in">
        Por favor, espere un momento...
      </div>
    </div>
  );
}
