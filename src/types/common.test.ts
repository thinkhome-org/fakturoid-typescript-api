import { describe, expect, mock, test } from 'bun:test';
import { paginateAll } from './common';

describe('paginateAll', () => {
  test('yields all items across multiple pages', async () => {
    const fetchPage = mock(async (page: number) => {
      if (page === 1) return Array.from({ length: 40 }, (_, i) => i);
      if (page === 2) return [40, 41];
      return [];
    });

    const results: number[] = [];
    for await (const item of paginateAll(fetchPage)) {
      results.push(item);
    }

    expect(results.length).toBe(42);
    expect(fetchPage).toHaveBeenCalledTimes(2);
  });
});
