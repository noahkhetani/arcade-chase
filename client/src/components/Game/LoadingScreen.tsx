import React from "react";
import { useGame, TransitionType } from "../../lib/stores/useGame";

interface LoadingScreenProps {
  transitionType: TransitionType;
}

export default function LoadingScreen({ transitionType }: LoadingScreenProps) {
  const getTransitionClass = () => {
    switch (transitionType) {
      case "fadeIn":
        return "loading-fade";
      case "slideDown":
        return "loading-slide";
      case "scale":
        return "loading-scale";
      case "spin":
        return "loading-spin";
      default:
        return "loading-fade";
    }
  };

  return (
    <div className={`loading-screen ${getTransitionClass()}`}>
      <div className="loading-content">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        
        <h2 className="loading-title">Loading...</h2>
        
        <div className="loading-bar">
          <div className="loading-progress"></div>
        </div>
        
        <div className="loading-particles">
          {Array.from({ length: 12 }).map((_, i) => (
            <div 
              key={i} 
              className="particle" 
              style={{ 
                animationDelay: `${i * 0.1}s`,
                left: `${(i * 8) + 10}%`
              }} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}