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
        Map: action.Map
      })
    };
    messageHandlers[REFRESH] = (action) => {
      console.log('message: ', action.Type);
      this.setState({
        Map: action.Map
      })
    };
    const wsConnectedCb = () => {
      this.connection.getWs().send(JSON.stringify({
        Type: ENTER_ROOM,
        Room: 42
      }));
    };

    this.connection = new Connection(messageHandlers, wsConnectedCb);

    this.state = {
      Map: [],
      TurnOf: -1,
      Player: -1,
      GameStarted: false
    };
  }

  /**
   * Callback when player plays a pawn
   * @param cellIndex unsigned int
   */
  handleTurn = (cellIndex) => {
    const newMap = this.state.Map.slice(0);
    newMap[cellIndex] = {
      Player: this.state.Player,
      Empty: false,
      Playable: false
    };
    this.setState({
      Map: newMap,
      TurnOf: (this.state.Player === 0) ? 1 : 0
    });
    this.connection.getWs().send(JSON.stringify({
      Type: PLAY_TURN,
      Map: newMap
    }));
  };

  render() {
    return (
        <div className="game-container">
          <div className="game-info">
            <h1 className="game-title">Gomoku</h1>
            <div className="game-indicator-container">
              {this.state.GameStarted
                  ? <div className="game-indicator">You are player {this.state.Player}</div>
                  : <div className="game-indicator warning">Game has not started yet</div>
              }
              {this.state.GameStarted && this.state.TurnOf === this.state.Player
                  ? <div className="game-indicator">Your turn</div>
                  : <div className="game-indicator warning">Not your turn</div>
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
