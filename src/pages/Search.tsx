
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon } from 'lucide-react';

const Search: React.FC = () => {
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Search</h1>
        <p className="text-muted-foreground mt-1">Find stocks, ETFs, and market data</p>
      </div>
      
      <div className="relative mb-6">
        <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
        <Input 
          placeholder="Search symbols, companies, or news..." 
          className="pl-10 h-12"
        />
      </div>
      
      <div className="bg-card rounded-lg shadow-sm p-12 text-center">
        <h2 className="text-xl font-medium text-muted-foreground">Search for stocks, ETFs, and market data</h2>
      </div>
    </MainLayout>
  );
};

export default Search;
