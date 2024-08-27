import { uuid } from 'uuidv4';

export function createResponse<T>(data: T) {
  return {
    Status: 'Ok',
    TimeKey: Math.round(new Date().getTime() / 1000),
    TimeValue: new Date().toUTCString(), //"2018.04.25 14:44:54"
    RequestId: uuid(),
    DayOfWeek: new Date().getDay(),
    AppVersion: '17.09.0009.26859',
    Data: data,
  };
}

export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

export default { createResponse, getRandomInt };
// const _createResponse = createResponse;
// const _getRandomInt = getRandomInt;
// export { _createResponse as createResponse, _getRandomInt as getRandomInt };
