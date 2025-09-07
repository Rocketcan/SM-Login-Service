
import React, { Component } from 'react';
import './App.css';
import SocialLogin from './SocialLogin';


class App extends Component {
  handleSocialLogin = (provider) => {
    alert(`Login with ${provider} clicked!`);
    // Here you would redirect to backend endpoint for OAuth
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
