
import { z } from 'zod';
import { kenyanCounties } from './types';

export const LedgerEntryFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters long." }),
  sourceUrl: z.string().url({ message: "Please enter a valid URL." }),
  amount: z.coerce.number().positive({ message: "Amount must be a positive number." }),
  date: z.date({ required_error: "Please select a date." }),
  giver: z.string().min(2, { message: "Giver name must be at least 2 characters long." }),
  recipients: z.string().min(2, { message: "Recipients must be at least 2 characters long." }),
  county: z.enum(kenyanCounties, { required_error: "Please select a county." }),
  town: z.string().optional(),
  description: z.string().min(10, { message: "Description must be at least 10 characters long." }).max(1000, { message: "Description cannot exceed 1000 characters." }),
  tags: z.string().optional(), // Comma-separated string
});

export type LedgerEntryFormData = z.infer<typeof LedgerEntryFormSchema>;

export const ChangePasswordFormSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required." }),
  newPassword: z.string().min(6, { message: "New password must be at least 6 characters long." }),
  confirmPassword: z.string().min(6, { message: "Confirm password must be at least 6 characters long." }),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords do not match.",
  path: ["confirmPassword"], // Set the error on the confirmPassword field
});

export type ChangePasswordFormData = z.infer<typeof ChangePasswordFormSchema>;
