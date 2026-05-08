import "./globals.css";

export const metadata = {
  title: "Prismatique | Premium Gaming Portal",
  description: "The ultimate destination for premium gaming, rewards, and elite casino bonuses.",
  icons: {
    icon: "/pris.png",
    apple: "/pris.png",
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
