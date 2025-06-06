import { ShieldAlert, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function KenyaWatchdogHeader() {
  return (
    <header className="bg-background py-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <ShieldAlert className="h-10 w-10 text-primary" />
          <h1 className="text-3xl font-headline font-bold text-primary">
            Kenya Watchdog
          </h1>
        </Link>
        <Button asChild variant="outline">
          <Link href="/dashboard">
            <LayoutDashboard className="mr-2 h-5 w-5" />
            Dashboard
          </Link>
        </Button>
      </div>
    </header>
  );
}
