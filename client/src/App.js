
import React, { Component } from 'react';
import './App.css';
import SocialLogin from './SocialLogin';


class App extends Component {
  handleSocialLogin = (provider) => {
    // Redirect to backend OAuth endpoint
    window.location.href = `http://localhost:3001/auth/${provider}`;
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <SocialLogin onLogin={this.handleSocialLogin} />
        </header>
      </div>
    );
  }
}

export default App;
