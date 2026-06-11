import CartPageClient from '@/component/cart/CartPageClient';

export const metadata = {
  title: 'Mi carrito - TechPoint',
  description: 'Revisá los productos que agregaste antes de finalizar la compra.',
};

export default function CarritoPage() {
  return <CartPageClient />;
}