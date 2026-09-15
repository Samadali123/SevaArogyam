import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface CustomSelectOption {
  value: string;
  label: string;
  sublabel?: string;
  disabled?: boolean;
}

interface CustomSelectProps {
  options: CustomSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select Option',
  disabled = false,
  className = '',
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative w-full font-sans text-xs ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-left text-slate-900 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:bg-white ${
          isOpen ? 'ring-2 ring-[#0F4C81] bg-white border-transparent' : 'hover:border-slate-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className={`truncate ${!selectedOption?.value ? 'text-slate-400 font-medium' : 'text-slate-900 font-bold'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#0F4C81]' : ''}`} />
      </button>

      {/* Hidden Native Input for HTML5 form validation */}
      {required && (
        <input
          type="text"
          value={value}
          onChange={() => {}}
          required={required}
          className="opacity-0 absolute inset-0 pointer-events-none -z-10 w-full h-full"
          tabIndex={-1}
        />
      )}

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto py-1.5 animate-in fade-in slide-in-from-top-2 duration-150 border-slate-200/90">
          {/* Default Unselected / Placeholder Option */}
          <div
            onClick={() => handleSelect('')}
            className={`px-3.5 py-2 cursor-pointer flex items-center justify-between text-xs transition ${
              !value ? 'bg-sky-50 text-[#0F4C81] font-extrabold' : 'text-slate-500 hover:bg-slate-50 font-medium'
            }`}
          >
            <span>{placeholder}</span>
            {!value && <Check className="w-3.5 h-3.5 text-[#0F4C81]" />}
          </div>

          <div className="my-1 border-t border-slate-100" />

          {/* Options List */}
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                onClick={() => !opt.disabled && handleSelect(opt.value)}
                className={`px-3.5 py-2.5 cursor-pointer flex items-center justify-between text-xs transition rounded-lg mx-1 ${
                  isSelected
                    ? 'bg-[#0F4C81] text-white font-extrabold shadow-xs'
                    : 'text-slate-800 hover:bg-slate-100 font-semibold'
                } ${opt.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <div className="flex flex-col">
                  <span>{opt.label}</span>
                  {opt.sublabel && (
                    <span className={`text-[10px] ${isSelected ? 'text-sky-200' : 'text-slate-400'}`}>
                      {opt.sublabel}
                    </span>
                  )}
                </div>
                {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
