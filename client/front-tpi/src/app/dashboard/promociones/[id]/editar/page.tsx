'use client';

import { use } from 'react';
import FormularioPromocion from '@/component/dashboard/FormularioPromocion';

export default function EditarPromocionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <FormularioPromocion id={id} />;
}
