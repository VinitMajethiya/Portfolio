import React from 'react';
import { motion } from 'framer-motion';
import './About.css';

const About = () => {
    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="about-page">
            <div className="bg-glow bg-glow-3"></div>

            <div className="about-container">
                <motion.section
                    className="about-section bio"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    variants={fadeInUp}
                >
                    <h1 className="section-title">About Me</h1>
                    <div className="bio-content">
                        <p>
                            I am <strong>Vinit Majethiya</strong>, a Third Year B.Tech student in
                            <strong> Artificial Intelligence & Machine Learning</strong> at Sanjay Ghodawat University, Kolhapur.
                        </p>
                        <p>
                            Currently serving as the <strong>CFO & AI/ML Engineer</strong> at <strong>Yukti Yantra</strong>,
                            a student-run startup, where I lead a 20-member team developing AI-driven products.
                            My focus lies in bridging the gap between theoretical AI research and real-world deployment,
                            specifically in healthcare and mental health tech.
                        </p>
                    </div>
                </motion.section>

                <motion.section
                    className="about-section education-experience"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    variants={fadeInUp}
                >
                    <div className="timeline-grid">
                        <div className="timeline-col">
                            <h2>🎓 Education</h2>
                            <div className="timeline-item">
                                <div className="timeline-date">Expected 2027</div>
                                <div className="timeline-content">
                                    <h3>B.Tech in AI & ML</h3>
                                    <h4>Sanjay Ghodawat University</h4>
                                    <p>Current Year: Third Year</p>
                                </div>
                            </div>
                        </div>

                        <div className="timeline-col">
                            <h2>💼 Experience</h2>
                            <div className="timeline-item">
                                <div className="timeline-date">March 2025 - Present</div>
                                <div className="timeline-content">
                                    <h3>CFO & AI/ML Engineer</h3>
                                    <h4>Yukti Yantra</h4>
                                    <ul>
                                        <li>Leading the Mental Health Chatbot Project.</li>
                                        <li>Managing a 20-member team & client AI web platforms.</li>
                                        <li>Contributing to ML architecture & deployment.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.section>

                <motion.section
                    className="about-section skills"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    variants={fadeInUp}
                >
                    <h2>🧠 Technical Skills</h2>
                    <div className="skills-grid">
                        <div className="skill-category">
                            <h3>Languages</h3>
                            <div className="tags">
                                <span>Python</span>
                                <span>C/C++</span>
                            </div>
                        </div>
                        <div className="skill-category">
                            <h3>ML & AI</h3>
                            <div className="tags">
                                <span>TensorFlow</span>
                                <span>Scikit-learn</span>
                                <span>Hugging Face</span>
                                <span>LangChain</span>
                                <span>Pandas</span>
                                <span>NumPy</span>
                            </div>
                        </div>
                        <div className="skill-category">
                            <h3>Backend</h3>
                            <div className="tags">
                                <span>FastAPI</span>
                                <span>REST APIs</span>
                            </div>
                        </div>
                        <div className="skill-category">
                            <h3>Core Competencies</h3>
                            <div className="tags">
                                <span>Data Preprocessing</span>
                                <span>Model Evaluation</span>
                                <span>Predictive Analysis</span>
                                <span>Visualization</span>
                            </div>
                        </div>
                    </div>
                </motion.section>

                <motion.section
                    className="about-section leadership"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    variants={fadeInUp}
                >
                    <h2>🏆 Leadership & Awards</h2>
                    <ul className="leadership-list">
                        <li><strong>Secretary</strong> – AIML Student Association</li>
                        <li><strong>Google Student Ambassador</strong></li>
                        <li><strong>Student Relations Officer</strong> – AIMLSA (Previous)</li>
                        <li><strong>Smart India Hackathon (SIH)</strong> – Qualified College Round</li>
                        <li><strong>CodeFiesta Hackathon</strong> – Participant (Jaipur)</li>
                        <li>Organized student-led AI workshops & events.</li>
                    </ul>
                </motion.section>
            </div>
        </div>
    );
};

export default About;
