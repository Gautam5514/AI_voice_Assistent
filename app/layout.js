import "./globals.css";

export const metadata = {
  title: "Saathi Voice Companion",
  description: "A warm voice companion demo for elderly-friendly daily check-ins.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
