import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/admin-auth';
import {
  getSql,
  ensureSchema,
  dbEnvVarName,
  presentDbVars,
  dbLikeEnvKeys,
} from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Admin-only database diagnostics. Log in at /admin first, then open
// /api/db-check in the same browser to see exactly why writes fail.
export async function GET() {
  if (!isAuthed()) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const sql = getSql();
  const envVar = dbEnvVarName();
  const presentVars = presentDbVars();

  if (!sql) {
    return NextResponse.json({
      connected: false,
      reason: 'no_connection_string',
      hint: 'No Neon/Postgres connection string is set in this deployment. Link the Neon integration to THIS project, enable it for the environment you are viewing (Preview and Production), then REDEPLOY (env changes do not apply to existing deployments).',
      recognisedVarsPresent: presentVars,
      // Names only (no values) — shows what the integration actually injected.
      dbLikeEnvKeys: dbLikeEnvKeys(),
    });
  }

  try {
    await ensureSchema(sql);
    const rows = (await sql`
      select
        (select count(*) from prayers)::int as prayers,
        (select count(*) from rsvps)::int as rsvps
    `) as { prayers: number; rsvps: number }[];
    return NextResponse.json({
      connected: true,
      envVar,
      counts: rows[0],
    });
  } catch (err) {
    return NextResponse.json(
      {
        connected: false,
        reason: 'query_failed',
        envVar,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
