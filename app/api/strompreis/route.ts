import { NextResponse } from 'next/server';

export async function GET() {
  const res = await fetch('https://api.energy-charts.info/price?bzn=DE-LU', {
    next: { revalidate: 1800 }, // cache 30 min
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'API nicht erreichbar' }, { status: 502 });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
