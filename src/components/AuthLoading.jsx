import React from 'react';

const AuthLoading = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10 text-center">
        {/* Logo animé */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl mb-6 shadow-lg animate-pulse">
          <img 
            src="/src/assets/craftus.png" 
            alt="Craftus" 
            className="w-10 h-10 rounded-lg"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <div className="w-10 h-10 text-white text-xl flex items-center justify-center font-bold" style={{ display: 'none' }}>
            C
          </div>
        </div>

        {/* Spinner de chargement */}
        <div className="mb-6">
          <div className="inline-block w-8 h-8 border-2 border-slate-600 border-t-emerald-400 rounded-full animate-spin"></div>
        </div>

        {/* Texte de chargement */}
        <h2 className="text-xl font-semibold text-white mb-2">Connexion en cours...</h2>
        <p className="text-slate-400 text-sm">
          Vérification de votre authentification
        </p>

        {/* Points de chargement animés */}
        <div className="flex justify-center gap-1 mt-4">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default AuthLoading;
