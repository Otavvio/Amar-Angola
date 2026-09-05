// Rode localmente com: node scripts/criar-admin.js <usuario> <senha>
// (precisa das variáveis SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente)
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const [, , username, password] = process.argv;

if (!username || !password) {
  console.error('Uso: node scripts/criar-admin.js <usuario> <senha>');
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const password_hash = await bcrypt.hash(password, 12);

const { error } = await supabase
  .from('admins')
  .insert({ username, password_hash });

if (error) {
  console.error('Erro ao criar admin:', error.message);
  process.exit(1);
}

console.log(`Admin "${username}" criado com sucesso.`);
