import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { StatsCards } from '../components/StatsCards';
import { 
    HourlyUsageChart, 
    WeeklyTripsChart, 
    TopStationsChart, 
    DistrictChart 
} from '../components/Charts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
    fetchGlobalStats, 
    fetchHourlyStats, 
    fetchWeeklyStats,
    fetchTop10Stations,
    fetchDistrictStats,
    fetchDistrictAvgBikes,
    fetchStationList
} from '../api/velib';
import { 
    BarChart3, 
    TrendingUp, 
    Activity,
    Clock,
    Map,
    Zap,
    Bike
} from 'lucide-react';

const StatsPage = () => {
    const [stats, setStats] = useState({});
    const [hourlyData, setHourlyData] = useState([]);
    const [weeklyData, setWeeklyData] = useState([]);
    const [topSaturated, setTopSaturated] = useState([]);
    const [topUnused, setTopUnused] = useState([]);
    const [districtData, setDistrictData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const normalizeStats = (raw = {}) => {
            const totalStations = Number(raw.total_stations ?? raw.totalStations ?? 0);
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
                occupancyRate,
            };
        };

        const toPercent = (value) => {
            const num = Number(value ?? 0);
            if (Number.isNaN(num)) return 0;
            // Backend peut renvoyer des ratios (0-1) ou des pourcentages (0-100)
            return num <= 1 ? Math.round(num * 100) : Math.round(num);
        };

        const normalizeHourly = (rows = []) =>
            rows.map((r) => ({
                hour: r.hour ?? r._id ?? '',
                usage: toPercent(r.avg_occupation_rate ?? r.usage ?? 0),
            }));

        const normalizeWeekly = (rows = []) =>
            rows.map((r, idx) => ({
                day: r.day ?? r.date ?? `Jour ${idx + 1}`,
                trips: toPercent(r.avg_rate ?? r.trips ?? 0),
            }));

        const normalizeTopStations = (rows = []) =>
            rows.slice(0, 8).map((s) => {
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
                    occupancy: toPercent(occupancyRaw),
                    fullName: name,
                };
            });

        const normalizeDistricts = (rateRows = [], bikesRows = [], stationRows = []) => {
            const normalizeKey = (val = '') => String(val).trim().toLowerCase();

            const bikesMap = new Map();
            bikesRows.forEach((b) => {
                const name = b.nom_arrondissement_communes || b.name || b._id || 'Arrondissement';
                const key = normalizeKey(name);
                bikesMap.set(key, {
                    name,
                    bikes: Number(b.avg_bikes ?? b.bikes ?? 0),
                });
            });

            const rateMap = new Map();
            rateRows.forEach((d) => {
                const name = d.name || d.nom_arrondissement_communes || d._id || 'Arrondissement';
                const key = normalizeKey(name);
                rateMap.set(key, {
                    name,
                    occupancy: toPercent(d.avg_occupation_rate ?? d.occupation_rate ?? d.occupancy ?? 0),
                });
            });

            const stationCountMap = new Map();
            stationRows.forEach((s) => {
                const city = s.city || s.nom_arrondissement_communes || s.name || '';
                const key = normalizeKey(city);
                if (!key) return;
                stationCountMap.set(key, (stationCountMap.get(key) || 0) + 1);
            });

            const keys = new Set([...bikesMap.keys(), ...rateMap.keys()]);

            return Array.from(keys).map((key) => {
                const bikesEntry = bikesMap.get(key) || {};
                const rateEntry = rateMap.get(key) || {};
                const stations = stationCountMap.get(key);
                const name = bikesEntry.name || rateEntry.name || 'Arrondissement';

                return {
                    name,
                    bikes: bikesEntry.bikes ?? 0,
                    stations: stations ?? null,
                    occupancy: rateEntry.occupancy ?? 0,
                };
            });
        };

        const loadData = async () => {
            try {
                const [
                    statsData, 
                    hourlyStats, 
                    weeklyStats, 
                    saturated, 
                    unused,
                    districtRates,
                    districtAvgBikes,
                    stationList
                ] = await Promise.all([
                    fetchGlobalStats(),
                    fetchHourlyStats(),
                    fetchWeeklyStats(),
                    fetchTop10Stations('saturated'),
                    fetchTop10Stations('unused'),
                    fetchDistrictStats(),
                    fetchDistrictAvgBikes(),
                    fetchStationList()
                ]);
                setStats(normalizeStats(statsData));
                setHourlyData(normalizeHourly(hourlyStats));
                setWeeklyData(normalizeWeekly(weeklyStats));
                setTopSaturated(normalizeTopStations(saturated));
                setTopUnused(normalizeTopStations(unused));
                setDistrictData(normalizeDistricts(districtRates, districtAvgBikes, stationList));
            } catch (error) {
                console.error('Error loading stats:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    return (
        <div className="min-h-screen pt-20 pb-12">
            {/* Header */}
            <section className="relative py-12 overflow-hidden">
                <div className="absolute inset-0 mesh-background" />
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <BarChart3 className="w-6 h-6 text-primary" />
                                    </div>
                                    <h1 className="text-3xl lg:text-4xl font-display font-bold text-foreground">
                                        Statistiques
                                    </h1>
                                </div>
                                <p className="text-muted-foreground">
                                    Analyse complète du réseau Vélib&apos; parisien
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-sm py-1.5">
                                    <Activity className="w-3.5 h-3.5 mr-1.5 text-success animate-pulse" />
                                    Données en temps réel
                                </Badge>
                            </div>
                        </div>

                        {/* Global stats */}
                        <StatsCards stats={stats} loading={loading} />
                    </motion.div>
                </div>
            </section>

            {/* Main content */}
            <section className="py-8">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="grid w-full grid-cols-3 lg:w-fit lg:grid-cols-3">
                            <TabsTrigger value="overview" className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                <span className="hidden sm:inline">Vue d&apos;ensemble</span>
                                <span className="sm:hidden">Global</span>
                            </TabsTrigger>
                            <TabsTrigger value="temporal" className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span className="hidden sm:inline">Temporel</span>
                                <span className="sm:hidden">Temps</span>
                            </TabsTrigger>
                            <TabsTrigger value="geographic" className="flex items-center gap-2">
                                <Map className="w-4 h-4" />
                                <span className="hidden sm:inline">Géographique</span>
                                <span className="sm:hidden">Zone</span>
                            </TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                {/* Key metrics */}
                                <div className="grid lg:grid-cols-3 gap-6 mb-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                <Bike className="w-5 h-5 text-primary" />
                                                Répartition des vélos
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-muted-foreground">Mécaniques</span>
                                                    <span className="font-semibold text-foreground">
                                                        {stats.mechanicalBikes?.toLocaleString() || '...'}
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-primary rounded-full transition-all duration-500"
                                                        style={{ 
                                                            width: `${stats.totalBikes ? (stats.mechanicalBikes / stats.totalBikes) * 100 : 0}%` 
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-muted-foreground">Électriques</span>
                                                    <span className="font-semibold text-warning">
                                                        {stats.electricBikes?.toLocaleString() || '...'}
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-warning rounded-full transition-all duration-500"
                                                        style={{ 
                                                            width: `${stats.totalBikes ? (stats.electricBikes / stats.totalBikes) * 100 : 0}%` 
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                <Activity className="w-5 h-5 text-primary" />
                                                État des stations
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-3 h-3 rounded-full bg-success" />
                                                        <span className="text-sm text-muted-foreground">Actives</span>
                                                    </div>
                                                    <span className="font-semibold text-foreground">
                                                        {stats.activeStations || '...'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-3 h-3 rounded-full bg-destructive" />
                                                        <span className="text-sm text-muted-foreground">Vides</span>
                                                    </div>
                                                    <span className="font-semibold text-foreground">
                                                        {stats.emptyStations || '...'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-3 h-3 rounded-full bg-chart-2" />
                                                        <span className="text-sm text-muted-foreground">Pleines</span>
                                                    </div>
                                                    <span className="font-semibold text-foreground">
                                                        {stats.fullStations || '...'}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                <Zap className="w-5 h-5 text-primary" />
                                                Performance
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <div>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-sm text-muted-foreground">Taux d&apos;occupation</span>
                                                        <span className="font-semibold text-foreground">
                                                            {stats.occupancyRate || 0}%
                                                        </span>
                                                    </div>
                                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all duration-500"
                                                            style={{ width: `${stats.occupancyRate || 0}%` }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="pt-2 border-t border-border">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-muted-foreground">Durée moyenne</span>
                                                        <span className="font-semibold text-foreground">
                                                            {stats.avgTripDuration || '...'} min
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Top stations charts */}
                                <div className="grid lg:grid-cols-2 gap-6">
                                    <TopStationsChart data={topSaturated} type="saturated" loading={loading} />
                                    <TopStationsChart data={topUnused} type="unused" loading={loading} />
                                </div>
                            </motion.div>
                        </TabsContent>

                        {/* Temporal Tab */}
                        <TabsContent value="temporal" className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                <div className="grid lg:grid-cols-2 gap-6">
                                    <HourlyUsageChart data={hourlyData} loading={loading} />
                                    <WeeklyTripsChart data={weeklyData} loading={loading} />
                                </div>

                                {/* Insights */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5 text-primary" />
                                            Insights temporels
                                        </CardTitle>
                                        <CardDescription>
                                            Tendances observées dans l&apos;utilisation du réseau
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div className="p-4 bg-muted/50 rounded-lg">
                                                <p className="text-sm text-muted-foreground mb-1">Heure de pointe (matin)</p>
                                                <p className="text-xl font-bold text-foreground">08:00 - 09:00</p>
                                            </div>
                                            <div className="p-4 bg-muted/50 rounded-lg">
                                                <p className="text-sm text-muted-foreground mb-1">Heure de pointe (soir)</p>
                                                <p className="text-xl font-bold text-foreground">17:00 - 19:00</p>
                                            </div>
                                            <div className="p-4 bg-muted/50 rounded-lg">
                                                <p className="text-sm text-muted-foreground mb-1">Jour le plus actif</p>
                                                <p className="text-xl font-bold text-foreground">Vendredi</p>
                                            </div>
                                            <div className="p-4 bg-muted/50 rounded-lg">
                                                <p className="text-sm text-muted-foreground mb-1">Période creuse</p>
                                                <p className="text-xl font-bold text-foreground">02:00 - 05:00</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </TabsContent>

                        {/* Geographic Tab */}
                        <TabsContent value="geographic" className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                <div className="grid lg:grid-cols-2 gap-6">
                                    <DistrictChart data={districtData} loading={loading} />
                                    
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Map className="w-5 h-5 text-primary" />
                                                Détails par quartier
                                            </CardTitle>
                                            <CardDescription>
                                                Répartition des ressources par arrondissement
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                                                {districtData.map((district, index) => (
                                                    <div 
                                                        key={district.name}
                                                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                                                                {index + 1}
                                                            </span>
                                                            <div>
                                                                <p className="font-medium text-foreground text-sm">
                                                                    {district.name}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {district.stations ?? '—'} stations
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-semibold text-foreground">
                                                                {(district.bikes ?? 0).toLocaleString(undefined, { maximumFractionDigits: 1 })} vélos
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {(district.occupancy ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}% occupé
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </motion.div>
                        </TabsContent>
                    </Tabs>
                </div>
            </section>
        </div>
    );
};

export default StatsPage;
