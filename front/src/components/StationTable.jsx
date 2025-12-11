import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from './ui/table';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
    Search, 
    ArrowUpDown, 
    ArrowUp, 
    ArrowDown,
    ChevronLeft,
    ChevronRight,
    Eye,
    Bike,
    Zap,
    Battery,
    MapPin,
    Filter
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select';

// Sort icon component - moved outside
const SortIcon = ({ columnKey, sortConfig }) => {
    if (sortConfig.key !== columnKey) {
        return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    }
    return sortConfig.direction === 'asc' 
        ? <ArrowUp className="w-4 h-4 ml-1 text-primary" />
        : <ArrowDown className="w-4 h-4 ml-1 text-primary" />;
};

// Status badge helper
const getStatusBadge = (status) => {
    const config = {
        available: { label: 'Disponible', class: 'status-available' },
        low: { label: 'Stock bas', class: 'status-low' },
        empty: { label: 'Vide', class: 'status-empty' },
        full: { label: 'Pleine', class: 'status-full' }
    };
    const { label, class: className } = config[status] || config.available;
    return <Badge className={className}>{label}</Badge>;
};

export const StationTable = ({ stations, loading = false }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const normalizedStations = useMemo(() => {
        if (!stations) return [];
        return stations.map((s, idx) => {
            const name = s.name || s.station_name || '';
            const address = s.address || s.city || '';
            const district = s.district || s.city || '';
            const availableBikes = s.availableBikes ?? s.num_bikes_available ?? s.mechanical ?? 0;
            const electricBikes = s.electricBikes ?? s.ebike ?? 0;
            const availableDocks = s.availableDocks ?? s.num_docks_available ?? 0;
            const capacity = (s.capacity ?? (availableBikes + availableDocks)) || 0;
            const fillRate = capacity > 0 ? availableBikes / capacity : 0;
            const status =
                s.status ||
                (capacity === 0 ? 'empty' :
                    fillRate === 0 ? 'empty' :
                    fillRate >= 0.9 ? 'full' :
                    fillRate <= 0.2 ? 'low' :
                    'available');

            return {
                id: s.id || s.station_id || idx,
                name,
                address,
                district,
                availableBikes,
                electricBikes,
                availableDocks,
                capacity,
                status,
            };
        });
    }, [stations]);

    const filteredAndSortedStations = useMemo(() => {
        if (!normalizedStations.length) return [];
        
        let result = normalizedStations.filter(station => {
            const matchesSearch = 
                (station.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (station.address || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (station.district || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || station.status === statusFilter;
            return matchesSearch && matchesStatus;
        });

        result.sort((a, b) => {
            let aVal = a[sortConfig.key];
            let bVal = b[sortConfig.key];
            
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
            
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [normalizedStations, searchTerm, sortConfig, statusFilter]);

    const paginatedStations = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredAndSortedStations.slice(start, start + itemsPerPage);
    }, [filteredAndSortedStations, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredAndSortedStations.length / itemsPerPage);

    const handleSort = useCallback((key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    }, []);

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex gap-4 animate-pulse">
                                <div className="h-10 bg-muted rounded flex-1" />
                                <div className="h-10 bg-muted rounded w-24" />
                                <div className="h-10 bg-muted rounded w-20" />
                                <div className="h-10 bg-muted rounded w-20" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        <CardTitle>Liste des stations</CardTitle>
                        <Badge variant="secondary" className="ml-2">
                            {filteredAndSortedStations.length} résultats
                        </Badge>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="pl-9"
                            />
                        </div>
                        
                        <Select value={statusFilter} onValueChange={(value) => {
                            setStatusFilter(value);
                            setCurrentPage(1);
                        }}>
                            <SelectTrigger className="w-full sm:w-40">
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue placeholder="Statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les statuts</SelectItem>
                                <SelectItem value="available">Disponible</SelectItem>
                                <SelectItem value="low">Stock bas</SelectItem>
                                <SelectItem value="empty">Vide</SelectItem>
                                <SelectItem value="full">Pleine</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            
            <CardContent>
                <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead 
                                    className="cursor-pointer hover:bg-muted transition-colors"
                                    onClick={() => handleSort('name')}
                                >
                                    <div className="flex items-center">
                                        Station
                                        <SortIcon columnKey="name" sortConfig={sortConfig} />
                                    </div>
                                </TableHead>
                                <TableHead className="hidden md:table-cell">Quartier</TableHead>
                                <TableHead 
                                    className="cursor-pointer hover:bg-muted transition-colors"
                                    onClick={() => handleSort('availableBikes')}
                                >
                                    <div className="flex items-center">
                                        <Bike className="w-4 h-4 mr-1" />
                                        Vélos
                                        <SortIcon columnKey="availableBikes" sortConfig={sortConfig} />
                                    </div>
                                </TableHead>
                                <TableHead className="hidden sm:table-cell">
                                    <div className="flex items-center">
                                        <Zap className="w-4 h-4 mr-1" />
                                        Élec.
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="cursor-pointer hover:bg-muted transition-colors"
                                    onClick={() => handleSort('availableDocks')}
                                >
                                    <div className="flex items-center">
                                        <Battery className="w-4 h-4 mr-1" />
                                        Places
                                        <SortIcon columnKey="availableDocks" sortConfig={sortConfig} />
                                    </div>
                                </TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence mode="popLayout">
                                {paginatedStations.map((station, index) => (
                                    <motion.tr
                                        key={station.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ delay: index * 0.03 }}
                                        className="border-b border-border hover:bg-muted/30 transition-colors"
                                    >
                                        <TableCell>
                                            <div>
                                                <p className="font-medium text-foreground text-sm">
                                                    {station.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                    {station.address}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                                            {station.district}
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-semibold text-success">
                                                {station.availableBikes}
                                            </span>
                                            <span className="text-muted-foreground text-xs">/{station.capacity}</span>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            <span className="font-semibold text-warning">
                                                {station.electricBikes}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-semibold text-chart-2">
                                                {station.availableDocks}
                                            </span>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(station.status)}</TableCell>
                                        <TableCell className="text-right">
                                            <Link to={`/stations/${station.id}`}>
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Afficher</span>
                        <Select value={String(itemsPerPage)} onValueChange={(v) => {
                            setItemsPerPage(Number(v));
                            setCurrentPage(1);
                        }}>
                            <SelectTrigger className="w-16 h-8">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                        </Select>
                        <span>par page</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground px-3">
                            Page {currentPage} sur {totalPages || 1}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
