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
        <div className="container">
          <GameContainer/>
        </div>
    );
  }
}

export default App;
