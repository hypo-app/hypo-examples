import React, { useEffect, useState } from 'react';
import * as hypo from 'hypo-client';

function App() {
    const [group, setGroup] = useState(null);
    const [assignmentError, setAssignmentError] = useState(null);

    useEffect(() => {
        // This can be called multiple times but needs to be called at least once
        // prior to making other calls to the hypo API.
        hypo.init({
            baseUrl: "http://localhost:5000",
            project: "development"
        });
        hypo.getGroupAssignment("first-test").then(setGroup, setAssignmentError);
    }, []);

    return (
        <div>
            {group === null && assignmentError === null && <div>Group assignment hasn't finished yet</div>}
            {assignmentError !== null && <div>An error occurred during group assignment: {assignmentError.message}</div>}
            {group === "" && <div>The test is not running</div>}
            {group === "control" && <div>Control group</div>}
            {group === "treatment" && <div>Treatment group</div>}
            <a
                href="https://reactjs.org"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => hypo.event('clicked')}
            >
                Learn React
            </a>
        </div>
    );
}

export default App;