import { io } from 'socket.io-client';

// Pass empty string so socket.io connects to the current domain,
// and Next.js rewrites will proxy /socket.io to the backend
const URL = process.env.NEXT_PUBLIC_API_URL || '';

export const socket = io(URL, {
  autoConnect: false,
});
