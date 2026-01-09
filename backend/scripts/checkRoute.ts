import Fastify from 'fastify';
import { userRoutes } from '../src/modules/user/adapters/user.routes.js';

(async () => {
  const f = Fastify({ logger: false });
  f.decorate('jwt', { sign: () => 't' });
  await f.register(userRoutes, { prefix: '/api/users' });
  await f.ready();

  const r = await f.inject({
    method: 'POST',
    url: '/api/users/register',
    payload: { email: 'new@test.com', username: 'new', password: 'SecurePass123!' },
  });

  console.log('STATUS', r.statusCode);
  console.log('BODY', r.payload);
  await f.close();
  process.exit(0);
})();
