import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  // 1. Session clear ya token delete ka logic
  const cookieStore = await cookies();
  cookieStore.delete('token'); // aapke token ka naam

  // 2. Main Dashboard par redirect kar dein
  redirect('/dashboard'); // ya jo bhi aapka main dashboard route ho (e.g. '/')
}