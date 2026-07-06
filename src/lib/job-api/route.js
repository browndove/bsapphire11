import { toUserMessage } from './errors';
import { NO_STORE_HEADERS } from './dynamic-route';

export async function jsonRoute(handler, context) {
  try {
    const data = await handler();
    return Response.json(data, { headers: NO_STORE_HEADERS });
  } catch (err) {
    return Response.json(
      { message: toUserMessage(err, context) },
      { status: err.status || 500, headers: NO_STORE_HEADERS }
    );
  }
}
