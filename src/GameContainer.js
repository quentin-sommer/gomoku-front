import React from 'react'
import {LineChart, Line, YAxis, XAxis, CartesianGrid, Tooltip, Legend} from 'recharts'
import Game from './Game'
import Connection, {
  IDLE,
  START_OF_GAME,
  END_OF_GAME,
  PLAY_TURN,
  ENTER_ROOM,
  REFRESH,
  SET_AI_LEVEL,
  SUGGESTED_MOVE
} from './lib/Connection'

class GameContainer extends React.Component {
  constructor(props) {
    super(props);

    const wsConnectedCb = () => {
      this.setState({Ws: 'connected'});
      this.connection.getWs().send(JSON.stringify({
        Type: ENTER_ROOM,
        Room: this.props.room,
        AiMode: this.props.aiMode
      }));
    };
    const wsDisconnectedCb = () => {
      this.setState({Ws: 'disconnected'})
    };
    this.connection = new Connection(this.getMessagesHandlers(), wsConnectedCb, wsDisconnectedCb);
    const turnsPlayed = [60, 60];
    const capturedPawns = [0, 0];
    this.state = {
      Map: [],
      TurnsPlayed: turnsPlayed,
      CapturedPawns: capturedPawns,
      TurnOf: -1,
      Player: -1,
      GameStarted: false,
      GameEnded: false,
      Winner: -1,
      Ws: 'disconnected',
      iaStrength: 3,
      suggestedMove: -1,
      PlayTimes: [{
        AI: 0,
        Player: 0,
        turnNumber: 0,
      }],
      TimeCounter: -1,
      Means: {AI: 0, Player: 0}
    };
  }

  getAiTurnStats = () => {
    return this.getPlayerTurnStats();
  };

  getPlayerTurnStats = () => {
    const now = Date.now();
    return now - this.state.TimeCounter;
  };

  /**
   * Callback when player plays a pawn
   * @param cellIndex unsigned int
   */
  handleTurn = (cellIndex) => {
    const timeTaken = this.getPlayerTurnStats();
    const newMap = this.state.Map.slice(0);
    const turnsPlayed = this.state.TurnsPlayed.slice(0);

    newMap[cellIndex] = {
      Player: this.state.Player,
      Empty: false,
      Playable: false
    };
    turnsPlayed[this.state.Player] = turnsPlayed[this.state.Player] + 1;
    const newChart = this.state.PlayTimes.concat([{
      Player: timeTaken,
      turnNumber: this.state.TurnsPlayed[1]
    }]);
    this.setState({
      Map: newMap,
      TurnOf: (this.state.Player === 0) ? 1 : 0,
      TurnsPlayed: turnsPlayed,
      PlayTimes: newChart,
      TimeCounter: Date.now()
    });
    this.connection.getWs().send(JSON.stringify({
      Type: PLAY_TURN,
      Map: newMap,
      TurnsPlayed: turnsPlayed
    }));
  };
  handleAIChange = (iaStrength) => {
    iaStrength = parseInt(iaStrength, 10);
    this.connection.getWs().send(JSON.stringify({
      Type: SET_AI_LEVEL,
      Level: iaStrength
    }));
    this.setState({
      iaStrength: iaStrength
    });
  };

  getMessagesHandlers() {
    const messageHandlers = [];

    messageHandlers[IDLE] = (action) => {
      console.log('message: ', action.Type);
    };
    messageHandlers[START_OF_GAME] = (action) => {
      console.log('message: ', action.Type);
      this.setState({
        GameStarted: true,
        Player: action.PlayerNumber
      });
    };
    messageHandlers[END_OF_GAME] = (action) => {
      console.log('message: ', action.Type);
      this.setState({
        Winner: action.Winner,
        GameStarted: false,
        GameEnded: true,
        Map: action.Map,
        TurnsPlayed: action.TurnsPlayed,
        CapturedPawns: action.CapturedPawns
      });
    };
    messageHandlers[PLAY_TURN] = (action) => {
      if (this.state.TimeCounter !== -1) {
        let newChart;
        // hack to prevent graph from being udpated when it's the same turn being replayed
        if (this.state.PlayTimes[this.state.PlayTimes.length - 1].turnNumber === action.TurnsPlayed[1]) {
          newChart = [...this.state.PlayTimes];
          newChart.pop();
        } else {
          const aiTurn = this.getAiTurnStats();
          newChart = [...this.state.PlayTimes];
          newChart[newChart.length - 1].AI = aiTurn;
        }
        this.setState({
          TurnOf: this.state.Player,
          Map: action.Map,
          TurnsPlayed: action.TurnsPlayed,
          CapturedPawns: action.CapturedPawns,
          TimeCounter: Date.now(),
          PlayTimes: newChart,
        });
        const len = this.state.PlayTimes.length - 1;
        const means = this.state.PlayTimes.slice(1).reduce((acc, cur) => {
          return {
            AI: acc.AI += cur.AI,
            Player: acc.Player += cur.Player
          }
        }, {AI: 0, Player: 0});
        this.setState({
          Means: {
            AI: Math.round(means.AI / len),
            Player: Math.round(means.Player / len),
          }
        });
      } else {
        this.setState({
          TurnOf: this.state.Player,
          Map: action.Map,
          TurnsPlayed: action.TurnsPlayed,
          CapturedPawns: action.CapturedPawns,
          TimeCounter: Date.now(),
        });
      }
    };
    messageHandlers[REFRESH] = (action) => {
      console.log('message: ', action.Type);
      this.setState({
        Map: action.Map,
        TurnsPlayed: action.TurnsPlayed,
        CapturedPawns: action.CapturedPawns
      });
    };
    messageHandlers[SUGGESTED_MOVE] = (action) => {
      console.log('message: ', action.Type);
      this.setState({
        suggestedMove: action.SuggestedMove,
      })
    };

    return messageHandlers
  }

