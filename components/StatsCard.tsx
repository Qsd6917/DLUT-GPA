import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  colorClass?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, description, colorClass = "bg-white" }) => {
  return (
    <div className={`${colorClass} p-6 rounded-2xl border border-transparent transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between relative overflow-hidden group`}>
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
          <h3 className={`text-3xl font-extrabold tracking-tight ${colorClass.includes("text-white") ? "text-white" : "text-gray-900"}`}>
            {value}
          </h3>
        </div>
        {icon && (
            <div className={`p-3 rounded-xl ${colorClass.includes("text-white") ? "bg-white/20 backdrop-blur-sm" : "bg-gray-50 group-hover:bg-blue-50 transition-colors"}`}>
                {icon}
            </div>
        )}
      </div>
      
      {description && (
        <p className={`text-xs mt-4 font-medium ${colorClass.includes("text-white") ? "text-blue-100" : "text-gray-500"}`}>
            {description}
        </p>
      )}
    </div>
  );
};