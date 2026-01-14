import React from 'react';
import { motion } from 'framer-motion';
import './Contact.css';

const Contact = () => {
    return (
        <div className="contact-page">
            <div className="bg-glow bg-glow-5"></div>

            <div className="contact-container">
                <motion.div
                    className="contact-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1>Get In Touch</h1>
                    <p className="contact-subtitle">
                        Open to opportunities in AI/ML, Data Science, and collaborative research.
                    </p>

                    <div className="contact-details">
                        <div className="detail-item">
                            <span className="label">Email</span>
                            <a href="mailto:vinitmajethiya@gmail.com" className="value">vinitmajethiya@gmail.com</a>
                        </div>

                        <div className="detail-item">
                            <span className="label">Phone</span>
                            <span className="value">+91 8767660574</span>
                        </div>

                        <div className="detail-item">
                            <span className="label">Location</span>
                            <span className="value">Kolhapur, India</span>
                        </div>

                        <div className="detail-item">
                            <span className="label">Social</span>
                            <a
                                href="https://linkedin.com/in/vinitmajethiya"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="value link"
                            >
                                LinkedIn Profile &nearr;
                            </a>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Contact;
