import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from '@tanstack/react-router';
import { 
  UserPlus, User, Lock, Mail, Eye, EyeOff, Check, X, 
  Github, Chrome, Sparkles, ArrowRight, Loader2,
  Shield, AlertCircle, Calendar as CalendarIcon, Briefcase,
  Target, Star, Book, Hash, FileText, Clock, Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { createFileRoute } from '@tanstack/react-router';

// Mock register function
const mockRegister = async (userData: {
  name: string;
  email: string;
  password: string;
  plan: 'free' | 'pro' | 'team';
  acceptTerms: boolean;
  notifications: boolean;
}) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  if (!userData.name || !userData.email || !userData.password) {
    throw new Error('All fields are required');
  }
  
  if (userData.password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }
  
  if (!userData.acceptTerms) {
    throw new Error('You must accept the terms and conditions');
  }
  
  // Simulate successful registration
  localStorage.setItem('auth_token', `registered_${Date.now()}`);
  localStorage.setItem('user', JSON.stringify({
    id: `user-${Date.now()}`,
    name: userData.name,
    email: userData.email,
    plan: userData.plan,
    isDemo: false,
    createdAt: new Date().toISOString(),
  }));
  
  return {
    success: true,
    message: 'Account created successfully!',
    user: {
      id: `user-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      plan: userData.plan,
    }
  };
};

const mockGoogleRegister = async () => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  localStorage.setItem('auth_token', 'google_token');
  localStorage.setItem('user', JSON.stringify({
    id: 'google-user-123',
    name: 'Google User',
    email: 'user@gmail.com',
    plan: 'free',
    isDemo: false,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Google',
  }));
};

const mockGithubRegister = async () => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  localStorage.setItem('auth_token', 'github_token');
  localStorage.setItem('user', JSON.stringify({
    id: 'github-user-123',
    name: 'GitHub User',
    email: 'user@github.com',
    plan: 'free',
    isDemo: false,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GitHub',
  }));
};

// RegistrationForm Component
interface RegistrationFormProps {
  onRegister: (userData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    plan: 'free' | 'pro' | 'team';
    acceptTerms: boolean;
    notifications: boolean;
  }) => Promise<void>;
  onGoogleRegister?: () => Promise<void>;
  onGithubRegister?: () => Promise<void>;
  onLogin?: () => void;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

function RegistrationForm({
  onRegister,
  onGoogleRegister,
  onGithubRegister,
  onLogin,
  isLoading = false,
  error = null,
  className,
}: RegistrationFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    plan: 'free' as 'free' | 'pro' | 'team',
    acceptTerms: false,
    notifications: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<'Weak' | 'Good' | 'Strong' | null>(null);

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    if (formData.password) {
      if (formData.password.length < 8) {
        setPasswordStrength('Weak');
      } else if (formData.password.length >= 8 && /[A-Z]/.test(formData.password) && /[0-9]/.test(formData.password) && /[^A-Za-z0-9]/.test(formData.password)) {
        setPasswordStrength('Strong');
      } else {
        setPasswordStrength('Good');
      }
    } else {
      setPasswordStrength(null);
    }
  }, [formData.password]);

  const validateForm = () => {
    setLocalError(null);
    
    if (!formData.name.trim()) {
      setLocalError('Full name is required');
      return false;
    }
    
    if (!formData.email.trim()) {
      setLocalError('Email address is required');
      return false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setLocalError('Please enter a valid email address');
      return false;
    }
    
    if (!formData.password) {
      setLocalError('Password is required');
      return false;
    }
    
    if (formData.password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match');
      return false;
    }
    
    if (!formData.acceptTerms) {
      setLocalError('You must accept the terms and conditions');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await onRegister(formData);
      setSuccessMessage('Account created successfully! Redirecting...');
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  const handleGoogleRegister = async () => {
    if (onGoogleRegister) {
      try {
        await onGoogleRegister();
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : 'Google registration failed');
      }
    }
  };

  const handleGithubRegister = async () => {
    if (onGithubRegister) {
      try {
        await onGithubRegister();
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : 'GitHub registration failed');
      }
    }
  };

  const getPasswordStrengthColor = (strength: string | null) => {
    if (!strength) return 'bg-muted';
    switch (strength) {
      case 'Weak': return 'bg-destructive';
      case 'Good': return 'bg-warning';
      case 'Strong': return 'bg-green-500';
      default: return 'bg-muted';
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'free': return <Star className="w-5 h-5" />;
      case 'pro': return <Award className="w-5 h-5" />;
      case 'team': return <Target className="w-5 h-5" />;
      default: return <Star className="w-5 h-5" />;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'border-primary/30';
      case 'pro': return 'border-warning/50';
      case 'team': return 'border-purple-500/50';
      default: return 'border-primary/30';
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: ['Up to 100 tasks', 'Basic features', '1 project', 'Email support'],
      description: 'Perfect for personal use',
      popular: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$9',
      period: 'per month',
      features: ['Unlimited tasks', 'Advanced features', '10 projects', 'Priority support', 'Custom themes'],
      description: 'For power users & small teams',
      popular: true,
    },
    {
      id: 'team',
      name: 'Team',
      price: '$24',
      period: 'per month',
      features: ['Everything in Pro', 'Unlimited projects', 'Team collaboration', 'Advanced analytics', 'Dedicated support'],
      description: 'For teams & organizations',
      popular: false,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('w-full max-w-4xl mx-auto', className)}
    >
      <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-primary/90 to-primary p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Join TaskFlow Today
                </h2>
                <p className="text-white/80 text-sm">
                  Create your account and boost your productivity
                </p>
              </div>
            </div>
            <Badge 
              variant="secondary" 
              className="bg-white/20 backdrop-blur-sm text-white border-0"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Start Free
            </Badge>
          </div>
        </div>

        <div className="p-6">
          {/* Social Registration Buttons */}
          <div className="space-y-3 mb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleRegister}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors disabled:opacity-50"
            >
              <Chrome className="w-5 h-5" />
              <span className="font-medium">
                Sign up with Google
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGithubRegister}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors disabled:opacity-50"
            >
              <Github className="w-5 h-5" />
              <span className="font-medium">
                Sign up with GitHub
              </span>
            </motion.button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or sign up with email
              </span>
            </div>
          </div>

          {/* Error & Success Messages */}
          <AnimatePresence>
            {(error || localError) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-destructive">{error || localError}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20"
              >
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-green-600">{successMessage}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Full Name *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => updateFormData({ name: e.target.value })}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => updateFormData({ email: e.target.value })}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Security
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password *
                    </Label>
                    {passwordStrength && (
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-muted-foreground">
                          {passwordStrength}
                        </div>
                        <div className="flex gap-1">
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className={cn(
                                'w-2 h-2 rounded-full transition-all',
                                passwordStrength === 'Weak' && i === 1
                                  ? getPasswordStrengthColor(passwordStrength)
                                  : passwordStrength === 'Good' && i <= 2
                                  ? getPasswordStrengthColor(passwordStrength)
                                  : passwordStrength === 'Strong' && i <= 3
                                  ? getPasswordStrengthColor(passwordStrength)
                                  : 'bg-muted'
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => updateFormData({ password: e.target.value })}
                      className="pl-10 pr-10"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Minimum 8 characters with letters, numbers, and symbols
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm Password *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => updateFormData({ confirmPassword: e.target.value })}
                      className="pl-10 pr-10"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {formData.confirmPassword && (
                    <div className="flex items-center gap-2 text-xs">
                      {formData.password === formData.confirmPassword ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Passwords match
                        </span>
                      ) : (
                        <span className="text-destructive flex items-center gap-1">
                          <X className="w-3 h-3" /> Passwords don't match
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Plan Selection */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg flex items-center gap-2">
                <Award className="w-5 h-5" />
                Choose Your Plan
              </h3>
              
              <RadioGroup
                value={formData.plan}
                onValueChange={(value) => updateFormData({ plan: value as 'free' | 'pro' | 'team' })}
                className="grid md:grid-cols-3 gap-4"
              >
                {plans.map((plan) => (
                  <div key={plan.id} className="relative">
                    <RadioGroupItem
                      value={plan.id}
                      id={`plan-${plan.id}`}
                      className="sr-only"
                    />
                    <Label
                      htmlFor={`plan-${plan.id}`}
                      className={cn(
                        "flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all",
                        "hover:border-primary/50 hover:bg-muted/50",
                        formData.plan === plan.id 
                          ? `${getPlanColor(plan.id)} bg-primary/5` 
                          : "border-border",
                        plan.popular && "ring-2 ring-warning/30"
                      )}
                    >
                      {plan.popular && (
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-warning text-warning-foreground text-xs">
                            Most Popular
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getPlanIcon(plan.id)}
                          <span className="font-semibold">{plan.name}</span>
                        </div>
                        {formData.plan === plan.id && (
                          <Check className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold">{plan.price}</span>
                          <span className="text-sm text-muted-foreground">/{plan.period}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                      </div>
                      
                      <ul className="space-y-2 text-sm">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-primary" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Preferences */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Preferences
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Switch
                    id="notifications"
                    checked={formData.notifications}
                    onCheckedChange={(checked) => updateFormData({ notifications: checked })}
                    disabled={isLoading}
                  />
                  <div>
                    <Label htmlFor="notifications" className="font-medium">
                      Email notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates about your tasks and projects
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Switch
                    id="terms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) => updateFormData({ acceptTerms: checked })}
                    disabled={isLoading}
                  />
                  <div>
                    <Label htmlFor="terms" className="font-medium">
                      I agree to the Terms of Service and Privacy Policy *
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      You must accept the terms to continue
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-medium hover:from-primary/90 hover:to-primary/70 transition-all disabled:opacity-50 text-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          {/* Already have account */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?
              </p>
              <motion.button
                type="button"
                onClick={onLogin}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                disabled={isLoading}
              >
                Sign in to your account
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="mt-4 text-center">
        <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
          By creating an account, you agree to our{' '}
          <button className="underline hover:text-foreground transition-colors">
            Terms of Service
          </button>
          ,{' '}
          <button className="underline hover:text-foreground transition-colors">
            Privacy Policy
          </button>
          , and{' '}
          <button className="underline hover:text-foreground transition-colors">
            Cookie Policy
          </button>
          . Your data is secured with enterprise-grade encryption.
        </p>
      </div>
    </motion.div>
  );
}

// RegisterPage Component
function RegisterPage({
  onRegister,
  onGoogleRegister,
  onGithubRegister,
  onLogin,
  isLoading,
  error,
}: {
  onRegister: (userData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    plan: 'free' | 'pro' | 'team';
    acceptTerms: boolean;
    notifications: boolean;
  }) => Promise<void>;
  onGoogleRegister?: () => Promise<void>;
  onGithubRegister?: () => Promise<void>;
  onLogin?: () => void;
  isLoading?: boolean;
  error?: string | null;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      
      <div className="relative w-full max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Brand & Benefits */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">TF</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  TaskFlow
                </h1>
                <p className="text-muted-foreground">Join thousands of productive teams</p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">
                Start achieving more with TaskFlow
              </h2>
              
              <div className="space-y-4">
                {[
                  {
                    title: '30-Day Free Trial',
                    description: 'All Pro features, no credit card required',
                    icon: '🚀',
                    color: 'bg-primary/10 text-primary',
                  },
                  {
                    title: '24/7 Customer Support',
                    description: 'Get help whenever you need it',
                    icon: '💬',
                    color: 'bg-green-500/10 text-green-600',
                  },
                  {
                    title: '99.9% Uptime SLA',
                    description: 'Reliable service you can count on',
                    icon: '⚡',
                    color: 'bg-warning/10 text-warning',
                  },
                  {
                    title: 'Enterprise Security',
                    description: 'Bank-level encryption for your data',
                    icon: '🔒',
                    color: 'bg-purple-500/10 text-purple-600',
                  },
                ].map((benefit, index) => (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className={`w-10 h-10 rounded-lg ${benefit.color} flex items-center justify-center text-lg`}>
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="font-medium">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {benefit.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-border">
              <div className="flex items-center gap-6">
                {[
                  { label: '50K+', description: 'Active Users' },
                  { label: '4.9/5', description: 'Rating' },
                  { label: '99%', description: 'Satisfaction' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl font-bold text-primary">{stat.label}</div>
                    <div className="text-xs text-muted-foreground">{stat.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right side - Registration Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center"
          >
            <RegistrationForm
              onRegister={onRegister}
              onGoogleRegister={onGoogleRegister}
              onGithubRegister={onGithubRegister}
              onLogin={onLogin}
              isLoading={isLoading}
              error={error}
              className="w-full max-w-2xl"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Main Route Component
export const Route = createFileRoute('/register')({
  component: RegisterRouteComponent,
});

function RegisterRouteComponent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (userData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    plan: 'free' | 'pro' | 'team';
    acceptTerms: boolean;
    notifications: boolean;
  }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await mockRegister(userData);
      // Redirect to dashboard after successful registration
      setTimeout(() => {
        router.navigate({ to: '/dashboard' });
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await mockGoogleRegister();
      await router.navigate({ to: '/dashboard' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google registration failed');
      setIsLoading(false);
    }
  };

  const handleGithubRegister = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await mockGithubRegister();
      await router.navigate({ to: '/dashboard' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'GitHub registration failed');
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    router.navigate({ to: '/login' });
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      router.navigate({ to: '/dashboard' });
    }
  }, [router]);

  return (
    <RegisterPage
      onRegister={handleRegister}
      onGoogleRegister={handleGoogleRegister}
      onGithubRegister={handleGithubRegister}
      onLogin={handleLogin}
      isLoading={isLoading}
      error={error}
    />
  );
}