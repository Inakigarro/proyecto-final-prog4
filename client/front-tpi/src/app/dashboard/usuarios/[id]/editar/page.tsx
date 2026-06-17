'use client';

import { use } from 'react';
import FormularioUsuario from '@/component/dashboard/FormularioUsuario';

export default function EditarUsuarioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <FormularioUsuario id={id} />;
}
