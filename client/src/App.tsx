import React, { useState, useEffect } from "react";

interface MembersData {
  members: string[];
}

function App() {
  const [data, setData] = useState<MembersData | null>(null);

  useEffect(() => {
    fetch("/members")
      .then(res => res.json())
      .then((data: MembersData) => {
        setData(data);
        console.log(data);
      });
  }, []);

  return (
    <div>
      {data === null ? (
        <p>Loading...</p>
      ) : (
        data.members.map((member, i) => <p key={i}>{member}</p>)
      )}
    </div>
  );
}

export default App;
