import { Outlet } from "react-router";
import { TopAppBar } from "./TopAppBar";
import { BottomNav } from "./BottomNav";
import { InstallPrompt } from "./InstallPrompt";

export function Layout() {
  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Top App Bar - Sticky */}
      <TopAppBar />
      
      {/* Main Content Area - Scrollable */}
      <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
        <Outlet />
      </main>
      
      {/* Bottom Navigation - Fixed (Mobile Only) */}
      <BottomNav />
      
      {/* PWA Install Prompt */}
      <InstallPrompt />
    </div>
  );
}