import React from 'react';
import { motion } from 'framer-motion';
import './Projects.css';

const Projects = () => {
    const projects = [
        {
            title: "LLM Doctor",
            subtitle: "Medical Q&A System",
            tech: ["FLAN-T5", "LangChain", "Python"],
            description: "A retrieval-augmented response generation system using FLAN-T5 and LangChain. Achieved ~92% medical query relevance responding to symptoms and treatment inquiries.",
            category: "AI / NLP"
        },
        {
            title: "Mental Health Platform",
            subtitle: "Prototype for Yukti Yantra",
            tech: ["React", "FastAPI", "WebRTC"],
            description: "Tele-therapy platform enabling 1:1 video sessions and AI chatbot support. Features secure PII handling and unified dashboards for users and therapists.",
            category: "Healthcare Tech"
        },
        {
            title: "Predictive Models Suite",
            subtitle: "Data Science Projects",
            tech: ["Scikit-learn", "Pandas", "Matplotlib"],
            description: "A suite of ML models for disease risk prediction and movie success forecasting. Achieved up to 85% accuracy using ensemble methods.",
            category: "Data Science"
        }
    ];

    return (
        <div className="projects-page">
            <div className="bg-glow bg-glow-4"></div>

            <div className="projects-container">
                <motion.h1
                    className="section-title"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    Selected Projects
                </motion.h1>

                <div className="projects-grid">
                    {projects.map((project, index) => (
                        <motion.div
                            className="project-card"
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <div className="card-header">
                                <span className="category-tag">{project.category}</span>
                                <h3>{project.title}</h3>
                                <h4>{project.subtitle}</h4>
                            </div>
                            <div className="card-body">
                                <p>{project.description}</p>
                                <div className="tech-stack">
                                    {project.tech.map((t, i) => (
                                        <span key={i}>{t}</span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Projects;
