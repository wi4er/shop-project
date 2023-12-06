import RedisStore from 'connect-redis';
import * as session from 'express-session';
import { createClient } from 'redis';

let redisClient = createClient({
  url: process.env.REDIS_URL ?? 'redis://localhost:6379',
});
redisClient.connect().catch(console.error);

export default function redisPermission() {
  return session({
    store: new RedisStore({client: redisClient, prefix: 'myapp:'}),
    secret: 'secret$%^134',
    saveUninitialized: false,
    resave: false,
  });
}

