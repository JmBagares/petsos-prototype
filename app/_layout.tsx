// app/_layout.tsx
import { Stack } from "expo-router";
import React, { createContext, useContext, useState, useMemo } from "react";
import { ReportsProvider } from "../context/ReportsContext";

export default function RootLayout() {
  return (
    <ReportsProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ReportsProvider>
  );
}
