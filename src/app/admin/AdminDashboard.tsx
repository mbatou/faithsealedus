'use client';

import { useMemo } from 'react';
import { logout } from './actions';
import { useLanguage } from '@/context/LanguageContext';

export interface RsvpRow {
  id: string;
  name: string;
  email: string;
  attending_ghana: boolean;
  attending_senegal: boolean;
  party_size: number;
  dietary_notes: string | null;
  message: string | null;
  created_at: string;
}

function toCsv(rows: RsvpRow[]): string {
  const headers = [
    'name',
    'email',
    'attending_ghana',
    'attending_senegal',
    'party_size',
    'dietary_notes',
    'message',
    'created_at',
  ];

  const escape = (value: unknown) => {
    const s = value === null || value === undefined ? '' : String(value);
    // Quote and escape per RFC 4180.
    return `"${s.replace(/"/g, '""')}"`;
  };

  const lines = [
    headers.join(','),
    ...rows.map((r) =>
      [
        r.name,
        r.email,
        r.attending_ghana,
        r.attending_senegal,
        r.party_size,
        r.dietary_notes ?? '',
        r.message ?? '',
        r.created_at,
      ]
        .map(escape)
        .join(','),
    ),
  ];

  return lines.join('\r\n');
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-5 text-center">
      <div className="font-serif text-4xl font-semibold text-gold">{value}</div>
      <div className="mt-1 text-[0.65rem] uppercase tracking-[0.15em] text-ivory-dim/60">
        {label}
      </div>
    </div>
  );
}

export function AdminDashboard({ rows }: { rows: RsvpRow[] }) {
  const { t } = useLanguage();
  const a = t.admin;

  const stats = useMemo(() => {
    return {
      total: rows.length,
      ghana: rows.filter((r) => r.attending_ghana).length,
      senegal: rows.filter((r) => r.attending_senegal).length,
      guests: rows.reduce((sum, r) => sum + (r.party_size || 0), 0),
    };
  }, [rows]);

  function handleExport() {
    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rsvps-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-ivory">{a.title}</h1>
          <p className="mt-1 text-xs font-semibold uppercase tracking-luxe text-gold">
            {t.footer.hashtag}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExport}
            disabled={rows.length === 0}
            className="btn-primary"
          >
            ⬇ {a.exportCsv}
          </button>
          <form action={logout}>
            <button type="submit" className="btn-ghost">
              {a.logout}
            </button>
          </form>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatCard label={a.total} value={stats.total} />
        <StatCard label={a.ghana} value={stats.ghana} />
        <StatCard label={a.senegal} value={stats.senegal} />
        <StatCard label={a.guests} value={stats.guests} />
      </div>

      {rows.length === 0 ? (
        <p className="mt-14 text-center text-ivory-dim">{a.noRsvps}</p>
      ) : (
        <div className="card mt-8 overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-gold/15 bg-panel text-[0.65rem] uppercase tracking-[0.15em] text-ivory-dim/60">
              <tr>
                <th className="px-4 py-3">{a.colName}</th>
                <th className="px-4 py-3">{a.colEmail}</th>
                <th className="px-4 py-3 text-center">{a.colGhana}</th>
                <th className="px-4 py-3 text-center">{a.colSenegal}</th>
                <th className="px-4 py-3 text-center">{a.colParty}</th>
                <th className="px-4 py-3">{a.colDietary}</th>
                <th className="px-4 py-3">{a.colMessage}</th>
                <th className="px-4 py-3">{a.colDate}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/10">
              {rows.map((r) => (
                <tr key={r.id} className="align-top transition hover:bg-gold/5">
                  <td className="px-4 py-3 font-medium text-ivory">{r.name}</td>
                  <td className="px-4 py-3 text-ivory-dim">{r.email}</td>
                  <td className="px-4 py-3 text-center text-gold">
                    {r.attending_ghana ? '✦' : '—'}
                  </td>
                  <td className="px-4 py-3 text-center text-gold">
                    {r.attending_senegal ? '✦' : '—'}
                  </td>
                  <td className="px-4 py-3 text-center text-ivory-dim">{r.party_size}</td>
                  <td className="px-4 py-3 text-ivory-dim">{r.dietary_notes || '—'}</td>
                  <td className="max-w-xs px-4 py-3 text-ivory-dim">{r.message || '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-ivory-dim/60">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
