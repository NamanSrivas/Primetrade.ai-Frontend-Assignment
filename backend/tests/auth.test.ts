import request from 'supertest';
import app from '../server';

jest.setTimeout(30000);

describe('Auth & Health', () => {
  it('should return health status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  it('should register, login and access profile with cookie', async () => {
    const email = `user${Date.now()}@example.com`;

    // Register
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email, password: 'Password123' })
      .expect(201);

    expect(reg.body).toHaveProperty('token');
    const setCookie = reg.headers['set-cookie'];
    expect(Array.isArray(setCookie)).toBeTruthy();

    // Login
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'Password123' })
      .expect(200);

    const cookie = login.headers['set-cookie'];
    expect(cookie).toBeDefined();

    // Access profile with cookie
    const profile = await request(app)
      .get('/api/auth/profile')
      .set('Cookie', cookie)
      .expect(200);

    expect(profile.body).toHaveProperty('user.email', email.toLowerCase());

    // Logout clears cookie
    await request(app)
      .post('/api/auth/logout')
      .set('Cookie', cookie)
      .expect(200);
  });
});
