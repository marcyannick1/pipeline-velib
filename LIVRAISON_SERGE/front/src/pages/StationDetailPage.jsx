import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { StationHistoryChart, StationWeeklyChart } from '../components/Charts';
import { fetchStationById } from '../api/velib';
import {
    ArrowLeft,
    Bike,
    Zap,
    Battery,
    MapPin,
    Clock,
    Navigation,
    Share2,
    RefreshCw,
    Cog
} from 'lucide-react';

const createMarkerIcon = (status) => {
    const colors = {
        available: '#22c55e',
        low: '#f59e0b',
        empty: '#ef4444',
        full: '#3b82f6'
    };
    const color = colors[status] || colors.available;
    
    return L.divIcon({
        className: 'custom-marker-wrapper',
        html: `
            <div style="
                width: 40px;
                height: 40px;
                background: ${color};
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <circle cx="5" cy="18" r="3" stroke="white" stroke-width="2" fill="none"/>
                    <circle cx="19" cy="18" r="3" stroke="white" stroke-width="2" fill="none"/>
                    <path d="M12 18V8l-4 4" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M5 18h6.5" stroke="white" stroke-width="2" fill="none"/>
                    <path d="M12 8h4l3 10" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
                </svg>
            </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
    });
};

const StationDetailPage = () => {
    const { id } = useParams();
    const [station, setStation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadStation = async () => {
        try {
            const data = await fetchStationById(id);
            setStation(data);
        } catch (error) {
            console.error('Error loading station:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadStation();
    }, [id]);

    const handleRefresh = () => {
        setRefreshing(true);
        loadStation();
    };

    const getStatusConfig = (status) => {
        const configs = {
            available: { label: 'Disponible', class: 'status-available', color: 'success' },
            low: { label: 'Stock bas', class: 'status-low', color: 'warning' },
            empty: { label: 'Vide', class: 'status-empty', color: 'destructive' },
            full: { label: 'Pleine', class: 'status-full', color: 'default' }
        };
        return configs[status] || configs.available;
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-20 pb-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-muted rounded w-48" />
                        <div className="h-64 bg-muted rounded-xl" />
                        <div className="grid md:grid-cols-3 gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-32 bg-muted rounded-xl" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!station) {
        return (
            <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
                <Card className="max-w-md w-full mx-4">
                    <CardContent className="p-8 text-center">
                        <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-foreground mb-2">Station introuvable</h2>
                        <p className="text-muted-foreground mb-6">
                            La station demandée n'existe pas ou a été supprimée.
                        </p>
                        <Link to="/stations">
                            <Button>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Retour aux stations
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const statusConfig = getStatusConfig(station.status);
    const occupancyRate = Math.round((station.availableBikes / station.capacity) * 100);

    return (
        <div className="min-h-screen pt-20 pb-12">
            {/* Header */}
            <section className="relative py-8 overflow-hidden">
                <div className="absolute inset-0 mesh-background" />
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                            <Link to="/" className="hover:text-foreground transition-colors">Accueil</Link>
                            <span>/</span>
                            <Link to="/stations" className="hover:text-foreground transition-colors">Stations</Link>
                            <span>/</span>
                            <span className="text-foreground">Détails</span>
                        </div>

                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                    <Badge className={statusConfig.class}>
                                        {statusConfig.label}
                                    </Badge>
                                    <Badge variant="outline" className="text-muted-foreground">
                                        ID: {station.id}
                                    </Badge>
                                </div>
                                <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground mb-2">
                                    {station.name}
                                </h1>
                                <p className="text-muted-foreground flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    {station.address}
                                </p>
                                <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Dernière mise à jour: {new Date(station.lastUpdate).toLocaleString('fr-FR')}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                                    Actualiser
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Navigation className="w-4 h-4 mr-2" />
                                    Itinéraire
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Partager
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Main content */}
            <section className="py-6">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Left column - Stats */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Availability cards */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                className="grid sm:grid-cols-3 gap-4"
                            >
                                <Card className="group hover:shadow-lg transition-all duration-300">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 rounded-xl bg-success/10 group-hover:scale-110 transition-transform duration-300">
                                                <Bike className="w-6 h-6 text-success" />
                                            </div>
                                            <span className="text-xs text-muted-foreground">Total</span>
                                        </div>
                                        <p className="text-3xl font-display font-bold text-foreground mb-1">
                                            {station.availableBikes}
                                        </p>
                                        <p className="text-sm text-muted-foreground">Vélos disponibles</p>
                                        <div className="mt-3 flex items-center gap-2 text-xs">
                                            <span className="text-muted-foreground">Mécaniques:</span>
                                            <span className="font-medium text-foreground">{station.mechanicalBikes}</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="group hover:shadow-lg transition-all duration-300">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 rounded-xl bg-warning/10 group-hover:scale-110 transition-transform duration-300">
                                                <Zap className="w-6 h-6 text-warning" />
                                            </div>
                                            <span className="text-xs text-muted-foreground">Électrique</span>
                                        </div>
                                        <p className="text-3xl font-display font-bold text-foreground mb-1">
                                            {station.electricBikes}
                                        </p>
                                        <p className="text-sm text-muted-foreground">Vélos électriques</p>
                                        <div className="mt-3">
                                            <Progress value={(station.electricBikes / station.availableBikes) * 100} className="h-1.5" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="group hover:shadow-lg transition-all duration-300">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 rounded-xl bg-chart-2/10 group-hover:scale-110 transition-transform duration-300">
                                                <Battery className="w-6 h-6 text-chart-2" />
                                            </div>
                                            <span className="text-xs text-muted-foreground">Places</span>
                                        </div>
                                        <p className="text-3xl font-display font-bold text-foreground mb-1">
                                            {station.availableDocks}
                                        </p>
                                        <p className="text-sm text-muted-foreground">Bornes libres</p>
                                        <div className="mt-3 flex items-center gap-2 text-xs">
                                            <span className="text-muted-foreground">Capacité:</span>
                                            <span className="font-medium text-foreground">{station.capacity}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Occupancy */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.1 }}
                            >
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Cog className="w-5 h-5 text-primary" />
                                            Taux d'occupation
                                        </CardTitle>
                                        <CardDescription>
                                            Ratio vélos disponibles / capacité totale
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <Progress value={occupancyRate} className="h-4" />
                                            </div>
                                            <span className="text-2xl font-bold text-foreground min-w-[60px] text-right">
                                                {occupancyRate}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between mt-4 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">Vélos: </span>
                                                <span className="font-medium text-success">{station.availableBikes}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Places: </span>
                                                <span className="font-medium text-chart-2">{station.availableDocks}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Capacité: </span>
                                                <span className="font-medium text-foreground">{station.capacity}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Charts */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.2 }}
                                className="grid md:grid-cols-2 gap-6"
                            >
                                <StationHistoryChart data={station.history} />
                                <StationWeeklyChart data={station.weeklyUsage} />
                            </motion.div>
                        </div>

                        {/* Right column - Map */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                            className="lg:col-span-1"
                        >
                            <Card className="sticky top-24 overflow-hidden">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        Localisation
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="h-[400px]">
                                        <MapContainer
                                            center={[station.latitude, station.longitude]}
                                            zoom={16}
                                            style={{ height: '100%', width: '100%' }}
                                            scrollWheelZoom={false}
                                        >
                                            <TileLayer
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            />
                                            <Marker
                                                position={[station.latitude, station.longitude]}
                                                icon={createMarkerIcon(station.status)}
                                            >
                                                <Popup>
                                                    <div className="p-2 text-center">
                                                        <p className="font-medium text-foreground">{station.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {station.availableBikes} vélos | {station.availableDocks} places
                                                        </p>
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        </MapContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Back button */}
                            <div className="mt-6">
                                <Link to="/stations">
                                    <Button variant="outline" className="w-full">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Retour à la liste
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default StationDetailPage;
