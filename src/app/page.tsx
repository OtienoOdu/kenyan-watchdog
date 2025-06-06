
"use client";

import { useState, useEffect, useMemo } from 'react';
import type { LedgerEntry, Filters, KenyanCounty } from '@/lib/types';
import { kenyanCounties } from '@/lib/types';
import KenyaWatchdogHeader from '@/components/KenyaWatchdogHeader';
import TotalLossCounter from '@/components/TotalLossCounter';
import LedgerCard from '@/components/LedgerCard';
import LedgerFilters from '@/components/LedgerFilters';
import DataVisualization from '@/components/DataVisualization';
import ArticleSummaryModal from '@/components/ArticleSummaryModal';
import { Button } from '@/components/ui/button';
import { ArrowUp, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { rtdb } from '@/lib/firebase'; // Import rtdb
import { ref, get, query as rtdbQuery } from 'firebase/database'; // RTDB functions
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'; 

export default function Home() {
  const [allEntries, setAllEntries] = useState<LedgerEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<LedgerEntry[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    keyword: '',
    giver: '',
    location: '',
    category: '',
    dateFrom: undefined,
    dateTo: undefined,
  });

  const [selectedEntryForSummary, setSelectedEntryForSummary] = useState<LedgerEntry | null>(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const fetchEntries = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const entriesRef = ref(rtdb, 'ledger_entries');
        const dataQuery = rtdbQuery(entriesRef); 
        
        console.log("Fetching from Realtime Database path: ledger_entries");
        const snapshot = await get(dataQuery);
        console.log("Snapshot exists:", snapshot.exists());

        if (snapshot.exists()) {
          const entriesData: LedgerEntry[] = [];
          snapshot.forEach(childSnapshot => {
            const entryId = childSnapshot.key;
            const entryData = childSnapshot.val();
            console.log("Processing entry from RTDB:", entryId, entryData);
            
            let dateStr: string;
            if (typeof entryData.date === 'string') {
              dateStr = entryData.date.split('T')[0]; 
            } else {
              console.warn("Unexpected date format for entry:", entryId, entryData.date);
              dateStr = new Date().toISOString().split('T')[0]; // Fallback
            }

            entriesData.push({
              id: entryId!,
              ...entryData,
              date: dateStr, 
              title: entryData.title || "",
              sourceUrl: entryData.sourceUrl || "",
              amount: entryData.amount || 0,
              giver: entryData.giver || "",
              recipients: entryData.recipients || "",
              location: entryData.location || { county: "", town: "" },
              description: entryData.description || "",
              tags: Array.isArray(entryData.tags) ? entryData.tags : [],
            } as LedgerEntry);
          });
          
          const sortedEntries = entriesData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          console.log("Fetched and sorted entries:", sortedEntries.length);
          setAllEntries(sortedEntries);
          setFilteredEntries(sortedEntries); 
        } else {
          console.log("No entries found in Realtime Database.");
          setAllEntries([]);
          setFilteredEntries([]);
        }
      } catch (err: any) {
        console.error("Error fetching ledger entries from Realtime Database:", err);
        setError(`Failed to load ledger entries: ${err.message || "Unknown error"}. Please try again later.`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();
  }, []);

  useEffect(() => {
    const total = allEntries.reduce((sum, entry) => sum + entry.amount, 0);
    setTotalAmount(total);
  }, [allEntries]);

  useEffect(() => {
    let newFilteredEntries = [...allEntries];

    if (filters.keyword) {
      const keywordLower = filters.keyword.toLowerCase();
      newFilteredEntries = newFilteredEntries.filter(
        entry =>
          entry.title.toLowerCase().includes(keywordLower) ||
          entry.description.toLowerCase().includes(keywordLower) ||
          entry.giver.toLowerCase().includes(keywordLower) ||
          entry.recipients.toLowerCase().includes(keywordLower)
      );
    }
    if (filters.giver) {
      newFilteredEntries = newFilteredEntries.filter(entry => entry.giver === filters.giver);
    }
    if (filters.location) {
      newFilteredEntries = newFilteredEntries.filter(entry => entry.location.county === filters.location);
    }
    if (filters.category) {
      newFilteredEntries = newFilteredEntries.filter(entry => entry.tags.includes(filters.category));
    }
    if (filters.dateFrom) {
      newFilteredEntries = newFilteredEntries.filter(entry => new Date(entry.date) >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      const inclusiveDateTo = new Date(filters.dateTo);
      newFilteredEntries = newFilteredEntries.filter(entry => new Date(entry.date) <= inclusiveDateTo);
    }
    
    setFilteredEntries(newFilteredEntries);
  }, [filters, allEntries]);

  const uniqueGivers = useMemo(() => Array.from(new Set(allEntries.map(entry => entry.giver))).sort(), [allEntries]);
  const uniqueTags = useMemo(() => Array.from(new Set(allEntries.flatMap(entry => entry.tags))).sort(), [allEntries]);

  const handleSummaryClick = (entry: LedgerEntry) => {
    setSelectedEntryForSummary(entry);
    setIsSummaryModalOpen(true);
  };
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const checkScrollTop = () => {
      if (!showScrollTop && window.pageYOffset > 400) {
        setShowScrollTop(true);
      } else if (showScrollTop && window.pageYOffset <= 400) {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', checkScrollTop);
    return () => window.removeEventListener('scroll', checkScrollTop);
  }, [showScrollTop]);

  const renderSkeletons = () => (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
      {[...Array(6)].map((_, index) => (
        <Card key={index} className="shadow-lg flex flex-col h-full">
          <CardHeader className="pb-3">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-5 w-1/2" />
          </CardHeader>
          <CardContent className="flex-grow space-y-2 text-sm">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full mt-3" />
            <Skeleton className="h-4 w-4/5" />
            <div className="flex flex-wrap gap-1 pt-2">
              <Skeleton className="h-5 w-12 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </CardContent>
          <CardFooter className="pt-4">
            <Skeleton className="h-9 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <KenyaWatchdogHeader />
      
      <main className="flex-grow container mx-auto py-8 px-4">
        <section className="mb-10">
          <TotalLossCounter totalAmount={totalAmount} />
        </section>

        <Separator className="my-8 bg-primary/30 h-0.5" />

        <div className="grid lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-3">
            <LedgerFilters
              onFilterChange={setFilters}
              allGivers={uniqueGivers}
              allLocations={kenyanCounties}
              allTags={uniqueTags}
              initialFilters={filters}
            />
          </aside>

          <section className="lg:col-span-9">
            <h2 className="text-3xl font-headline font-semibold text-primary mb-6">The People's Ledger</h2>
            {isLoading && renderSkeletons()}
            {!isLoading && error && (
              <div className="text-center py-10 bg-card rounded-lg shadow">
                <p className="text-xl text-destructive">{error}</p>
              </div>
            )}
            {!isLoading && !error && filteredEntries.length > 0 && (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredEntries.map(entry => (
                  <LedgerCard key={entry.id} entry={entry} onSummaryClick={handleSummaryClick} />
                ))}
              </div>
            )}
            {!isLoading && !error && filteredEntries.length === 0 && allEntries.length > 0 && (
               <div className="text-center py-10 bg-card rounded-lg shadow">
                 <p className="text-xl text-muted-foreground">No entries match your current filters.</p>
                 <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or clearing filters.</p>
               </div>
            )}
             {!isLoading && !error && allEntries.length === 0 && (
               <div className="text-center py-10 bg-card rounded-lg shadow">
                 <p className="text-xl text-muted-foreground">No ledger entries found in the database.</p>
                 <p className="text-sm text-muted-foreground mt-2">Please check back later or add new entries via the admin dashboard. Ensure your Realtime Database security rules allow public reads for the '/ledger_entries' path if data is not appearing.</p>
               </div>
            )}
          </section>
        </div>
        
        <Separator className="my-12 bg-primary/30 h-0.5" />

        <section className="mt-8">
          <DataVisualization data={allEntries} />
        </section>
      </main>

      <footer className="bg-card text-foreground py-6 text-center border-t">
        <p className="text-sm">&copy; {new Date().getFullYear()} Kenya Watchdog. All rights reserved.</p>
        <p className="text-xs mt-1 text-muted-foreground">Fostering Transparency and Accountability.</p>
      </footer>

      {isSummaryModalOpen && selectedEntryForSummary && (
        <ArticleSummaryModal
          articleUrl={selectedEntryForSummary.sourceUrl}
          articleTitle={selectedEntryForSummary.title}
          isOpen={isSummaryModalOpen}
          onClose={() => setIsSummaryModalOpen(false)}
        />
      )}

      {showScrollTop && (
        <Button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 p-3 h-auto rounded-full shadow-lg"
            variant="default"
            aria-label="Scroll to top"
          >
          <ArrowUp className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}

