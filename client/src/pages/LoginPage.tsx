import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Shield, Copy, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LogoWordmark } from '../components/Logo';

const MOCK_ADMIN = { email: 'abc@gmail.com', password: 'abc@1234' };

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [copied, setCopied]     = useState<'email' | 'password' | null>(null);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(email === MOCK_ADMIN.email ? '/admin' : '/dashboard');
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch {
      setError('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillAdmin = () => {
    setEmail(MOCK_ADMIN.email);
    setPassword(MOCK_ADMIN.password);
  };

  const copyText = async (text: string, field: 'email' | 'password') => {
    await navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-emerald-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-4">
        <div className="flex justify-center mb-2">
          <Link to="/"><LogoWordmark /></Link>
        </div>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to continue helping your community</p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-400" />
              <span className="text-sm font-semibold text-slate-200">Demo Admin Account</span>
            </div>
            <button
              type="button"
              onClick={fillAdmin}
              className="text-xs bg-brand-600 hover:bg-brand-500 text-white font-semibold px-3 py-1 rounded-lg transition-colors"
            >
              Auto-fill
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-slate-800 rounded-lg px-3 py-2">
              <div>
                <p className="text-xs text-slate-400">Email</p>
                <p className="text-sm font-mono text-slate-100">{MOCK_ADMIN.email}</p>
              </div>
              <button
                type="button"
                onClick={() => copyText(MOCK_ADMIN.email, 'email')}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                {copied === 'email' ? <Check className="w-4 h-4 text-brand-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-center justify-between bg-slate-800 rounded-lg px-3 py-2">
              <div>
                <p className="text-xs text-slate-400">Password</p>
                <p className="text-sm font-mono text-slate-100">{MOCK_ADMIN.password}</p>
              </div>
              <button
                type="button"
                onClick={() => copyText(MOCK_ADMIN.password, 'password')}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                {copied === 'password' ? <Check className="w-4 h-4 text-brand-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            After login, go to <span className="text-slate-300 font-mono">/admin</span> to manage issues
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="email" type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="password" type="password" required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Your password"
                />
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-slate-400">or</span></div>
          </div>

          <button
            type="button" onClick={handleGoogle} disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-slate-200 hover:bg-slate-50 disabled:opacity-60 font-medium py-2.5 rounded-xl text-sm transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>

          <p className="text-center text-sm text-slate-500 mt-5">
            No account?{' '}
            <Link to="/register" className="text-brand-600 font-medium hover:underline">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