  render() {
    return (
      <div className="game-container" >
        <div className="game-info" >
          <div style={{display: 'flex', padding: '1rem', paddingBottom: '0', justifyContent: 'space-between'}} >
            <div style={{flex: 1}} >
              <h1 className="game-title" >Gomoku</h1>
              <div style={{textAlign: 'left'}} >
                <div>AI mean play time : {this.state.Means.AI}ms</div>
                <div>Player mean play time : {this.state.Means.Player}ms</div>
              </div>
            </div>
            <LineChart width={900} height={200} data={this.state.PlayTimes} >
              <YAxis yAxisId="left" orientation="left" stroke="#F44336" />
              <YAxis yAxisId="right" orientation="right" stroke="#8BC34A" />
              <XAxis dataKey="turnNumber" />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip/>
              <Legend verticalAlign="top" height={20} />
              <Line dot={false} yAxisId="left" type="monotone" dataKey="AI" stroke="#F44336" strokeWidth={2} />
              <Line dot={false} yAxisId="right" type="monotone" dataKey="Player" stroke="#8BC34A" strokeWidth={2} />
            </LineChart>
          </div>
          <div className="game-indicator" >Websocket status:
            {this.state.Ws === 'connected'
              ? <span> Connected</span>
              : <span className="warning" > Disconnected</span>
            }
          </div>
          {this.state.GameStarted ?
            this.state.Player !== 2
              ? this.genPlayerInterface()
              : this.genSpectatorInterface()
            : this.state.GameEnded
            ? this.genEndScreen()
            : this.genWaitForPlayer()
          }
        </div>
        <div className="canvas-container" >
          <Game {...this.state} onPawnPlayed={this.handleTurn} />
        </div>
      </div>
    )
  }

  genPlayerInterface = () => (
    <div className="game-indicator-container" >
      <div className="game-indicator" >
        <div>You are playing the {this.state.Player === 0 ? 'white' : 'black'}</div>
        <div>Turns played: {this.state.TurnsPlayed[this.state.Player]}</div>
      </div>
      <div className="game-indicator" >
        {this.state.TurnOf === this.state.Player
          ? <div>Your turn</div>
          : <div className="warning" >Not your turn</div>
        }
        <div>{this.props.aiMode
          ?
          <div>
            <input
              type="range"
              min={1}
              max={5}
              value={this.state.iaStrength}
              onChange={e => this.handleAIChange(e.target.value)}
            />
            <label>
              {this.state.iaStrength}
            </label>
          </div>
          : ''}
        </div>
      </div>
      <div className="game-indicator" >
        <div>You captured {this.state.CapturedPawns[this.state.Player]} pawns</div>
        <div>
          You lost {this.state.CapturedPawns[(this.state.Player === 0) ? 1 : 0]} pawns
        </div>
      </div>
    </div>
  );

  genSpectatorInterface = () => (
    <div className="game-indicator-container" >
      <div className="game-indicator" >
        <div>White turns played: {this.state.TurnsPlayed[0]}</div>
        <div>Black turns played: {this.state.TurnsPlayed[1]}</div>
      </div>
      <div className="game-indicator" >Spectator</div>
      <div className="game-indicator" >
        <div>Captured white pawns: {this.state.CapturedPawns[1]}</div>
        <div>Captured black pawns: {this.state.CapturedPawns[0]}</div>
      </div>
    </div>
  );

  genWaitForPlayer = () => (
    <div className="game-indicator-container" >
      <div className="game-indicator warning" >Waiting for another player</div>
    </div>
  );

  genEndScreen = () => (
    <div className="game-indicator-container" >
      <div className="game-indicator" >
        <div>White turns played: {this.state.TurnsPlayed[0]}</div>
        <div>Black turns played: {this.state.TurnsPlayed[1]}</div>
      </div>
      <div className="game-indicator" >
        <div>Game is finished</div>
        <div>Winner: {this.state.Winner === 0 ? 'white' : 'black'}</div>
      </div>
      <div className="game-indicator" >
        <div>Captured white pawns: {this.state.CapturedPawns[1]}</div>
        <div>Captured black pawns: {this.state.CapturedPawns[0]}</div>
      </div>
    </div>
  );
}

export default GameContainer;
