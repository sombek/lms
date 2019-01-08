import React, {Component} from 'react';
import './App.css';
import 'nes.css/css/nes.min.css'

import axios from 'axios';
import Login from "./Login";
import Results from "./Results";


class App extends Component {

    state = {
        user: '',
        password: '',
        showLoading: false,
        student: undefined,
        error: undefined,
    };

    fetchData = () => {
        this.setState({showLoading: true});
        axios.post(`http://localhost:4000`, {
            user: this.state.user,
            password: this.state.password
        }).then(res => {
            if (res.data.err)
                this.setState({
                    showLoading: false,
                    error: res.data.err
                });
            else
                this.setState({
                    showLoading: false,
                    student: res.data.res
                });
        });
    };

    updateUsername = (event) => this.setState({user: event.target.value});
    updatePassword = (event) => this.setState({password: event.target.value});

    closeMessage = () => this.setState({error: undefined});

    reset = () => this.setState({student: undefined});

    render() {
        return (
            <div className={`App`}>
                {
                    this.state.student ?
                        <Results student={this.state.student}
                                 reset={this.reset}
                        />
                        : <Login updateUsername={this.updateUsername}
                                 updatePassword={this.updatePassword}
                                 fetchData={this.fetchData}
                                 showLoading={this.state.showLoading}/>

                }

                <div className="nes-balloon from-right message" hidden={!this.state.error}>
                    <p>
                        {this.state.error}
                        <img src="https://orig00.deviantart.net/f028/f/2014/221/5/4/signal_by_pavanz-d7uhv5q.gif"
                             width={100}/>
                    </p>
                    <div style={{textAlign: 'right'}}>
                        <button type="button" className="nes-btn is-error" onClick={this.closeMessage}>X</button>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
