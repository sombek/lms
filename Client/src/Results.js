import React, {Component} from 'react';
import './App.css'

class Results extends Component {

    loadingImages = [
        'http://rs746.pbsrc.com/albums/xx106/Zukato-sama/1lg106Buzz.gif~c200',
        'http://img.ifcdn.com/images/3e413c4dd0bbe140681f191854c39aaeee9c8b4aab9fa7e1151d4ad7e265c289_1.gif',
        'http://rs794.pbsrc.com/albums/yy222/toystoryftw/Misc%20Toy%20Story/1385242ovj38uen07.gif~c200',
        'https://www.gifmania.co.uk/Walt-Disney-Animated-Gifs/Animated-Pixar-Movies/Toy-Story/Buzz-Little-Green-Men-82984.gif',
    ];

    render() {
        const {name, results} = this.props.student;
        return (
            <>
                <section className="nes-container with-title login-container">
                    <h2 className="title">Results</h2>
                    <h6>Welcome {name}</h6>

                    <div className={'wrapper'}>
                        <img
                            src={this.loadingImages[Math.floor(Math.random() * this.loadingImages.length)]}
                            width={150}/>


                        <div className="nes-table-responsive">
                            <table className="nes-table is-bordered is-centered">
                                <thead>
                                <tr>
                                    <th>Course</th>
                                    <th>Hours</th>
                                </tr>
                                </thead>

                                <tbody>
                                {
                                    results.map((item, i) =>
                                        <tr key={i}>
                                            <td>{item.courseName}</td>
                                            <td>{item.attendance}</td>
                                        </tr>
                                    )
                                }
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <br/>
                    <br/>

                    <div className={'wrapper'}>
                        <button type="button" className="nes-btn is-primary" onClick={this.props.reset}>Return</button>
                    </div>

                </section>
            </>
        );
    }
}

export default Results;
