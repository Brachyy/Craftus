// src/auth/AuthBar.jsx
import React from "react";
import { signInWithGoogle, signOut } from "../lib/firebase";
import { colors } from "../theme/colors";

export default function AuthBar({ user }) {
  return (
    <div className="flex items-center gap-3">
      {user ? (
        <>
          {user.photoURL ? (
            <img src={user.photoURL} alt="" className="h-8 w-8 rounded-full" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-white/10" />
          )}
          <div className="text-sm">
            <div className="font-medium leading-none">{user.displayName || user.email}</div>
            <div className="text-xs text-slate-400 leading-none">{user.email}</div>
          </div>
          <button
            onClick={() => signOut()}
            className={`px-3 py-2 rounded-xl bg-[#20242a] text-slate-300 border ${colors.border} hover:border-emerald-500 text-sm`}
          >
            Se déconnecter
          </button>
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
