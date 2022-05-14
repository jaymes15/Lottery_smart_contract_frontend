import logo from './logo.svg';
import './App.css';
import web3 from './web3';
import lottery from './lottery';
import { Component } from 'react';

class App extends Component{

  state = {
    manager: '',
    players: [],
    balance: '',
    minAmountToEnterLottery: '',
    value: '',
    message: '',

  };

  async componentDidMount(){
    const manager = await lottery.methods.manager().call();
    const players = await lottery.methods.getLotteryPlayer().call();
    const balance = await web3.eth.getBalance(lottery.options.address);
    const minAmountToEnterLottery = await lottery.methods.minAmountToEnterLottery().call();

    this.setState({
      manager: manager,
      players: players,
      balance: balance,
      minAmountToEnterLottery: minAmountToEnterLottery
    });
  }

  onSubmit = async (event) => {
    event.preventDefault();

    const accounts = await web3.eth.getAccounts();

    this.setState({message: "Processing transaction to enter lottery....."});

    try{
      await lottery.methods.enterLottery().send({
        from: accounts[0],
        value: web3.utils.toWei(this.state.value, 'ether'),
      });

      const players = await lottery.methods.getLotteryPlayer().call();
      const balance = await web3.eth.getBalance(lottery.options.address);

      this.setState({
        message: "successfully entered lottery",
        players: players,
        balance: balance
      });


    }catch (err){
      this.setState({message: "An error occurred"});
    }

  }

  pickWinner = async() =>{
    try{

      this.setState({message: "Picking a winner....."});
      const accounts = await web3.eth.getAccounts();

      await lottery.methods.pickWinner().send({
        from: accounts[0]
      });
      const winner = await lottery.methods.getWinnerFromPrevLottery().call();
      const players = await lottery.methods.getLotteryPlayer().call();
      const balance = await web3.eth.getBalance(lottery.options.address);

      this.setState({
        message: `The Winner is: ${winner}`,
        players: players,
        balance: balance
      });
    }
    catch (err){
      console.log("error");
      console.log(err);
      this.setState({message: "An error occurred"});
    }

  }

  render(){
    return(
      <>
        <h2>Lottery Contract</h2>
        <p>This contract is managed by {this.state.manager} </p>
        <p>Lottery Balance: {web3.utils.fromWei(this.state.balance, 'ether')}</p>
        <p>Number of lottery players: {this.state.players.length}</p>

        <hr/>
        <form onSubmit={this.onSubmit}>
          <h4>Want to try your luck?!</h4>
          <div>
            <label>
              Amount to ether to enter {web3.utils.fromWei(this.state.minAmountToEnterLottery, 'ether')} ether <br/><br/>
            </label>
            <input
              value={this.state.value}
              onChange={(event) => this.setState({ value: event.target.value })}
            />
            <button>Enter</button>
          </div>
        </form>
        <hr/>
        <h4>Ready to pick a winner?</h4>
        <button onClick={this.pickWinner}>Pick a winner</button>
        <hr/>
        <h1>{this.state.message}</h1>


      </>
    );
  }
}

export default App;
