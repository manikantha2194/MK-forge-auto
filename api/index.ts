import type { IncomingMessage, ServerResponse } from 'http';
import app from '../server.ts';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: IncomingMessage, res: ServerResponse) {
  app(req, res);
}
