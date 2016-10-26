import React from 'react';
import Game from './Game';
import Connection from './lib/Connection';
import { genInitialMap } from './lib/Map';
import config from './config';

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

class GameContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      map: genInitialMap(),
      turnOf: -1,
      unauthorizedMoves: []
    };
    this.connection = new Connection();
  }

  /**
   * Callback when player plays a pawn
   * @param x unsigned int
   * @param y unsigned int
   */
  handleTurn = (x, y) => {
    // TODO: inject real player (0 or 1)
    this.state.map[x + (config.nbCase * y)] = {
      player: -1,
      empty: false,
      playable: false
    };
    this.setState({
      map: this.state.map
    });
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
          <Game {...this.state} onPawnPlayed={this.handleTurn}/>
        </div>
    )
  }

  handleClick = () => {
    let i = 0;
    const map = [];
    while (i < 120) {
      map.push({
        player: 0,
        empty: false,
        playable: false
      });
      i++;
    }

    this.setState({
      map
    });
  };

}

export default GameContainer;
