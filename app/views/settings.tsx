import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Table } from "react-bootstrap";
import Api from "../helpers/api";
import { get } from "core-js/core/dict";

interface DrivesProps {
  letter: string;
  name: string;
  freeSpace: string;
  size: string;
  content: boolean;
}

const Settings = () => {
  const [drives, setDrives] = useState([]);

  useEffect(() => {
    getDrives();
  }, []);

  const getDrives = () => {
    Api.getDrives()
      .then((res) => {
        console.log(res.data);
        setDrives(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const executeContentDrive = (drive) => {
    Api.getExecute(drive)
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="container">
      <h2>Settings</h2>
      <p>Here you can configure the application.</p>
      <h3>Drives</h3>
      <p>Choose the drives to search for files.</p>
      <Button variant="primary" size="sm" onClick={() => getDrives()}>
        Refresh
      </Button>
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>Letter</th>
            <th>Name</th>
            <th>Free Space</th>
            <th>Total Space</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {drives.map((drive: DrivesProps, index) => (
            <tr key={index}>
              <td>{drive.letter}</td>
              <td>{drive.name}</td>
              <td>{drive.freeSpace}</td>
              <td>{drive.size}</td>
              <td>
                {drive.content && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => executeContentDrive(drive.letter)}
                  >
                    Sync
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default Settings;
