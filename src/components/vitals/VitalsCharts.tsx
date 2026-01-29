"use client"

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { Vitals } from "@/types/database"
import { format } from "date-fns"
import { Activity, Droplets, Thermometer, Heart } from "lucide-react"

interface VitalsChartsProps {
    vitals: Vitals[]
}

export function VitalsCharts({ vitals }: VitalsChartsProps) {
    if (vitals.length === 0) {
        return (
            <Card className="border-dashed border-2 bg-muted/10">
                <CardContent className="flex flex-col items-center justify-center h-60 text-muted-foreground gap-3">
                    <Activity className="h-10 w-10 opacity-20" />
                    <p className="font-medium">No longitudinal data available for trending</p>
                </CardContent>
            </Card>
        )
    }

    const chartData = [...vitals].sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()).map((v) => ({
        time: format(new Date(v.recorded_at), "dd MMM HH:mm"),
        bp_systolic: v.bp_systolic,
        bp_diastolic: v.bp_diastolic,
        spo2: v.spo2,
        temperature: v.temperature,
        heart_rate: v.heart_rate,
    }))

    const ChartCard = ({ title, subtitle, icon: Icon, color, dataKey, domain, unit, isDoubleLine }: any) => (
        <Card className="border-none shadow-xl overflow-hidden animate-in-fade">
            <CardHeader className="bg-white/50 border-b pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center" style={{ color }}>
                        <Icon className="h-4 w-4" />
                    </div>
                    <div>
                        <CardTitle className="text-sm font-black uppercase tracking-widest">{title}</CardTitle>
                        <CardDescription className="text-[10px]">{subtitle}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-6">
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id={`color-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis
                                dataKey="time"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: '#64748B' }}
                            />
                            <YAxis
                                domain={domain}
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: '#64748B' }}
                                unit={unit}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                itemStyle={{ fontWeight: 'bold' }}
                            />
                            {isDoubleLine ? (
                                <>
                                    <Area
                                        type="monotone"
                                        dataKey="bp_systolic"
                                        stroke="#ef4444"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#color-bp_systolic)"
                                        name="Systolic"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="bp_diastolic"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#color-bp_diastolic)"
                                        name="Diastolic"
                                    />
                                </>
                            ) : (
                                <Area
                                    type="monotone"
                                    dataKey={dataKey}
                                    stroke={color}
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill={`url(#color-${dataKey})`}
                                    name={title}
                                />
                            )}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <ChartCard
                title="Blood Pressure"
                subtitle="Systolic vs Diastolic Trend"
                icon={Activity}
                color="#ef4444"
                dataKey="bp_systolic"
                domain={[60, 180]}
                unit=" mmHg"
                isDoubleLine
            />
            <ChartCard
                title="Oxygen Saturation"
                subtitle="SpO2 Percentage Over Time"
                icon={Droplets}
                color="#22c55e"
                dataKey="spo2"
                domain={[85, 100]}
                unit="%"
            />
            <ChartCard
                title="Body Temperature"
                subtitle="Core Temp Variations"
                icon={Thermometer}
                color="#f59e0b"
                dataKey="temperature"
                domain={[35, 40]}
                unit="°C"
            />
            <ChartCard
                title="Heart Rate"
                subtitle="BPM Progression"
                icon={Heart}
                color="#8b5cf6"
                dataKey="heart_rate"
                domain={[40, 140]}
                unit=" bpm"
            />
        </div>
    )
}
