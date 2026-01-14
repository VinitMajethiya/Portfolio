import React, { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <a href="/" className="navbar-logo">
                    VM
                </a>

                <button
                    className="navbar-toggle"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle navigation"
                >
                    <span className="hamburger"></span>
                </button>

                <div className={`navbar-links ${isOpen ? 'active' : ''}`}>
                    <a href="/" onClick={() => setIsOpen(false)}>Home</a>
                    <a href="/about" onClick={() => setIsOpen(false)}>About</a>
                    <a href="/projects" onClick={() => setIsOpen(false)}>Projects</a>
                    <a href="/contact" onClick={() => setIsOpen(false)}>Contact</a>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
