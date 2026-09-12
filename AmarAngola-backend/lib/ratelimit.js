import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// 5 tentativas de login por minuto, por IP. Como funções da Vercel são
// stateless e podem rodar em instâncias diferentes a cada chamada, o
// limite precisa ficar num armazenamento compartilhado (Redis) em vez de
// uma variável em memória.
export const loginRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  prefix: 'ratelimit:login',
});
