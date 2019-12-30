import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { getGroupAssignment, init, event } from 'hypo-client';

function App() {
  const [group, setGroup] = useState("");
  useEffect(() => {
    init({
      baseUrl: "http://localhost:5000",
      project: "prj-dev"
    });
    getGroupAssignment("abtest-3").then(setGroup);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        {group === "control" && <div>Control group</div>}
        {group === "treatment" && <div>Treatment group</div>}
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => event('paid')}
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
