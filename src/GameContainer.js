import React from 'react';
import Game from './Game';
import Connection from './lib/Connection';
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
      map: [],
      turnOf: -1,
      unauthorizedMoves: []
    };
    this.connection = new Connection();
  }

  /**
   * callback when player plays a pawn
   * @param position {x, y}
   */
  handleTurn = (position) => {
    // send turn to webserver
  };

  render() {
    return (
        <div>
          <button onClick={this.handleClick}>CLICK</button>
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
        x: getRandomIntInclusive(0, config.nbCase - 1),
        y: getRandomIntInclusive(0, config.nbCase - 1)
      });
      i++;
    }

    this.setState({
      map
    });
  };

}

export default GameContainer;
