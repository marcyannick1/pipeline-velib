import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { 
    Bike, 
    Map, 
    BarChart3, 
    Table2, 
    Moon, 
    Sun, 
    Menu, 
    X,
    Activity
} from 'lucide-react';

export const NavBar = () => {
    const location = useLocation();
    const [isDark, setIsDark] = useState(() => {
        // Initialize from localStorage synchronously
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'dark';
        }
        return false;
    });
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        // Apply initial theme class
        if (isDark) {
            document.documentElement.classList.add('dark');
        }
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleTheme = useCallback(() => {
        setIsDark(prev => {
            const newValue = !prev;
            if (newValue) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }
            return newValue;
        });
    }, []);

    const navLinks = [
        { path: '/', label: 'Accueil', icon: Map },
        { path: '/stations', label: 'Stations', icon: Table2 },
        { path: '/stats', label: 'Statistiques', icon: BarChart3 },
    ];

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <header 
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled 
                    ? 'bg-background/80 backdrop-blur-lg border-b border-border shadow-sm' 
                    : 'bg-transparent'
            }`}
        >
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 lg:h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-glow group-hover:shadow-lg transition-shadow duration-300">
                                <Bike className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-success animate-pulse" />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-lg font-display font-bold text-foreground">
                                Vélib&apos; <span className="text-primary">Data</span>
                            </h1>
                            <p className="text-xs text-muted-foreground -mt-0.5">Big Data Dashboard</p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const active = isActive(link.path);
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`nav-link flex items-center gap-2 rounded-lg ${
                                        active ? 'active bg-primary/10' : 'hover:bg-muted'
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 ${active ? 'text-primary' : ''}`} />
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right side actions */}
                    <div className="flex items-center gap-2">
                        {/* Live indicator */}
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
                            <Activity className="w-3.5 h-3.5 text-success animate-pulse" />
                            <span className="text-xs font-medium text-success">Live</span>
                        </div>

                        {/* Theme toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleTheme}
                            className="rounded-full"
                        >
                            <AnimatePresence mode="wait">
                                {isDark ? (
                                    <motion.div
                                        key="sun"
                                        initial={{ rotate: -90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: 90, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Sun className="w-5 h-5" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="moon"
                                        initial={{ rotate: 90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: -90, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Moon className="w-5 h-5" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Button>

                        {/* Mobile menu button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden rounded-full"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="md:hidden border-t border-border"
                        >
                            <div className="py-4 space-y-1">
                                {navLinks.map((link) => {
                                    const Icon = link.icon;
                                    const active = isActive(link.path);
                                    return (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                                active 
                                                    ? 'bg-primary/10 text-primary' 
                                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                            }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span className="font-medium">{link.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </header>
    );
};
