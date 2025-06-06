
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // This can be removed if using FormLabel everywhere
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, KeyRound, Loader2, ShieldCheck } from 'lucide-react';
import { getAuth, EmailAuthProvider, reauthenticateWithCredential, updatePassword, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { ChangePasswordFormData } from '@/lib/schemas';
import { ChangePasswordFormSchema } from '@/lib/schemas';

export default function AccountSettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        toast({
          title: "Access Denied",
          description: "You must be logged in to access account settings.",
          variant: "destructive",
        });
        router.push('/login');
      }
      setIsLoadingAuth(false);
    });
    return () => unsubscribe();
  }, [auth, router, toast]);

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(ChangePasswordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleChangePassword = async (data: ChangePasswordFormData) => {
    setIsLoading(true);
    setServerError(null);
    
    if (!currentUser || !currentUser.email) {
      setServerError("User not found or email not available. Please re-login.");
      setIsLoading(false);
      return;
    }

    const credential = EmailAuthProvider.credential(currentUser.email, data.currentPassword);

    try {
      await reauthenticateWithCredential(currentUser, credential);
      // User re-authenticated, now update password
      await updatePassword(currentUser, data.newPassword);
      toast({
        title: "Password Updated Successfully!",
        description: "Your password has been changed.",
      });
      form.reset(); // Reset form fields
    } catch (error: any) {
      let errorMessage = "An unexpected error occurred.";
      if (error.code) {
        switch (error.code) {
          case 'auth/wrong-password':
            errorMessage = 'Incorrect current password.';
            form.setError("currentPassword", { type: "manual", message: errorMessage });
            break;
          case 'auth/weak-password':
            errorMessage = 'The new password is too weak.';
            form.setError("newPassword", { type: "manual", message: errorMessage });
            break;
          default:
            errorMessage = error.message || "Password change failed.";
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      setServerError(errorMessage);
      toast({
        variant: "destructive",
        title: "Password Change Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
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
      <div className="max-w-xl mx-auto">
        <Button variant="outline" size="sm" asChild className="mb-6">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
                <KeyRound className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl font-headline text-primary">Account Settings</CardTitle>
            </div>
            <CardDescription>
              Manage your account details, including changing your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleChangePassword)} className="space-y-6">
                {serverError && !form.formState.errors.currentPassword && !form.formState.errors.newPassword && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{serverError}</AlertDescription>
                  </Alert>
                )}
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter your current password" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter your new password" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Confirm your new password" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Change Password"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
