import { motion, primitives } from './spec/primitives';

describe('motion primitives', () => {
  it('exposes a four-step duration scale in ms', () => {
    expect(Object.keys(motion.duration)).toEqual(['instant', 'fast', 'base', 'slow']);
    for (const v of Object.values(motion.duration)) {
      expect(v).toMatch(/^\d+ms$/);
    }
  });

  it('orders durations strictly ascending', () => {
    const ms = Object.values(motion.duration).map((v) => parseInt(v, 10));
    expect(ms).toEqual([...ms].sort((a, b) => a - b));
  });

  it('exposes four semantic easing curves as cubic-beziers', () => {
    expect(Object.keys(motion.ease)).toEqual([
      'standard',
      'emphasized',
      'decelerate',
      'accelerate',
    ]);
    for (const v of Object.values(motion.ease)) {
      expect(v).toMatch(/^cubic-bezier\([-0-9.,\s]+\)$/);
    }
  });

  it('is wired into the primitives barrel so the generator emits it', () => {
    expect(primitives.motion).toBe(motion);
  });
});
