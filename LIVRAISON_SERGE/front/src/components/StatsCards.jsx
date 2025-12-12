import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import { 
    Bike, 
    MapPin, 
    Battery, 
    Zap, 
    Activity,
    TrendingUp,
    Clock,
    AlertCircle
} from 'lucide-react';

const statConfig = {
    totalStations: {
        label: 'Stations',
        icon: MapPin,
        color: 'primary',
        format: (v) => v.toLocaleString()
    },
    totalBikes: {
        label: 'Vélos disponibles',
        icon: Bike,
        color: 'success',
        format: (v) => v.toLocaleString()
    },
    electricBikes: {
        label: 'Vélos électriques',
        icon: Zap,
        color: 'warning',
        format: (v) => v.toLocaleString()
    },
    occupancyRate: {
        label: 'Taux d\'occupation',
        icon: Activity,
        color: 'chart-2',
        format: (v) => `${v}%`
    },
    tripsToday: {
        label: 'Trajets aujourd\'hui',
        icon: TrendingUp,
        color: 'primary',
        format: (v) => v.toLocaleString()
    },
    avgTripDuration: {
        label: 'Durée moyenne',
        icon: Clock,
        color: 'accent',
        format: (v) => `${v} min`
    },
    emptyStations: {
        label: 'Stations vides',
        icon: AlertCircle,
        color: 'destructive',
        format: (v) => v.toLocaleString()
    },
    totalDocks: {
        label: 'Places disponibles',
        icon: Battery,
        color: 'chart-4',
        format: (v) => v.toLocaleString()
    }
};

const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    destructive: 'bg-destructive/10 text-destructive',
    accent: 'bg-accent/10 text-accent',
    'chart-2': 'bg-chart-2/10 text-chart-2',
    'chart-4': 'bg-chart-4/10 text-chart-4'
};

export const StatsCards = ({ stats, loading = false, variant = 'default' }) => {
    const displayKeys = variant === 'compact' 
        ? ['totalStations', 'totalBikes', 'electricBikes', 'occupancyRate']
        : ['totalStations', 'totalBikes', 'electricBikes', 'occupancyRate', 'tripsToday', 'avgTripDuration', 'emptyStations', 'totalDocks'];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <div className={`grid grid-cols-2 ${variant === 'compact' ? 'lg:grid-cols-4' : 'md:grid-cols-4'} gap-4`}>
                {displayKeys.map((key, index) => (
                    <Card key={index} className="animate-pulse">
                        <CardContent className="p-4 lg:p-6">
                            <div className="flex items-start justify-between">
                                <div className="space-y-3 flex-1">
                                    <div className="h-3 bg-muted rounded w-20" />
                                    <div className="h-8 bg-muted rounded w-16" />
                                </div>
                                <div className="w-10 h-10 bg-muted rounded-xl" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <motion.div 
            className={`grid grid-cols-2 ${variant === 'compact' ? 'lg:grid-cols-4' : 'md:grid-cols-4'} gap-4`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {displayKeys.map((key) => {
                const config = statConfig[key];
                if (!config || stats[key] === undefined) return null;
                
                const Icon = config.icon;
                const value = config.format(stats[key]);

                return (
                    <motion.div key={key} variants={itemVariants}>
                        <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                            <CardContent className="p-4 lg:p-6">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                                            {config.label}
                                        </p>
                                        <p className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-foreground">
                                            {value}
                                        </p>
                                    </div>
                                    <div className={`p-2.5 rounded-xl ${colorClasses[config.color]} transition-transform duration-300 group-hover:scale-110`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                </div>
                                {/* Progress bar for percentage values */}
                                {key === 'occupancyRate' && (
                                    <div className="mt-4">
                                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                            <motion.div 
                                                className="h-full rounded-full bg-gradient-to-r from-primary to-primary-light"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${stats[key]}%` }}
                                                transition={{ duration: 1, ease: 'easeOut' }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                );
            })}
        </motion.div>
    );
};
