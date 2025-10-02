import request from 'supertest';
import app from '../server';

describe('Health endpoint', () => {
  it('should return server status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
});
