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
import {genInitialMap} from './lib/Map';

class GameContainer extends React.Component {
  constructor(props) {
    super(props);
    const messageHandlers = [];

    messageHandlers[IDLE] = (action) => {
      console.log('message: ', action.Type)
    };
    messageHandlers[START_OF_GAME] = (action) => {
      this.setState({
        Player: action.PlayerNumber
      })
    };
    messageHandlers[END_OF_GAME] = (action) => {
      console.log('message: ', action.Type);
    };
    messageHandlers[PLAY_TURN] = (action) => {
      console.log('message: ', action.Type);
      this.setState({
        TurnOf: this.state.Player
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
      Map: genInitialMap(),
      TurnOf: -1,
      Player: -1,
      gameState: IDLE
    };
  }

  /**
   * Callback when player plays a pawn
   * @param cellIndex unsigned int
   */
  handleTurn = (cellIndex) => {
    // TODO: inject real player (0 or 1)
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

    // TODO: send turn to webserver
  };

  render() {
    return (
        <div>
          <button onClick={this.handleClick}>stress test</button>
          <button onClick={() => {
            this.connection.getWs().send('testMsg')
          }}>test wesbsocket
          </button>
          {this.state.Player !== -1
              ? <p>You are player {this.state.Player}</p>
              : <p>Game has not started yet</p>
          }
          {this.state.TurnOf !== -1 && this.state.TurnOf === this.state.Player
              ? <p>Your turn</p>
              : <p>Not your turn</p>
          }
          <Game {...this.state} onPawnPlayed={this.handleTurn}/>
        </div>
    )
  }

  handleClick = () => {
    let i = 0;
    const map = [];
    while (i < 120) {
      map.push({
        Player: 0,
        Empty: false,
        Playable: false
      });
      i++;
    }

    this.setState({
      Map: map
    });
  };

}

export default GameContainer;
