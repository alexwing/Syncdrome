import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table } from "react-bootstrap";

interface DrivesProps {
  letter: string;
  name: string;
  freeSpace: string;
  size: string;
}

const Settings = () => {
  const [drives, setDrives] = useState([]);

  useEffect(() => {
    axios
      .get("/drives")
      .then((response) => {
        setDrives(response.data);
      })
      .catch((error) => {
        console.error("There was an error getting the disk drives: ", error);
      });
  }, []);

  return (
    <div className="container">
      <h2>Settings</h2>
      <p>Here you can configure the application.</p>
      <h3>Drives</h3>
      <p>Choose the drives to search for files.</p>
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>Letter</th>
            <th>Name</th>
            <th>Free Space</th>
            <th>Total Space</th>
          </tr>
        </thead>
        <tbody>
          {drives.map((drive: DrivesProps, index) => (
            <tr key={index}>
              <td>{drive.letter}</td>
              <td>{drive.name}</td>
              <td>{drive.freeSpace}</td>
              <td>{drive.size}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default Settings;
