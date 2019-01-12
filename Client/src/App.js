import React, {Component} from 'react';
import './App.css';
import 'nes.css/css/nes.min.css'

import axios from 'axios';
import Login from './Login'
import Results from "./Results";


class App extends Component {

    state = {
        user: '',
        password: '',
        showLoading: false,
        student: false,
        error: false,
        showError: false,
    };

    fetchData = () => {
        if (this.state.user && this.state.password)
            this.setState({showLoading: true}, () => {
                axios.post(`http://updullah.me:4000`, {
                    user: this.state.user,
                    password: this.state.password
                }).then(res => {
                    if (res.data.err)
                        this.setState({
                            user: '',
                            password: '',
                            showLoading: false,
                            error: res.data.err,
                            showError: true
                        });
                    else
                        this.setState({
                            user: '',
                            password: '',
                            showLoading: false,
                            student: res.data.res,
                            showError: false
                        });
                })
                    .catch(res => this.setState({
                        user: '',
                        password: '',
                        showLoading: false,
                        showError: true,
                        error: res.message || res.data.err,
                    }));
            });
        else
            this.setState({
                showLoading: false,
                showError: true,
                error: "Username & Password is required",
            })

    };

    updateUsername = (event) => this.setState({user: event.target.value});
    updatePassword = (event) => this.setState({password: event.target.value});

    closeMessage = () => this.setState({showError: false, error: ''});

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
                                 username={this.state.user}
                                 password={this.state.password}
                                 fetchData={this.fetchData}
                                 showLoading={this.state.showLoading}/>

                }

                <div className={`nes-balloon from-right message ${this.state.showError ? '' : 'hidden'}`}>
                    <p>
                        {this.state.error}
                        <img src="https://orig00.deviantart.net/f028/f/2014/221/5/4/signal_by_pavanz-d7uhv5q.gif"
                             width={100} alt={'gif'}/>
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
