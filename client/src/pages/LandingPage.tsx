import { Link } from 'react-router-dom';
import { Brain, MapPin, Users, ArrowRight, CheckCircle, Camera, Trophy, Zap, Shield, Star } from 'lucide-react';
import { LogoWordmark } from '../components/Logo';

const FEATURES = [
  { icon: Camera,      title: 'Photo Reports',        description: 'Snap a photo and report in under 30 seconds.', color: 'bg-orange-50 text-orange-600' },
  { icon: Brain,       title: 'Smart AI',              description: 'Auto-categorizes issues and sets priority instantly.', color: 'bg-violet-50 text-violet-600' },
  { icon: MapPin,      title: 'Live Map',              description: 'Pin exact locations. Authorities find issues fast.', color: 'bg-blue-50 text-blue-600' },
  { icon: Users,       title: 'Community Verify',      description: 'Neighbors confirm issues to build trust.', color: 'bg-emerald-50 text-emerald-600' },
  { icon: CheckCircle, title: 'Real-Time Tracking',    description: 'Track every issue from reported to resolved.', color: 'bg-brand-50 text-brand-600' },
  { icon: Trophy,      title: 'Earn Rewards',          description: 'Points and badges for active community heroes.', color: 'bg-yellow-50 text-yellow-600' },
];

const STATS = [
  { value: '< 30s',   label: 'to report an issue' },
  { value: 'AI',      label: 'auto-categorization' },
  { value: 'Live',    label: 'map updates' },
  { value: '3',       label: 'verifications to confirm' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <LogoWordmark />
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-xl transition-colors shadow-md shadow-brand-600/20">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-violet-50/30" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-brand-100 text-brand-700 rounded-full text-xs font-bold mb-6 animate-fade-in">
              <Zap className="w-3.5 h-3.5" />
              AI-Powered Civic Tech
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-5 animate-fade-up">
              Your neighborhood.<br />
              <span className="gradient-text">Your hero.</span>
            </h1>

            <p className="text-lg text-slate-600 mb-8 leading-relaxed animate-fade-up stagger-2">
              Report potholes, water leaks, broken streetlights and more. Community Hero uses AI to fix local problems <strong>faster</strong>.
            </p>

            <div className="flex flex-wrap gap-3 animate-fade-up stagger-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-3 rounded-2xl transition-colors shadow-lg shadow-brand-600/25"
              >
                Start Reporting Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-brand-300 text-slate-700 font-semibold px-6 py-3 rounded-2xl transition-colors"
              >
                Sign In
              </Link>
            </div>

            <div className="flex items-center gap-2 mt-6 animate-fade-up stagger-4">
              <div className="flex -space-x-2">
                {['A','B','C','D'].map((l) => (
                  <div key={l} className="w-7 h-7 rounded-full bg-brand-600 border-2 border-white flex items-center justify-center text-white text-xs font-bold">{l}</div>
                ))}
              </div>
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-700">Community heroes</span> already making a difference
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-brand-600 to-emerald-500 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-white text-center">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl sm:text-3xl font-extrabold">{value}</p>
                <p className="text-brand-100 text-sm mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <span className="inline-block bg-brand-50 text-brand-700 text-xs font-bold px-3 py-1 rounded-full mb-3">How it works</span>
          <h2 className="text-3xl font-extrabold text-slate-900">Three steps to a better community</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { n: '1', icon: Camera,      title: 'Snap & Report',     desc: 'Take a photo, describe the issue. AI fills the rest.' },
            { n: '2', icon: Users,       title: 'Community Verifies', desc: 'Neighbors confirm the issue is real. 3 verifications needed.' },
            { n: '3', icon: CheckCircle, title: 'Gets Resolved',     desc: 'Authorities act. You track it live until resolved.' },
          ].map(({ n, icon: Icon, title, desc }) => (
            <div key={n} className="relative bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-lg transition-shadow">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-brand-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md">
                {n}
              </div>
              <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-brand-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-violet-50 text-violet-700 text-xs font-bold px-3 py-1 rounded-full mb-3">Features</span>
            <h2 className="text-3xl font-extrabold text-slate-900">Everything your community needs</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, description, color }) => (
              <div key={title} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-600 to-emerald-500 rounded-3xl p-10 sm:p-16 text-center text-white shadow-2xl shadow-brand-600/25">
          <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute -bottom-10 -right-10 w-56 h-56 rounded-full bg-white/5" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-3 py-1 text-sm font-medium mb-5">
              <Star className="w-4 h-4 text-yellow-300" />
              Join your community today
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Ready to be a hero?</h2>
            <p className="text-brand-100 mb-8 max-w-md mx-auto">Report issues, earn points, and help make your neighborhood a better place to live.</p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-white text-brand-700 font-extrabold px-8 py-3.5 rounded-2xl hover:bg-brand-50 transition-colors shadow-xl"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <LogoWordmark />
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Shield className="w-3.5 h-3.5" />
            Community Hero — Hyperlocal Problem Solver
          </div>
        </div>
      </footer>
    </div>
  );
}
