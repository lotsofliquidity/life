"use client"
import '@/app/globals.css';
import RememberingDates from "@/app/features/memory/dates/components/remembering-dates.component";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function Dates() {
  return <div>
    <QueryClientProvider client={new QueryClient()}>
        <RememberingDates />
    </QueryClientProvider>
  </div>
}