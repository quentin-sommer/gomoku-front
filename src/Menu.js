import React from 'react'
import GameContainer from './GameContainer'

export default class Menu extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      room: 42,
      loadGame: false
    }
  }

  handleRoomFormSubmit = (e) => {
    e.preventDefault();
    console.log('loading game with room', this.state.room);
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
          ? <GameContainer room={this.state.room} />
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
        <input type="number" placeholder="room number" required name="roomNumber" value={this.state.room} onChange={this.handleRoomChange} />
        <button style={{marginLeft: '2rem'}} type="submit" >Enter room</button>
      </form>
    </div>
  )
}
