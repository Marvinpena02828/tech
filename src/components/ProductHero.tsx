'use client';

import { useEffect, useState } from 'react';

export default function ProductHero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="relative w-full h-96 md:h-[500px] lg:h-[600px] overflow-hidden bg-gray-200 border-2 border-dashed border-gray-400 flex items-center justify-center">
      {/* Placeholder */}
      <div className={`relative h-full flex flex-col items-center justify-center px-6 sm:px-12 md:px-16 lg:px-24 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <div className="text-center">
          <p className={`text-4xl sm:text-5xl md:text-6xl font-bold text-gray-600 transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            Put your banner here
          </p>
          <p className={`text-lg sm:text-xl text-gray-500 mt-4 transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            Recommended size: 1400x600px or larger
          </p>
        </div>
      </div>
    </div>
  );
}
