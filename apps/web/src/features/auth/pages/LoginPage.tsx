import { useEffect, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { login, needsSetup } from '../../../core/auth';
import { errorMessage } from '../../../shared/lib/error-message';
import { Button, Field, Notice } from '../../../shared/ui';
import { AuthLayout } from '../components/AuthLayout';

export function LoginPage() {
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/wash';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // A fresh install has no accounts yet: go to first-run setup.
  useEffect(() => {
    needsSetup()
      .then((setup) => setup && navigate('/setup', { replace: true }))
      .catch(() => undefined);
  }, [navigate]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout title="تسجيل الدخول">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field
          label="اسم المستخدم"
          ltr
          autoComplete="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Field
          label="كلمة المرور"
          ltr
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <Notice tone="error">{error}</Notice>}
        <Button type="submit" disabled={busy}>
          {busy ? 'جارٍ تسجيل الدخول…' : 'تسجيل الدخول'}
        </Button>
      </form>
    </AuthLayout>
  );
}
