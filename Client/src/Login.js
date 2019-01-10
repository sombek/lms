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

                        <h6>Please Enter your info to see the attendance</h6>
                        <div className={'wrapper'}>
                            <img
                                src="https://thumbs.gfycat.com/HopefulShockedBarracuda-small.gif"
                                width={100}/>
                        </div>

                        <div className="nes-field">
                            <label htmlFor="name_field">Username</label>
                            <input type="text" onChange={this.props.updateUsername} className="nes-input"/>

                            <label htmlFor="name_field">Password</label>
                            <input type="password" onChange={this.props.updatePassword} className="nes-input"/>
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
