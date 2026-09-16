import { motion } from 'framer-motion';

function SkeletonBlock({ className }: { className: string }) {
    return <div className={`bg-slate-200 rounded-xl ${className}`} />;
}

export function ChartSkeleton() {
    return (
        <div className="relative overflow-hidden bg-surface-container-lowest rounded-2xl border border-slate-100 shadow-sm p-6">
            {/* Shimmer Sweep Overlay */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
                <motion.div
                    className="w-1/2 h-full bg-gradient-to-r from-transparent via-slate-100/60 to-transparent"
                    initial={{ x: '-100%', skewX: -20 }}
                    animate={{ x: '250%' }}
                    transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        ease: 'linear',
                    }}
                    style={{
                        position: 'absolute',
                        top: 0,
                        height: '100%',
                    }}
                />
            </div>

            {/* Label */}
            <SkeletonBlock className="h-3 w-28 mb-2" />
            {/* Big number */}
            <SkeletonBlock className="h-8 w-36 mb-1" />
            {/* "across n trips" */}
            <SkeletonBlock className="h-3 w-20 mb-6" />
            {/* Chart area */}
            <div className="relative h-[360px] flex items-end gap-2 px-1">
                {/* Y-axis stub */}
                <div className="absolute left-0 top-0 bottom-6 w-px bg-slate-100" />
                {/* Fake bars to hint at a chart */}
                {[55, 80, 40, 95, 60, 75, 50, 85, 45, 70].map((h, i) => (
                    <div
                        key={i}
                        className="flex-1 bg-slate-200/80 rounded-t-lg"
                        style={{ height: `${h}%` }}
                    />
                ))}
                {/* X-axis stub */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-100" />
            </div>
            {/* X-axis tick labels */}
            <div className="flex justify-between mt-2 px-1">
                {[...Array(5)].map((_, i) => (
                    <SkeletonBlock key={i} className="h-2 w-10" />
                ))}
            </div>
        </div>
    );
}
