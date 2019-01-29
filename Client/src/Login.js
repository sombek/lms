import React, {Component} from 'react';
import './App.css'

class Login extends Component {
    loadingImages = [
        {
            url: 'https://media.giphy.com/media/gx54W1mSpeYMg/giphy.gif',
            width: 100
        },{
            url: 'https://media.giphy.com/media/qzPH01HCx1n8I/giphy.gif',
            width: 100
        },{
            url: 'https://media.giphy.com/media/ukMiDlCmdv2og/giphy.gif',
            width: 100
        },{
            url: 'https://media.giphy.com/media/K37u4P7MLoJfW/giphy.gif',
            width: 200
        },{
            url: 'https://media.giphy.com/media/IPbS5R4fSUl5S/giphy.gif',
            width: 200
        },{
            url: 'https://media.giphy.com/media/HPF6ivflFs7U4/giphy.gif',
            width: 150
        },{
            url: 'https://media.giphy.com/media/JcZzoAcTjUZ2/giphy.gif',
            width: 150
        },{
            url: 'https://media.giphy.com/media/l2Je66zG6mAAZxgqI/giphy.gif',
            width: 150
        },{
            url: 'https://media.giphy.com/media/l2RbeHTkknU52SfPq/giphy.gif',
            width: 150
        },{
            url: 'https://media.giphy.com/media/3oz8xOJiQ9VtnOKAIU/giphy.gif',
            width: 150
        },{
            url: 'https://media.giphy.com/media/26AHG5KGFxSkUWw1i/giphy.gif',
            width: 150
        },
    ];


    img = {
        url: '',
        width: 100
    };

    componentWillMount() {
        this.img = this.loadingImages[Math.floor(Math.random() * this.loadingImages.length)];
    }


    render() {
        return (
            <>
                <section className={`nes-container with-title login-container`}>
                    <h2 className="title">Login Page</h2>
                    <div className="containers">

                        <h6>Attendance Checker Application</h6>
                        <div className={'wrapper'}>
                            <img src={this.img.url}
                                 width={this.img.width}
                                 height={90} alt={'gif'}/>
                        </div>

                        <section className="nes-container with-title uni">
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

                <section className="nes-container is-rounded loading-container" hidden={this.props.showLoading}>
                    <h5>Loading</h5>
                    <img src="https://media.giphy.com/media/MJTOHmGiGPHgI/giphy.gif"
                         alt="" width={160}/>

                    <p style={{fontSize: '6pt', marginTop: 5}}>There is a delay in SIS usually it takes 33s to be
                        done</p>
                </section>
            </>
        );
    }
}

export default Login;
