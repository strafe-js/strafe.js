import http from 'node:http';
import WebSocket from 'ws';

const RELAY_PORT = 3099;

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, data) {
  const payload = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(payload);
}

async function handleRestRelay(body, res) {
  const { url, method = 'GET', authHeader, payload } = body;
  if (!url || !authHeader) {
    return sendJson(res, 400, { error: 'Missing url or authHeader' });
  }

  const headers = {
    Authorization: authHeader,
    'User-Agent': 'strafebot-js/1.2 (Playground)',
  };
  if (payload !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const start = performance.now();
  try {
    const upstream = await fetch(url, {
      method,
      headers,
      body: payload !== undefined ? JSON.stringify(payload) : undefined,
    });
    const latencyMs = Math.round(performance.now() - start);

    let parsedBody = null;
    if (upstream.status !== 204) {
      const text = await upstream.text();
      try {
        parsedBody = text ? JSON.parse(text) : null;
      } catch {
        parsedBody = text;
      }
    }

    return sendJson(res, 200, {
      live: true,
      status: upstream.status,
      statusText: upstream.statusText || '',
      ok: upstream.ok,
      latency_ms: latencyMs,
      request: `${method} ${url}`,
      body: parsedBody,
    });
  } catch (err) {
    const latencyMs = Math.round(performance.now() - start);
    return sendJson(res, 200, {
      live: true,
      status: 0,
      ok: false,
      latency_ms: latencyMs,
      request: `${method} ${url}`,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

function handleWsRelay(body, res) {
  const { gatewayUrl, authHeader, wsFrame, spaceId, roomId } = body;
  if (!gatewayUrl || !authHeader) {
    return sendJson(res, 400, { error: 'Missing gatewayUrl or authHeader' });
  }

  const start = performance.now();
  const receivedFrames = [];
  const sentFrames = [];
  let settled = false;

  const finish = (payload) => {
    if (settled) return;
    settled = true;
    clearTimeout(timeoutId);
    try {
      ws.terminate();
    } catch {
      // socket already closed
    }
    sendJson(res, 200, payload);
  };

  let ws;
  try {
    ws = new WebSocket(gatewayUrl, {
      headers: {
        Authorization: authHeader,
        'User-Agent': 'strafebot-js/1.2 (Playground)',
      },
    });
  } catch (err) {
    return sendJson(res, 200, {
      live: true,
      ok: false,
      statusLabel: 'Invalid WS URL',
      error: err instanceof Error ? err.message : String(err),
    });
  }

  const timeoutId = setTimeout(() => {
    finish({
      live: true,
      ok: receivedFrames.length > 0,
      latency_ms: Math.round(performance.now() - start),
      statusLabel:
        receivedFrames.length > 0
          ? `Connected (${receivedFrames.length} frame${receivedFrames.length === 1 ? '' : 's'})`
          : 'Timed Out',
      sent: sentFrames,
      received: receivedFrames,
    });
  }, wsFrame === 'messageCreate' ? 3500 : 2500);

  ws.on('unexpected-response', (_req, incomingRes) => {
    const chunks = [];
    incomingRes.on('data', (c) => chunks.push(c));
    incomingRes.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      let parsed = raw;
      try {
        parsed = raw ? JSON.parse(raw) : null;
      } catch {
        // keep raw text
      }
      finish({
        live: true,
        ok: false,
        http_status: incomingRes.statusCode,
        latency_ms: Math.round(performance.now() - start),
        statusLabel: `HTTP ${incomingRes.statusCode} Handshake Rejected`,
        response: parsed,
      });
    });
  });

  ws.on('open', () => {
    if (wsFrame === 'subscribe') {
      const subSpace = { op: 1, d: { space_id: spaceId } };
      ws.send(JSON.stringify(subSpace));
      sentFrames.push(subSpace);
      if (roomId && roomId !== spaceId) {
        const subRoom = { op: 1, d: { space_id: roomId } };
        ws.send(JSON.stringify(subRoom));
        sentFrames.push(subRoom);
      }
    } else if (wsFrame === 'pingPong') {
      const pingFrame = { op: 6 };
      ws.send(JSON.stringify(pingFrame));
      sentFrames.push(pingFrame);
    }
  });

  ws.on('message', (data) => {
    let frame;
    try {
      frame = JSON.parse(data.toString('utf8'));
    } catch {
      frame = { raw: data.toString('utf8') };
    }
    receivedFrames.push(frame);

    if (wsFrame === 'ready' && frame?.op === 4) {
      finish({
        live: true,
        ok: true,
        latency_ms: Math.round(performance.now() - start),
        statusLabel: 'OP 4 READY Received',
        frame,
      });
    } else if (wsFrame === 'pingPong' && frame?.op === 7) {
      finish({
        live: true,
        ok: true,
        latency_ms: Math.round(performance.now() - start),
        statusLabel: 'OP 7 PONG Received',
        sent: sentFrames,
        received: receivedFrames,
      });
    } else if (wsFrame === 'subscribe' && receivedFrames.length >= 1) {
      setTimeout(() => {
        finish({
          live: true,
          ok: true,
          latency_ms: Math.round(performance.now() - start),
          statusLabel: 'OP 1 Subscribed & Session Ready',
          sent: sentFrames,
          received: receivedFrames,
        });
      }, 250);
    } else if (wsFrame === 'messageCreate' && frame?.op === 3) {
      finish({
        live: true,
        ok: true,
        latency_ms: Math.round(performance.now() - start),
        statusLabel: `OP 3 EVENT (${frame?.d?.t || frame?.t || 'EVENT'})`,
        frame,
      });
    }
  });

  ws.on('close', (code, reason) => {
    if (!settled) {
      finish({
        live: true,
        ok: receivedFrames.length > 0,
        close_code: code,
        close_reason: reason ? reason.toString('utf8') : '',
        latency_ms: Math.round(performance.now() - start),
        statusLabel: `Closed (${code})`,
        sent: sentFrames,
        received: receivedFrames,
      });
    }
  });

  ws.on('error', (err) => {
    if (!settled) {
      finish({
        live: true,
        ok: false,
        latency_ms: Math.round(performance.now() - start),
        statusLabel: 'WS Error',
        error: err instanceof Error ? err.message : String(err),
      });
    }
  });
}

export function ensurePlaygroundRelayServer() {
  if (globalThis.__strafePlaygroundRelayStarted) {
    return;
  }
  globalThis.__strafePlaygroundRelayStarted = true;

  const server = http.createServer(async (req, res) => {
    if (req.method === 'POST' && req.url === '/_playground-relay') {
      try {
        const body = await readJsonBody(req);
        if (body.type === 'ws') {
          return handleWsRelay(body, res);
        }
        return await handleRestRelay(body, res);
      } catch (err) {
        return sendJson(res, 500, {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
    sendJson(res, 404, { error: 'Not found' });
  });

  server.on('error', () => {
    // Port 3099 is already bound by another worker in dev mode
  });

  server.listen(RELAY_PORT, '127.0.0.1');
}
