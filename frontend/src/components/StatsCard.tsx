import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'yellow' | 'purple';
  change?: string;
}

const colorClasses = {
  blue: 'bg-blue-600 text-blue-600 bg-blue-50',
  green: 'bg-green-600 text-green-600 bg-green-50',
  yellow: 'bg-yellow-600 text-yellow-600 bg-yellow-50',
  purple: 'bg-purple-600 text-purple-600 bg-purple-50'
};

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color, change }) => {
  const [bgColor, textColor, lightBgColor] = colorClasses[color].split(' ');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p className="text-sm text-green-600 mt-1">{change}</p>
          )}
        </div>
        <div className={`${lightBgColor} p-3 rounded-lg`}>
          <Icon className={`h-6 w-6 ${textColor}`} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;