import React, {Component} from 'react';
import './App.css';
import 'nes.css/css/nes.min.css'

import axios from 'axios';
import Results from "./Results";
import Login from "./Login";


class App extends Component {

    state = {
        user: '',
        password: '',
        university: '',
        showLoading: false,
        student: false,
        // student: {
        //     name: 'Abdullah Hashim',
        //     results: [
        //         {
        //             courseName: 'abc',
        //             hours: '13',
        //             percentage: '3'
        //         }, {
        //             courseName: 'abc',
        //             hours: '13',
        //             percentage: '3'
        //         }, {
        //             courseName: 'abc',
        //             hours: '13',
        //             percentage: '3'
        //         }, {
        //             courseName: 'abc',
        //             hours: '13',
        //             percentage: '3'
        //         }, {
        //             courseName: 'abc',
        //             hours: '13',
        //             percentage: '3'
        //         }, {
        //             courseName: 'abc',
        //             hours: '13',
        //             percentage: '3'
        //         }, {
        //             courseName: 'abc',
        //             hours: '13',
        //             percentage: '3'
        //         }, {
        //             courseName: 'abc',
        //             hours: '13',
        //             percentage: '3'
        //         }, {
        //             courseName: 'abc',
        //             hours: '13',
        //             percentage: '3'
        //         }, {
        //             courseName: 'abc',
        //             hours: '13',
        //             percentage: '3'
        //         }, {
        //             courseName: 'abc',
        //             hours: '13',
        //             percentage: '3'
        //         }, {
        //             courseName: 'abc',
        //             hours: '13',
        //             percentage: '3'
        //         }, {
        //             courseName: 'abc',
        //             hours: '13',
        //             percentage: '3'
        //         }, {
        //             courseName: 'abc',
        //             hours: '13',
        //             percentage: '3'
        //         }, {
        //             courseName: 'abc',
        //             hours: '13',
        //             percentage: '3'
        //         }, {
        //             courseName: 'abc',
        //             hours: '13',
        //             percentage: '3'
        //         }, {
        //             courseName: 'abc',
        //             hours: '13',
        //             percentage: '3'
        //         }, {
        //             courseName: 'abc',
        //             hours: '13',
        //             percentage: '3'
        //         },
        //     ],
        //     university: 'RCYCI'
        // },
        error: false,
        showError: false,
        showInfo: false,
    };

    fetchData = () => {
        if (this.state.user && this.state.password && this.state.university)
            this.setState({showLoading: true}, () => {
                axios.post(`https://updullah.me:4000`, {
                    user: this.state.user,
                    password: this.state.password,
                    university: this.state.university
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
                error: "Username & Password & University are required",
            })

    };

    updateUsername = (event) => this.setState({user: event.target.value});
    updatePassword = (event) => this.setState({password: event.target.value});

    closeMessage = () => this.setState({showError: false, error: ''});

    setUni = (event) => {
        if (event.target) {
            console.log(event.target.value);
            this.setState({university: event.target.value});
        }
    };

    reset = () => this.setState({student: undefined});
    showInfo = () => this.setState({showInfo: true});
    closeInfo = () => this.setState({showInfo: false});

    render() {
        return (
            <div className={`App`}>

                {
                    this.state.student ?
                        <Results student={this.state.student}
                                 showInfo={this.showInfo}
                                 reset={this.reset}
                        />
                        : <Login updateUsername={this.updateUsername}
                                 updatePassword={this.updatePassword}
                                 username={this.state.user}
                                 password={this.state.password}
                                 setUni={this.setUni}
                                 fetchData={this.fetchData}
                                 showLoading={this.state.showLoading}/>

                }

                <div className={`nes-balloon from-right message ${this.state.showError ? '' : 'hidden'}`}>
                    <p>
                        {this.state.error}
                        <br/>
                        <img src="https://orig00.deviantart.net/f028/f/2014/221/5/4/signal_by_pavanz-d7uhv5q.gif"
                             width={80} alt={'gif'}/>
                    </p>
                    <div style={{textAlign: 'right'}}>
                        <button type="button" className="nes-btn is-error" onClick={this.closeMessage}>X</button>
                    </div>
                </div>

                <div className={`nes-balloon from-right infoMessage ${this.state.showInfo ? '' : 'hidden'}`}>
                    <p>
                        Thanks for using this app
                        For more click on github
                        <i className="nes-octocat" onClick={() => window.open('https://github.com/sombek')}/>
                    </p>

                    <div style={{textAlign: 'right'}}>
                        <button type="button" className="nes-btn is-error" onClick={this.closeInfo}>X</button>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
