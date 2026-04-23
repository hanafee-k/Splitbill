// components/ui/Input.tsx
import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  className = "",
  ...props
}) => (
  <div className="flex flex-col">
    {label && (
      <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
        {label}
      </label>
    )}
    <input
      className={`px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 ${className}`}
      {...props}
    />
  </div>
);
