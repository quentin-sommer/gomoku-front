import React from 'react';
import Game from './Game';
import './App.css';
import config from './config';

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      map: []
    }
  }

  handleClick = () => {
    let i = 0;
    //if (this.state.map.length === 0) {
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
    })
    /* } else {
     this.setState({
     map: this.state.map.slice(1)
     })
     }*/
  };

  render() {
    return (
        <div>
          <h1>Gomoku</h1>
          <button onClick={this.handleClick}>CLICK</button>
          <Game pawns={this.state.map}/>
        </div>
    );
  }
}

export default App;
