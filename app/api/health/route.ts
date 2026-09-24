import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Liveness probe for the container's HEALTHCHECK.
 *
 * It touches the database rather than just returning 200, because a running
 * process with an unwritable data volume is the failure this needs to catch —
 * the site would render but every admin save would fail.
 */
export async function GET(): Promise<NextResponse> {
  try {
    db().prepare('SELECT 1').get();
    return NextResponse.json({ status: 'ok' }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json(
      { status: 'error', detail: 'database unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
