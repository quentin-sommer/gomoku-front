import React from 'react';
import Game from './Game';
import Connection, {
    IDLE,
    START_OF_GAME,
    END_OF_GAME,
    PLAY_TURN
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
        player: action.PlayerNumber
      })
    };
    messageHandlers[END_OF_GAME] = (action) => {
      console.log('message: ', action.Type);
    };
    messageHandlers[PLAY_TURN] = (action) => {
      console.log('message: ', action.Type);
      if (action.Map) {
        this.setState({
          map: action.Map,
          turnOf: this.state.player
        })
      } else {
        this.setState({
          turnOf: this.state.player
        })
      }
    };
    this.connection = new Connection(messageHandlers);

    this.state = {
      map: genInitialMap(),
      turnOf: -1,
      player: -1,
      gameState: IDLE
    };
  }

  /**
   * Callback when player plays a pawn
   * @param cellIndex unsigned int
   */
  handleTurn = (cellIndex) => {
    // TODO: inject real player (0 or 1)
    const newMap = this.state.map.slice(0);
    newMap[cellIndex] = {
      player: this.state.player,
      empty: false,
      playable: false
    };
    this.setState({
      map: newMap,
      turnOf: (this.state.player === 0) ? 1 : 0
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
          {this.state.player !== -1
              ? <p>You are player {this.state.player}</p>
              : <p>Game has not started yet</p>
          }
          {this.state.turnOf === this.state.player
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
      map
    });
  };

}

export default GameContainer;
