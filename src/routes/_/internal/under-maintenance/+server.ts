import { json } from '@sveltejs/kit';

const handler = () => json({ code: 'under-maintenance' });
export { handler as GET, handler as POST };
