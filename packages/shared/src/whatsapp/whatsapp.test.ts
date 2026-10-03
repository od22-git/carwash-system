import { describe, expect, it } from 'vitest';
import { DEFAULT_READY_TEMPLATE, fillTemplate, whatsappLink } from '.';

describe('fillTemplate', () => {
  it('fills known placeholders and keeps unknown ones', () => {
    expect(fillTemplate('{name} - {plate} - {x}', { name: 'سامر', plate: '123' })).toBe(
      'سامر - 123 - {x}',
    );
  });

  it('the default message mentions the grace minutes', () => {
    expect(
      fillTemplate(DEFAULT_READY_TEMPLATE, { name: 'سامر', plate: 'حلب 1234', grace: 15 }),
    ).toContain('15 دقيقة');
  });
});

describe('whatsappLink', () => {
  it('builds a wa.me link with the encoded message', () => {
    expect(whatsappLink('0912345678', 'جاهزة')).toBe(
      `https://wa.me/963912345678?text=${encodeURIComponent('جاهزة')}`,
    );
  });

  it('returns null for an invalid number', () => {
    expect(whatsappLink('123', 'x')).toBeNull();
  });
});
