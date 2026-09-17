import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, CheckCircle2 } from 'lucide-react';

export interface ThemeSelectOption {
  value: string;
  label: string;
  sublabel?: string;
  disabled?: boolean;
}

export interface ThemeSelectProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  options: ThemeSelectOption[];
  placeholder?: string;
  showPlaceholderOption?: boolean;
  className?: string;
  buttonClassName?: string;
  variant?: 'light' | 'dark' | 'glass';
  themeColor?: 'emerald' | 'purple' | 'orange';
  required?: boolean;
}

export const ThemeSelect: React.FC<ThemeSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  className = '',
  buttonClassName = '',
  variant = 'light',
  themeColor = 'emerald',
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOpt = options.find(o => o.value === value);

  const isDark = variant === 'dark';
  const isGlass = variant === 'glass';

  // Role Color Themes mapping (Eye-pleasing soft tones)
  const colorMap = {
    emerald: {
      buttonBorder: isDark || isGlass ? 'border-emerald-400/40 focus:ring-emerald-400/30' : 'border-emerald-200 hover:border-[#0F9D6D] focus:ring-[#0F9D6D]/20',
      chevron: isDark ? 'text-emerald-300' : 'text-[#0F9D6D]',
      popoverBorder: isDark || isGlass ? 'border-[#0F9D6D]/40 bg-[#073626]' : 'border-emerald-200 bg-white',
      selectedItem: isDark ? 'bg-[#0F9D6D]/30 text-emerald-200 font-black' : 'bg-emerald-50 text-emerald-900 font-black',
      hoverItem: isDark ? 'text-slate-200 hover:bg-white/10 hover:text-emerald-300' : 'text-slate-700 hover:bg-emerald-50/60 hover:text-emerald-700',
      checkIcon: isDark ? 'text-emerald-300' : 'text-[#0F9D6D]'
    },
    purple: {
      buttonBorder: isDark || isGlass ? 'border-[#5B5588]/40 focus:ring-[#5B5588]/30' : 'border-[#5B5588]/30 hover:border-[#5B5588] focus:ring-[#5B5588]/20',
      chevron: isDark ? 'text-purple-200' : 'text-[#5B5588]',
      popoverBorder: isDark || isGlass ? 'border-[#5B5588]/40 bg-[#353154]' : 'border-[#5B5588]/30 bg-white',
      selectedItem: isDark ? 'bg-[#5B5588]/30 text-purple-200 font-black' : 'bg-[#5B5588]/10 text-[#5B5588] font-black',
      hoverItem: isDark ? 'text-slate-200 hover:bg-white/10 hover:text-purple-200' : 'text-slate-700 hover:bg-[#5B5588]/10 hover:text-[#5B5588]',
      checkIcon: isDark ? 'text-purple-200' : 'text-[#5B5588]'
    },
    orange: {
      buttonBorder: isDark || isGlass ? 'border-[#9A5B3C]/40 focus:ring-[#9A5B3C]/30' : 'border-[#9A5B3C]/30 hover:border-[#9A5B3C] focus:ring-[#9A5B3C]/20',
      chevron: isDark ? 'text-amber-200' : 'text-[#9A5B3C]',
      popoverBorder: isDark || isGlass ? 'border-[#9A5B3C]/40 bg-[#5A2E1A]' : 'border-[#9A5B3C]/30 bg-white',
      selectedItem: isDark ? 'bg-[#9A5B3C]/30 text-amber-200 font-black' : 'bg-[#9A5B3C]/10 text-[#9A5B3C] font-black',
      hoverItem: isDark ? 'text-slate-200 hover:bg-white/10 hover:text-amber-200' : 'text-slate-700 hover:bg-[#9A5B3C]/10 hover:text-[#9A5B3C]',
      checkIcon: isDark ? 'text-amber-200' : 'text-[#9A5B3C]'
    }
  };

  const themeStyles = colorMap[themeColor] || colorMap.emerald;

  const defaultButtonBg = isDark || isGlass
    ? `bg-white/10 hover:bg-white/15 border text-white font-heading font-extrabold focus:ring-2 ${themeStyles.buttonBorder}`
    : `bg-white border text-slate-800 font-bold focus:ring-2 ${themeStyles.buttonBorder}`;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          {label} {required && <span className="text-rose-600 font-extrabold">*</span>}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 rounded-xl text-xs flex items-center justify-between shadow-xs transition cursor-pointer text-left ${defaultButtonBg} ${buttonClassName}`}
      >
        <span className="truncate pr-2">
          {selectedOpt ? selectedOpt.label : (
            <span className={isDark ? 'text-slate-300 font-normal' : 'text-slate-400 font-normal'}>{placeholder}</span>
          )}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 shrink-0 ${themeStyles.chevron} ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute z-9999 left-0 right-0 mt-1 border rounded-2xl py-1.5 max-h-60 overflow-y-auto animate-fade-in divide-y min-w-[200px] shadow-2xl ${themeStyles.popoverBorder}`}>
          {options.map((opt) => {
            if (opt.disabled) return null;
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-xs text-left flex items-center justify-between font-bold transition cursor-pointer ${
                  isSelected ? themeStyles.selectedItem : themeStyles.hoverItem
                }`}
              >
                <div className="truncate">
                  <span>{opt.label}</span>
                  {opt.sublabel && <span className={`block text-[10px] font-normal ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{opt.sublabel}</span>}
                </div>
                {isSelected && <CheckCircle2 className={`w-4 h-4 shrink-0 ml-2 ${themeStyles.checkIcon}`} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
