import React from 'react';
import { Check, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * StepperTimeline Component
 * Menampilkan linimasa status siklus hidup KP / TA dengan visual interaktif.
 */
const StepperTimeline = ({ steps = [], className = '' }) => {
  if (!steps.length) return null;

  return (
    <div className={`w-full bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-xs ${className}`}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-800">Lintasan Progres Akademik</h3>
          <p className="text-xs text-slate-500 mt-0.5">Pantau status pengajuan dan langkah yang harus Anda selesaikan.</p>
        </div>
      </div>

      <div className="relative">
        {/* Track Line (Desktop) */}
        <div className="hidden md:block absolute top-5 left-6 right-6 h-0.5 bg-slate-200 -z-0" />

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-2 relative z-10">
          {steps.map((step, idx) => {
            const isCompleted = step.status === 'completed';
            const isCurrent = step.status === 'current';
            const isWarning = step.status === 'warning';
            const isPending = step.status === 'pending';

            return (
              <div
                key={step.id || idx}
                className={`flex md:flex-col items-start md:items-center text-left md:text-center gap-3.5 md:gap-2 p-3 md:p-2 rounded-xl transition-all ${
                  isCurrent ? 'bg-emerald-50/60 md:bg-transparent ring-1 ring-emerald-200 md:ring-0' : ''
                }`}
              >
                {/* Node Icon */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 shadow-xs ${
                    isCompleted
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                      : isCurrent
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-200 animate-pulse'
                      : isWarning
                      ? 'bg-amber-500 text-white ring-4 ring-amber-100'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  ) : isCurrent ? (
                    <Clock className="w-5 h-5 stroke-[2]" />
                  ) : isWarning ? (
                    <AlertCircle className="w-5 h-5 stroke-[2]" />
                  ) : (
                    <span className="text-xs font-bold">{idx + 1}</span>
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 md:w-full">
                  <p
                    className={`text-xs font-bold leading-tight truncate ${
                      isCompleted
                        ? 'text-slate-800'
                        : isCurrent
                        ? 'text-emerald-700'
                        : isWarning
                        ? 'text-amber-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{step.subtitle || step.date || '-'}</p>

                  {/* Optional Action CTA */}
                  {step.actionLink && (
                    <Link
                      to={step.actionLink}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 mt-1.5 transition-colors"
                    >
                      <span>{step.actionText || 'Buka'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StepperTimeline;

