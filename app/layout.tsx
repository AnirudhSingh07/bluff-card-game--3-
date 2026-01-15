import "./globals.css";
import SocketProvider from "./providers/socket-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SocketProvider>
          {children}
        </SocketProvider>
      </body>
    </html>
  );
}
