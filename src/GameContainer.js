import React from 'react';
import Game from './Game';
import Connection, {
    IDLE,
    START_OF_GAME,
    END_OF_GAME,
    PLAY_TURN,
    ENTER_ROOM,
    REFRESH
} from './lib/Connection';

class GameContainer extends React.Component {
  constructor(props) {
    super(props);

    const wsConnectedCb = () => {
      this.setState({Ws: 'connected'});
      this.connection.getWs().send(JSON.stringify({
        Type: ENTER_ROOM,
        Room: 42
      }));
    };
    const wsDisconnectedCb = () => {
      this.setState({Ws: 'disconnected'})
    };
    this.connection = new Connection(this.getMessagesHandlers(), wsConnectedCb, wsDisconnectedCb);
    const availablePawns = [60, 60];
    const capturedPawns = [0, 0];
    this.state = {
      Map: [],
      AvailablePawns: availablePawns,
      CapturedPawns: capturedPawns,
      TurnOf: -1,
      Player: -1,
      GameStarted: false,
      GameEnded: false,
      Winner: -1,
      Ws: 'disconnected'
    };
  }

  /**
   * Callback when player plays a pawn
   * @param cellIndex unsigned int
   */
  handleTurn = (cellIndex) => {
    const newMap = this.state.Map.slice(0);
    const availablePawns = this.state.AvailablePawns.slice(0);

    newMap[cellIndex] = {
      Player: this.state.Player,
      Empty: false,
      Playable: false
    };
    availablePawns[this.state.Player] = availablePawns[this.state.Player] + 1;

    this.setState({
      Map: newMap,
      TurnOf: (this.state.Player === 0) ? 1 : 0,
      AvailablePawns: availablePawns
    });
    this.connection.getWs().send(JSON.stringify({
      Type: PLAY_TURN,
      Map: newMap,
      AvailablePawns: availablePawns
    }));
  };

  getMessagesHandlers() {
    const messageHandlers = [];

    messageHandlers[IDLE] = (action) => {
      console.log('message: ', action.Type);
    };
    messageHandlers[START_OF_GAME] = (action) => {
      console.log('message: ', action.Type);
      this.setState({
        GameStarted: true,
        Player: action.PlayerNumber
      });
    };
    messageHandlers[END_OF_GAME] = (action) => {
      console.log('message: ', action.Type);
      this.setState({
        Winner: action.Winner,
        GameStarted: false,
        GameEnded: true,
        Map: action.Map,
        AvailablePawns: action.AvailablePawns,
        CapturedPawns: action.CapturedPawns
      });
    };
    messageHandlers[PLAY_TURN] = (action) => {
      console.log('message: ', action.Type);
      this.setState({
        TurnOf: this.state.Player,
        Map: action.Map,
        AvailablePawns: action.AvailablePawns,
        CapturedPawns: action.CapturedPawns
      });
    };
    messageHandlers[REFRESH] = (action) => {
      console.log('message: ', action.Type);
      this.setState({
        Map: action.Map,
        AvailablePawns: action.AvailablePawns,
        CapturedPawns: action.CapturedPawns
      });
    };

    return messageHandlers
  }

  render() {
    return (
        <div className="game-container">
          <div className="game-info">
            <h1 className="game-title">Gomoku</h1>
            <div className="game-indicator">Websocket status:
              {this.state.Ws === 'connected'
                  ? <span> Connected</span>
                  : <span className="warning"> Disconnected</span>
              }
            </div>
            {this.state.GameStarted ?
                this.state.Player !== 2
                    ? this.genPlayerInterface()
                    : this.genSpectatorInterface()
                : this.state.GameEnded
                ? this.genEndScreen()
                : this.genWaitForPlayer()
            }
          </div>
          <div className="canvas-container">
            <Game {...this.state} onPawnPlayed={this.handleTurn}/>
          </div>
        </div>
    )
  }

  genPlayerInterface = () => (
      <div className="game-indicator-container">
        <div className="game-indicator">
          <div>You are playing the {this.state.Player === 0 ? 'white' : 'black'}</div>
          <div>Turns played: {this.state.AvailablePawns[this.state.Player]}</div>
        </div>
        {this.state.TurnOf === this.state.Player
            ? <div className="game-indicator">Your turn</div>
            : <div className="game-indicator warning">Not your turn</div>
        }
        <div className="game-indicator">
          <div>You captured {this.state.CapturedPawns[this.state.Player]} pawns</div>
          <div>
            You lost {this.state.CapturedPawns[(this.state.Player === 0) ? 1 : 0]} pawns
          </div>
        </div>
      </div>
  );

  genSpectatorInterface = () => (
      <div className="game-indicator-container">
        <div className="game-indicator">
          <div>White turns played: {this.state.AvailablePawns[0]}</div>
          <div>Black turns played: {this.state.AvailablePawns[1]}</div>
        </div>
        <div className="game-indicator">Spectator</div>
        <div className="game-indicator">
          <div>Captured white pawns: {this.state.CapturedPawns[1]}</div>
          <div>Captured black pawns: {this.state.CapturedPawns[0]}</div>
        </div>
      </div>
  );

  genWaitForPlayer = () => (
      <div className="game-indicator-container">
        <div className="game-indicator warning">Waiting for another player</div>
      </div>
  );

  genEndScreen = () => (
      <div className="game-indicator-container">
        <div className="game-indicator">
          <div>White turns played: {this.state.AvailablePawns[0]}</div>
          <div>Black turns played: {this.state.AvailablePawns[1]}</div>
        </div>
        <div className="game-indicator">
          <div>Game is finished</div>
          <div>Winner: {this.state.Winner === 0 ? 'white' : 'black'}</div>
        </div>
        <div className="game-indicator">
          <div>Captured white pawns: {this.state.CapturedPawns[1]}</div>
          <div>Captured black pawns: {this.state.CapturedPawns[0]}</div>
        </div>
      </div>
  );
}

export default GameContainer;
