// src/components/SearchField/SearchField.component.tsx
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  fullWidth?: boolean;
  className?: string;
}

export const SearchField: React.FC<SearchFieldProps> = ({
  value,
  onChange,
  placeholder = 'Buscar por nome...',
  fullWidth = false,
  className
}) => {
  return (
    <div className={cn("relative", fullWidth ? "w-full" : "w-[350px]", className)}>
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary"
        size={18}
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 h-10 bg-background border-primary/10 hover:border-primary/30 focus-visible:ring-primary/20 transition-all rounded-xl shadow-sm"
      />
    </div>
  );
};
