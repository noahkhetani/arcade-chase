import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { useAuth } from '../../lib/stores/useAuth';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onSuccess: () => void;
}

export default function RegisterForm({ onSwitchToLogin, onSuccess }: RegisterFormProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, isLoading, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      return;
    }

    if (password !== confirmPassword) {
      return;
    }

    if (password.length < 6) {
      return;
    }

    const success = await register(username.trim(), email.trim(), password);
    if (success) {
      onSuccess();
    }
  };

  const isValid = username.trim().length >= 3 && 
                  email.trim().includes('@') && 
                  password.length >= 6 && 
                  password === confirmPassword;

  return (
    <Card className="w-full max-w-md mx-auto bg-black/90 border-cyan-500/30">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center text-cyan-400 font-mono">
          Join NEON RUNNER
        </CardTitle>
        <CardDescription className="text-center text-gray-400">
          Create your account to save high scores
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert className="border-red-500/50 bg-red-500/10">
              <AlertDescription className="text-red-400">
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="username" className="text-cyan-400">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username (3+ characters)"
              className="bg-black/50 border-cyan-500/30 text-white placeholder:text-gray-500"
              disabled={isLoading}
              required
              minLength={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-cyan-400">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="bg-black/50 border-cyan-500/30 text-white placeholder:text-gray-500"
              disabled={isLoading}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-cyan-400">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password (6+ characters)"
              className="bg-black/50 border-cyan-500/30 text-white placeholder:text-gray-500"
              disabled={isLoading}
              required
              minLength={6}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-cyan-400">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="bg-black/50 border-cyan-500/30 text-white placeholder:text-gray-500"
              disabled={isLoading}
              required
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-red-400 text-sm">Passwords do not match</p>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            type="submit" 
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-semibold"
            disabled={isLoading || !isValid}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
          
          <div className="text-center space-y-2">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-cyan-400 hover:text-cyan-300 underline"
                disabled={isLoading}
              >
                Login here
              </button>
            </p>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}