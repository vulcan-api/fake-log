import { uuid } from 'uuidv4';
import { getTime, format } from 'date-fns';

export function createEnvelope<T>(statusCode: number, statusMessage: string, type: string, body: T | null) {
  /*
   * The generic type <T> allows the 'body' parameter to be of any type,
   * ensuring that the 'createEnvelope' function can return an envelope
   * with a correctly typed body.
   */
  return {
    Envelope: body,
    EnvelopeType: type,
    InResponseTo: null,
    RequestId: uuid(),
    Status: {
      Code: statusCode,
      Message: statusMessage,
    },
    Timestamp: getTime(new Date()),
    TimestampFormatted: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
  };
}
