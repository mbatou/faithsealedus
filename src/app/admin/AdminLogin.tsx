'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { login } from './actions';
import { useLanguage } from '@/context/LanguageContext';

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useLanguage();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full">
      {t.admin.login}
    </button>
  );
}

export function AdminLogin() {
  const { t } = useLanguage();
  const [state, formAction] = useFormState(login, { error: false });

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-5">
      <form action={formAction} className="card w-full max-w-sm p-8">
        <h1 className="text-center font-serif text-3xl font-semibold text-ivory">
          {t.admin.title}
        </h1>
        <p className="mt-2 text-center text-xs font-semibold uppercase tracking-luxe text-gold">
          {t.footer.hashtag}
        </p>

        <div className="mt-6">
          <label htmlFor="password" className="field-label">
            {t.admin.passwordLabel}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoFocus
            className="field-input"
          />
        </div>

        {state.error && (
          <p className="mt-3 rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-2 text-sm text-red-200">
            {t.admin.wrongPassword}
          </p>
        )}

        <div className="mt-6">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
