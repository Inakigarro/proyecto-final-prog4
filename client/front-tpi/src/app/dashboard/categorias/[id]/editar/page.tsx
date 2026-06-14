'use client';

import { use } from 'react';
import FormularioCategoria from '@/component/dashboard/FormularioCategoria';

export default function EditarCategoriaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <FormularioCategoria id={id} />;
}
