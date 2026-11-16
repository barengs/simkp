import React from 'react';

/**
 * CapacityGauge Component
 * Menampilkan meteran visual beban bimbingan dosen / kapasitas kuota.
 */
const CapacityGauge = ({
  title,
  current = 0,
  max = 10,
  unit = 'Mahasiswa',
  colorScheme = 'emerald',
  className = '',
}) => {
  const percentage = Math.min(100, Math.round((current / (max || 1)) * 100));
  const isFull = current >= max;
  const isNearFull = percentage >= 80 && !isFull;

  const colorMap = {
    emerald: {
      bar: isFull ? 'bg-rose-500' : isNearFull ? 'bg-amber-500' : 'bg-emerald-500',
      badge: isFull
        ? 'bg-rose-50 text-rose-700 ring-rose-200'
        : isNearFull
        ? 'bg-amber-50 text-amber-700 ring-amber-200'
        : 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    },
    indigo: {
      bar: isFull ? 'bg-rose-500' : isNearFull ? 'bg-amber-500' : 'bg-indigo-500',
      badge: isFull
        ? 'bg-rose-50 text-rose-700 ring-rose-200'
        : isNearFull
        ? 'bg-amber-50 text-amber-700 ring-amber-200'
        : 'bg-indigo-50 text-indigo-700 ring-indigo-200',
    },
  };

  const scheme = colorMap[colorScheme] || colorMap.emerald;

  return (
    <div className={`p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-700">{title}</span>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ring-1 ${scheme.badge}`}>
          {current} / {max} {unit}
        </span>
      </div>

      <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${scheme.bar}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between items-center mt-1.5 text-[10px] text-slate-500">
        <span>Beban: {percentage}%</span>
        <span>{isFull ? 'Kuota Penuh' : `Tersisa ${Math.max(0, max - current)}`}</span>
      </div>
    </div>
  );
};

export default CapacityGauge;

