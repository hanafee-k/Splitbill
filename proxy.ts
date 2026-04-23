import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  // Placeholder middleware for session auth — implement as needed
  return NextResponse.next();
}
