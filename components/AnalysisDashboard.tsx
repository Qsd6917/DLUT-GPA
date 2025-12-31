import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Course, SemesterTrend } from '../types';
import { calculateTrend } from '../services/gpaService';
import { TrendingUp, Award } from 'lucide-react';

interface AnalysisDashboardProps {
  courses: Course[];
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ courses }) => {
  const trends: SemesterTrend[] = useMemo(() => calculateTrend(courses), [courses]);
  
  if (trends.length === 0) return null;

  return (
    <div className="space-y-6">
        {/* GPA Trend Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 relative overflow-hidden transition-all hover:shadow-md">
             {/* Background Decoration */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full opacity-50 pointer-events-none"></div>

            <div className="flex items-center gap-2 mb-6 relative z-10">
                <div className="p-2 bg-blue-50 rounded-lg text-dlut-blue">
                    <TrendingUp size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-800">GPA 变化走势</h3>
            </div>
            <div className="h-64 w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#005BAC" stopOpacity={0.15}/>
                                <stop offset="95%" stopColor="#005BAC" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis 
                            dataKey="semester" 
                            tick={{fontSize: 10, fill: '#64748B'}} 
                            interval={0} 
                            angle={-15} 
                            textAnchor="end" 
                            height={50} 
                            tickLine={false}
                            axisLine={{stroke: '#E2E8F0'}}
                        />
                        <YAxis domain={['auto', 'auto']} hide />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                            itemStyle={{ color: '#005BAC', fontWeight: 'bold' }}
                            formatter={(value: number) => [value.toFixed(3), 'GPA']}
                            cursor={{stroke: '#005BAC', strokeWidth: 1, strokeDasharray: '4 4'}}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="gpa" 
                            stroke="#005BAC" 
                            strokeWidth={3} 
                            fillOpacity={1} 
                            fill="url(#colorGpa)" 
                            activeDot={{r: 6, strokeWidth: 0, fill: '#005BAC'}}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Credits Progress */}
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 transition-all hover:shadow-md">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                    <Award size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-800">学期学分积累</h3>
            </div>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trends}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis 
                            dataKey="semester" 
                            tick={{fontSize: 10, fill: '#64748B'}} 
                            interval={0} 
                            angle={-15} 
                            textAnchor="end" 
                            height={50} 
                            tickLine={false}
                            axisLine={{stroke: '#E2E8F0'}}
                        />
                        <Tooltip 
                             contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                             cursor={{fill: '#F8FAFC'}}
                        />
                        <Bar 
                            dataKey="credits" 
                            fill="#10B981" 
                            radius={[4, 4, 0, 0]} 
                            barSize={24} 
                            name="获得学分"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
  );
};