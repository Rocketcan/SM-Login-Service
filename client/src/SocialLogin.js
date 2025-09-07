import React from 'react';
import './SocialLogin.css';

const SOCIALS = [
  { name: 'Google', icon: '🔵', provider: 'google' },
  { name: 'Facebook', icon: '🔷', provider: 'facebook' }
];

export default function SocialLogin({ onLogin }) {
  return (
    <div className="social-login-container">
      <h2>Login with Social Media</h2>
      <div className="social-buttons">
        {SOCIALS.map(social => (
          <button
            key={social.provider}
            className={`social-btn social-btn-${social.provider}`}
            onClick={() => onLogin && onLogin(social.provider)}
          >
            <span className="icon">{social.icon}</span> Login with {social.name}
          </button>
        ))}
      </div>
    </div>
  );
}
