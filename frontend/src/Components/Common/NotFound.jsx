import React from 'react';
import { Button } from 'react-bootstrap';

const NotFound = () => {
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#282c34',
        textAlign: 'center',
        color: '#ffffff',
        flexDirection: 'column',
        fontFamily: 'Arial, sans-serif',
        backgroundImage: 'radial-gradient(circle at 50% 50%, #4682B4, #282c34)',
        animation: 'backgroundGlow 10s infinite alternate',
      }}
    >
      <h1
        style={{
          fontSize: '15rem',
          margin: '0',
          fontWeight: '900',
          letterSpacing: '10px',
          color: '#ffffff',
          textShadow: '0 0 30px #ffffff, 0 0 60px #4682B4',
          animation: 'glow 2s ease-in-out infinite alternate',
        }}
      >
        404
      </h1>
      <h3
        style={{
          fontSize: '2rem',
          fontWeight: '300',
          color: '#ffffff',
          margin: '20px 0',
        }}
      >
        Oops! The page you're looking for doesn't exist.
      </h3>
      <Button
        href="/"
        style={{
          padding: '10px 30px',
          fontSize: '1.2rem',
          border: 'none',
          backgroundColor: '#4682B4',
          color: '#fff',
          borderRadius: '50px',
          boxShadow: '0 0 20px #4682B4',
          transition: '0.3s ease',
        }}
        onMouseOver={(e) => {
          e.target.style.backgroundColor = '#ffffff';
          e.target.style.color = '#4682B4';
          e.target.style.boxShadow = '0 0 40px #ffffff';
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = '#4682B4';
          e.target.style.color = '#ffffff';
          e.target.style.boxShadow = '0 0 20px #4682B4';
        }}
      >
        Go Home
      </Button>
    </div>
  );
};

export default NotFound;
