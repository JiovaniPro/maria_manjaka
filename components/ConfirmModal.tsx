"use client";

type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: "danger" | "warning" | "info";
};

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  onConfirm,
  onCancel,
  type = "danger",
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const colors = {
    danger: {
      icon: "text-red-500",
      button: "bg-red-500 hover:bg-red-600",
      bg: "bg-red-50",
    },
    warning: {
      icon: "text-yellow-500",
      button: "bg-yellow-500 hover:bg-yellow-600",
      bg: "bg-yellow-50",
    },
    info: {
      icon: "text-blue-500",
      button: "bg-blue-500 hover:bg-blue-600",
      bg: "bg-blue-50",
    },
  };

  const color = colors[type];

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-8 shadow-2xl">
        <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${color.bg}`}>
          <svg
            viewBox="0 0 24 24"
            className={`h-8 w-8 ${color.icon}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="mb-2 text-center text-xl font-bold">{title}</h2>
        <p className="mb-6 text-center text-sm text-black/60">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-2xl border border-black/20 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-black/5"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-2xl px-6 py-3 text-sm font-semibold text-white transition ${color.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}