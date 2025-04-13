
import React, { useState } from 'react';
import { ArrowRight, Mail, User, Lock, Info } from 'lucide-react';
import { toast } from 'sonner';
import NeonButton from '@/components/NeonButton';
import NeonInput from '@/components/NeonInput';
import { SignUpResult } from '@/types/auth';

interface RegisterFormProps {
  onToggleMode: () => void;
  onRegister: (email: string, password: string, username: string) => Promise<SignUpResult>;
  isLoading: boolean;
  onHowToUse: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ 
  onToggleMode, 
  onRegister, 
  isLoading,
  onHowToUse 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !username) {
      toast.error('Please fill all fields');
      return;
    }
    
    await onRegister(email, password, username);
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
          <User size={32} className="text-matrix-primary" />
        </div>
      </div>
      
      <h2 className="text-xl font-bold text-center text-matrix-primary mb-6">
        Create Account
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
            <User size={16} className="mr-2" />
            Username
          </label>
          <NeonInput
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Choose a username"
            icon={<User size={18} />}
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
          {isLoading ? 'Processing...' : 'Register'}
          {!isLoading && <ArrowRight size={16} className="ml-2" />}
        </NeonButton>
      </form>
      
      <div className="text-center">
        <button 
          className="text-matrix-primary/70 hover:text-matrix-primary text-sm"
          onClick={onToggleMode}
          type="button"
        >
          Already have an account? Login
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

export default RegisterForm;
