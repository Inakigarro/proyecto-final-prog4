import { proxyA, BACKEND_URL } from '../../_helpers';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  return proxyA(`${BACKEND_URL}/api/categories/${id}`, 'GET', request);
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  return proxyA(`${BACKEND_URL}/api/categories/${id}`, 'PUT', request);
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  return proxyA(`${BACKEND_URL}/api/categories/${id}`, 'DELETE', request);
}
