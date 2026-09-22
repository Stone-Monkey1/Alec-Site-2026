import { useState } from 'react';
import './projectsStyle.css';

const PROJECTS = [
    {
        title: 'Government Contract Tracker & Stock Purchases',
        technology: 'Python',
        status: 'Completed',
        description: (
            <>
                This project pulled daily government contracts via one the{' '}
                <a href="https://www.usaspending.gov/">https://www.usaspending.gov/</a>{' '}
                APIs. It would look through every contract and save the information of
                contracts awarded that exceeded $5,000,000. It then checked to see
                whether the company awarded the contract was publicly traded. It then
                purchased stock based off of a scoring alogorithm. The hypothesis was
                big contract awards would affect the price of the stock in the
                following days. I then mounted the program on my personal server. I ran
                it for a few months. I was not able to find a correlation to support my
                hypothesis.
            </>
        ),
    },
    {
        title: 'Sokal QA Application',
        technology: 'Node/Express + Vue',
        status: 'Completed',
        description:
            'Desktop tool that crawls dealership sites and runs modular checks (navigation/title validation, alt-tag checks, responsive image checks, quick-links tests, keyword search, CSS unused/overwritten audit). Supports dynamic test selection, per-URL result sets, and auto-updates; packaged and distributed with electron-builder.',
    },
    {
        title: '.NET Maui Applications',
        technology: "C#",
        status: 'Completed',
        description: "Built two cross-platform .NET MAUI apps to develop C#/.NET fundamentals: a weapon-damage calculator with frontend selectors driving conditional backend logic across multiple damage types (physical, magic, fire), and a memory-matching game with grid-based flip/match state management and a completion timer. Paired these with focused exercises on constructors, object/reference semantics, and inheritance/polymorphism patterns."
    },
    {
        title: 'Journey',
        technology: 'Unity/C#',
        status: 'Ongoing',
        description: 'Building a grid-based tactical game in Unity/C#. Core coordinate and grid systems are in place; currently implementing character movement and A* pathfinding. Applying OOP and SOLID principles to keep the architecture extensible as the project grows.'
    },
    {
        title: 'Dating Application Clone',
        technology: "Angular/.NET",
        status: 'Completed',
        description: "Followed a course on building a full stack application. Users can register and log in, with password rules and a date-of-birth picker. Private messaging with inbox, outbox and unread views, live chat through SignalR and read receipts. Admin panel for editing user roles and approving photos. Member detail pages with a photo gallery. You can edit your own profile and upload photos, set a main photo or delete one."

    }

];

function ProjectMenu({ projects, emptyMessage }) {
    const [openIndex, setOpenIndex] = useState(null);

    if (projects.length === 0) {
        return <p className="projects-menu__empty">{emptyMessage}</p>;
    }

    return (
        <div className="projects-menu">
            {projects.map((project, index) => {
                const isOpen = openIndex === index;
                return (
                    <div className="projects-menu__item" key={project.title}>
                        <button
                            type="button"
                            className="projects-menu__toggle"
                            aria-expanded={isOpen}
                            onClick={() => setOpenIndex(isOpen ? null : index)}
                        >
                            <span className="projects-menu__hamburger" aria-hidden="true">
                                <span></span>
                                <span></span>
                                <span></span>
                            </span>
                            <h3 className="projects-menu__title">{project.title} - {project.technology}</h3>
                        </button>
                        <div className={`projects-menu__panel${isOpen ? ' projects-menu__panel--open' : ''}`}>
                            <p className="projects-menu__description">{project.description}</p>
                        </div>
                        <div className="separator-div-full"></div>
                    </div>
                );
            })}
        </div>
    );
}

function Projects() {
    const completedProjects = PROJECTS.filter((project) => project.status === 'Completed');
    const ongoingProjects = PROJECTS.filter((project) => project.status === 'Ongoing');

    return (
        <div className="background-secondary-color">
            <div className="p-5pct">
                <h1 className="text-primary-color">Projects</h1>
            </div>

            <div className="p-5pct projects-section-heading">
                <h2 className="text-primary-color">Ongoing</h2>
            </div>
            <ProjectMenu projects={ongoingProjects} emptyMessage="No ongoing projects right now." />
            <div className="space-y-2"></div>

            <div className="p-5pct projects-section-heading">
                <h2 className="text-primary-color">Completed</h2>
            </div>
            <ProjectMenu projects={completedProjects} emptyMessage="No completed projects yet." />
            <div className="space-y-4"></div>
            <div className="space-y-4"></div>
        </div>
        
    );
}

export default Projects;
