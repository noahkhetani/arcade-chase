import React, { useState } from 'react';
import { Dialog, DialogContent } from '../ui/dialog';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);

  const handleSuccess = () => {
    onClose();
  };

  const handleSwitchMode = () => {
    setIsLoginMode(!isLoginMode);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-transparent border-0 shadow-none p-0">
        <div className="relative">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-lg blur-xl"></div>
          
          {/* Content */}
          <div className="relative">
            {isLoginMode ? (
              <LoginForm 
                onSwitchToRegister={handleSwitchMode}
                onSuccess={handleSuccess}
              />
            ) : (
              <RegisterForm 
                onSwitchToLogin={handleSwitchMode}
                onSuccess={handleSuccess}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}