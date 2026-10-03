import { createUserSchema, type CreateUserRequest, type Role } from '@carwash/shared';
import { useState, type FormEvent } from 'react';
import { useAction } from '../../../shared/lib/use-action';
import { Button, Field, Notice } from '../../../shared/ui';

const EMPTY = { name: '', username: '', password: '', role: 'user' as Role };

export function CreateUserForm({
  onCreate,
}: {
  onCreate: (input: CreateUserRequest) => Promise<void>;
}) {
  const [form, setForm] = useState(EMPTY);
  const [invalid, setInvalid] = useState(false);
  const action = useAction();
  const set = (key: 'name' | 'username' | 'password') => (e: { target: { value: string } }) =>
    setForm({ ...form, [key]: e.target.value });

  async function submit(event: FormEvent) {
    event.preventDefault();
    const parsed = createUserSchema.safeParse(form);
    setInvalid(!parsed.success);
    if (parsed.success && (await action.run(() => onCreate(parsed.data)))) setForm(EMPTY);
  }

  return (
    <form onSubmit={submit} className="grid max-w-2xl gap-4 sm:grid-cols-2">
      <Field label="الاسم" required value={form.name} onChange={set('name')} />
      <Field
        label="اسم المستخدم"
        ltr
        required
        value={form.username}
        onChange={set('username')}
        hint="بالأحرف الإنجليزية، مثل cashier"
      />
      <Field
        label="كلمة المرور"
        ltr
        type="password"
        autoComplete="new-password"
        required
        value={form.password}
        onChange={set('password')}
        hint="6 أحرف على الأقل"
      />
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-sm font-semibold">نوع الحساب</legend>
        {(['user', 'admin'] as const).map((role) => (
          <label key={role} className="flex items-center gap-2">
            <input
              type="radio"
              name="role"
              className="accent-foam"
              checked={form.role === role}
              onChange={() => setForm({ ...form, role })}
            />
            {role === 'user' ? 'موظف (تسجيل الغسيل والبيع فقط)' : 'مسؤول (كل الصلاحيات)'}
          </label>
        ))}
      </fieldset>
      <div className="flex flex-col gap-3 sm:col-span-2">
        {invalid && (
          <Notice tone="error">
            راجع اسم المستخدم (إنجليزي، 3 أحرف على الأقل) وكلمة المرور (6 أحرف على الأقل).
          </Notice>
        )}
        {action.error && <Notice tone="error">{action.error}</Notice>}
        {action.done && (
          <Notice tone="success">أُنشئ الحساب. يمكن لصاحبه تسجيل الدخول الآن.</Notice>
        )}
        <Button type="submit" disabled={action.busy} className="self-start">
          إنشاء الحساب
        </Button>
      </div>
    </form>
  );
}
