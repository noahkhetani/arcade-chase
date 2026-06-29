import React, { useState, useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
  show: boolean;
}

export default function SplashScreen({ onComplete, show }: SplashScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    "Loading Game Engine...",
    "Initializing Audio...", 
    "Setting Up Controls...",
    "Ready to Play!"
  ];

  useEffect(() => {
    if (!show) return;

    let stepIndex = 0;
    const stepDuration = 800;

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (steps.length * 10));
        return Math.min(newProgress, 100);
      });
    }, stepDuration / 10);

    const stepInterval = setInterval(() => {
      if (stepIndex < steps.length - 1) {
        stepIndex++;
        setCurrentStep(stepIndex);
      } else {
        clearInterval(stepInterval);
        clearInterval(progressInterval);
        setTimeout(() => {
          onComplete();
        }, stepDuration);
      }
    }, stepDuration);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 bg-[#0A0A1A] z-50 flex items-center justify-center"
      style={{
        opacity: show ? 1 : 0,
        transition: 'opacity 0.3s ease'
      }}
    >
      <div className="text-center z-10 px-8">
        <div className="mb-8">
          <h1 
            className="text-3xl md:text-4xl font-bold mb-2"
            style={{
              color: '#00FF88',
              textShadow: '0 0 20px #00FF88, 0 0 40px #00FF88',
              fontFamily: 'Orbitron, monospace'
            }}
          >
            NEON RUNNER
          </h1>
          <p className="text-[#666] text-sm">by NK</p>
        </div>

        <div className="space-y-4 w-64 mx-auto">
          <div className="bg-[#12122A] rounded-full h-2 overflow-hidden border border-[#00FF88]/20">
            <div 
              className="bg-[#00FF88] h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%`, boxShadow: '0 0 10px #00FF88' }}
            />
          </div>

          <div className="text-center">
            <p className="text-[#00FF88] text-lg font-medium" style={{ textShadow: '0 0 10px #00FF88' }}>
              {steps[currentStep]}
            </p>
            <div className="flex justify-center space-x-2 mt-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{
                    backgroundColor: '#7000FF',
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '0.8s',
                    boxShadow: '0 0 6px #7000FF'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}