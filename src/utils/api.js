const { uuid } = require('uuidv4');

function createResponse(data) {
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

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

exports.createResponse = createResponse;
exports.getRandomInt = getRandomInt;
