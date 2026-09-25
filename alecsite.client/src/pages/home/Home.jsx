
import './homeStyle.css'

function Home() {
    return (
        <div className="background-secondary-color">
            <div className="p-5pct display-flex flex-col space-y-1">
                <h1 className="text-primary-color">Alec Powell</h1>

                <p className="text-primary-color">
                    Hey. I'm Alec! Welcome to my website which doubles as a small game — walk around to find your way in.
                </p>

                <p className="text-primary-color">
                    I build web applications, small games, and tinker with pixel-art side projects like this one.
                </p>


            </div>
        </div>
    );
}

export default Home;