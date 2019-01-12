import React, {Component} from 'react';
import './App.css'

class Login extends Component {

    state = {
        loadingImages: []
    };

    render() {
        return (
            <>
                <section className={`nes-container with-title login-container`}>
                    <h2 className="title">Login Page</h2>
                    <div className="containers">

                        <h6>Attendance Checker Application</h6>
                        <div className={'wrapper'}>
                            <img
                                src="https://thumbs.gfycat.com/HopefulShockedBarracuda-small.gif"
                                width={100} alt={'gif'}/>
                        </div>

                        <section className="nes-container with-title">
                            <h2 className="title">Select Uni</h2>
                            <div>
                                <label>
                                    <input type="radio" className="nes-radio" name={'university'} value={'RCYCI'}
                                           onChange={this.props.setUni.bind(this)}/>
                                    <span>RCYCI</span>
                                </label>
                                <br/>
                                <label>
                                    <input type="radio" className="nes-radio" name={'university'} value={'EFFAT'}
                                           onChange={this.props.setUni.bind(this)}/>
                                    <span>EFFAT</span>
                                </label>
                            </div>
                        </section>


                        <div className="nes-field">
                            <label htmlFor="name_field">Username</label>
                            <input type="text" onChange={this.props.updateUsername} value={this.props.username}
                                   className="nes-input"/>

                            <label htmlFor="name_field">Password</label>
                            <input type="password" onChange={this.props.updatePassword} value={this.props.password}
                                   className="nes-input"/>
                        </div>

                        <br/>

                        <div className={'wrapper'}>
                            <button type="button" className="nes-btn" onClick={this.props.fetchData}>Login</button>
                        </div>
                    </div>
                </section>

                <div className={`${this.props.showLoading ? 'overlay' : ''}`}/>

                <section className="nes-container is-rounded loading-container" hidden={!this.props.showLoading}>
                    <h5>Loading</h5>
                    <img src="https://mir-s3-cdn-cf.behance.net/project_modules/disp/92b69c22219753.5630ea254987a.gif"
                         alt="" width={160}/>
                </section>
            </>
        );
    }
}

export default Login;
