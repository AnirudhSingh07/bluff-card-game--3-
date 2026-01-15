import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 🔥 This triggers the socket server
  fetch("/api/socket");

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
