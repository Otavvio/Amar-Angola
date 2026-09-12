import { createClient } from '@supabase/supabase-js';

// ATENÇÃO: este cliente usa a service_role key, que tem acesso total ao
// banco e ao storage, ignorando qualquer Row Level Security. Ele deve ser
// importado SOMENTE dentro de arquivos em /api (código de servidor).
// NUNCA importe este arquivo em admin.js/script.js nem exponha
// SUPABASE_SERVICE_ROLE_KEY como variável pública (NEXT_PUBLIC_/VITE_...).
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);
