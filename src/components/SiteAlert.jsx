import React from 'react';
import { colors } from '../theme/colors';

export default function SiteAlert({ isOpen, onClose, title, message, type = 'info', onConfirm }) {
  if (!isOpen) return null;

  const getAlertStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-500/20',
          border: 'border-emerald-500/30',
          icon: '✅',
          iconBg: 'bg-emerald-500',
          button: 'bg-emerald-600 hover:bg-emerald-500'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-500/30',
          icon: '⚠️',
          iconBg: 'bg-yellow-500',
          button: 'bg-yellow-600 hover:bg-yellow-500'
        };
      case 'error':
        return {
          bg: 'bg-red-500/20',
          border: 'border-red-500/30',
          icon: '❌',
          iconBg: 'bg-red-500',
          button: 'bg-red-600 hover:bg-red-500'
        };
      default:
        return {
          bg: 'bg-blue-500/20',
          border: 'border-blue-500/30',
          icon: 'ℹ️',
          iconBg: 'bg-blue-500',
          button: 'bg-blue-600 hover:bg-blue-500'
        };
    }
  };

  const styles = getAlertStyles();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${colors.panel} rounded-xl max-w-md w-full shadow-2xl border ${colors.border} animate-scale-in`}>
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 ${styles.iconBg} rounded-full flex items-center justify-center text-white text-xl flex-shrink-0`}>
              {styles.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-white mb-2">
                {title}
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                {message}
              </p>
              <div className="flex justify-end gap-2">
                {onConfirm && (
                  <button
                    onClick={onConfirm}
                    className={`px-4 py-2 ${styles.button} text-white text-sm font-medium rounded-lg transition-all duration-200`}
                  >
                    Confirmer
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium rounded-lg transition-all duration-200"
                >
                  {onConfirm ? 'Annuler' : 'Compris'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
