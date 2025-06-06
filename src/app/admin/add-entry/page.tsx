
"use client";

import { useState, useEffect } from 'react';
import LedgerEntryForm from '@/components/admin/LedgerEntryForm';
import type { LedgerEntryFormData } from '@/lib/schemas';
import { addLedgerEntry } from '@/lib/actions';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { getAuth, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function AddLedgerEntryPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
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
          description: "You must be logged in to access this page.",
          variant: "destructive",
        });
        router.push('/login');
      }
      setIsLoadingAuth(false);
    });
    return () => unsubscribe();
  }, [auth, router, toast]);


  const handleFormSubmit = async (data: LedgerEntryFormData) => {
    setIsSubmitting(true);
    try {
      const result = await addLedgerEntry(data);
      if (result.success) {
        toast({
          title: "Success!",
          description: `Ledger entry added successfully. Entry ID: ${result.entryId}`,
        });
        // Optionally reset form or redirect
        // For now, user can add another entry.
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
      setIsSubmitting(false);
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
     return (
         <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
            <ShieldCheck className="h-16 w-16 text-destructive mb-4" />
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="mb-4">Please log in to view this page.</p>
            <Button asChild>
                <Link href="/login">Go to Login</Link>
            </Button>
        </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <Button variant="outline" size="sm" asChild className="mb-6">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary">Add New Ledger Entry</CardTitle>
            <CardDescription>
              Fill in the details below to record a new instance of alleged irregular donation or handout.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LedgerEntryForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
