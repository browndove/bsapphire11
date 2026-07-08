import { toUserMessage } from './errors';
import { NO_STORE_HEADERS } from './dynamic-route';

export async function jsonRoute(handler, context) {
  try {
    const data = await handler();
    if (data == null) {
      return new Response(null, { status: 204, headers: NO_STORE_HEADERS });
    }
    return Response.json(data, { headers: NO_STORE_HEADERS });
  } catch (err) {
    return Response.json(
      { message: toUserMessage(err, context) },
      { status: err.status || 500, headers: NO_STORE_HEADERS }
    );
  }
}
