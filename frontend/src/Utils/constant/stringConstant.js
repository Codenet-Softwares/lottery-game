export class StringConstants {
  LOGIN = 'login';

  //others
  LOCAL_STORAGE_KEY = 'my_app_state';
  applicationJSON = { 'Content-Type': 'application/json' };

  // http methods
  GET = 'GET';
  POST = 'POST';
  PUT = 'PUT';
  DELETE = 'DELETE';

  // reducer type

  LOG_IN = 'LOG_IN';
  LOG_OUT = 'LOG_OUT';
  GENERATE_TICKET_NUMBER = 'GENERATE_TICKET_NUMBER';
  GENERATE_LOTTERY = 'GENERATE_LOTTERY';
  FETCH_LOTTERY_TICKETS = 'FETCH_LOTTERY_TICKETS';
  PURCHASED_LOTTERY_TICKETS = 'PURCHASED_LODTERY_TICKETS';
  EDIT_LOTTERY = `EDIT_LOTTERY`;
  ADD_DRAW_TIME = 'ADD_DRAW_TIME';
  ADD_SUBMITTED_PRIZE = 'ADD_SUBMITTED_PRIZE';
}

let strings = new StringConstants();
export default strings;
