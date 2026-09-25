import { useEffect, useState } from 'react';
import './projectsStyle.css';

// Project content is served by AlecSite.Server (GET /api/projects),
// seeded from AlecSite.Server/Data/ProjectSeed.cs.
function useProjects() {
    const [result, setResult] = useState({ status: 'loading', projects: [] });

    useEffect(() => {
        const controller = new AbortController();
        fetch('/api/projects', { signal: controller.signal })
            .then((response) => {
                if (!response.ok) throw new Error(`GET /api/projects failed: ${response.status}`);
                return response.json();
            })
            .then((projects) => setResult({ status: 'ready', projects }))
            .catch((error) => {
                if (error.name === 'AbortError') return;
                console.error(error);
                setResult({ status: 'error', projects: [] });
            });
        return () => controller.abort();
    }, []);

    return result;
}

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
                    <div className="projects-menu__item" key={project.slug}>
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
                            {/* Single child: the panel's 0fr -> 1fr grid animation needs exactly one row. */}
                            <div className="projects-menu__content">
                                <p className="projects-menu__description">{project.description}</p>
                                {project.links.length > 0 && (
                                    <p className="projects-menu__links">
                                        {project.links.map((link) => (
                                            <a key={link.url} href={link.url} target="_blank" rel="noreferrer">
                                                {link.label}
                                            </a>
                                        ))}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="separator-div-full"></div>
                    </div>
                );
            })}
        </div>
    );
}

function Projects() {
    const { status, projects } = useProjects();
    const completedProjects = projects.filter((project) => project.status === 'Completed');
    const ongoingProjects = projects.filter((project) => project.status === 'Ongoing');

    return (
        <div className="background-secondary-color">
            <div className="p-5pct">
                <h1 className="text-primary-color">Projects</h1>

                {status === 'loading' && <p>Loading projects…</p>}
                {status === 'error' && <p>Couldn't load projects right now. Please try again later.</p>}
                {status === 'ready' && (
                    <>
                        <div className="projects-section-heading">
                            <h2 className="text-primary-color">Ongoing</h2>
                        </div>
                        <ProjectMenu projects={ongoingProjects} emptyMessage="No ongoing projects right now." />
                        <div className="space-y-2"></div>

                        <div className="projects-section-heading">
                            <h2 className="text-primary-color">Completed</h2>
                        </div>
                        <ProjectMenu projects={completedProjects} emptyMessage="No completed projects yet." />
                    </>
                )}
                <div className="space-y-4"></div>
                <div className="space-y-4"></div>
            </div>
        </div>

    );
}

export default Projects;
