import { describe, expect, it } from 'vitest';
import { findPossibleDuplicates, normalizeArabicName, normalizeSyrianPhone } from '.';

describe('normalizeSyrianPhone', () => {
  it.each([
    '0912345678',
    '912345678',
    '+963912345678',
    '00963912345678',
    '+963 91 234 5678',
    '٠٩١٢٣٤٥٦٧٨',
  ])('%s -> 963912345678', (input) => expect(normalizeSyrianPhone(input)).toBe('963912345678'));

  it('rejects landlines and foreign numbers', () => {
    expect(normalizeSyrianPhone('0212345678')).toBeNull();
    expect(normalizeSyrianPhone('+971501234567')).toBeNull();
  });
});

describe('normalizeArabicName', () => {
  it('unifies letter forms and removes diacritics', () => {
    expect(normalizeArabicName('  أحمد   مُحَمّد ')).toBe('احمد محمد');
    expect(normalizeArabicName('فاطمة')).toBe(normalizeArabicName('فاطمه'));
  });
});

describe('findPossibleDuplicates', () => {
  const customers = [
    { id: '1', name: 'أحمد الحلبي', phone: '0933111222' },
    { id: '2', name: 'احمد الحلبى', phone: '0944555666' },
    { id: '3', name: 'سامر', phone: '0955777888' },
  ];

  it('puts the same phone first, then similar names', () => {
    const hits = findPossibleDuplicates(
      { name: 'أحمد الحلبي', phone: '+963 944 555 666' },
      customers,
    );
    expect(hits.map((h) => [h.customer.id, h.reason])).toEqual([
      ['2', 'same_phone'],
      ['1', 'similar_name'],
    ]);
  });

  it('finds nothing for a new person', () => {
    expect(findPossibleDuplicates({ name: 'ليلى', phone: '0999000111' }, customers)).toEqual([]);
  });
});
