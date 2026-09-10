import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import NavScene from './components/nav-scene/NavScene.jsx';
import Home from './pages/home/Home.jsx';
import About from './pages/about/About.jsx';
import Projects from './pages/projects/Projects.jsx';
import Contact from './pages/contact/Contact.jsx';
import Games from './pages/games/Games.jsx';

function App() {
    return (
        <BrowserRouter>
            <NavScene />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/games" element={<Games />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App;
