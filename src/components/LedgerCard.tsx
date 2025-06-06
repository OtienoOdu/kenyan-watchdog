import Link from 'next/link';
import { LedgerEntry } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, UserCircle, MapPin, Tag, Newspaper, CircleDollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LedgerCardProps {
  entry: LedgerEntry;
  onSummaryClick: (entry: LedgerEntry) => void;
}

export default function LedgerCard({ entry, onSummaryClick }: LedgerCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="pb-3">
        <Link href={entry.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
          <CardTitle className="font-headline text-xl text-primary mb-1">{entry.title}</CardTitle>
        </Link>
        <div className="flex items-center text-sm text-muted-foreground">
          <CircleDollarSign className="h-4 w-4 mr-1.5" />
          <span className="font-semibold text-lg text-accent">KES {entry.amount.toLocaleString()}</span>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-2 text-sm">
        <div className="flex items-center text-muted-foreground">
          <CalendarDays className="h-4 w-4 mr-1.5 shrink-0" />
          <span>{formatDate(entry.date)}</span>
        </div>
        <div className="flex items-start text-muted-foreground">
          <UserCircle className="h-4 w-4 mr-1.5 shrink-0 mt-0.5" />
          <div>
            <span className="font-medium text-foreground">Giver:</span> {entry.giver}
          </div>
        </div>
        <div className="flex items-start text-muted-foreground">
          <MapPin className="h-4 w-4 mr-1.5 shrink-0 mt-0.5" />
          <div>
           <span className="font-medium text-foreground">Location:</span> {entry.location.county}{entry.location.town ? `, ${entry.location.town}` : ''}
          </div>
        </div>
        <CardDescription className="pt-1 !mt-3 text-foreground line-clamp-3">
          {entry.description}
        </CardDescription>
        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2">
            <Tag className="h-4 w-4 mr-1 text-muted-foreground shrink-0 mt-1" />
            {entry.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={(e) => {
            e.stopPropagation(); // Prevent card link navigation
            onSummaryClick(entry);
          }}
        >
          <Newspaper className="h-4 w-4 mr-2" />
          View AI Summary
        </Button>
      </CardFooter>
    </Card>
  );
}
