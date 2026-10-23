import { describe, expect, it } from 'vitest';
import { createApp } from './app.js';

const app = createApp({ ping: async () => {}, listTracks: async () => [] }, 'http://localhost:4321');

describe('API', () => {
  it('responds to liveness', async () => {
    const response = await app.request('/v1/health/live');
    expect(response.status).toBe(200);
    expect((await response.json()).status).toBe('ok');
  });
  it('lists published tracks', async () => {
    const response = await app.request('/v1/tracks');
    expect(response.status).toBe(200);
    expect((await response.json()).data).toEqual([]);
  });
});
