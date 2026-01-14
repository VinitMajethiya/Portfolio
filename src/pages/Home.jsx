import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Typed from 'typed.js';
import { motion } from 'framer-motion';
import './Home.css';

const Home = () => {
    const el = useRef(null);

    useEffect(() => {
        const typed = new Typed(el.current, {
            strings: [
                'AI/ML Engineer',
                'CFO @ Yukti Yantra',
                'Student Founder'
            ],
            typeSpeed: 50,
            backSpeed: 30,
            backDelay: 2000,
            loop: true,
            cursorChar: '_',
        });

        return () => {
            typed.destroy();
        };
    }, []);

    return (
        <div className="home-page">
            <section className="hero-grid">
                {/* Left Column: Text & Intro */}
                <motion.div
                    className="hero-text-area"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="badge">Based in India</div>
                    <h1 className="name-title">Vinit<br />Majethiya</h1>

                    <div className="role-container">
                        <span className="role-prefix">//</span>
                        <span ref={el} className="typed-text"></span>
                    </div>

                    <p className="bio-text">
                        Bridging the gap between theoretical AI research and real-world impact.
                        Specializing in <strong>Deep Learning</strong>, <strong>Generative AI</strong>,
                        and building scalable systems for healthcare.
                    </p>

                    <div className="cta-group">
                        <Link to="/projects" className="btn-primary-v2">View Work</Link>
                        <Link to="/contact" className="btn-outline-v2">Contact Me</Link>
                    </div>
                </motion.div>

                {/* Right Column: Visual Element / Bento Cards */}
                <motion.div
                    className="hero-visuals"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <div className="bento-box box-1">
                        <h3>Yukti Yantra</h3>
                        <p>Leading ML Initiatives</p>
                    </div>
                    <div className="bento-box box-2">
                        <h3>2027</h3>
                        <p>Graduation</p>
                    </div>
                    <div className="bento-box box-3">
                        <h3>Tech Focus</h3>
                        <div className="tech-pill-container">
                            <span className="tech-pill">Python</span>
                            <span className="tech-pill">TensorFlow</span>
                            <span className="tech-pill">FastAPI</span>
                            <span className="tech-pill">Generative AI</span>
                        </div>
                    </div>
                </motion.div>
            </section>
        </div>
    );
};

export default Home;
