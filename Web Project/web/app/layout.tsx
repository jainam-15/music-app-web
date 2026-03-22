import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Player from "@/components/Player";
import { UserProvider } from "@/components/UserProvider";
import { GlobalAuthModal } from "@/components/GlobalAuthModal";
import { UserGate } from "@/components/UserGate";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Jainam's Music Space | Your Personal Music Hub",
  description: "Experience music like never before with smooth streaming and sync.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.className} bg-black text-white h-full flex overflow-hidden`}>
        <UserProvider>
          {/* AuthModal is ALWAYS outside the gate so it can render even if user is logged out */}
          <GlobalAuthModal />

          {/* UserGate hides everything else if user is not logged in */}
          <UserGate>
             <Sidebar />
             <main className="flex-1 flex flex-col relative overflow-hidden bg-gradient-to-b from-zinc-900/50 to-black">
               <div className="flex-1 overflow-y-auto scroll-smooth">
                 {children}
               </div>
             </main>
             <Player />
          </UserGate>
        </UserProvider>
      </body>
    </html>
  );
}
