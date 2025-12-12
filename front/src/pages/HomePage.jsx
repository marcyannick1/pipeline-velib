import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StationMap } from '../components/StationMap';
import { StatsCards } from '../components/StatsCards';
import { HourlyUsageChart, TopStationsChart } from '../components/Charts';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
    fetchRealtimeStations, 
    fetchGlobalStats, 
    fetchHourlyStats,
    fetchTop10Stations 
} from '../api/velib';
import { 
    ArrowRight, 
    Bike, 
    Sparkles, 
    TrendingUp,
    MapPin,
    BarChart3,
    Zap
} from 'lucide-react';

const HomePage = () => {
    const [stations, setStations] = useState([]);
    const [stats, setStats] = useState({});
    const [hourlyData, setHourlyData] = useState([]);
    const [topStations, setTopStations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const normalizeStats = (raw = {}, fallbackStationCount = 0) => {
            const activeStations = Number(raw.active_stations ?? raw.activeStations ?? fallbackStationCount ?? 0);
            const totalStations = Number(
                raw.total_stations ??
                raw.totalStations ??
                fallbackStationCount ??
                activeStations ??
                0
            );
            const totalBikes = Number(raw.total_bikes ?? raw.totalBikes ?? 0);
            const totalDocks = Number(raw.total_docks ?? raw.totalDocks ?? 0);
            const electricBikes = Number(raw.total_ebike ?? raw.electricBikes ?? 0);
            const mechanicalBikes = Number(
                raw.total_mechanical ?? raw.mechanicalBikes ?? (totalBikes - electricBikes) ?? 0
            );
            const tripsToday = Number(raw.tripsToday ?? 0);
            const avgTripDuration = Number(raw.avgTripDuration ?? 0);
            const emptyStations = Number(raw.emptyStations ?? 0);
            const fullStations = Number(raw.fullStations ?? 0);
            const occupancyRate = totalBikes + totalDocks > 0
                ? Math.round((totalBikes / (totalBikes + totalDocks)) * 100)
                : 0;

            return {
                totalStations,
                totalBikes,
                totalDocks,
                electricBikes,
                mechanicalBikes,
                tripsToday,
                avgTripDuration,
                emptyStations,
                fullStations,
                activeStations,
                occupancyRate,
            };
        };

        const normalizeTopStations = (rows = [], type = 'saturated') => {
            const items = rows.slice(0, 8).map((s) => {
                const name = s.name || s.station_name || s.station || 'Station';
                const availableBikes = s.availableBikes ?? s.num_bikes_available ?? s.mechanical ?? 0;
                const availableDocks = s.availableDocks ?? s.num_docks_available ?? (s.capacity ? Math.max(s.capacity - availableBikes, 0) : 0);
                const occupancyRaw =
                    s.occupation_rate ??
                    s.occupancy ??
                    (availableBikes + availableDocks > 0
                        ? (availableBikes / (availableBikes + availableDocks)) * 100
                        : 0);
                return {
                    name: name.length > 40 ? `${name.slice(0, 37)}...` : name,
                    occupancy: occupancyRaw,
                    fullName: name,
                };
            });

            return items.sort((a, b) => {
                return type === 'unused' ? a.occupancy - b.occupancy : b.occupancy - a.occupancy;
            });
        };

        const loadData = async () => {
            try {
                const [stationsData, statsData, hourlyStats, top10] = await Promise.all([
                    fetchRealtimeStations(),
                    fetchGlobalStats(),
                    fetchHourlyStats(),
                    fetchTop10Stations('saturated')
                ]);
                setStations(stationsData);
                setStats(normalizeStats(statsData, stationsData?.length || 0));
                setHourlyData(hourlyStats);
                setTopStations(normalizeTopStations(top10, 'saturated'));
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
                {/* Background decorations */}
                <div className="absolute inset-0 mesh-background" />
                <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
                
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Hero content */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                                Dashboard Big Data en temps réel
                            </Badge>
                            
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight mb-6">
                                Explorez le réseau{' '}
                                <span className="gradient-text">Vélib'</span>{' '}
                                de Paris
                            </h1>
                            
                            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-lg">
                                Visualisez en temps réel la disponibilité des vélos, analysez les tendances 
                                d'utilisation et découvrez les statistiques du réseau de vélos en libre-service parisien.
                            </p>
                            
                            <div className="flex flex-wrap gap-4">
                                <Link to="/stations">
                                    <Button size="lg" className="shadow-lg shadow-primary/25">
                                        <MapPin className="w-4 h-4 mr-2" />
                                        Explorer les stations
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                                <Link to="/stats">
                                    <Button size="lg" variant="outline">
                                        <BarChart3 className="w-4 h-4 mr-2" />
                                        Voir les statistiques
                                    </Button>
                                </Link>
                            </div>

                            {/* Quick stats */}
                            <div className="flex flex-wrap gap-6 mt-10 pt-8 border-t border-border">
                                <div>
                                    <p className="text-3xl font-display font-bold text-foreground">
                                        {loading ? '...' : (stats.activeStations || (stats.totalStations - (stats.fullStations || 0)) || 0).toLocaleString()}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Stations actives</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-display font-bold text-success">
                                        {loading ? '...' : stats.totalBikes?.toLocaleString()}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Vélos disponibles</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-display font-bold text-warning">
                                        {loading ? '...' : stats.electricBikes?.toLocaleString()}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Vélos électriques</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Hero image/illustration */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="relative hidden lg:block"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-3xl blur-2xl" />
                                <img 
                                    src="https://images.unsplash.com/photo-1566764577204-a112fa006ea3?w=800&q=80" 
                                    alt="Vélib Paris"
                                    className="relative rounded-3xl shadow-2xl object-cover w-full h-[400px]"
                                />
                                {/* Floating card */}
                                <Card className="absolute -bottom-6 -left-6 glass-card">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-success/10">
                                                <TrendingUp className="w-5 h-5 text-success" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-foreground">
                                                    {loading ? '...' : `${stats.tripsToday?.toLocaleString()}`}
                                                </p>
                                                <p className="text-xs text-muted-foreground">Trajets aujourd'hui</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                {/* Another floating card */}
                                <Card className="absolute -top-4 -right-4 glass-card">
                                    <CardContent className="p-3">
                                        <div className="flex items-center gap-2">
                                            <Zap className="w-4 h-4 text-warning" />
                                            <span className="text-sm font-medium text-foreground">
                                                {stats.occupancyRate}% occupation
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 bg-muted/30">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-display font-bold text-foreground">Vue d'ensemble</h2>
                                <p className="text-muted-foreground">Statistiques globales du réseau Vélib'</p>
                            </div>
                            <Link to="/stats">
                                <Button variant="ghost" size="sm">
                                    Voir tout
                                    <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                            </Link>
                        </div>
                        <StatsCards stats={stats} loading={loading} variant="compact" />
                    </motion.div>
                </div>
            </section>

            {/* Map Section */}
            <section className="py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-display font-bold text-foreground">Carte interactive</h2>
                                <p className="text-muted-foreground">Localisez les stations et leur disponibilité</p>
                            </div>
                            <Link to="/stations">
                                <Button variant="ghost" size="sm">
                                    Liste complète
                                    <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                            </Link>
                        </div>
                        <StationMap stations={stations} loading={loading} height="500px" />
                    </motion.div>
                </div>
            </section>

            {/* Charts Section */}
            <section className="py-12 bg-muted/30">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-display font-bold text-foreground">Analyse des données</h2>
                            <p className="text-muted-foreground">Tendances et insights du réseau</p>
                        </div>
                    </div>
                    <div className="grid lg:grid-cols-2 gap-6">
                        <HourlyUsageChart data={hourlyData} loading={loading} />
                        <TopStationsChart data={topStations} type="saturated" loading={loading} />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <Card className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10" />
                        <CardContent className="relative p-8 lg:p-12">
                            <div className="grid lg:grid-cols-2 gap-8 items-center">
                                <div>
                                    <h3 className="text-2xl lg:text-3xl font-display font-bold text-foreground mb-4">
                                        Découvrez toutes les statistiques
                                    </h3>
                                    <p className="text-muted-foreground mb-6">
                                        Accédez à des analyses détaillées, des graphiques interactifs 
                                        et des données historiques sur le réseau Vélib'.
                                    </p>
                                    <div className="flex flex-wrap gap-4">
                                        <Link to="/stats">
                                            <Button size="lg">
                                                <BarChart3 className="w-4 h-4 mr-2" />
                                                Statistiques avancées
                                            </Button>
                                        </Link>
                                        <Link to="/stations">
                                            <Button size="lg" variant="outline">
                                                <Bike className="w-4 h-4 mr-2" />
                                                Toutes les stations
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                                <div className="hidden lg:flex justify-end">
                                    <img 
                                        src="https://images.unsplash.com/photo-1631365588346-5283e420b1fc?w=400&q=80" 
                                        alt="Vélo Paris"
                                        className="rounded-2xl shadow-lg w-80 h-48 object-cover"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
