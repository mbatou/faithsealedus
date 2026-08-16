'use client';

import { Fragment, useMemo, useState } from 'react';
import { logout } from './actions';
import { useLanguage } from '@/context/LanguageContext';

export interface RsvpRow {
  id: string;
  full_name: string;
  email: string;
  attending_ghana: boolean;
  attending_senegal: boolean;
  attending_exclusive: boolean;
  party_size: number;
  dietary_notes: string | null;
  message: string | null;
  created_at: string;
}

export interface PrayerRow {
  id: string;
  name: string | null;
  message: string;
  created_at: string;
}

function toCsv(rows: RsvpRow[]): string {
  const headers = [
    'full_name',
    'email',
    'attending_ghana',
    'attending_senegal',
    'attending_exclusive',
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
        r.full_name,
        r.email,
        r.attending_ghana,
        r.attending_senegal,
        r.attending_exclusive,
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

interface Draft {
  full_name: string;
  email: string;
  attending_ghana: boolean;
  attending_senegal: boolean;
  attending_exclusive: boolean;
  party_size: number;
  dietary_notes: string;
  message: string;
}

function toDraft(r: RsvpRow): Draft {
  return {
    full_name: r.full_name,
    email: r.email,
    attending_ghana: r.attending_ghana,
    attending_senegal: r.attending_senegal,
    attending_exclusive: r.attending_exclusive,
    party_size: r.party_size,
    dietary_notes: r.dietary_notes ?? '',
    message: r.message ?? '',
  };
}

export function AdminDashboard({
  rows: initialRows,
  prayers: initialPrayers,
}: {
  rows: RsvpRow[];
  prayers: PrayerRow[];
}) {
  const { t } = useLanguage();
  const a = t.admin;

  const [rows, setRows] = useState<RsvpRow[]>(initialRows);
  const [prayers, setPrayers] = useState<PrayerRow[]>(initialPrayers);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stats = useMemo(() => {
    return {
      total: rows.length,
      ghana: rows.filter((r) => r.attending_ghana).length,
      senegal: rows.filter((r) => r.attending_senegal).length,
      exclusive: rows.filter((r) => r.attending_exclusive).length,
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

  function startEdit(r: RsvpRow) {
    setEditingId(r.id);
    setDraft(toDraft(r));
    setError(null);
  }

  function stopEdit() {
    setEditingId(null);
    setDraft(null);
  }

  async function saveEdit() {
    if (!editingId || !draft) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/rsvps/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(a.updateError);
        return;
      }
      setRows((prev) =>
        prev.map((r) => (r.id === editingId ? { ...r, ...(data.rsvp as RsvpRow) } : r)),
      );
      stopEdit();
    } catch {
      setError(a.updateError);
    } finally {
      setBusy(false);
    }
  }

  async function deleteRsvp(id: string) {
    if (!window.confirm(a.confirmDelete)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/rsvps/${id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(a.deleteError);
        return;
      }
      setRows((prev) => prev.filter((r) => r.id !== id));
      if (editingId === id) stopEdit();
    } catch {
      setError(a.deleteError);
    } finally {
      setBusy(false);
    }
  }

  async function deletePrayer(id: string) {
    if (!window.confirm(a.confirmDeletePrayer)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/prayers/${id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(a.deleteError);
        return;
      }
      setPrayers((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setError(a.deleteError);
    } finally {
      setBusy(false);
    }
  }

  const actionBtn =
    'text-[0.65rem] font-semibold uppercase tracking-[0.15em] underline-offset-4 transition hover:underline disabled:opacity-40';

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-ivory">{a.title}</h1>
          <p className="mt-1 text-xs font-semibold uppercase tracking-luxe text-gold">
            {t.hero.bride} &amp; {t.hero.groom}
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

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-4">
        <StatCard label={a.total} value={stats.total} />
        <StatCard label={a.ghana} value={stats.ghana} />
        <StatCard label={a.senegal} value={stats.senegal} />
        <StatCard label={a.exclusive} value={stats.exclusive} />
        <StatCard label={a.guests} value={stats.guests} />
      </div>

      {error && (
        <p className="mt-6 border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      {rows.length === 0 ? (
        <p className="mt-14 text-center text-ivory-dim">{a.noRsvps}</p>
      ) : (
        <div className="card mt-8 overflow-x-auto">
          <table className="w-full min-w-[1020px] text-left text-sm">
            <thead className="border-b border-gold/15 bg-surface text-[0.65rem] uppercase tracking-[0.15em] text-ivory-dim/60">
              <tr>
                <th className="px-4 py-3">{a.colName}</th>
                <th className="px-4 py-3">{a.colEmail}</th>
                <th className="px-4 py-3 text-center">{a.colGhana}</th>
                <th className="px-4 py-3 text-center">{a.colSenegal}</th>
                <th className="px-4 py-3 text-center">{a.colExclusive}</th>
                <th className="px-4 py-3 text-center">{a.colParty}</th>
                <th className="px-4 py-3">{a.colDietary}</th>
                <th className="px-4 py-3">{a.colMessage}</th>
                <th className="px-4 py-3">{a.colDate}</th>
                <th className="sticky right-0 z-10 border-l border-gold/10 bg-surface px-4 py-3 text-right">
                  {a.colActions}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/10">
              {rows.map((r) => (
                <Fragment key={r.id}>
                  <tr className="align-top transition hover:bg-gold/5">
                    <td className="px-4 py-3 font-medium text-ivory">{r.full_name}</td>
                    <td className="px-4 py-3 text-ivory-dim">{r.email}</td>
                    <td className="px-4 py-3 text-center text-gold">
                      {r.attending_ghana ? '✦' : '—'}
                    </td>
                    <td className="px-4 py-3 text-center text-gold">
                      {r.attending_senegal ? '✦' : '—'}
                    </td>
                    <td className="px-4 py-3 text-center text-gold">
                      {r.attending_exclusive ? '✦' : '—'}
                    </td>
                    <td className="px-4 py-3 text-center text-ivory-dim">{r.party_size}</td>
                    <td className="px-4 py-3 text-ivory-dim">{r.dietary_notes || '—'}</td>
                    <td className="max-w-xs px-4 py-3 text-ivory-dim">{r.message || '—'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-ivory-dim/60">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="sticky right-0 z-10 whitespace-nowrap border-l border-gold/10 bg-noir px-4 py-3 text-right">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => (editingId === r.id ? stopEdit() : startEdit(r))}
                        className={`${actionBtn} text-gold`}
                      >
                        {a.edit}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => deleteRsvp(r.id)}
                        className={`${actionBtn} ml-4 text-red-300`}
                      >
                        {a.delete}
                      </button>
                    </td>
                  </tr>

                  {editingId === r.id && draft && (
                    <tr className="bg-surface/60">
                      <td colSpan={10} className="px-4 py-5">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                          <div>
                            <label className="field-label">{a.colName}</label>
                            <input
                              type="text"
                              value={draft.full_name}
                              onChange={(e) =>
                                setDraft({ ...draft, full_name: e.target.value })
                              }
                              className="field-input"
                            />
                          </div>
                          <div>
                            <label className="field-label">{a.colEmail}</label>
                            <input
                              type="email"
                              value={draft.email}
                              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                              className="field-input"
                            />
                          </div>
                          <div>
                            <label className="field-label">{a.colParty}</label>
                            <input
                              type="number"
                              min={1}
                              max={20}
                              value={draft.party_size}
                              onChange={(e) =>
                                setDraft({ ...draft, party_size: Number(e.target.value) })
                              }
                              className="field-input"
                            />
                          </div>
                          <div className="flex flex-wrap items-end gap-4 pb-1">
                            {(
                              [
                                ['attending_ghana', a.colGhana],
                                ['attending_senegal', a.colSenegal],
                                ['attending_exclusive', a.colExclusive],
                              ] as const
                            ).map(([key, label]) => (
                              <label
                                key={key}
                                className="flex cursor-pointer items-center gap-2 text-xs text-ivory-dim"
                              >
                                <input
                                  type="checkbox"
                                  checked={draft[key]}
                                  onChange={(e) =>
                                    setDraft({ ...draft, [key]: e.target.checked })
                                  }
                                  className="h-4 w-4 accent-gold"
                                />
                                {label}
                              </label>
                            ))}
                          </div>
                          <div className="sm:col-span-2">
                            <label className="field-label">{a.colDietary}</label>
                            <input
                              type="text"
                              value={draft.dietary_notes}
                              onChange={(e) =>
                                setDraft({ ...draft, dietary_notes: e.target.value })
                              }
                              className="field-input"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="field-label">{a.colMessage}</label>
                            <input
                              type="text"
                              value={draft.message}
                              onChange={(e) => setDraft({ ...draft, message: e.target.value })}
                              className="field-input"
                            />
                          </div>
                        </div>
                        <div className="mt-5 flex gap-3">
                          <button
                            type="button"
                            onClick={saveEdit}
                            disabled={busy}
                            className="btn-primary"
                          >
                            {busy ? a.saving : a.save}
                          </button>
                          <button
                            type="button"
                            onClick={stopEdit}
                            disabled={busy}
                            className="btn-ghost"
                          >
                            {a.cancel}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Prayer wall */}
      <div className="mt-14">
        <h2 className="font-serif text-2xl font-semibold text-ivory">
          {a.prayersTitle} <span className="text-gold">({prayers.length})</span>
        </h2>
        {prayers.length === 0 ? (
          <p className="mt-4 text-ivory-dim">{a.noPrayers}</p>
        ) : (
          <ul className="mt-6 space-y-3">
            {prayers.map((p) => (
              <li key={p.id} className="card flex items-start justify-between gap-4 p-4">
                <div>
                  <p className="font-serif italic text-ivory">“{p.message}”</p>
                  <p className="mt-1 text-[0.65rem] uppercase tracking-[0.15em] text-gold/70">
                    {p.name || '—'} ·{' '}
                    <span className="text-ivory-dim/60">
                      {new Date(p.created_at).toLocaleDateString()}
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => deletePrayer(p.id)}
                  className={`${actionBtn} shrink-0 text-red-300`}
                >
                  {a.remove}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
