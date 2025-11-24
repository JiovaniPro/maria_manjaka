"use client";

import { useEffect, useState } from "react";

type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type, duration = 5000, onClose }: ToastProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (duration / 100));
        if (newProgress <= 0) {
          clearInterval(interval);
          onClose();
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [duration, onClose]);

  const getColorClasses = () => {
    switch (type) {
      case "success":
        return "bg-emerald-500";
      case "error":
        return "bg-red-500";
      case "info":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
          </svg>
        );
      case "error":
        return (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
          </svg>
        );
      case "info":
        return (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
        );
    }
  };

  return (
    <div className="animate-slide-in-right mb-4 w-80 overflow-hidden rounded-2xl bg-white shadow-[0_15px_45px_rgba(0,0,0,0.15)]">
      <div className="flex items-start gap-3 p-4">
        <div className={`${getColorClasses()} rounded-lg p-1 text-white`}>
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-black">
            {type === "success" ? "Succès" : type === "error" ? "Erreur" : "Information"}
          </p>
          <p className="mt-1 text-sm text-black/60">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-black/40 transition hover:bg-black/5 hover:text-black"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="h-1 bg-black/5">
        <div
          className={`h-full transition-all duration-100 ease-linear ${getColorClasses()}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}