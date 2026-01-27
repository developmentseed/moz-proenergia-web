import type { Metadata } from "next";
import { Box } from "@chakra-ui/react";
import { Provider } from "@/components/chakra/provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import Header from "@/components/layout/header";
import { DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "Proenergia + IEP",
  description: "Proenergia",
  icons: {
    icon: ["/Logo.svg"],
    apple: ["/Logo.svg"],
    shortcut: ["/Logo.svg"],
  },
};

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"]
});
const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"]
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmMono.variable}`} suppressHydrationWarning>
      <body>
        <NuqsAdapter>
          <Provider>
            <Header />
            <Box as='main' bg={"panelBg"}>
              {children}
            </Box>
            {/* <footer> Footer</footer> */}
          </Provider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
