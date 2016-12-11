// nothing is happening
export const IDLE = 'IDLE';
// init game routine, followed by n play turns
export const START_OF_GAME = 'START_OF_GAME';
// play turn, waiting a user action
export const PLAY_TURN = 'PLAY_TURN';
// game ended, contain winning player
export const END_OF_GAME = 'END_OF_GAME';

export const ENTER_ROOM = 'ENTER_ROOM';

export const REFRESH = 'REFRESH';

export const SET_AI_LEVEL = 'SET_AI_LEVEL';

export const SUGGESTED_MOVE = 'SUGGESTED_MOVE';

class Connection {
  constructor(messageHandlers, onOpenCb, onCloseCb) {
    this.url = "ws://localhost:8080/ws";
    this.messageHandlers = messageHandlers;
    this.reconnectAttempts = 0;
    this.nbReconnectAttempts = 5;
    this.onOpenCb = onOpenCb;
    this.onCloseCb = onCloseCb;
    this.initWs();
  }

  initWs() {
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = (evt) => {
        console.log("WS OPEN");
        this.reconnectAttempts = 0;
        this.onOpenCb();
      };

      this.ws.onclose = (evt) => {
        console.log(`WS CLOSE code: ${evt.code}`);
        this.onCloseCb();
        this.reconnect();
      };

      this.ws.onmessage = (evt) => {
        try {
          const action = JSON.parse(evt.data);
          this.handleMessage(action);
        }
        catch (e) {
          console.log('WS JSON parsing of message failed', e);
        }
      };

      this.ws.onerror = (evt) => {
        console.log("WS ERROR");
      }

    }
    catch (e) {
      console.log('error while initializing ws', e);
      this.reconnect();
    }
  }

  reconnect() {
    if (this.reconnectAttempts < this.nbReconnectAttempts) {
      this.reconnectAttempts += 1;
      setTimeout(() => this.initWs(), 1000);
    }
  }

  handleMessage(action) {
    const type = action.Type;
    if (this.messageHandlers[type]) {
      return this.messageHandlers[type](action);
    } else {
      console.log('invalid action type', type);
      return null;
    }
  }

  getWs() {
    return this.ws;
  }
}

export default Connection;
