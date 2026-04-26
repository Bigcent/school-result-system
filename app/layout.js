import "./globals.css";
import { ThemeProvider } from "@/lib/ThemeContext";

export const metadata = {
  title: "Gradora — Result Processing Made Effortless",
  description: "Automated school result processing for Nigerian primary and secondary schools. Report cards, broadsheets, and rankings — done for you.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}