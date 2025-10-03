// src/auth/AuthBar.jsx
import React, { useState } from "react";
import { signInWithGoogle, signOut } from "../lib/firebase";
import { colors } from "../theme/colors";

export default function AuthBar({ user, userName, onShowUsernameModal }) {
  const [showMenu, setShowMenu] = useState(false);

  // Fermer le menu quand on clique à l'extérieur
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu && !event.target.closest('.relative')) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showMenu]);

  return (
    <div className="flex items-center gap-3">
      {user ? (
        <>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-3 hover:bg-slate-700/50 rounded-lg p-2 transition-colors"
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="h-8 w-8 rounded-full" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-white/10" />
              )}
              <div className="text-sm text-left">
                <div className="font-medium leading-none text-white">
                  {userName || user.displayName || user.email}
                </div>
                <div className="text-xs text-slate-400 leading-none">{user.email}</div>
              </div>
              <svg 
                className={`w-4 h-4 text-slate-400 transition-transform ${showMenu ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Menu déroulant */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
                <div className="p-3 border-b border-slate-700">
                  <div className="text-sm font-medium text-white">Mon profil</div>
                  <div className="text-xs text-slate-400">{user.email}</div>
                </div>
                
                <div className="p-2">
                  <button
                    onClick={() => {
                      onShowUsernameModal();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Changer mon nom d'utilisateur
                  </button>
                  
                  <button
                    onClick={() => {
                      signOut();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Se déconnecter
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <button
          onClick={() => signInWithGoogle()}
          className={`px-3 py-2 rounded-xl bg-[#20242a] text-slate-300 border ${colors.border} hover:border-emerald-500 text-sm`}
        >
          Se connecter avec Google
        </button>
      )}
    </div>
  );
}
