import type { Metadata } from "next";
import { Mukta } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { DevLinkProvider } from "@/devlink/DevLinkProvider";

const mukta = Mukta({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-mukta",
});

export const metadata: Metadata = {
  title: "Saksham Senior - Complete Your Subscription",
  description: "Subscribe to Saksham Senior plans",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="stylesheet" href="https://cdn.prod.website-files.com/69df9a13ad765128599ea0d4/css/saksham-senior-staging.webflow.shared.8e49e9ba7.css" />
      </head>
      <body className={`${mukta.variable} antialiased`}>
        <DevLinkProvider>
          {children}
        </DevLinkProvider>
        <Script src="https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js" integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=" crossOrigin="anonymous" strategy="beforeInteractive" />
        <Script src="https://cdn.prod.website-files.com/69df9a13ad765128599ea0d4/js/saksham-senior-staging.webflow.5c6319e71.js" crossOrigin="anonymous" strategy="afterInteractive" />
      </body>
    </html>
  );
}
