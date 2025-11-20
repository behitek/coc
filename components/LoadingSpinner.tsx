import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-coc-gold">
      <Loader2 className="w-12 h-12 animate-spin mb-4" />
      <p className="text-lg font-semibold">Summoning Troops...</p>
    </div>
  );
};
