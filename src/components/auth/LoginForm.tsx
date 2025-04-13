
import React, { useState } from 'react';
import { ArrowRight, Mail, Lock, Info } from 'lucide-react';
import { toast } from 'sonner';
import NeonButton from '@/components/NeonButton';
import NeonInput from '@/components/NeonInput';

interface LoginFormProps {
  onToggleMode: () => void;
  onLogin: (email: string, password: string) => Promise<boolean>;
  isLoading: boolean;
  onHowToUse: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ 
  onToggleMode, 
  onLogin, 
  isLoading,
  onHowToUse 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter your email and password');
      return;
    }
    
    await onLogin(email, password);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center mb-6">
        <div className="p-3 bg-black/50 rounded-full border-2 border-matrix-primary">
          <Mail size={32} className="text-matrix-primary" />
        </div>
      </div>
      
      <h2 className="text-xl font-bold text-center text-matrix-primary mb-6">
        Welcome Back
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-matrix-primary/80 mb-2 flex items-center">
            <Mail size={16} className="mr-2" />
            Email
          </label>
          <NeonInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your email"
            icon={<Mail size={18} />}
          />
        </div>
        
        <div>
          <label className="block text-matrix-primary/80 mb-2 flex items-center">
            <Lock size={16} className="mr-2" />
            Password
          </label>
          <NeonInput
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your password"
            icon={<Lock size={18} />}
          />
        </div>
        
        <NeonButton 
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Login'}
          {!isLoading && <ArrowRight size={16} className="ml-2" />}
        </NeonButton>
      </form>
      
      <div className="text-center">
        <button 
          className="text-matrix-primary/70 hover:text-matrix-primary text-sm"
          onClick={onToggleMode}
          type="button"
        >
          Need an account? Register
        </button>
      </div>

      <div className="mt-6">
        <NeonButton 
          onClick={onHowToUse} 
          secondary 
          className="w-full"
        >
          <Info size={16} className="mr-2" />
          How to Use This App
        </NeonButton>
      </div>
    </div>
  );
};

export default LoginForm;
