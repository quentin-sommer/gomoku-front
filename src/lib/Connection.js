class Connection {
  constructor() {
    this.ws = new WebSocket("ws://localhost:8080/echo");

    this.ws.onopen = function (evt) {
      console.log("OPEN");
    };

    this.ws.onclose = function (evt) {
      console.log("CLOSE");
      this.ws = null;
    };

    this.ws.onmessage = function (evt) {
      console.log("RESPONSE: " + evt.data);
    };

    this.ws.onerror = function (evt) {
      console.log("ERROR: " + evt.data);
    }
  }

  getWs() {
    return this.ws;
  }
}

export default Connection;
