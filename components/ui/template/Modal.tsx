import { ReactNode, useId } from "react";
import { X } from "lucide-react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const titleId = useId();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200 max-h-[calc(100vh-2rem)]"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label={`Close ${title}`}
          title={`Close ${title}`}
        >
          <X className="w-5 h-5" />
        </button>

        <h2 id={titleId} className="text-xl font-bold mb-6 text-gray-800">
          {title}
        </h2>

        <div className="max-h-[calc(100vh-9rem)] overflow-y-auto pr-1">
          {children}
        </div>
      </div>
    </div>
  );
}
