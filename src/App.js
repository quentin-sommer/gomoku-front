import React from 'react';
import GameContainer from './GameContainer';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      map: []
    }
  }

  render() {
    return (
        <div>
          <h1>Gomoku</h1>
          <GameContainer/>
        </div>
    );
  }
}

export default App;
