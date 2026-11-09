import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  isPassword = false,
  className = '',
  id,
  type = 'text',
  disabled,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-xs font-mono uppercase tracking-wider text-[#929BAA] select-none"
        >
          {label}
          {props.required && <span className="text-[#00F59B] ml-1">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 text-[#929BAA] pointer-events-none flex items-center">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={inputType}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          className={`
            w-full py-2.5 px-3.5 rounded-xl text-xs font-sans
            bg-[#111722] text-[#F5F7FA] placeholder-[#5F697A]
            border border-[#1E283A]
            transition-all duration-200
            hover:border-[#2E3D56]
            focus:border-[#00F59B] focus:bg-[#161F2E] focus:outline-none
            focus:ring-2 focus:ring-[#00F59B]/20
            disabled:opacity-50 disabled:cursor-not-allowed
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon || isPassword ? 'pr-10' : ''}
            ${error ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/20' : ''}
            ${className}
          `}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(prev => !prev)}
            className="absolute right-3.5 p-1 rounded-lg text-[#929BAA] hover:text-[#F5F7FA] transition-colors focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}

        {!isPassword && rightIcon && (
          <div className="absolute right-3.5 text-[#929BAA] flex items-center">
            {rightIcon}
          </div>
        )}
      </div>

      {error ? (
        <div id={`${inputId}-error`} className="flex items-center gap-1.5 text-xs text-rose-400 mt-1 animate-in fade-in">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : helperText ? (
        <p id={`${inputId}-helper`} className="text-[11px] text-[#5F697A] mt-1 font-mono">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
