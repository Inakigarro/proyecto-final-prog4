import FormularioSlide from '@/component/dashboard/FormularioSlide';

/**
 * Página `/dashboard/slider/nuevo` — alta de un slide.
 * El acceso queda gateado por el layout del dashboard (roles dueno y superadmin).
 */
export default function NuevoSlidePage() {
  return <FormularioSlide />;
}
