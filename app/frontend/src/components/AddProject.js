import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@mui/material";
import Button from "@mui/material/Button";

export default function AddProject() {
  const [links, setLinks] = useState([]);
  const [newLink, setNewLink] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:5000/links.json") // Ensure this path is correct
      .then((response) => response.json())
      .then((data) => setLinks(data))
      .catch((error) => console.error("Error fetching links:", error));
  }, []);

  const addLink = () => {
    const githubRepoRegex = /^https:\/\/github\.com\/[^\/]+\/[^\/]+$/;
    if (newLink && githubRepoRegex.test(`https://github.com/${newLink}`)) {
      const updatedLinks = [...links, `https://github.com/${newLink}`];
      setLinks(updatedLinks);
      setNewLink("");
  
      fetch("http://127.0.0.1:5000/save-links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedLinks),
      })
        .then((response) => {
          console.log('Response status:', response.status);  
          if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
          }
          
        })
        .then((data) => {
          try {
            const jsonData = JSON.parse(data);  
            console.log("Links saved:", jsonData.message);
            fetch("http://127.0.0.1:5000/links.json")
              .then((response) => response.json())
              .then((data) => setLinks(data))
              .catch((error) => console.error("Error fetching links:", error));
          } catch (error) {
            console.error("Error parsing JSON:", error);
            console.error("Response was:", data);  
          }
        })
        .catch((error) => {
          console.error("There was a problem with the fetch operation:", error);
        });
    } else {
      console.error("Invalid GitHub repository URL");
      alert("Invalid GitHub repository URL. Please enter a valid URL.");  
    }
  };
    

  return (
    <div className="p-4 grid gap-4 grid-cols-1 md:grid-cols-2">
      <Card>
        <CardContent>
          <h2 className="text-xl font-bold mb-4">Manage Links</h2>
          <ul>
            {links.slice(1).map((link, index) => (
              <li key={index}>{link}</li>
            ))}
          </ul>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: 'grey' }}>https://github.com/</span>
            <input
              type="text"
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
              placeholder="user/repo"
              className="border p-2 mr-2"
              style={{ flex: 1 }}
            />
          </div>
          <Button onClick={addLink}>Add Link</Button>
        </CardContent>
      </Card>
    </div>
  );
}
