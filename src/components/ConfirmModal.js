import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

export default function ConfirmModal({ isOpen, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-dark-800 border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
        <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiAlertTriangle className="text-red-400" size={24} />
        </div>
        <h3 className="text-white font-semibold mb-2">Confirmar exclusão</h3>
        <p className="text-dark-300 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-sm text-dark-300 hover:text-white bg-dark-700/50 hover:bg-dark-700 border border-white/10 rounded-lg transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-500 rounded-lg font-medium transition-all"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
