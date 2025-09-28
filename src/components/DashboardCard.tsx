'use client';

import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  subtitle?: string;
  onClick?: () => void;
}

const colorClasses = {
  blue: 'border-blue-200 bg-blue-50/50 hover:bg-blue-50',
  green: 'border-green-200 bg-green-50/50 hover:bg-green-50',
  yellow: 'border-yellow-200 bg-yellow-50/50 hover:bg-yellow-50',
  red: 'border-red-200 bg-red-50/50 hover:bg-red-50',
  purple: 'border-purple-200 bg-purple-50/50 hover:bg-purple-50',
  gray: 'border-gray-200 bg-gray-50/50 hover:bg-gray-50',
};

const iconColorClasses = {
  blue: 'text-blue-600',
  green: 'text-green-600',
  yellow: 'text-yellow-600',
  red: 'text-red-600',
  purple: 'text-purple-600',
  gray: 'text-gray-600',
};

export function DashboardCard({ title, value, icon, color, subtitle, onClick }: DashboardCardProps) {
  const CardComponent = onClick ? 'button' : 'div';
  
  return (
    <CardComponent
      onClick={onClick}
      className={`w-full text-left p-6 rounded-xl border-2 ${colorClasses[color]} shadow-sm hover:shadow-md transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:scale-105' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
        <div className={`text-4xl ${iconColorClasses[color]} opacity-80`}>
          {icon}
        </div>
      </div>
    </CardComponent>
  );
}
