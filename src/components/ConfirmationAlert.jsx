import React from 'react';
import { colors } from '../theme/colors';

export default function ConfirmationAlert({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmation",
  message = "Êtes-vous sûr de vouloir effectuer cette action ?",
  confirmText = "Confirmer",
  cancelText = "Annuler",
  type = "warning" // warning, danger, info
}) {
  if (!isOpen) return null;

  const getColors = () => {
    switch (type) {
      case 'danger':
        return {
          icon: '⚠️',
          iconBg: 'bg-red-500/20',
          iconColor: 'text-red-400',
          confirmBg: 'bg-red-600 hover:bg-red-700',
          borderColor: 'border-red-500/20'
        };
      case 'info':
        return {
          icon: 'ℹ️',
          iconBg: 'bg-blue-500/20',
          iconColor: 'text-blue-400',
          confirmBg: 'bg-blue-600 hover:bg-blue-700',
          borderColor: 'border-blue-500/20'
        };
      default: // warning
        return {
          icon: '⚠️',
          iconBg: 'bg-yellow-500/20',
          iconColor: 'text-yellow-400',
          confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
          borderColor: 'border-yellow-500/20'
        };
    }
  };

  const alertColors = getColors();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`relative rounded-2xl bg-[#0f1319] border ${alertColors.borderColor} shadow-2xl w-full max-w-md`}>
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          <div className={`w-10 h-10 rounded-full ${alertColors.iconBg} flex items-center justify-center`}>
            <span className="text-xl">{alertColors.icon}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
            <p className="text-sm text-slate-400">Action irréversible</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-slate-300 leading-relaxed">{message}</p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-white/10">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 px-4 py-2 ${alertColors.confirmBg} text-white rounded-lg transition-colors`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
