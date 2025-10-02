import React, { useState, useEffect } from 'react';
import { colors } from '../theme/colors';
import craftusLogo from '../assets/craftus.png';
import craftus1 from '../assets/craftus1.png';
import craftus2 from '../assets/craftus2.png';
import craftus3 from '../assets/craftus3.png';

const AuthRequired = ({ onSignIn }) => {
  const [currentImage, setCurrentImage] = useState(0);
  
  const images = [
    {
      src: craftus1,
      title: "Recherchez vos items",
      description: "Trouvez facilement les objets que vous souhaitez fabriquer",
      gradient: "from-blue-500/20 to-purple-500/20",
      emoji: "🔍"
    },
    {
      src: craftus2,
      title: "Renseignez les prix",
      description: "Saisissez vos prix d'achat et de vente pour chaque ingrédient",
      gradient: "from-green-500/20 to-emerald-500/20",
      emoji: "💰"
    },
    {
      src: craftus3,
      title: "Comparez et analysez",
      description: "Visualisez la rentabilité et comparez vos options",
      gradient: "from-orange-500/20 to-red-500/20",
      emoji: "📊"
    }
  ];

  // Auto-rotation des images avec réinitialisation du timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [currentImage]); // Dépendance sur currentImage pour réinitialiser le timer

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className={`${colors.bg} text-slate-100 min-h-screen flex items-center justify-center p-4`}>
      <div className="relative z-10 max-w-6xl w-full">
        {/* Logo principal */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center">
            <img
              src={craftusLogo}
              alt="Craftus"
              className="h-32 sm:h-40 md:h-48 lg:h-56 xl:h-64 2xl:h-72 w-auto"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div className="h-32 sm:h-40 md:h-48 lg:h-56 xl:h-64 2xl:h-72 text-white text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl 2xl:text-[10rem] flex items-center justify-center font-bold" style={{ display: 'none' }}>
              C
            </div>
          </div>
        </div>

        {/* Carousel hexagonal moderne */}
        <div className="mb-8">
          <div className="relative h-96 flex items-center justify-center">
            {/* Images du carousel */}
            {images.map((image, index) => {
              const isCenter = index === currentImage;
              const isLeft = index === (currentImage - 1 + images.length) % images.length;
              const isRight = index === (currentImage + 1) % images.length;
              
              let position = '';
              let scale = '';
              let blur = '';
              let opacity = '';
              let zIndex = '';
              
              if (isCenter) {
                position = 'translate-x-0';
                scale = 'scale-110';
                blur = 'blur-0';
                opacity = 'opacity-100';
                zIndex = 'z-30';
              } else if (isLeft) {
                position = '-translate-x-32 md:-translate-x-40';
                scale = 'scale-75';
                blur = 'blur-sm';
                opacity = 'opacity-60';
                zIndex = 'z-20';
              } else if (isRight) {
                position = 'translate-x-32 md:translate-x-40';
                scale = 'scale-75';
                blur = 'blur-sm';
                opacity = 'opacity-60';
                zIndex = 'z-20';
              } else {
                position = 'translate-x-0';
                scale = 'scale-50';
                blur = 'blur-md';
                opacity = 'opacity-30';
                zIndex = 'z-10';
              }
              
              return (
                <div
                  key={index}
                  className={`absolute transition-all duration-700 ease-in-out ${position} ${scale} ${blur} ${opacity} ${zIndex}`}
                >
                  <div className="relative group">
                    <div className="w-80 h-80 md:w-96 md:h-96 rounded-3xl overflow-hidden bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 shadow-2xl">
                      <img
                        src={image.src}
                        alt={image.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className={`w-full h-full bg-gradient-to-br ${image.gradient} flex items-center justify-center text-6xl`} style={{ display: 'none' }}>
                        {image.emoji}
                      </div>
                    </div>
                    
                    {/* Overlay avec texte */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent rounded-3xl"></div>
                    <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="text-xl font-bold text-white mb-2">{image.title}</h3>
                      <p className="text-sm text-slate-200">{image.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Boutons de navigation */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 bg-slate-800/80 backdrop-blur-sm rounded-full border border-slate-700/50 flex items-center justify-center hover:bg-slate-700/80 transition-colors"
            >
              <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 bg-slate-800/80 backdrop-blur-sm rounded-full border border-slate-700/50 flex items-center justify-center hover:bg-slate-700/80 transition-colors"
            >
              <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            {/* Indicateurs de pagination */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 flex space-x-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentImage 
                      ? 'bg-white scale-125' 
                      : 'bg-slate-500/50 hover:bg-slate-400/70'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Card principale */}
        <div className="max-w-md mx-auto bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-700/50">
          {/* Icône de sécurité */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-full mb-4">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Authentification requise</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Connectez-vous avec Google pour accéder pleinement à Craftus
            </p>
          </div>

          {/* Bouton Google */}
          <button
            onClick={onSignIn}
            className="w-full bg-white hover:bg-gray-50 text-gray-900 font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Se connecter avec Google</span>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-slate-500">
          <p>En vous connectant, vous acceptez nos conditions d'utilisation</p>
        </div>
      </div>
    </div>
  );
};

export default AuthRequired;
