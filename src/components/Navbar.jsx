import React, { useState } from 'react';
import './Navbar.css';
import { NavLink } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <NavLink to="/" className="navbar-logo" onClick={() => setIsOpen(false)}>
                    VM
                </NavLink>

                <button
                    className="navbar-toggle"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle navigation"
                    aria-expanded={isOpen}
                >
                    <span className="hamburger"></span>
                </button>

                <div className={`navbar-links ${isOpen ? 'active' : ''}`}>
                    <NavLink to="/" onClick={() => setIsOpen(false)} className={({ isActive }) => isActive ? 'active' : undefined}>Home</NavLink>
                    <NavLink to="/about" onClick={() => setIsOpen(false)} className={({ isActive }) => isActive ? 'active' : undefined}>About</NavLink>
                    <NavLink to="/projects" onClick={() => setIsOpen(false)} className={({ isActive }) => isActive ? 'active' : undefined}>Projects</NavLink>
                    <NavLink to="/contact" onClick={() => setIsOpen(false)} className={({ isActive }) => isActive ? 'active' : undefined}>Contact</NavLink>
                    <ThemeToggle />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
