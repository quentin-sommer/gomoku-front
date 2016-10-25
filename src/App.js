import React from 'react';
import Game from './Game';
import './App.css';

class App extends React.Component {
  render() {
    return (
        <div>
          <h1>Gomoku</h1>
          <Game/>
        </div>
    );
  }
}

export default App;
