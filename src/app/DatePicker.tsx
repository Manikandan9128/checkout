"use client";

import { useEffect, useRef, useState } from "react";

interface DatePickerProps {
  value: string; // "YYYY-MM-DD"
  onChange: (value: string) => void;
  max?: string;
  className?: string;
  placeholder?: string;
  required?: boolean;
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WEEKDAYS = ["S","M","T","W","T","F","S"];

function parseDate(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function formatValue(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDisplay(d: Date): string {
  const day = String(d.getDate()).padStart(2, "0");
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${m}/${d.getFullYear()}`;
}

export default function DatePicker({ value, onChange, max, className, placeholder = "dd/mm/yyyy", required }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = parseDate(value);
  const maxDate = max ? parseDate(max) : null;
  const [viewDate, setViewDate] = useState(() => selected ?? maxDate ?? new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selected) setViewDate(selected);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const isDisabled = (d: Date) => (maxDate ? d > maxDate : false);

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day));

  const changeMonth = (delta: number) => setViewDate(new Date(year, month + delta, 1));

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${className} flex items-center justify-between text-left`}
      >
        <span className={selected ? "" : "text-gray-400"}>{selected ? formatDisplay(selected) : placeholder}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-400">
          <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      {required && !selected && <input tabIndex={-1} aria-hidden className="sr-only" required value="" onChange={() => {}} />}

      {open && (
        <div className="absolute z-50 mt-2 w-72 rounded-xl border border-gray-200 bg-white p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <button type="button" onClick={() => changeMonth(-1)} className="flex h-8 w-8 items-center justify-center rounded-full text-purple-700 hover:bg-purple-50">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <div className="text-sm font-semibold text-gray-900">{MONTHS[month]} {year}</div>
            <button type="button" onClick={() => changeMonth(1)} className="flex h-8 w-8 items-center justify-center rounded-full text-purple-700 hover:bg-purple-50">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
          <div className="mb-1 grid grid-cols-7 text-center text-xs font-medium text-gray-400">
            {WEEKDAYS.map((w, i) => <div key={i}>{w}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-y-1 text-center text-sm">
            {cells.map((d, i) => {
              if (!d) return <div key={i} />;
              const disabled = isDisabled(d);
              const isSelected = selected && formatValue(d) === formatValue(selected);
              return (
                <button
                  key={i}
                  type="button"
                  disabled={disabled}
                  onClick={() => { onChange(formatValue(d)); setOpen(false); }}
                  className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full transition ${
                    isSelected
                      ? "bg-purple-600 text-white font-semibold"
                      : disabled
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-700 hover:bg-purple-100"
                  }`}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
