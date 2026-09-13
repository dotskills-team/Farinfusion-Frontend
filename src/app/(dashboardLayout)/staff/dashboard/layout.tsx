"use client";

import AiChatWidget from "@/components/ai-chat/AiChatWidget";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useGlobalBarcodeScanner } from "@/hooks/useGlobalBarcodeScanner";

function GlobalScanner() {
  useGlobalBarcodeScanner();
  return null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <GlobalScanner />
      <DashboardContent>
        {children}
        {/* <AiChatWidget /> */}
      </DashboardContent>
    </SidebarProvider>
  );
}
