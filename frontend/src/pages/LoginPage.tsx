import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

export function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Đăng nhập thất bại');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s' }} />
            
            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-soft-lg transform rotate-3 hover:rotate-6 transition-transform">
                        <span className="text-4xl drop-shadow-md">📐</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Smart-MathAI</h1>
                    <p className="text-slate-500 mt-2 font-medium">Nền tảng Giáo dục Thế hệ mới</p>
                </div>

                {/* Login Form */}
                <div className="glass-panel rounded-3xl p-8 shadow-soft-lg hover:shadow-2xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 animate-in fade-in zoom-in duration-300">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm font-medium">{error}</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700 ml-1">
                                Email
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-white/60 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                                    placeholder="email@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700 ml-1">
                                Mật khẩu
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-white/60 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-bounce w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl shadow-soft hover:shadow-soft-lg flex items-center justify-center gap-2 disabled:opacity-50 mt-8"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    Đăng nhập
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 font-medium">
                            Chưa có tài khoản?{' '}
                            <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors">
                                Đăng ký ngay
                            </Link>
                        </p>
                    </div>

                    {/* Demo accounts */}
                    <div className="mt-8 p-5 bg-indigo-50/60 rounded-2xl border border-indigo-100/50 backdrop-blur-sm">
                        <p className="text-xs font-bold text-indigo-900 mb-3 uppercase tracking-wider opacity-80">Tài khoản demo:</p>
                        <div className="text-sm font-medium text-indigo-700 space-y-2">
                            <p className="flex items-center gap-3 bg-white/40 p-2 rounded-xl"><span className="text-xl">👨‍🏫</span> <span className="tabular-nums">teacher@demo.com / 123456</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
