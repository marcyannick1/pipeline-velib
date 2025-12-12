import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bike, MapPin, TrendingUp, Zap } from 'lucide-react';

const HomePage = () => {
    const [stats, setStats] = useState({
        activeStations: 86,
        availableBikes: 1400,
        electricBikes: 597,
        todayTrips: 82746,
        occupation: 54
    });

    // Animation du compteur de trajets
    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prev => ({
                ...prev,
                todayTrips: prev.todayTrips + Math.floor(Math.random() * 3)
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 mesh-background">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Column - Text Content */}
                        <div className="space-y-8 animate-fade-in">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                                <Zap className="w-4 h-4" />
                                Dashboard Big Data en temps réel
                            </div>

                            {/* Main Heading */}
                            <div className="space-y-4">
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight">
                                    Explorez le réseau{' '}
                                    <span className="gradient-text">Vélib'</span>
                                    {' '}de Paris
                                </h1>
                                <p className="text-lg text-muted-foreground max-w-xl">
                                    Visualisez en temps réel la disponibilité des vélos, analysez les tendances d'utilisation et découvrez les statistiques du réseau de vélos en libre-service parisien.
                                </p>
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    to="/stations"
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
                                >
                                    <MapPin className="w-5 h-5" />
                                    Explorer les stations
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                                <Link
                                    to="/stats"
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors"
                                >
                                    <TrendingUp className="w-5 h-5" />
                                    Voir les statistiques
                                </Link>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-3 gap-6 pt-8">
                                <div className="space-y-1">
                                    <div className="text-3xl font-bold text-foreground">{stats.activeStations}</div>
                                    <div className="text-sm text-muted-foreground">Stations actives</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-3xl font-bold text-success">{stats.availableBikes.toLocaleString()}</div>
                                    <div className="text-sm text-muted-foreground">Vélos disponibles</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-3xl font-bold text-warning">{stats.electricBikes}</div>
                                    <div className="text-sm text-muted-foreground">Vélos électriques</div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Image with Overlay Stats */}
                        <div className="relative animate-float">
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                {/* Paris Image */}
                                <img
                                    src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80"
                                    alt="Paris Trocadéro avec Tour Eiffel"
                                    className="w-full h-[400px] lg:h-[500px] object-cover"
                                />

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />

                                {/* Vélib Rouge en bas à droite */}
                                <div className="absolute bottom-0 right-0 w-48 h-32 animate-pulse-slow">
                                    <svg viewBox="0 0 200 120" className="w-full h-full">
                                        {/* Vélo simplifié rouge Vélib' */}
                                        <g transform="translate(20, 20)">
                                            {/* Roue arrière */}
                                            <circle cx="30" cy="70" r="20" fill="none" stroke="#ef4444" strokeWidth="3"/>
                                            <circle cx="30" cy="70" r="3" fill="#ef4444"/>

                                            {/* Roue avant */}
                                            <circle cx="130" cy="70" r="20" fill="none" stroke="#ef4444" strokeWidth="3"/>
                                            <circle cx="130" cy="70" r="3" fill="#ef4444"/>

                                            {/* Cadre */}
                                            <path d="M 30 70 L 80 30 L 130 70" fill="none" stroke="#dc2626" strokeWidth="4" strokeLinecap="round"/>
                                            <path d="M 30 70 L 80 30 L 80 70 Z" fill="none" stroke="#dc2626" strokeWidth="4" strokeLinecap="round"/>

                                            {/* Guidon */}
                                            <path d="M 130 70 L 140 50" stroke="#dc2626" strokeWidth="3" strokeLinecap="round"/>
                                            <path d="M 135 50 L 145 50" stroke="#dc2626" strokeWidth="3" strokeLinecap="round"/>

                                            {/* Selle */}
                                            <ellipse cx="65" cy="25" rx="15" ry="5" fill="#dc2626"/>
                                        </g>
                                    </svg>
                                </div>
                            </div>

                            {/* Floating Stats Card */}
                            <div className="absolute top-8 right-8 glass-card rounded-xl p-4 shadow-lg animate-pulse-slow">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-foreground">
                                            {stats.occupation}%
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            occupation
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Trips Today Card */}
                            <div className="absolute bottom-8 left-8 glass-card rounded-xl p-4 shadow-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                                        <Bike className="w-5 h-5 text-success" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-foreground">
                                            {stats.todayTrips.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Trajets aujourd'hui
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Vue d'ensemble Section */}
            <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-display font-bold mb-2">Vue d'ensemble</h2>
                        <p className="text-muted-foreground">Statistiques globales du réseau Vélib'</p>
                    </div>
                    <Link
                        to="/stats"
                        className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                        Voir tout
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Placeholder pour d'autres contenus */}
                <div className="text-center py-12 text-muted-foreground">
                    <p>Graphiques et statistiques détaillées à venir...</p>
                </div>
            </section>

            {/* Carte Interactive Section */}
            <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-display font-bold mb-2">Carte interactive</h2>
                        <p className="text-muted-foreground">Localisez les stations et leur disponibilité</p>
                    </div>
                    <Link
                        to="/stations"
                        className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                        Liste complète
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Map Placeholder */}
                <div className="map-container h-96 bg-muted flex items-center justify-center">
                    <p className="text-muted-foreground">Carte Leaflet à intégrer ici</p>
                </div>
            </section>
        </div>
    );
};

export default HomePage;