import { useEffect } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

export default function NotificationToast({ 
  message, 
  type = "success", 
  onClose, 
  autoClose = true,
  duration = 5000 
}) {
  useEffect(() => {
    if (autoClose && message) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, autoClose, duration, onClose]);

  if (!message) return null;

  const bgColor = type === "success" ? "bg-green-50" : "bg-red-50";
  const borderColor = type === "success" ? "border-green-200" : "border-red-200";
  const textColor = type === "success" ? "text-green-800" : "text-red-800";
  const Icon = type === "success" ? CheckCircle : XCircle;

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full`}>
      <div className={`${bgColor} border ${borderColor} rounded-lg shadow-lg p-4 flex items-start space-x-3`}>
        <Icon 
          size={20} 
          className={`${type === "success" ? "text-green-500" : "text-red-500"} mt-0.5 flex-shrink-0`} 
        />
        <div className={`flex-1 ${textColor} text-sm`}>
          {message}
        </div>
        <button
          onClick={onClose}
          className={`${textColor} hover:opacity-70 transition-opacity`}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
} 