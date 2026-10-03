import assert from 'node:assert/strict';
import { aggregate, monthOf } from '../supabase/functions/cleaning-stats/index.ts';
const now = new Date('2026-10-04T05:00:00Z');
const event = (id, summary, patch = {}) => ({ id, summary, colorId: '2', end: { dateTime: '2026-10-03T18:00:00+03:00' }, ...patch });
assert.equal(monthOf(new Date('2026-09-30T22:00:00Z')), '2026-10');
const result = aggregate([
  event('a', 'Генеральная уборка, 38 м²'), event('a', 'Генеральная уборка, 38 м²'),
  event('b', 'Всё включено, 75,5 м²'), event('c', 'Узнавали цену, 50 м²'),
  event('d', 'Генеральная, 60 м²', { colorId: '7' }), event('e', 'Уборка, 40 м²', { status: 'cancelled' }),
  event('f', 'Уборка, 30 м²', { end: { dateTime: '2026-10-05T10:00:00+03:00' } }),
  event('g', 'Уборка, 80 м²', { end: { dateTime: '2026-09-30T18:00:00+03:00' } }),
  event('h', 'Химчистка мебели'), event('i', 'Уборка 30 м² и 20 м²'),
], now);
assert.equal(result.area, 113.5);
assert.deepEqual(Object.keys(result).sort(), ['area','month','scope','updatedAt']);
console.log('Calendar statistics tests passed');
