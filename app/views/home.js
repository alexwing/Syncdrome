import React, { Component } from "react";
import Api from "../helpers/api";
import { Button } from "react-windows-ui";

import { NavPageContainer } from "react-windows-ui";

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = { name: "", files: [] };
    this.handleInput = this.handleInput.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
  }

  componentDidMount() {
    // Do something when loaded
  }

  handleInput(e) {
    this.setState({ name: e.target.value });
  }

  handleSearch(e) {
    e.preventDefault();
    Api.getFind(this.state.name)
      .then((res) => {
        this.setState({ files: res.data });
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  render() {
    const { name } = this.state;

    return (
      <NavPageContainer>
        <div className="centered">
          <img src="./logo.png" alt="logo" className="logo" />
          <h1>Hard Drive Content Finder</h1>
        </div>
        <div className="container text-center">
          <form className="search" onSubmit={this.handleSearch}>
            <input
              value={name}
              onChange={this.handleInput}
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
              onClick={this.handleSearch}
            />
          </form>
          <ul style={{ textAlign: "left" }}>
            {Object.keys(this.state.files).map((key) => (
              <li key={key}>
                {key}
                <ul>
                  {Object.keys(this.state.files[key]).map((key2) => (
                    <li key={key2}>
                      {key2}
                      <ul>
                        {this.state.files[key][key2].map((item) => (
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
  }
}

export default Home;
