import { Request } from 'express';

export default function (req: Request) {
  const isConnectionEncrypted = req.secure;
  const isSslEnvSet = process.env.SSL === 'true';
  const isHeaderSsl = req.header('x-forwarded-proto') === 'https';

  const proto = isConnectionEncrypted || isSslEnvSet || isHeaderSsl ? 'https' : 'http';

  return proto.split(/\s*,\s*/)[0];
}
