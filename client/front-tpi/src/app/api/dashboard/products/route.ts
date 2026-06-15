import { proxyA, BACKEND_URL } from '../_helpers';

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams.toString();
  const url = `${BACKEND_URL}/api/products${params ? `?${params}` : ''}`;
  return proxyA(url, 'GET', request);
}

export async function POST(request: Request) {
  return proxyA(`${BACKEND_URL}/api/products`, 'POST', request);
}
