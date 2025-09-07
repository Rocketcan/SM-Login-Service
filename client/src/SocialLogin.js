import React from 'react';
import './SocialLogin.css';
import googleLogo from './assets/google.png';
import linkedInLogo from './assets/linkedinlogo.png';

const SOCIALS = [
  { name: 'Google', icon: googleLogo, provider: 'google' },
  { name: 'LinkedIn', icon: linkedInLogo, provider: 'linkedin' }
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
            <img src={social.icon} alt={`${social.name} logo`} className="icon" /> Login with {social.name}
          </button>
        ))}
      </div>
    </div>
  );
}
