import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, RefreshCw, LogOut, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LogoWordmark } from '../components/Logo';

export default function VerifyEmailPage() {
  const { user, logout, resendVerification, reloadUser } = useAuth();
  const navigate = useNavigate();
  const [resent, setResent] = useState(false);
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');

  const handleResend = async () => {
    setError('');
    setResending(true);
    try {
      await resendVerification();
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } catch {
      setError('Could not send email. Please wait a moment and try again.');
    } finally {
      setResending(false);
    }
  };

  const handleCheckVerified = async () => {
    setError('');
    setChecking(true);
    try {
      await reloadUser();
      navigate('/dashboard');
    } catch {
      setError('Not verified yet. Please click the link in your email first.');
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-emerald-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <LogoWordmark />
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-5">
            <Mail className="w-8 h-8 text-brand-600" />
          </div>

          <h1 className="text-xl font-bold text-slate-900 mb-2">Verify your email</h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-1">We sent a verification link to</p>
          <p className="font-semibold text-slate-800 text-sm mb-2">{user?.email}</p>
          <p className="text-slate-400 text-xs mb-6">
            Click the link in your email, then press the button below.
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-xl mb-4">{error}</div>
          )}
          {resent && (
            <div className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 text-sm px-4 py-2.5 rounded-xl mb-4">
              <CheckCircle className="w-4 h-4" /> Verification email sent!
            </div>
          )}

          <button
            type="button"
            onClick={handleCheckVerified}
            disabled={checking}
            className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors mb-3"
          >
            {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {checking ? 'Checking...' : "I've verified my email"}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending || resent}
            className="w-full flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-600 font-medium py-2.5 rounded-xl transition-colors text-sm mb-5"
          >
            {resending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {resent ? 'Email sent!' : 'Resend verification email'}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors mx-auto"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out and use a different account
          </button>
        </div>
      </div>
    </div>
  );
}
