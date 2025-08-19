import { WebSocketServer } from 'ws';
import { host, port, wsPingInterval } from '../config.js';
import { initialize as initializeStore, saveInstance } from '@only-chat/in-memory-store';
import { initialize as initializeUserStore } from '@only-chat/in-memory-user-store';
import { initialize as initializeClient, WsClient } from '@only-chat/client';

import type { AddressInfo } from 'ws';
import type { Log } from '@only-chat/types/log.js';

const logger: Log = console;

logger.debug('Application started');

const store = await initializeStore();

const userStore = await initializeUserStore();

const response = await saveInstance();

const instanceId = response._id;

logger.debug('Instance id:', instanceId);

initializeClient({store, userStore, instanceId}, logger);

const ws = new WebSocketServer({ host, port });

logger.debug('WebSocketServer created');

ws.on('error', e => logger.error('WebSocketServer error:', e));

ws.on('connection', s => new WsClient(s));

ws.on('listening', () => {
    const {address, port} = ws.address() as AddressInfo;
    logger.debug('Server listening on %s:%d', address, port);
});

const _ = setInterval(() => ws.clients.forEach(s => s.ping()), wsPingInterval);