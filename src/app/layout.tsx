import type { Metadata } from "next";
import { Box } from "@chakra-ui/react";
import { Provider } from "@/components/chakra/provider";
import ReactQueryProvider from "@/utils/context/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { WEBSITE_DESC, WEBSITE_TITLE } from "@/config/website";
import Header from "@/components/layout/header/";
import { AuthProvider } from "@/utils/context/auth";
import { I18nProvider } from "@/i18n/provider";
import { DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: WEBSITE_TITLE,
  description: WEBSITE_DESC,
  icons: {
    icon: ["/Emblem_of_Mozambique.svg"],
    apple: ["/Emblem_of_Mozambique.svg"],
    shortcut: ["/Emblem_of_Mozambique.svg"],
  },
};

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});
const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt"
      className={`${dmSans.variable} ${dmMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <I18nProvider>
          <ReactQueryProvider>
            <NuqsAdapter>
              <Provider>
                <AuthProvider>
                  <Header />
                  <Box as="main" bg="bg">
                    {children}
                  </Box>
                </AuthProvider>
              </Provider>
            </NuqsAdapter>
          </ReactQueryProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
