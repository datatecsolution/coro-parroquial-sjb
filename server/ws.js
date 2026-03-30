const { WebSocketServer } = require('ws');

let sessionState = {
  mode: 'blank',       // 'blank' | 'song' | 'text' | 'image'
  theme: 'dark',       // 'dark' | 'light'
  massId: null,
  songIndex: 0,
  verseIndex: 0,
  customText: '',
  imageUrl: '',
};

function setupWebSocket(server) {
  const wss = new WebSocketServer({ server });

  function broadcast(data) {
    const msg = JSON.stringify(data);
    wss.clients.forEach((client) => {
      if (client.readyState === 1) client.send(msg);
    });
  }

  wss.on('connection', (ws) => {
    // Send current state to new client
    ws.send(JSON.stringify({ type: 'state', payload: sessionState }));

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw);
        if (msg.action === 'setState') {
          sessionState = { ...sessionState, ...msg.payload };
          broadcast({ type: 'state', payload: sessionState });
        } else if (msg.action === 'getState') {
          ws.send(JSON.stringify({ type: 'state', payload: sessionState }));
        }
      } catch (e) {
        // ignore malformed messages
      }
    });
  });

  return { wss, broadcast };
}

let broadcastFn = null;

function initWebSocket(server) {
  const { wss, broadcast } = setupWebSocket(server);
  broadcastFn = broadcast;
  return wss;
}

function broadcastRefresh() {
  if (broadcastFn) {
    broadcastFn({ type: 'refresh' });
  }
}

module.exports = { initWebSocket, broadcastRefresh };
