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
    const messageHandlers = [];

    messageHandlers[IDLE] = (action) => {
      console.log('message: ', action.Type);
    };
    messageHandlers[START_OF_GAME] = (action) => {
      console.log('message: ', action.Type);
      this.setState({
        GameStarted: true,
        Player: action.PlayerNumber
      })
    };
    messageHandlers[END_OF_GAME] = (action) => {
      console.log('message: ', action.Type);
    };
    messageHandlers[PLAY_TURN] = (action) => {
      console.log('message: ', action.Type);
      this.setState({
        TurnOf: this.state.Player,
        Map: action.Map,
        AvailablePawns: action.AvailablePawns,
        CapturedPawns: action.CapturedPawns
      })
    };
    messageHandlers[REFRESH] = (action) => {
      console.log('message: ', action.Type);
      this.setState({
        Map: action.Map,
        AvailablePawns: action.AvailablePawns,
        CapturedPawns: action.CapturedPawns
      })
    };
    const wsConnectedCb = () => {
      this.setState({ws: 'connected'});
      this.connection.getWs().send(JSON.stringify({
        Type: ENTER_ROOM,
        Room: 42
      }));
    };
    const wsDisconnectedCb = () => {
      this.setState({ws: 'disconnected'})
    };
    this.connection = new Connection(messageHandlers, wsConnectedCb, wsDisconnectedCb);

    this.state = {
      Map: [],
      AvailablePawns: [],
      CapturedPawns: [],
      TurnOf: -1,
      Player: -1,
      GameStarted: false,
      ws: 'disconnected'
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
    availablePawns[this.state.Player] = availablePawns[this.state.Player] - 1;

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

  render() {
    return (
        <div className="game-container">
          <div className="game-info">
            <h1 className="game-title">Gomoku</h1>
            <div className="game-indicator-container">
              {this.state.GameStarted
                  ? this.state.Player !== 2
                  ? <div className="game-indicator">You are player {this.state.Player}</div>
                  : <div className="game-indicator">Spectator</div>

                  : <div className="game-indicator warning">Game has not started yet</div>
              }
              {this.state.GameStarted && this.state.TurnOf === this.state.Player
                  ? <div className="game-indicator">Your turn</div>
                  : <div className="game-indicator warning">Not your turn</div>
              }
              {this.state.ws === 'connected'
                  ? <div className="game-indicator">Connected</div>
                  : <div className="game-indicator warning">Disconnected</div>
              }
            </div>
          </div>
          <div className="canvas-container">
            <Game {...this.state} onPawnPlayed={this.handleTurn}/>
          </div>
        </div>
    )
  }
}

export default GameContainer;
