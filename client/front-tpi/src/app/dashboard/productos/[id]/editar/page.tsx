'use client';

import { use } from 'react';
import FormularioProducto from '@/component/dashboard/FormularioProducto';

export default function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <FormularioProducto id={id} />;
}
