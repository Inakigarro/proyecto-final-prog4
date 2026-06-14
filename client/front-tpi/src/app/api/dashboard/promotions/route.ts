import { proxyA, BACKEND_URL } from '../_helpers';

export async function GET(request: Request) {
  return proxyA(`${BACKEND_URL}/api/promotions`, 'GET', request);
}

export async function POST(request: Request) {
  return proxyA(`${BACKEND_URL}/api/promotions`, 'POST', request);
}
