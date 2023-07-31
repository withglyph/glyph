import { createClient } from '@supabase/supabase-js';
import { json } from '@sveltejs/kit';
import {
  PRIVATE_SUPABASE_KEY,
  PRIVATE_SUPABASE_URL,
} from '$env/static/private';
import type { RequestHandler } from './$types';

const supabase = createClient(PRIVATE_SUPABASE_URL, PRIVATE_SUPABASE_KEY, {
  auth: { persistSession: false },
});

export const POST = (async ({ request }) => {
  const { phoneNumber } = await request.json();

  const valid = /^0\d{2}-?\d{3,4}-?\d{4}$/.test(phoneNumber);
  if (!valid) {
    return json({ success: false });
  }

  await supabase
    .from('waitlists')
    .insert({ phone_number: phoneNumber.replaceAll('-', '') });

  return json({ success: true });
}) satisfies RequestHandler;
