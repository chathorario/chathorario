import { createClient } from '@supabase/supabase-js'

// Project settings
const SUPABASE_URL = 'https://ajytkkqvxoeewwabtdpt.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable.')
  console.error('Set SUPABASE_SERVICE_ROLE_KEY and re-run this script.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function ensureSchool(name) {
  const { data, error } = await supabase
    .from('schools')
    .upsert({ name }, { onConflict: 'name' })
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

async function ensureUser(email, password) {
  // Create or return existing user; mark email as confirmed
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  // If user already exists, fetch it
  if (error) {
    // Try to find by email
    const { data: list, error: listErr } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    })
    if (listErr) throw listErr
    const existing = list?.users?.find((u) => u.email === email)
    if (!existing) throw error
    return existing
  }

  return data.user
}

async function upsertProfile({ id, school_id, role, full_name }) {
  const { error } = await supabase
    .from('profiles')
    .upsert({ id, school_id, role, full_name }, { onConflict: 'id' })
  if (error) throw error
}

async function main() {
  try {
    console.log('Seeding: escola, usuários e perfis...')
    const schoolId = await ensureSchool('Escola Teste')
    console.log('School ok:', schoolId)

    const admin = await ensureUser('admin@chathorario.com.br', 'Admin@123')
    const staff = await ensureUser('escola_teste@chathorario.com.br', 'EscolaTeste@123')
    console.log('Users ok:', { admin: admin.id, staff: staff.id })

    await upsertProfile({
      id: admin.id,
      school_id: schoolId,
      role: 'admin',
      full_name: 'Administrador',
    })
    await upsertProfile({
      id: staff.id,
      school_id: schoolId,
      role: 'staff',
      full_name: 'Escola Teste',
    })

    console.log('Perfis ok. Seed concluído com sucesso.')
  } catch (err) {
    console.error('Falha no seed:', err?.message || err)
    process.exit(1)
  }
}

main()