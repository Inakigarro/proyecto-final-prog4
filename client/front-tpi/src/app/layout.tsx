import { Metadata } from "next";
import "./globals.css";
import Navbar from "@/component/layout/navbar";

export const metadata: Metadata = {
  title: "TechPoint",
  description:
    "Tu mejor opción para comprar tecnología de calidad a precios competitivos. En TechPoint, nos apasiona ofrecer una amplia gama de productos tecnológicos, desde los últimos smartphones hasta computadoras portátiles y accesorios innovadores. Nuestro compromiso es brindarte una experiencia de compra excepcional, con un servicio al cliente dedicado y productos de alta calidad. Descubre las mejores ofertas y mantente a la vanguardia de la tecnología con TechPoint.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
