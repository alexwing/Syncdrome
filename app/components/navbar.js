import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => (
    <div className="container">
        <div className="centered">
            <img src="./logo.png" alt="logo" className="logo" />
            <h1>Hard Drive Content Finder</h1>
        </div>
        <nav className="nav">
            <Link to="/">Home</Link>
            <Link to="about">About</Link>
        </nav>
    </div>
);

export default Navbar;
