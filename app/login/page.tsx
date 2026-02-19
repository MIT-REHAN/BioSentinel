'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Dna, Mail, Lock, User, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Email and password are required.');
      setLoading(false);
      return;
    }

    if (mode === 'signup' && !name) {
      setError('Name is required.');
      setLoading(false);
      return;
    }

    const result = mode === 'login' ? login(email, password) : signup(email, password, name);

    if (result.success) {
      router.push('/');
    } else {
      setError(result.error || 'Something went wrong.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Nav */}
      <nav className="px-6 py-4 flex items-center gap-4 max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </Link>
      </nav>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2.5 mb-10">
            <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
              <Dna className="w-5 h-5 text-secondary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">Bio<span className="text-secondary">Sentinel</span></span>
          </div>

          {/* Card */}
          <div className="p-8 bg-card rounded-2xl border border-border">
            <h1 className="text-2xl font-bold text-center mb-2">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-sm text-muted-foreground text-center mb-8">
              {mode === 'login'
                ? 'Sign in to access your analysis dashboard'
                : 'Join BioSentinel to save your analysis history'
              }
            </p>

            {error && (
              <div className="flex items-center gap-2 p-3 mb-6 bg-chart-5/5 border border-chart-5/20 rounded-lg text-chart-5 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label htmlFor="name" className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Dr. Jane Smith"
                      className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? 'Min. 6 characters' : 'Your password'}
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
                className="text-sm text-secondary hover:underline"
              >
                {mode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
              </button>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground text-center mt-6">
            Data is stored locally in your browser. No external servers involved.
          </p>
        </div>
      </div>
    </div>
  );
}
