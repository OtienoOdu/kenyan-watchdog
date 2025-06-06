
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Settings, FileText, HomeIcon, LogOut, Loader2, ShieldCheck } from 'lucide-react';
import LedgerEntryForm from '@/components/admin/LedgerEntryForm';
import type { LedgerEntryFormData } from '@/lib/schemas';
import { addLedgerEntry } from '@/lib/actions';
import { useToast } from "@/hooks/use-toast";
import { getAuth, signOut, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { app } from '@/lib/firebase';

export default function DashboardPage() {
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        toast({
          title: "Access Denied",
          description: "You must be logged in to access the dashboard.",
          variant: "destructive",
        });
        router.push('/login');
      }
      setIsLoadingAuth(false);
    });
    return () => unsubscribe();
  }, [auth, router, toast]);

  const handleFormSubmit = async (data: LedgerEntryFormData) => {
    setIsSubmittingForm(true);
    try {
      const result = await addLedgerEntry(data);
      if (result.success) {
        toast({
          title: "Success!",
          description: `Ledger entry added successfully. Entry ID: ${result.entryId}`,
        });
        // Optionally reset form or redirect
      } else {
        toast({
          title: "Error Adding Entry",
          description: result.error || "An unknown error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Submission Error",
        description: "An unexpected error occurred during submission.",
        variant: "destructive",
      });
      console.error("Form submission error:", error);
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      router.push('/login');
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Failed",
        description: "An error occurred while logging out.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg">Authenticating...</p>
      </div>
    );
  }

  if (!currentUser) {
    // This state should ideally not be reached if redirection works, but it's a fallback.
    return (
         <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
            <ShieldCheck className="h-16 w-16 text-destructive mb-4" />
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="mb-4">Please log in to view the dashboard.</p>
            <Button asChild>
                <Link href="/login">Go to Login</Link>
            </Button>
        </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 min-h-screen">
      <header className="mb-10">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-primary rounded-full p-3 w-fit">
                    <User className="h-8 w-8 text-primary-foreground" />
                </div>
                <div>
                    <h1 className="text-3xl font-headline text-primary">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Manage Kenya Watchdog content and settings. Welcome, {currentUser.displayName || currentUser.email}!</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                    <Link href="/">
                        <HomeIcon className="mr-2 h-4 w-4" />
                        Homepage
                    </Link>
                </Button>
                <Button variant="destructive" size="sm" onClick={handleLogout} disabled={isLoggingOut}>
                    {isLoggingOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
                    Logout
                </Button>
            </div>
        </div>
      </header>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-headline text-primary flex items-center">
                <FileText className="mr-3 h-6 w-6" />
                Add New Ledger Entry
              </CardTitle>
              <CardDescription>
                Fill in the details below to record a new instance of alleged irregular donation or handout. 
                Ensure the "Source/Article URL" is provided for fact-checking.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LedgerEntryForm onSubmit={handleFormSubmit} isSubmitting={isSubmittingForm} />
            </CardContent>
          </Card>
        </div>

        <aside className="md:col-span-1 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-headline text-primary">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" asChild className="w-full justify-start">
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-5 w-5" /> Account Settings
                </Link>
              </Button>
              {/* Add more admin links here as needed */}
            </CardContent>
          </Card>
          
          <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-xl font-headline text-primary">Instructions</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
                <p><strong>Title:</strong> A concise, descriptive title for the incident.</p>
                <p><strong>Source URL:</strong> Mandatory link to the news article or report for verification.</p>
                <p><strong>Amount:</strong> Estimated monetary value in KES.</p>
                <p><strong>Date:</strong> When the transaction occurred.</p>
                <p><strong>Giver:</strong> Politician, entity, or individual who gave funds.</p>
                <p><strong>Recipient(s):</strong> Who received the funds (e.g., "Youth group in Nakuru").</p>
                <p><strong>Location:</strong> County and (optionally) town.</p>
                <p><strong>Description:</strong> Summary of the incident and its context.</p>
                <p><strong>Tags:</strong> Comma-separated keywords (e.g., "election handout, harambee").</p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
