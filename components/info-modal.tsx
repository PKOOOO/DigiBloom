'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Info, X } from 'lucide-react';

export function InfoModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  return (
    <>
      {/* Info Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 w-10 h-10 sm:w-12 sm:h-12 bg-white/80 rounded-full shadow-lg flex items-center justify-center hover:bg-white/90 transition-all"
        aria-label="App Information"
      >
        <Info className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-50 animate-modal-fade-in"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
            <div
              className="bg-blue-50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto px-4 sm:px-8 py-6 sm:py-12 pointer-events-auto animate-modal-slide-from-bottom-right relative"
              style={{
                transformOrigin: 'bottom right',
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              {/* Content */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-center">
                {/* Flower Image */}
                <div className="flex-shrink-0 overflow-hidden">
                  <Image
                    src="/special_flower.png"
                    alt="Special Flower"
                    width={400}
                    height={400}
                    className="w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] object-contain scale-110"
                    style={{ outline: 'none', border: 'none' }}
                    unoptimized
                  />
                </div>

                {/* Description */}
                <div className="flex-1 space-y-3 sm:space-y-4">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">DigiBloom</h2>

                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    Welcome to DigiBloom, a digital sanctuary of peace and positivity! Our goal is to spread happiness and kindness throughout the world.
                  </p>

                  <div className="space-y-2">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">How to Use:</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm sm:text-base text-gray-700">
                      <li>Click anywhere on the garden to plant a flower</li>
                      <li>Choose a flower type and write a positive message</li>
                      <li>Click on any flower to read its message</li>
                      <li>Share flowers with friends via the share buttons</li>
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs sm:text-sm text-gray-600">
                      Built for the Web Dev Challenge by{' '}
                      <a
                        href="https://www.youtube.com/@codetv-dev"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline font-medium"
                      >
                        Code TV
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
