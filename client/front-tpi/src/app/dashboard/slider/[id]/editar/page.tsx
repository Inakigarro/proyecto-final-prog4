import FormularioSlide from '@/component/dashboard/FormularioSlide';

interface EditarSlidePageProps {
  params: Promise<{ id: string }>;
}

/**
 * Página `/dashboard/slider/[id]/editar` — edición de un slide existente.
 * El formulario detecta el id por prop y precarga los datos.
 */
export default async function EditarSlidePage({ params }: EditarSlidePageProps) {
  const { id } = await params;
  return <FormularioSlide id={id} />;
}
