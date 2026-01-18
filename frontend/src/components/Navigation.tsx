import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut, GraduationCap, LayoutDashboard, Menu, X, BookOpen, FileText } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface NavLink {
    label: string;
    href: string;
    icon: React.ElementType;
    disabled?: boolean;
}

export function Navigation() {
    const { user, logout, isAuthenticated } = useAuth();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    if (!isAuthenticated || !user) return null;

    const isTeacher = user.role === 'teacher';

    const teacherLinks: NavLink[] = [
        { label: 'Trang chủ', href: '/', icon: LayoutDashboard },
        { label: 'Lớp học', href: '/classes', icon: GraduationCap },
        { label: 'Export PDF', href: '/export', icon: FileText, disabled: true }, // Placeholder
    ];

    const parentLinks: NavLink[] = [
        { label: 'Trang chủ', href: '/parent', icon: LayoutDashboard },
        { label: 'Góc học tập', href: '/parent/student', icon: BookOpen },
    ];

    const links = isTeacher ? teacherLinks : parentLinks;

    // Helper to extract initials
    const initials = user.full_name
        ? user.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
        : 'U';

    const isActive = (path: string) => {
        if (path === '/' || path === '/parent') {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to={isTeacher ? '/' : '/parent'} className="flex items-center gap-2">
                                <div className="bg-gradient-to-br from-blue-500 to-teal-400 p-1.5 rounded-lg">
                                    <GraduationCap className="h-6 w-6 text-white" />
                                </div>
                                <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500 hidden sm:block">
                                    Smart-MathAI
                                </span>
                            </Link>
                        </div>
                        <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
                            {links.map((link) => (
                                <Link
                                    key={link.href}
                                    to={link.disabled ? '#' : link.href}
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${isActive(link.href)
                                        ? 'border-blue-500 text-gray-900'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        } ${link.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    onClick={(e) => link.disabled && e.preventDefault()}
                                >
                                    <link.icon className="w-4 h-4 mr-2" />
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="hidden sm:ml-6 sm:flex sm:items-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                    <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                                        <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user.full_name}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user.email}
                                        </p>
                                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 mt-1 w-fit">
                                            {isTeacher ? 'Giáo viên' : 'Phụ huynh'}
                                        </span>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Đăng xuất</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="-mr-2 flex items-center sm:hidden">
                        <Button
                            variant="ghost"
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMobileMenuOpen ? (
                                <X className="block h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Menu className="block h-6 w-6" aria-hidden="true" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {isMobileMenuOpen && (
                <div className="sm:hidden bg-white border-b border-gray-200">
                    <div className="pt-2 pb-3 space-y-1 px-4">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                to={link.disabled ? '#' : link.href}
                                className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${isActive(link.href)
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                    } ${link.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={(e) => {
                                    if (link.disabled) e.preventDefault();
                                    else setIsMobileMenuOpen(false);
                                }}
                            >
                                <link.icon className="w-5 h-5 mr-3" />
                                {link.label}
                            </Link>
                        ))}
                    </div>
                    <div className="pt-4 pb-4 border-t border-gray-200 px-4">
                        <div className="flex items-center mb-3">
                            <div className="flex-shrink-0">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="ml-3">
                                <div className="text-base font-medium text-gray-800">{user.full_name}</div>
                                <div className="text-sm font-medium text-gray-500">{user.email}</div>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                            onClick={logout}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Đăng xuất
                        </Button>
                    </div>
                </div>
            )}
        </nav>
    );
}
