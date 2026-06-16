import { proxyA, BACKEND_URL } from '../../_helpers';

export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return proxyA(`${BACKEND_URL}/api/slides/${id}`, 'GET', request);
}

export async function PUT(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return proxyA(`${BACKEND_URL}/api/slides/${id}`, 'PUT', request);
}

export async function DELETE(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return proxyA(`${BACKEND_URL}/api/slides/${id}`, 'DELETE', request);
}
