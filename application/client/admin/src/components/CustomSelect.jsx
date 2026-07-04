import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const CustomSelect = ({
  options = [],
  value,
  onChange,
  className = '',
  buttonClassName = '',
  placeholder = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const normalizedOptions = options.map(opt => 
    typeof opt === 'object' ? opt : { value: opt, label: opt }
  );

  const selectedOption = normalizedOptions.find(opt => opt.value === value) || { 
    value: '', 
    label: placeholder || normalizedOptions[0]?.label || '' 
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const defaultBtnClass = 'w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-xs font-semibold bg-white text-slate-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-900/10 active:scale-[0.98]';
  const btnClass = buttonClassName || defaultBtnClass;

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`${btnClass} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className="truncate">{selectedOption.label}</span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-slate-800' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 z-50 mt-1.5 w-full min-w-[180px] max-h-60 overflow-y-auto rounded-2xl border border-slate-100 bg-white/95 backdrop-blur-md p-1.5 shadow-xl shadow-slate-200/50 outline-none scrollbar-thin"
          >
            {normalizedOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all truncate flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-900 text-white font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomSelect;
