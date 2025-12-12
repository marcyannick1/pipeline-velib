import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NavBar } from './components/NavBar';
import { Toaster } from './components/ui/sonner';
import HomePage from './pages/HomePage';
import StationsPage from './pages/StationsPage';
import StationDetailPage from './pages/StationDetailPage';
import StatsPage from './pages/StatsPage';
import './index.css';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-background">
                <NavBar />
                <main>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/stations" element={<StationsPage />} />
                        <Route path="/stations/:id" element={<StationDetailPage />} />
                        <Route path="/stats" element={<StatsPage />} />
                    </Routes>
                </main>
                {/* Footer */}
                <footer className="border-t border-border bg-muted/30 py-8 mt-auto">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                                    <svg 
                                        className="w-4 h-4 text-primary-foreground" 
                                        viewBox="0 0 24 24" 
                                        fill="currentColor"
                                    >
                                        <circle cx="5" cy="18" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
                                        <circle cx="19" cy="18" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
                                        <path d="M12 18V8l-4 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M5 18h6.5" stroke="currentColor" strokeWidth="2" fill="none"/>
                                        <path d="M12 8h4l3 10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                                    </svg>
                                </div>
                                <span className="font-display font-semibold text-foreground">
                                    Vélib&apos; Data
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground text-center">
                                Dashboard Big Data &bull; Données simulées pour démonstration
                            </p>
                            <p className="text-sm text-muted-foreground">
                                &copy; 2024 Vélib&apos; Data Project
                            </p>
                        </div>
                    </div>
                </footer>
                <Toaster />
            </div>
        </Router>
    );
}

export default App;
