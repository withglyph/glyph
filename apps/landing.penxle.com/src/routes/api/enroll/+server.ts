import { createClient } from '@supabase/supabase-js';
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

export const POST = (async ({ request }) => {
  const supabase = createClient(env.PRIVATE_SUPABASE_URL, env.PRIVATE_SUPABASE_KEY, {
    auth: { persistSession: false },
  });

  const { phoneNumber } = (await request.json()) as { phoneNumber: string };

  const valid = /^0\d{2}-?\d{3,4}-?\d{4}$/.test(phoneNumber);
  if (!valid) {
    return json({ success: false });
  }

  await supabase.from('waitlists').insert({ phone_number: phoneNumber.replaceAll('-', '') });

  return json({ success: true });
}) satisfies RequestHandler;
