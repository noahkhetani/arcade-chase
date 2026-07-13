import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { useAuth } from '../../lib/stores/useAuth';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onSuccess: () => void;
}

export default function LoginForm({ onSwitchToRegister, onSuccess }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!username.trim() || !password.trim()) {
      return;
    }

    const success = await login(username.trim(), password);
    if (success) {
      onSuccess();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-black/90 border-cyan-500/30">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center text-cyan-400 font-mono">
          Login to NEON RUNNER
        </CardTitle>
        <CardDescription className="text-center text-gray-400">
          Enter your credentials to continue playing
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
              placeholder="Enter your username"
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
              placeholder="Enter your password"
              className="bg-black/50 border-cyan-500/30 text-white placeholder:text-gray-500"
              disabled={isLoading}
              required
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            type="submit" 
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-semibold"
            disabled={isLoading || !username.trim() || !password.trim()}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
          
          <div className="text-center space-y-2">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-cyan-400 hover:text-cyan-300 underline"
                disabled={isLoading}
              >
                Register here
              </button>
            </p>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}