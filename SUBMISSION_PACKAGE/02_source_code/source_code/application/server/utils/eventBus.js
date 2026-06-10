const clients = new Map();

const keepAliveMs = 25000;

const serializeEvent = (event) => {
    const typeLine = event.type ? `event: ${event.type}\n` : '';
    return `${typeLine}data: ${JSON.stringify(event.payload || {})}\n\n`;
};

const addClient = ({ user, res }) => {
    const id = `${user.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const client = { id, user, res };
    clients.set(id, client);

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
    });
    res.write(serializeEvent({ type: 'connected', payload: { connected: true } }));

    const keepAlive = setInterval(() => {
        res.write(': keep-alive\n\n');
    }, keepAliveMs);

    res.on('close', () => {
        clearInterval(keepAlive);
        clients.delete(id);
    });

    return id;
};

const canReceive = (user, payload) => {
    if (!user) return false;
    if (user.role === 'Admin') return true;
    if (user.role === 'Partner') return Number(user.id) === Number(payload.partnerId);
    return false;
};

const emit = (type, payload = {}) => {
    const message = serializeEvent({ type, payload: { ...payload, emittedAt: new Date().toISOString() } });
    for (const client of clients.values()) {
        if (!canReceive(client.user, payload)) continue;
        client.res.write(message);
    }
};

module.exports = {
    addClient,
    emit,
};
