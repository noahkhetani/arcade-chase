import React from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useGame } from "../../lib/stores/useGame";

export default function TouchControls() {
  const { phase, joystickMode, toggleJoystickMode } = useGame();
  const [joystickPosition, setJoystickPosition] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [joystickSize, setJoystickSize] = React.useState(96);
  const [joystickOpacity, setJoystickOpacity] = React.useState(0.8);
  const [currentMovement, setCurrentMovement] = React.useState({ direction: '', intensity: 0 });
  const joystickRef = React.useRef<HTMLDivElement>(null);
  const lastMovementRef = React.useRef({ left: false, right: false, up: false, down: false });

  // Adaptive joystick sizing based on screen size
  React.useEffect(() => {
    const updateJoystickSize = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const minDimension = Math.min(screenWidth, screenHeight);
      
      // Scale joystick size based on screen size
      if (minDimension < 480) {
        setJoystickSize(80); // Small phones
      } else if (minDimension < 768) {
        setJoystickSize(96); // Regular phones
      } else if (minDimension < 1024) {
        setJoystickSize(112); // Tablets
      } else {
        setJoystickSize(128); // Large screens
      }
    };

    updateJoystickSize();
    window.addEventListener('resize', updateJoystickSize);
    return () => window.removeEventListener('resize', updateJoystickSize);
  }, []);

  // Enhanced haptic feedback function with game-specific patterns
  const triggerHapticFeedback = (intensity: 'light' | 'medium' | 'heavy' | 'collect' | 'hit' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: 25,
        medium: 50,
        heavy: 100,
        collect: [50, 30, 50], // Double tap pattern for collectibles
        hit: [100, 50, 100, 50, 100] // Strong pattern for obstacles
      };
      navigator.vibrate(patterns[intensity]);
    }
  };

  const handleTouch = (direction: string, pressed: boolean) => {
    // Create and dispatch keyboard events to simulate key presses
    const keyMap = {
      'up': 'ArrowUp',
      'down': 'ArrowDown',
      'left': 'ArrowLeft', 
      'right': 'ArrowRight'
    };
    
    const eventType = pressed ? 'keydown' : 'keyup';
    const event = new KeyboardEvent(eventType, {
      key: keyMap[direction as keyof typeof keyMap],
      code: keyMap[direction as keyof typeof keyMap],
      bubbles: true,
      cancelable: true
    });
    
    // Dispatch to window to ensure the GameCanvas keyboard handlers catch it
    window.dispatchEvent(event);
  };

  const handleJoystickMove = (event: React.TouchEvent | React.MouseEvent) => {
    if (!joystickMode || !joystickRef.current || !isDragging) return;

    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    let clientX, clientY;
    if ('touches' in event) {
      if (event.touches.length === 0) return;
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = (joystickSize / 2) - 16; // Dynamic max distance based on joystick size

    let x = deltaX;
    let y = deltaY;

    // Constrain to circle
    if (distance > maxDistance) {
      x = (deltaX / distance) * maxDistance;
      y = (deltaY / distance) * maxDistance;
    }

    setJoystickPosition({ x, y });

    // Calculate angle and intensity for precise analog movement
    const angle = Math.atan2(y, x);
    const intensity = Math.min(distance / maxDistance, 1);
    const threshold = 0.2; // 20% deadzone

    // Determine movement direction and intensity - support diagonal movement
    const newMovement = { left: false, right: false, up: false, down: false };
    
    if (intensity > threshold) {
      // Calculate individual axis intensities
      const xIntensity = Math.abs(x) / maxDistance;
      const yIntensity = Math.abs(y) / maxDistance;
      
      // Enable diagonal movement by checking both axes independently with improved sensitivity
      if (xIntensity > threshold) {
        if (x > 0) {
          newMovement.right = true;
        } else {
          newMovement.left = true;
        }
      }
      
      if (yIntensity > threshold) {
        if (y > 0) {
          newMovement.down = true;
        } else {
          newMovement.up = true;
        }
      }
      
      // Set direction display for primary movement
      let primaryDirection = '';
      if (Math.abs(x) > Math.abs(y)) {
        primaryDirection = x > 0 ? 'right' : 'left';
      } else {
        primaryDirection = y > 0 ? 'down' : 'up';
      }
      
      // Show diagonal if both axes are strong enough
      if (xIntensity > threshold && yIntensity > threshold) {
        if (x > 0 && y < 0) primaryDirection = '↗';
        else if (x > 0 && y > 0) primaryDirection = '↘';
        else if (x < 0 && y < 0) primaryDirection = '↖';
        else if (x < 0 && y > 0) primaryDirection = '↙';
      }
      
      setCurrentMovement({ direction: primaryDirection, intensity });

      // Enhanced haptic feedback with more responsive thresholds
      if (intensity > 0.7) {
        triggerHapticFeedback('heavy');
      } else if (intensity > 0.4) {
        triggerHapticFeedback('medium');
      } else if (intensity > threshold) {
        triggerHapticFeedback('light');
      }
    } else {
      setCurrentMovement({ direction: '', intensity: 0 });
    }

    // Update keyboard events only when movement changes
    Object.keys(newMovement).forEach(direction => {
      const isPressed = newMovement[direction as keyof typeof newMovement];
      const wasPressed = lastMovementRef.current[direction as keyof typeof lastMovementRef.current];
      
      if (isPressed !== wasPressed) {
        handleTouch(direction, isPressed);
        lastMovementRef.current[direction as keyof typeof lastMovementRef.current] = isPressed;
      }
    });
  };

  const handleJoystickStart = (event: React.TouchEvent | React.MouseEvent) => {
    event.preventDefault();
    setIsDragging(true);
    triggerHapticFeedback('medium');
    
    // Reduce opacity when actively being used
    setJoystickOpacity(0.9);
  };

  const handleJoystickEnd = () => {
    setIsDragging(false);
    setJoystickPosition({ x: 0, y: 0 });
    setCurrentMovement({ direction: '', intensity: 0 });
    triggerHapticFeedback('light');
    
    // Restore opacity
    setJoystickOpacity(0.8);
    
    // Stop all movement when joystick is released
    Object.keys(lastMovementRef.current).forEach(direction => {
      if (lastMovementRef.current[direction as keyof typeof lastMovementRef.current]) {
        handleTouch(direction, false);
        lastMovementRef.current[direction as keyof typeof lastMovementRef.current] = false;
      }
    });
  };

  // Joystick mode overlay
  if (joystickMode) {
    const knobSize = Math.max(joystickSize * 0.3, 24);
    const baseOpacity = joystickOpacity;
    
    return (
      <div className="fixed bottom-8 left-8 z-50">
        {/* Joystick base */}
        <div 
          ref={joystickRef}
          className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-2 border-cyan-400/60 rounded-full flex items-center justify-center transition-all duration-200 shadow-2xl"
          onTouchStart={handleJoystickStart}
          onTouchMove={handleJoystickMove}
          onTouchEnd={handleJoystickEnd}
          onMouseDown={handleJoystickStart}
          onMouseMove={isDragging ? handleJoystickMove : undefined}
          onMouseUp={handleJoystickEnd}
          onMouseLeave={handleJoystickEnd}
          style={{ 
            width: joystickSize,
            height: joystickSize,
            touchAction: 'none',
            opacity: baseOpacity,
            boxShadow: isDragging 
              ? '0 0 30px rgba(34, 211, 238, 0.6), inset 0 0 20px rgba(34, 211, 238, 0.1)' 
              : '0 0 20px rgba(34, 211, 238, 0.3), inset 0 0 15px rgba(34, 211, 238, 0.05)'
          }}
        >
          {/* Outer ring indicator */}
          <div 
            className="absolute border border-cyan-300/30 rounded-full"
            style={{
              width: joystickSize * 0.8,
              height: joystickSize * 0.8,
            }}
          />
          
          {/* Inner deadzone indicator */}
          <div 
            className="absolute border border-gray-500/40 rounded-full"
            style={{
              width: joystickSize * 0.4,
              height: joystickSize * 0.4,
            }}
          />

          {/* Joystick knob */}
          <div 
            className="absolute rounded-full shadow-xl transition-all duration-100 ease-out border-2"
            style={{
              width: knobSize,
              height: knobSize,
              transform: `translate(${joystickPosition.x}px, ${joystickPosition.y}px)`,
              background: isDragging 
                ? 'radial-gradient(circle at 30% 30%, #38bdf8, #0891b2, #0e7490)' 
                : 'radial-gradient(circle at 30% 30%, #22d3ee, #06b6d4, #0891b2)',
              borderColor: isDragging ? '#0891b2' : '#22d3ee',
              boxShadow: isDragging 
                ? '0 0 20px rgba(34, 211, 238, 0.8), inset 0 2px 8px rgba(255, 255, 255, 0.3)' 
                : '0 0 15px rgba(34, 211, 238, 0.5), inset 0 2px 6px rgba(255, 255, 255, 0.2)',
              scale: isDragging ? '1.1' : '1.0'
            }}
          />
          
          {/* Center reference dot */}
          <div 
            className="absolute bg-cyan-200/60 rounded-full"
            style={{
              width: joystickSize * 0.04,
              height: joystickSize * 0.04,
            }}
          />

          {/* Enhanced direction indicators with better visibility */}
          {currentMovement.direction && (
            <div 
              className="absolute text-cyan-300 font-bold pointer-events-none drop-shadow-lg"
              style={{
                fontSize: joystickSize * 0.14,
                opacity: Math.max(0.6, currentMovement.intensity),
                textShadow: '0 0 8px rgba(6, 182, 212, 0.8)',
                transform: currentMovement.intensity > 0.5 
                  ? `scale(${1 + currentMovement.intensity * 0.2})` 
                  : 'scale(1)',
              }}
            >
              {currentMovement.direction === 'up' && '↑'}
              {currentMovement.direction === 'down' && '↓'}
              {currentMovement.direction === 'left' && '←'}
              {currentMovement.direction === 'right' && '→'}
              {/* Diagonal indicators */}
              {currentMovement.direction === '↗' && '↗'}
              {currentMovement.direction === '↘' && '↘'}
              {currentMovement.direction === '↖' && '↖'}
              {currentMovement.direction === '↙' && '↙'}
            </div>
          )}
        </div>

        {/* Joystick controls panel */}
        <div className="absolute -top-16 left-0 bg-black/80 rounded-lg p-2 text-xs text-white min-w-32">
          <div className="flex justify-between items-center mb-1">
            <span>Opacity:</span>
            <input
              type="range"
              min="0.3"
              max="1"
              step="0.1"
              value={joystickOpacity}
              onChange={(e) => setJoystickOpacity(parseFloat(e.target.value))}
              className="w-16 ml-2"
            />
          </div>
          <button
            onClick={toggleJoystickMode}
            className="w-full px-2 py-1 bg-purple-500/80 text-white rounded text-xs font-bold"
          >
            Exit Joystick
          </button>
        </div>

        {/* Movement intensity indicator */}
        {currentMovement.intensity > 0 && (
          <div 
            className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-cyan-400/80 text-black text-xs px-2 py-1 rounded"
            style={{ opacity: currentMovement.intensity }}
          >
            {Math.round(currentMovement.intensity * 100)}%
          </div>
        )}
      </div>
    );
  }

  // Only show when game is playing
  if (phase !== "playing") return null;

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50 touch-controls">
      {/* Up Arrow */}
      <div className="flex justify-center">
        <button
          className="bg-cyan-600 bg-opacity-90 hover:bg-cyan-500 active:bg-cyan-400 text-white p-4 rounded-full shadow-xl touch-none select-none transition-colors"
          onTouchStart={(e) => {
            e.preventDefault();
            handleTouch('up', true);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            handleTouch('up', false);
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            handleTouch('up', true);
          }}
          onMouseUp={(e) => {
            e.preventDefault();
            handleTouch('up', false);
          }}
          onMouseLeave={(e) => {
            e.preventDefault();
            handleTouch('up', false);
          }}
          style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
        >
          <ChevronUp size={28} />
        </button>
      </div>
      
      {/* Left, Down, Right Arrows */}
      <div className="flex gap-2 justify-center">
        <button
          className="bg-cyan-600 bg-opacity-90 hover:bg-cyan-500 active:bg-cyan-400 text-white p-4 rounded-full shadow-xl touch-none select-none transition-colors"
          onTouchStart={(e) => {
            e.preventDefault();
            handleTouch('left', true);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            handleTouch('left', false);
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            handleTouch('left', true);
          }}
          onMouseUp={(e) => {
            e.preventDefault();
            handleTouch('left', false);
          }}
          onMouseLeave={(e) => {
            e.preventDefault();
            handleTouch('left', false);
          }}
          style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
        >
          <ChevronLeft size={28} />
        </button>
        
        <button
          className="bg-cyan-600 bg-opacity-90 hover:bg-cyan-500 active:bg-cyan-400 text-white p-4 rounded-full shadow-xl touch-none select-none transition-colors"
          onTouchStart={(e) => {
            e.preventDefault();
            handleTouch('down', true);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            handleTouch('down', false);
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            handleTouch('down', true);
          }}
          onMouseUp={(e) => {
            e.preventDefault();
            handleTouch('down', false);
          }}
          onMouseLeave={(e) => {
            e.preventDefault();
            handleTouch('down', false);
          }}
          style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
        >
          <ChevronDown size={28} />
        </button>
        
        <button
          className="bg-cyan-600 bg-opacity-90 hover:bg-cyan-500 active:bg-cyan-400 text-white p-4 rounded-full shadow-xl touch-none select-none transition-colors"
          onTouchStart={(e) => {
            e.preventDefault();
            handleTouch('right', true);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            handleTouch('right', false);
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            handleTouch('right', true);
          }}
          onMouseUp={(e) => {
            e.preventDefault();
            handleTouch('right', false);
          }}
          onMouseLeave={(e) => {
            e.preventDefault();
            handleTouch('right', false);
          }}
          style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
        >
          <ChevronRight size={28} />
        </button>
      </div>

      {/* Joystick mode toggle button - moved to right side */}
      <div className="fixed bottom-20 right-4 z-50">
        <button
          onClick={toggleJoystickMode}
          className="px-3 py-1 bg-purple-500/80 text-white rounded text-sm font-bold shadow-lg"
        >
          Joystick
        </button>
      </div>
    </div>
  );
}
