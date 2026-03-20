import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserPlus, Mail, Lock, User, AlertCircle, GraduationCap, Users } from 'lucide-react';
import type { UserRole } from '../types';

export function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState<UserRole>('teacher');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await register(email, password, fullName, role);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Đăng ký thất bại');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '9s' }} />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '11s' }} />
            
            <div className="w-full max-w-md relative z-10 my-8">
                {/* Logo */}
                <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-soft-lg transform -rotate-3 hover:rotate-0 transition-transform">
                        <span className="text-4xl drop-shadow-md">📐</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Smart-MathAI</h1>
                    <p className="text-slate-500 mt-2 font-medium">Tạo tài khoản mới</p>
                </div>

                {/* Register Form */}
                <div className="glass-panel rounded-3xl p-8 shadow-soft-lg hover:shadow-2xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 animate-in zoom-in duration-300">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm font-medium">{error}</span>
                            </div>
                        )}

                        {/* Role Selection */}
                        <div className="space-y-3">
                            <label className="block text-sm font-semibold text-slate-700 ml-1">
                                Bạn là:
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setRole('teacher')}
                                    className={`btn-bounce p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${role === 'teacher'
                                            ? 'border-indigo-500 bg-indigo-50 shadow-soft'
                                            : 'border-slate-200 bg-white/50 hover:border-indigo-300 hover:bg-white'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${role === 'teacher' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                                        <GraduationCap className="w-6 h-6" />
                                    </div>
                                    <span className={`font-bold ${role === 'teacher' ? 'text-indigo-700' : 'text-slate-600'}`}>
                                        Giáo viên
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('parent')}
                                    className={`btn-bounce p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${role === 'parent'
                                            ? 'border-emerald-500 bg-emerald-50 shadow-soft'
                                            : 'border-slate-200 bg-white/50 hover:border-emerald-300 hover:bg-white'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${role === 'parent' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <span className={`font-bold ${role === 'parent' ? 'text-emerald-700' : 'text-slate-600'}`}>
                                        Phụ huynh
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2 mt-2">
                            <label className="block text-sm font-semibold text-slate-700 ml-1">
                                Họ và tên
                            </label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-white/60 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                                    placeholder="Nguyễn Văn A"
                                    required
                                />
                            </div>
                        </div>

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
                                    placeholder="Tối thiểu 6 ký tự"
                                    minLength={6}
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
                                    <UserPlus className="w-5 h-5" />
                                    Đăng ký
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 font-medium">
                            Đã có tài khoản?{' '}
                            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors">
                                Đăng nhập
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
