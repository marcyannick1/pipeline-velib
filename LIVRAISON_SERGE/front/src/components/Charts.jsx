import { useMemo } from 'react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { motion } from 'framer-motion';
import { Clock, Calendar, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                <p className="font-medium text-foreground mb-1">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: <span className="font-semibold">{entry.value}</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// Custom tooltip for top stations
const TopStationsTooltip = ({ active, payload, color }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                <p className="font-medium text-foreground text-sm mb-1">
                    {payload[0].payload.fullName}
                </p>
                <p className="text-sm" style={{ color }}>
                    Occupation: <span className="font-semibold">{payload[0].value}%</span>
                </p>
            </div>
        );
    }
    return null;
};

// Custom tooltip for district chart
const DistrictTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                <p className="font-medium text-foreground mb-1">
                    {payload[0].name}
                </p>
                <p className="text-sm text-muted-foreground">
                    Vélos: <span className="font-semibold text-foreground">{payload[0].value}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                    Stations: <span className="font-semibold text-foreground">{payload[0].payload.stations}</span>
                </p>
            </div>
        );
    }
    return null;
};

// Hourly usage chart
export const HourlyUsageChart = ({ data, loading = false }) => {
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        Utilisation horaire
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] animate-pulse bg-muted rounded-lg" />
                </CardContent>
            </Card>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        Utilisation horaire
                    </CardTitle>
                    <CardDescription>
                        Nombre de trajets par heure aujourd&apos;hui
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis 
                                    dataKey="hour" 
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                />
                                <YAxis 
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="usage"
                                    name="Trajets"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={2}
                                    fill="url(#colorUsage)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

// Weekly trips chart
export const WeeklyTripsChart = ({ data, loading = false }) => {
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        Trajets hebdomadaires
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] animate-pulse bg-muted rounded-lg" />
                </CardContent>
            </Card>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
        >
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        Trajets hebdomadaires
                    </CardTitle>
                    <CardDescription>
                        Nombre total de trajets par jour
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                                <XAxis 
                                    dataKey="day" 
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                />
                                <YAxis 
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar 
                                    dataKey="trips" 
                                    name="Trajets"
                                    fill="hsl(var(--chart-2))" 
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

// Top stations chart
export const TopStationsChart = ({ data, type = 'saturated', loading = false }) => {
    const title = type === 'saturated' ? 'Stations les plus saturées' : 'Stations les moins utilisées';
    const color = type === 'saturated' ? 'hsl(var(--chart-3))' : 'hsl(var(--chart-4))';

    const chartData = useMemo(() => {
        return data?.slice(0, 8).map(s => ({
            name: s.name.length > 25 ? s.name.substring(0, 25) + '...' : s.name,
            occupancy: s.occupancy,
            fullName: s.name
        })) || [];
    }, [data]);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[350px] animate-pulse bg-muted rounded-lg" />
                </CardContent>
            </Card>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
        >
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        {title}
                    </CardTitle>
                    <CardDescription>
                        Top 8 stations par taux d&apos;occupation
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart 
                                data={chartData} 
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                                <XAxis 
                                    type="number" 
                                    domain={[0, 100]}
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickFormatter={(v) => `${v}%`}
                                />
                                <YAxis 
                                    type="category" 
                                    dataKey="name" 
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={11}
                                    width={150}
                                    tickLine={false}
                                />
                                <Tooltip content={<TopStationsTooltip color={color} />} />
                                <Bar 
                                    dataKey="occupancy" 
                                    fill={color}
                                    radius={[0, 4, 4, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

// District distribution pie chart
const CHART_COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
    'hsl(var(--primary))',
    'hsl(var(--accent))'
];

export const DistrictChart = ({ data, loading = false }) => {
    const chartData = useMemo(() => data?.slice(0, 7) || [], [data]);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PieChartIcon className="w-5 h-5 text-primary" />
                        Répartition par quartier
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] animate-pulse bg-muted rounded-lg" />
                </CardContent>
            </Card>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
        >
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PieChartIcon className="w-5 h-5 text-primary" />
                        Répartition par quartier
                    </CardTitle>
                    <CardDescription>
                        Distribution des vélos par arrondissement
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={2}
                                    dataKey="bikes"
                                    nameKey="name"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<DistrictTooltip />} />
                                <Legend 
                                    verticalAlign="bottom" 
                                    height={36}
                                    formatter={(value) => (
                                        <span className="text-sm text-foreground">{value}</span>
                                    )}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

// Station detail charts
export const StationHistoryChart = ({ data, loading = false }) => {
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Historique de la journée</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] animate-pulse bg-muted rounded-lg" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Historique de la journée
                </CardTitle>
                <CardDescription>
                    Évolution du nombre de vélos disponibles
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis 
                                dataKey="hour" 
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={11}
                            />
                            <YAxis 
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={11}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line 
                                type="monotone" 
                                dataKey="bikes" 
                                name="Vélos"
                                stroke="hsl(var(--success))" 
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="docks" 
                                name="Places"
                                stroke="hsl(var(--chart-2))" 
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export const StationWeeklyChart = ({ data, loading = false }) => {
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Activité hebdomadaire</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] animate-pulse bg-muted rounded-lg" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Activité hebdomadaire
                </CardTitle>
                <CardDescription>
                    Locations et retours par jour
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                            <XAxis 
                                dataKey="day" 
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={11}
                            />
                            <YAxis 
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={11}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar 
                                dataKey="rentals" 
                                name="Locations"
                                fill="hsl(var(--primary))" 
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar 
                                dataKey="returns" 
                                name="Retours"
                                fill="hsl(var(--chart-2))" 
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};
