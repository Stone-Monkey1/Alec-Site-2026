import { Link } from 'react-router-dom';
import './homeStyle.css'

function Home() {
    return (
        <div className="background-secondary-color">
            <div className="p-5pct display-flex flex-col space-y-1">
                {/* TODO: your name/handle */}
                <h1 className="text-primary-color">Alec Powell</h1>

                {/* Suggested copy — edit freely */}
                <p className="text-primary-color">
                    Software engineer. This site doubles as a small game — walk around to find your way in.
                </p>

                {/* TODO: one line on what you actually do / are into right now */}
                <p className="text-primary-color">
                    I build [what you build], and tinker with pixel-art side projects like this one.
                </p>

                {/* TODO: optional teaser for a recent/favorite project — delete this <p> if it feels like too much */}
                <p className="text-primary-color">
                    Latest: <Link className="text-primary-color" to="/projects">[Project Name]</Link> →
                </p>
            </div>
        </div>
    );
}

export default Home;