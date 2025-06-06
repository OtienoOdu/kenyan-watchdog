
"use client";

import { useState } from 'react';
import type { Filters, KenyanCounty } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, FilterX, Calendar as CalendarIcon, MapPin, UserCircle, TagIcon } from 'lucide-react';
import { format } from "date-fns";

interface LedgerFiltersProps {
  onFilterChange: (filters: Filters) => void;
  allGivers: string[];
  allLocations: KenyanCounty[];
  allTags: string[];
  initialFilters: Filters;
}

const ALL_ITEMS_SELECT_VALUE = "_ALL_ITEMS_"; // Special value for "All" options

export default function LedgerFilters({ 
  onFilterChange, 
  allGivers, 
  allLocations, 
  allTags,
  initialFilters
}: LedgerFiltersProps) {
  const [filters, setFilters] = useState<Filters>(initialFilters);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (name: keyof Filters) => (value: string) => {
    setFilters(prev => ({ ...prev, [name]: value === ALL_ITEMS_SELECT_VALUE ? '' : value }));
  };

  const handleDateChange = (name: 'dateFrom' | 'dateTo') => (date: Date | undefined) => {
    setFilters(prev => ({ ...prev, [name]: date }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange(filters);
  };

  const handleClearFilters = () => {
    const clearedFilters: Filters = {
      keyword: '',
      giver: '',
      location: '',
      category: '',
      dateFrom: undefined,
      dateTo: undefined,
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <Card className="shadow-lg sticky top-4">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center">
          <Search className="h-5 w-5 mr-2 text-primary" />
          Filter Ledger
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="keyword" className="block text-sm font-medium text-foreground mb-1">Keyword</label>
            <Input
              type="text"
              name="keyword"
              id="keyword"
              placeholder="Search title, description..."
              value={filters.keyword}
              onChange={handleInputChange}
              className="bg-card"
            />
          </div>

          <div>
            <label htmlFor="giver" className="block text-sm font-medium text-foreground mb-1">Giver</label>
            <Select 
              value={filters.giver || ALL_ITEMS_SELECT_VALUE} 
              onValueChange={handleSelectChange('giver')}
            >
              <SelectTrigger className="w-full bg-card">
                <UserCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="All Givers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_ITEMS_SELECT_VALUE}>All Givers</SelectItem>
                {allGivers.map(giver => (
                  <SelectItem key={giver} value={giver}>{giver}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-foreground mb-1">Location (County)</label>
            <Select 
              value={filters.location || ALL_ITEMS_SELECT_VALUE} 
              onValueChange={handleSelectChange('location')}
            >
              <SelectTrigger className="w-full bg-card">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="All Counties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_ITEMS_SELECT_VALUE}>All Counties</SelectItem>
                {allLocations.map(loc => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-foreground mb-1">Category/Tag</label>
            <Select 
              value={filters.category || ALL_ITEMS_SELECT_VALUE} 
              onValueChange={handleSelectChange('category')}
            >
              <SelectTrigger className="w-full bg-card">
                <TagIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_ITEMS_SELECT_VALUE}>All Categories</SelectItem>
                {allTags.map(tag => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="dateFrom" className="block text-sm font-medium text-foreground mb-1">Date From</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal bg-card"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateFrom ? format(filters.dateFrom, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateFrom}
                    onSelect={handleDateChange('dateFrom')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label htmlFor="dateTo" className="block text-sm font-medium text-foreground mb-1">Date To</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal bg-card"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateTo ? format(filters.dateTo, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateTo}
                    onSelect={handleDateChange('dateTo')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button type="submit" className="w-full">Apply Filters</Button>
            <Button type="button" variant="outline" onClick={handleClearFilters} className="w-full">
              <FilterX className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
