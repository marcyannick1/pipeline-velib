import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { 
    Search, 
    Bike, 
    Battery, 
    Zap, 
    MapPin,
    ExternalLink,
    Filter,
    Layers
} from 'lucide-react';

// Custom marker icons
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
                width: 32px;
                height: 32px;
                background: ${color};
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <circle cx="5" cy="18" r="3" stroke="white" stroke-width="2" fill="none"/>
                    <circle cx="19" cy="18" r="3" stroke="white" stroke-width="2" fill="none"/>
                    <path d="M12 18V8l-4 4" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M5 18h6.5" stroke="white" stroke-width="2" fill="none"/>
                    <path d="M12 8h4l3 10" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
                </svg>
            </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
};

// Map recenter component
const MapController = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    return null;
};

export const StationMap = ({ stations, loading = false, height = '500px', onStationClick }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [mapCenter, setMapCenter] = useState([48.8566, 2.3522]);

    const filteredStations = useMemo(() => {
        if (!stations) return [];
        return stations.filter(station => {
            const matchesSearch = station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 station.address.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || station.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [stations, searchTerm, statusFilter]);

    const statusCounts = useMemo(() => {
        if (!stations) return { all: 0, available: 0, low: 0, empty: 0, full: 0 };
        return {
            all: stations.length,
            available: stations.filter(s => s.status === 'available').length,
            low: stations.filter(s => s.status === 'low').length,
            empty: stations.filter(s => s.status === 'empty').length,
            full: stations.filter(s => s.status === 'full').length
        };
    }, [stations]);

    const statusOptions = [
        { value: 'all', label: 'Toutes', color: 'secondary' },
        { value: 'available', label: 'Disponibles', color: 'success' },
        { value: 'low', label: 'Stock bas', color: 'warning' },
        { value: 'empty', label: 'Vides', color: 'destructive' },
        { value: 'full', label: 'Pleines', color: 'default' }
    ];

    if (loading) {
        return (
            <Card className="overflow-hidden">
                <CardContent className="p-0">
                    <div 
                        className="animate-pulse bg-muted flex items-center justify-center"
                        style={{ height }}
                    >
                        <div className="text-center">
                            <MapPin className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2" />
                            <p className="text-muted-foreground">Chargement de la carte...</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden">
            {/* Map controls */}
            <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Layers className="w-5 h-5 text-primary" />
                        <CardTitle className="text-lg">Carte des stations</CardTitle>
                        <Badge variant="secondary" className="ml-2">
                            {filteredStations.length} stations
                        </Badge>
                    </div>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher une station..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>
                
                {/* Status filter */}
                <div className="flex flex-wrap gap-2 mt-3">
                    {statusOptions.map((option) => (
                        <Button
                            key={option.value}
                            variant={statusFilter === option.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setStatusFilter(option.value)}
                            className="text-xs"
                        >
                            <span className={`w-2 h-2 rounded-full mr-2 ${
                                option.value === 'available' ? 'bg-success' :
                                option.value === 'low' ? 'bg-warning' :
                                option.value === 'empty' ? 'bg-destructive' :
                                option.value === 'full' ? 'bg-chart-2' :
                                'bg-muted-foreground'
                            }`} />
                            {option.label}
                            <span className="ml-1 text-muted-foreground">({statusCounts[option.value]})</span>
                        </Button>
                    ))}
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <div className="map-container" style={{ height }}>
                    <MapContainer
                        center={mapCenter}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={true}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapController center={mapCenter} />
                        
                        {filteredStations.map((station) => (
                            <Marker
                                key={station.id}
                                position={[station.latitude, station.longitude]}
                                icon={createMarkerIcon(station.status)}
                            >
                                <Popup className="station-popup" maxWidth={300}>
                                    <div className="p-3 min-w-[250px]">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="font-display font-semibold text-foreground text-sm leading-tight">
                                                    {station.name}
                                                </h3>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {station.address}
                                                </p>
                                            </div>
                                            <Badge 
                                                className={`text-xs ${
                                                    station.status === 'available' ? 'status-available' :
                                                    station.status === 'low' ? 'status-low' :
                                                    station.status === 'empty' ? 'status-empty' :
                                                    'status-full'
                                                }`}
                                            >
                                                {station.status === 'available' ? 'Disponible' :
                                                 station.status === 'low' ? 'Stock bas' :
                                                 station.status === 'empty' ? 'Vide' : 'Pleine'}
                                            </Badge>
                                        </div>
                                        
                                        <div className="grid grid-cols-3 gap-2 mb-3">
                                            <div className="text-center p-2 bg-muted rounded-lg">
                                                <Bike className="w-4 h-4 mx-auto mb-1 text-success" />
                                                <p className="text-lg font-bold text-foreground">{station.availableBikes}</p>
                                                <p className="text-xs text-muted-foreground">Vélos</p>
                                            </div>
                                            <div className="text-center p-2 bg-muted rounded-lg">
                                                <Zap className="w-4 h-4 mx-auto mb-1 text-warning" />
                                                <p className="text-lg font-bold text-foreground">{station.electricBikes}</p>
                                                <p className="text-xs text-muted-foreground">Élec.</p>
                                            </div>
                                            <div className="text-center p-2 bg-muted rounded-lg">
                                                <Battery className="w-4 h-4 mx-auto mb-1 text-chart-2" />
                                                <p className="text-lg font-bold text-foreground">{station.availableDocks}</p>
                                                <p className="text-xs text-muted-foreground">Places</p>
                                            </div>
                                        </div>
                                        
                                        <Link to={`/stations/${station.id}`}>
                                            <Button size="sm" className="w-full">
                                                <ExternalLink className="w-3.5 h-3.5 mr-2" />
                                                Voir les détails
                                            </Button>
                                        </Link>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </CardContent>
        </Card>
    );
};
