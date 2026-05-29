import React, { forwardRef } from 'react';
import { X } from 'lucide-react';

// ── Base input sized for touch ──
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}
export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <input
        className={`h-12 px-3 rounded-lg border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-hpr-blue focus:border-hpr-blue ${error ? 'border-red-400' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

// ── Large numeric input (phone-optimized) ──
interface NumInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  value: string | number;
  onChange: (val: string) => void;
  unit?: string;
}
export const NumInput = forwardRef<HTMLInputElement, NumInputProps>(
  ({ label, value, onChange, unit, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <div className="relative flex items-center">
        <input
          ref={ref}
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`h-14 w-full px-3 rounded-lg border border-gray-300 text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-hpr-blue focus:border-hpr-blue ${className}`}
          {...props}
        />
        {unit && (
          <span className="absolute right-3 text-gray-400 text-sm font-medium">{unit}</span>
        )}
      </div>
    </div>
  )
);

// ── Select ──
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}
export function Select({ label, options, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <select
        className={`h-12 px-3 rounded-lg border border-gray-300 text-base bg-white focus:outline-none focus:ring-2 focus:ring-hpr-blue focus:border-hpr-blue ${className}`}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

// ── Toggle / Checkbox ──
interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  description?: string;
}
export function Toggle({ label, checked, onChange, description }: ToggleProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-hpr-blue' : 'bg-gray-300'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </div>
      <div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {description && <p className="text-xs text-gray-400">{description}</p>}
      </div>
    </label>
  );
}

// ── Button ──
interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'gold';
  size?: 'sm' | 'md' | 'lg';
}
export function Btn({ variant = 'primary', size = 'md', className = '', children, ...props }: BtnProps) {
  const variants = {
    primary: 'bg-hpr-blue text-white hover:bg-blue-800 active:bg-blue-900',
    secondary: 'bg-white text-hpr-blue border border-hpr-blue hover:bg-blue-50',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100',
    gold: 'bg-hpr-gold text-hpr-dark hover:bg-yellow-400 font-bold',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-4 py-2.5 text-sm rounded-lg',
    lg: 'px-6 py-3 text-base rounded-xl',
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// ── Card ──
export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
      {children}
    </div>
  );
}

// ── Section Header (blue bar) ──
export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="bg-hpr-blue text-white px-4 py-3 rounded-lg">
      <h3 className="font-semibold text-base">{title}</h3>
      {subtitle && <p className="text-xs text-blue-200 mt-0.5">{subtitle}</p>}
    </div>
  );
}

// ── Modal ──
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}
export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
      <div className={`bg-white w-full ${maxWidth} rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-lg font-semibold text-hpr-dark">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-5">{children}</div>
      </div>
    </div>
  );
}

// ── Color Swatch ──
interface SwatchProps {
  color: string;
  label: string;
  selected?: boolean;
  onClick?: () => void;
}
export function ColorSwatch({ color, label, selected, onClick }: SwatchProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${selected ? 'border-hpr-blue shadow-md' : 'border-transparent hover:border-gray-300'}`}
    >
      <div
        className="w-8 h-8 rounded-full border border-gray-200 shadow-sm"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs text-gray-600 text-center leading-tight max-w-[52px]">{label}</span>
    </button>
  );
}

// ── Stat Badge ──
export function StatBadge({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 text-center">
      <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
      <div className="text-xl font-bold text-hpr-dark mt-0.5">{value}</div>
      {sub && <div className="text-xs text-gray-400">{sub}</div>}
    </div>
  );
}
