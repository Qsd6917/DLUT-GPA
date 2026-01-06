import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  colorClass?: string;
  comparisonValue?: string | number;
  isSandbox?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon, 
  description, 
  colorClass = "bg-white",
  comparisonValue,
  isSandbox = false
}) => {
  
  let diff = 0;
  let diffFormatted = '';
  let showDiff = false;

  if (isSandbox && comparisonValue !== undefined) {
      const current = parseFloat(value.toString());
      const original = parseFloat(comparisonValue.toString());
      
      if (!isNaN(current) && !isNaN(original)) {
          diff = current - original;
          diffFormatted = (diff > 0 ? '+' : '') + diff.toFixed(3);
          showDiff = true;
      }
  }

  return (
    <div className={`${colorClass} p-6 rounded-2xl border border-transparent transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between relative overflow-hidden group ${isSandbox ? 'ring-2 ring-amber-400/50' : ''}`}>
      {/* Subtle background pattern for white cards */}
      {colorClass.includes("bg-white") && (
         <div className="absolute right-0 top-0 w-24 h-24 bg-gray-50 rounded-bl-full -mr-4 -mt-4 opacity-50 pointer-events-none transition-all group-hover:bg-gray-100"></div>
      )}
      
      {/* Shine effect for colored cards */}
      {!colorClass.includes("bg-white") && (
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-10 blur-3xl rounded-full pointer-events-none group-hover:opacity-20 transition-opacity"></div>
      )}

      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${colorClass.includes("text-white") ? "text-blue-100" : "text-gray-400"}`}>
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className={`text-3xl font-extrabold tracking-tight ${colorClass.includes("text-white") ? "text-white" : "text-gray-900"}`}>
                {value}
            </h3>
            {showDiff && Math.abs(diff) > 0.0001 && (
                <div className={`flex items-center text-xs font-bold px-1.5 py-0.5 rounded ${
                    diff > 0 
                        ? (colorClass.includes("text-white") ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-700")
                        : (colorClass.includes("text-white") ? "bg-white/20 text-white" : "bg-red-100 text-red-700")
                }`}>
                    {diff > 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                    {diffFormatted}
                </div>
            )}
          </div>
        </div>
        {icon && (
            <div className={`p-3 rounded-xl ${colorClass.includes("text-white") ? "bg-white/20 backdrop-blur-sm" : "bg-gray-50 group-hover:bg-blue-50 transition-colors"}`}>
                {icon}
            </div>
        )}
      </div>
      
      {description && !showDiff && (
        <p className={`text-xs mt-4 font-medium ${colorClass.includes("text-white") ? "text-blue-100" : "text-gray-500"}`}>
            {description}
        </p>
      )}

      {showDiff && (
          <div className={`text-xs mt-4 font-medium flex justify-between ${colorClass.includes("text-white") ? "text-blue-100" : "text-gray-500"}`}>
             <span>原值: {comparisonValue}</span>
             {Math.abs(diff) < 0.0001 && <span className="opacity-70">(无变化)</span>}
          </div>
      )}
    </div>
  );
};