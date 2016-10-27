// nothing is happening
export const IDLE = 'IDLE';
// init game routine, followed by n play turns
export const START_OF_GAME = 'START_OF_GAME';
// play turn, waiting a user action
export const PLAY_TURN = 'PLAY_TURN';
// game ended, contain winning player
export const END_OF_GAME = 'END_OF_GAME';

class Connection {
  constructor(messageHandlers) {
    this.messageHandlers = messageHandlers;
    this.ws = new WebSocket("ws://localhost:8080/echo");

    this.ws.onopen = function (evt) {
      console.log("OPEN");
    };

    this.ws.onclose = function (evt) {
      console.log("CLOSE");
      this.ws = null;
    };

    this.ws.onmessage = (evt) => {
      console.log("RESPONSE: " + evt.data);
      try {
        const action = JSON.parse(evt.data);
        this.handleMessage(action);
      }
      catch (e) {
        console.log('JSON parsing of message failed', e);
      }
    };

    this.ws.onerror = function (evt) {
      console.log("ERROR: " + evt.data);
    }
  }

  handleMessage(action) {
    const type = action.Type;
    switch (type) {
      case IDLE:
        return this.messageHandlers[IDLE](action);
      case START_OF_GAME:
        return this.messageHandlers[START_OF_GAME](action);
      case PLAY_TURN:
        return this.messageHandlers[PLAY_TURN](action);
      case END_OF_GAME:
        return this.messageHandlers[END_OF_GAME](action);
      default:
        console.log('invalid action type', type);
        return null;
    }
  }

  getWs() {
    return this.ws;
  }
}

export default Connection;
