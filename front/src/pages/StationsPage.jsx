import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { StationTable } from '../components/StationTable';
import { StationMap } from '../components/StationMap';
import { StatsCards } from '../components/StatsCards';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { fetchRealtimeStations, fetchGlobalStats } from '../api/velib';
import { MapPin, Table2, Map, Activity } from 'lucide-react';

const StationsPage = () => {
    const [stations, setStations] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState('table');

    useEffect(() => {
        const loadData = async () => {
            try {
                const [stationsData, statsData] = await Promise.all([
                    fetchRealtimeStations(),
                    fetchGlobalStats()
                ]);
                setStations(stationsData);
                setStats(statsData);
            } catch (error) {
                console.error('Error loading stations:', error);
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
                                        <MapPin className="w-6 h-6 text-primary" />
                                    </div>
                                    <h1 className="text-3xl lg:text-4xl font-display font-bold text-foreground">
                                        Stations Vélib&apos;
                                    </h1>
                                </div>
                                <p className="text-muted-foreground">
                                    Explorez toutes les stations du réseau parisien
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-sm py-1.5">
                                    <Activity className="w-3.5 h-3.5 mr-1.5 text-success animate-pulse" />
                                    {stations.length} stations en ligne
                                </Badge>
                            </div>
                        </div>

                        {/* Quick stats */}
                        <StatsCards stats={stats} loading={loading} variant="compact" />
                    </motion.div>
                </div>
            </section>

            {/* Main content */}
            <section className="py-8">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
                        <div className="flex items-center justify-between">
                            <TabsList className="grid w-fit grid-cols-2">
                                <TabsTrigger value="table" className="flex items-center gap-2">
                                    <Table2 className="w-4 h-4" />
                                    <span className="hidden sm:inline">Tableau</span>
                                </TabsTrigger>
                                <TabsTrigger value="map" className="flex items-center gap-2">
                                    <Map className="w-4 h-4" />
                                    <span className="hidden sm:inline">Carte</span>
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="table" className="mt-0">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                <StationTable stations={stations} loading={loading} />
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="map" className="mt-0">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                <StationMap stations={stations} loading={loading} height="600px" />
                            </motion.div>
                        </TabsContent>
                    </Tabs>
                </div>
            </section>
        </div>
    );
};

export default StationsPage;
