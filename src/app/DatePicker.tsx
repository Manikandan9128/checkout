"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface DatePickerProps {
  value: string; // "YYYY-MM-DD"
  onChange: (value: string) => void;
  max?: string;
  className?: string;
  placeholder?: string;
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

export default function DatePicker({ value, onChange, max, className, placeholder = "dd/mm/yyyy" }: DatePickerProps) {
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
  const changeYear = (newYear: number) => setViewDate(new Date(newYear, month, 1));

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${className} flex items-center justify-between text-left`}
        style={{ borderWidth: "1px", borderStyle: "solid", borderColor: "#D1D5DB" }}
      >
        <span className={selected ? "" : "text-gray-400"}>{selected ? formatDisplay(selected) : placeholder}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-400">
          <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-72 rounded-xl border border-gray-200 bg-white p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <button type="button" onClick={() => changeMonth(-1)} className="flex h-8 w-8 items-center justify-center rounded-full text-purple-700 hover:bg-purple-50">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
              <span>{MONTHS[month]}</span>
              <YearDropdown year={year} maxYear={maxDate ? maxDate.getFullYear() : new Date().getFullYear() + 50} onSelect={changeYear} />
            </div>
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
                  style={isSelected ? { backgroundColor: "#7e22ce", color: "#ffffff" } : undefined}
                  className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full transition ${
                    isSelected
                      ? "font-semibold"
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

const YEAR_RANGE_PAST = 100;
const YEAR_RANGE_FUTURE = 50;

function YearDropdown({
  year,
  maxYear,
  onSelect,
}: {
  year: number;
  maxYear: number;
  onSelect: (year: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    const hi = Math.max(maxYear, current, year);
    const lo = hi - YEAR_RANGE_PAST - YEAR_RANGE_FUTURE;
    const list: number[] = [];
    for (let y = hi; y >= lo; y--) list.push(y);
    return list;
  }, [maxYear, year]);

  const filteredYears = useMemo(() => {
    if (!query.trim()) return years;
    return years.filter((y) => String(y).includes(query.trim()));
  }, [years, query]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActiveIndex(Math.max(0, years.indexOf(year)));
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [open, year, years]);

  useEffect(() => {
    if (!open) return;
    itemRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex, filteredYears]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const commit = (y: number) => {
    onSelect(y);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filteredYears.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredYears[activeIndex] !== undefined) commit(filteredYears[activeIndex]);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="rounded-md px-1.5 py-0.5 text-sm font-semibold text-gray-900 hover:bg-purple-50"
      >
        {year}
      </button>

      {open && (
        <div className="absolute left-1/2 z-50 mt-1 w-32 -translate-x-1/2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value.replace(/[^0-9]/g, ""));
              setActiveIndex(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search year"
            aria-label="Search year"
            className="w-full border-b border-gray-200 px-2 py-1.5 text-sm text-gray-700 outline-none placeholder:text-gray-400"
          />
          <div
            ref={listRef}
            role="listbox"
            aria-label="Select year"
            className="max-h-48 overflow-y-auto py-1"
          >
            {filteredYears.length === 0 && (
              <div className="px-2 py-1.5 text-center text-sm text-gray-400">No results</div>
            )}
            {filteredYears.map((y, i) => {
              const isSelected = y === year;
              const isActive = i === activeIndex;
              return (
                <button
                  key={y}
                  ref={(el) => { itemRefs.current[i] = el; }}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => commit(y)}
                  onMouseEnter={() => setActiveIndex(i)}
                  style={isSelected ? { backgroundColor: "#7e22ce", color: "#ffffff" } : undefined}
                  className={`block w-full px-2 py-1.5 text-center text-sm transition ${
                    isSelected
                      ? "font-semibold"
                      : isActive
                      ? "bg-purple-100 text-gray-900"
                      : "text-gray-700"
                  }`}
                >
                  {y}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
