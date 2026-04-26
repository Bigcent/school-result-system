import "./globals.css";

export const metadata = {
  title: "Gradora — Result Processing Made Effortless",
  description: "Automated school result processing for Nigerian primary and secondary schools. Report cards, broadsheets, and rankings — done for you.",
  keywords: "school results, report cards, Nigerian schools, result processing, broadsheet, gradora",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}