import { ApiError, OfflineError } from '../../core/api';
import { OfflineLoginError } from '../../core/auth';

/** Turns any error into one sentence the cashier can act on. */
export function errorMessage(error: unknown): string {
  if (error instanceof OfflineLoginError) {
    return 'لا يوجد اتصال بالإنترنت، وهذا الحساب لم يسجّل دخوله على هذا الجهاز من قبل. سجّل الدخول مرة واحدة مع الإنترنت.';
  }
  if (error instanceof OfflineError)
    return 'لا يوجد اتصال بالخادم. تحقّق من الإنترنت ثم أعد المحاولة.';
  if (error instanceof ApiError) {
    if (error.status === 401) return 'اسم المستخدم أو كلمة المرور غير صحيحة.';
    if (error.status === 403) return 'هذا الإجراء غير مسموح لهذا الحساب.';
    if (error.status === 409) return 'اسم المستخدم مستخدم من قبل، اختر اسماً آخر.';
    if (error.status === 400) return 'بعض المعلومات غير صحيحة، راجعها ثم أعد المحاولة.';
  }
  return 'حدث خطأ غير متوقع. أعد المحاولة، وإذا تكرر أبلغ المسؤول.';
}
