"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RememberingNumbers from "./features/memory/dates/components/remembering-dates.component";
import { FinancialCalculator } from "./features/financial/components/financial-independence-calculator.component";


export default function Home() {
  return (
      <FinancialCalculator />
  );
}
