    import React, { useState, useEffect } from 'react';

    function LeaderboardPage() {
      const [data, setData] = useState([]);

      useEffect(() => {
        fetch('http://localhost:5000/api/data') // Replace with your Flask API URL
          .then(response => {
              return setData(data);
          })
          .catch(error => {
            console.error("Error fetching data:", error);
          });
      }, []); // Empty dependency array ensures this runs once on mount

      return (
        <div>
          <h1>Data from Flask & PostgreSQL:</h1>
          <ul>
            {data.map((item, index) => (
              <li key={index}>{JSON.stringify(item)}</li> // Adjust rendering based on your data structure
            ))}
          </ul>
        </div>
      );
    }

    export default LeaderboardPage;
