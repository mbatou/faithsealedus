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
      <form
        action={formAction}
        className="w-full max-w-sm rounded-3xl border border-ink/10 bg-white/80 p-8 shadow-sm"
      >
        <h1 className="text-center font-serif text-3xl font-semibold text-ink">
          {t.admin.title}
        </h1>
        <p className="mt-1 text-center font-script text-2xl text-terracotta">
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
          <p className="mt-3 rounded-xl bg-terracotta/10 px-4 py-2 text-sm text-terracotta-dark">
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
