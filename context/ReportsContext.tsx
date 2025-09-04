// context/ReportsContext.tsx
import React, { createContext, useContext, useMemo, useState } from "react";

type Report = {
  id: string;              // local temp id ok
  photoUri: string;        // local file (for preview)
  photo_url?: string;      // public URL from Storage
  description: string;
  timestamp: string;
  coords: { lat: number; lng: number } | null;
  address: string | null;
};

type ReportsContextType = {
  reports: Report[];
  addReport: (report: Report) => void;
};

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

export function ReportsProvider({ children }: { children: React.ReactNode }) {
  const [reports, setReports] = useState<Report[]>([]);
  const addReport = (report: Report) => setReports((prev) => [report, ...prev]);
  const value = useMemo(() => ({ reports, addReport }), [reports]);
  return <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>;
}

export function useReports() {
  const ctx = useContext(ReportsContext);
  if (!ctx) throw new Error("useReports must be used inside ReportsProvider");
  return ctx;
}
