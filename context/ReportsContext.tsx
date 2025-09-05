// context/ReportsContext.tsx
import React, { createContext, useContext, useMemo, useState, useCallback } from "react";

export type Report = {
  id: string;                           // local temp id is fine
  photoUri: string;                     // local file (for preview)
  photo_url?: string;                   // public URL from Storage (remote)
  description: string;
  timestamp: string;
  coords: { lat: number; lng: number } | null;
  address: string | null;
  status?: "pending" | "uploaded" | "failed"; // <-- NEW: for optimistic UI
};

type ReportsContextType = {
  reports: Report[];
  addReport: (report: Report) => void;
  updateReport: (id: string, patch: Partial<Report>) => void; // <-- NEW
  replaceReports: (items: Report[]) => void;                  // <-- NEW
};

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

export function ReportsProvider({ children }: { children: React.ReactNode }) {
  const [reports, setReports] = useState<Report[]>([]);

  const addReport = useCallback((report: Report) => {
    setReports((prev) => [report, ...prev]);
  }, []);

  const updateReport = useCallback((id: string, patch: Partial<Report>) => {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const replaceReports = useCallback((items: Report[]) => {
    setReports(items);
  }, []);

  const value = useMemo(
    () => ({ reports, addReport, updateReport, replaceReports }),
    [reports, addReport, updateReport, replaceReports]
  );

  return <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>;
}

export function useReports() {
  const ctx = useContext(ReportsContext);
  if (!ctx) throw new Error("useReports must be used inside ReportsProvider");
  return ctx;
}
