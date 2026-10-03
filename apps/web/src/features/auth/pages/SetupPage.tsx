import { setupRequestSchema } from '@carwash/shared';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { setupAdmin } from '../../../core/auth';
import { errorMessage } from '../../../shared/lib/error-message';
import { Button, Field, Notice } from '../../../shared/ui';
import { AuthLayout } from '../components/AuthLayout';

const EMPTY = { name: '', username: '', password: '', confirm: '' };

/** First run only: the owner creates the admin account. */
export function SetupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (key: keyof typeof EMPTY) => (e: { target: { value: string } }) =>
    setForm({ ...form, [key]: e.target.value });

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (form.password !== form.confirm) return setError('كلمتا المرور غير متطابقتين.');
    const parsed = setupRequestSchema.safeParse(form);
    if (!parsed.success) {
      return setError(
        'اسم المستخدم بالأحرف الإنجليزية (3 أحرف على الأقل) وكلمة المرور 6 أحرف على الأقل.',
      );
    }
    setBusy(true);
    setError(null);
    try {
      await setupAdmin(parsed.data);
      navigate('/settings', { replace: true });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout title="إعداد النظام لأول مرة">
      <p className="text-muted">أنشئ حساب المسؤول. يمكنك بعدها إضافة حساب الموظف من الإعدادات.</p>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="الاسم" required value={form.name} onChange={set('name')} />
        <Field
          label="اسم المستخدم"
          ltr
          hint="بالأحرف الإنجليزية، مثل owner"
          required
          value={form.username}
          onChange={set('username')}
        />
        <Field
          label="كلمة المرور"
          ltr
          type="password"
          autoComplete="new-password"
          required
          value={form.password}
          onChange={set('password')}
        />
        <Field
          label="تأكيد كلمة المرور"
          ltr
          type="password"
          autoComplete="new-password"
          required
          value={form.confirm}
          onChange={set('confirm')}
        />
        {error && <Notice tone="error">{error}</Notice>}
        <Button type="submit" disabled={busy}>
          إنشاء حساب المسؤول
        </Button>
      </form>
    </AuthLayout>
  );
}
