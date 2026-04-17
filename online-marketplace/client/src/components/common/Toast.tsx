"use client";

import React from "react";
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  type: ToastType;
  message: string;
  onClose: () => void;
}

/**
 * Toast Component for notifications
 */
export const Toast: React.FC<ToastProps> = ({ type, message, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const typeStyles = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  };

  const iconMap = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
  };

  return (
    <div
      className={`fixed top-4 right-4 flex items-center gap-3 px-4 py-3 border rounded-lg shadow-lg animate-in fade-in slide-in-from-top-4 ${typeStyles[type]} z-50`}
      role="alert"
    >
      {iconMap[type]}
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="ml-2 text-current hover:opacity-70 transition-opacity"
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
};
