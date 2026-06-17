import { proxyA, BACKEND_URL } from '../../_helpers';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyA(`${BACKEND_URL}/api/users/${id}`, 'GET', request);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyA(`${BACKEND_URL}/api/users/${id}`, 'PUT', request);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyA(`${BACKEND_URL}/api/users/${id}`, 'DELETE', request);
}
