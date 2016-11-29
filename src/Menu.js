import React from 'react'
import GameContainer from './GameContainer'
import './menu.css'

export default class Menu extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      room: 42,
      aiMode: true,
      loadGame: false
    }
  }

  handleRoomFormSubmit = (e) => {
    e.preventDefault();
    console.log(`loading ${this.state.aiMode ? 'IA game' : 'human game'} game with room ${this.state.room}`);
    this.setState({
      loadGame: true
    })
  };

  handleRoomChange = (e) => {
    this.setState({
      room: parseInt(e.target.value, 10)
    })
  };

  render() {
    return (
      <div>
        {this.state.loadGame
          ? <GameContainer room={this.state.room} aiMode={this.state.aiMode} />
          : this.genRoomForm()
        }
      </div>
    )
  }

  genRoomForm = () => (
    <div style={{
      textAlign: 'center',
      width: '80%',
      margin: 'auto',
      paddingTop: '10vh'
    }} >
      <h1>Choose a room to enter</h1>
      <form onSubmit={this.handleRoomFormSubmit} >
        <div className="menu-form" >
          <div className="form-elem" >
            <input style={{width: '100%'}} type="number" placeholder="room number" required name="roomNumber" value={this.state.room} onChange={this.handleRoomChange} />
          </div>
          <div className="form-elem" >
            <input
              id="iagame"
              type="radio"
              name="iagame"
              value="true"
              checked={this.state.aiMode}
              onChange={() => this.setState({aiMode: true})}
            />
            <label htmlFor="iagame" style={{marginLeft: '1rem'}} >Play against AI</label>
          </div>
          <div className="form-elem" >
            <input
              id="humangame"
              type="radio"
              name="iagame"
              value="false"
              checked={!this.state.aiMode}
              onChange={() => this.setState({aiMode: false})}
            />
            <label htmlFor="humangame" style={{marginLeft: '1rem'}} >Play against human</label>
          </div>
          <button type="submit" >Enter room</button>
        </div>
      </form>
    </div>
  )
}
