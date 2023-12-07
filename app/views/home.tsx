import React, { useState, useEffect } from "react";
import Api from "../helpers/api";
import { Button } from "react-windows-ui";
import { NavPageContainer } from "react-windows-ui";

const Home = () => {
  const [name, setName] = useState("");
  const [files, setFiles] = useState([]);

  useEffect(() => {
    // Do something when loaded
  }, []);

  const handleInput = (e) => {
    setName(e.target.value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    Api.getFind(name)
      .then((res) => {
        setFiles(res.data);
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <NavPageContainer>
      <div className="centered">
        <img src="./assets/logo.png" alt="logo" className="logo" />
        <h1>Hard Drive Content Finder</h1>
      </div>
      <div className="container text-center">
        <form className="search" onSubmit={handleSearch}>
          <input
            value={name}
            onChange={handleInput}
            type="search"
            placeholder="Enter file or folder to search"
          />
          <button type="submit" className="btn">
            Search
          </button>
          <Button
            type="primary"
            icon={<i className="icons10-search color-primary"></i>}
            value="Search"
            onClick={handleSearch}
          />
        </form>
        <ul style={{ textAlign: "left" }}>
          {Object.keys(files).map((key) => (
            <li key={key}>
              {key}
              <ul>
                {Object.keys(files[key]).map((key2) => (
                  <li key={key2}>
                    {key2}
                    <ul>
                      {files[key][key2].map((item) => (
                        <li key={item.fileName}>{item.fileName}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </NavPageContainer>
  );
};

export default Home;
