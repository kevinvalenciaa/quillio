import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, User, Chrome, ArrowRight, AlertCircle, Check } from 'lucide-react';

export default function SignUp() {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signUp(email, password, fullName);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen w-full bg-[#0F1729] text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <Check className="h-8 w-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-serif mb-4">Check your email</h1>
          <p className="text-gray-400 mb-8">
            We've sent a confirmation link to <span className="text-white font-medium">{email}</span>. 
            Click the link to verify your account.
          </p>
          <Button onClick={() => navigate('/login')} variant="outline" className="border-white/10">
            Back to login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0F1729] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#0F1729] to-[#1a243a] -z-10" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[#C17A72]/10 blur-[120px] rounded-full -z-10" />

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <img src="/white-quillio.png" alt="Quillio" className="h-10 w-auto" />
          <span className="text-2xl font-serif font-semibold">Quillio</span>
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
          <h1 className="text-2xl font-serif text-center mb-2">Create your account</h1>
          <p className="text-gray-400 text-center text-sm mb-8">Start your founder accountability journey</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}

          {/* Google Sign In */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            className="w-full h-12 bg-white/5 border-white/10 text-white hover:bg-white/10 mb-6 gap-3"
          >
            <Chrome className="h-5 w-5" />
            Continue with Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0F1729] px-4 text-gray-500">or</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-bold text-gray-500">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Marcus Chen"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10 h-12 bg-black/20 border-white/10 focus-visible:ring-accent"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-bold text-gray-500">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-black/20 border-white/10 focus-visible:ring-accent"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-bold text-gray-500">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 bg-black/20 border-white/10 focus-visible:ring-accent"
                  minLength={8}
                  required
                />
              </div>
              <p className="text-xs text-gray-500">Minimum 8 characters</p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-accent hover:bg-accent/90 text-white mt-6 gap-2"
            >
              {loading ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  Create account <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-6">
            By signing up, you agree to our{' '}
            <a href="#" className="text-accent hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-accent hover:underline">Privacy Policy</a>
          </p>
        </div>

        {/* Sign In Link */}
        <p className="text-center mt-8 text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:text-accent/80 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

