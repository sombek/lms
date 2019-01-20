import React, {Component} from 'react';
import './App.css'

class Results extends Component {

    loadingImages = [
        {
            url: 'http://rs746.pbsrc.com/albums/xx106/Zukato-sama/1lg106Buzz.gif~c200',
            width: 100
        }, {
            url: 'http://rs794.pbsrc.com/albums/yy222/toystoryftw/Misc%20Toy%20Story/1385242ovj38uen07.gif~c200',
            width: 100
        }, {
            url: 'https://www.gifmania.co.uk/Walt-Disney-Animated-Gifs/Animated-Pixar-Movies/Toy-Story/Buzz-Little-Green-Men-82984.gif',
            width: 100
        }, {
            url: 'https://media.giphy.com/media/MQWqYabCLWEtW/giphy.gif',
            width: 150
        }, {
            url: 'https://media.giphy.com/media/rOEvmLAxxcE1i/giphy.gif',
            width: 150
        }, {
            url: 'https://media.giphy.com/media/gisoxd5IYmUMM/giphy.gif',
            width: 150
        }, {
            url: 'https://media.giphy.com/media/xUOwGpCYAioBj5RQQg/giphy.gif',
            width: 180
        }, {
            url: 'https://media.giphy.com/media/dEdmW17JnZhiU/giphy.gif',
            width: 180
        }, {
            url: 'https://media.giphy.com/media/eKDp7xvUdbCrC/giphy.gif',
            width: 180
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
        const {name, results, university} = this.props.student;

        return (
            <>
                <section className="nes-container with-title login-container results">
                    <h6 className="title" style={{marginBottom: 0}}>{name}</h6>

                    <div className={'wrapper'}>
                        <img
                            src={this.img.url}
                            width={this.img.width}
                            height={100} alt={'gif'}/>
                    </div>
                    <div className="nes-table-responsive table">
                        <table className="nes-table is-bordered is-centered">
                            <thead>

                            {
                                university === "EFFAT" ? (
                                    <tr>
                                        <th style={{width: '40%'}}>Course</th>
                                        <th>P</th>
                                        <th>A</th>
                                        <th>L</th>
                                        <th>E</th>
                                        <th>U</th>
                                    </tr>
                                ) : (
                                    <tr>
                                        <th style={{width: '40%'}}>Course</th>
                                        <th>Hours</th>
                                        <th>%</th>
                                    </tr>
                                )
                            }
                            </thead>

                            <tbody>
                            {
                                university === "EFFAT" ?
                                    results.map((item, i) =>
                                        <tr key={i}>
                                            <td>{item.courseName}</td>
                                            <td>{item.present}</td>
                                            <td>{item.absent}</td>
                                            <td>{item.late}</td>
                                            <td>{item.excused}</td>
                                            <td>{item.unexcused}</td>
                                        </tr>
                                    ) :
                                    results.map((item, i) =>
                                        <tr key={i}>
                                            <td>{item.courseName}</td>
                                            <td>{item.hours}</td>
                                            <td>{item.percentage}</td>
                                        </tr>
                                    )
                            }
                            </tbody>
                        </table>
                    </div>

                    <div className={'wrapper results_buttons'}>
                        <button type="button" className="nes-btn is-primary" onClick={this.props.reset}>Return</button>
                        <button type="button" className="nes-btn is-warning" onClick={this.props.showInfo}>Info</button>
                    </div>

                </section>
            </>
        );
    }
}

export default Results;
