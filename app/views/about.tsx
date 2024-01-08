import React, { useEffect, useState } from "react";
import { Breadcrumb, Button, Container } from "react-bootstrap";
import ReactMarkdown from "react-markdown";
import { shell } from "electron";
import packageJson from "../../package.json";
import { Commit } from "../models/Interfaces";
import * as Icon from "react-bootstrap-icons";
import Api from "../helpers/api";

const About = () => {
  const [markdown, setMarkdown] = useState("");
  const [commits, setCommits] = useState<{ [key: string]: Commit[] }>({});
  const [latestVersion, setLatestVersion] = useState<string | null>(null);

  async function fetchLatestVersion() {
    try {
      const response = await Api.getLatestVersion();
      // the tag_name property contains the version number of the latest release
      return response.data.tag_name;
    } catch (error) {
      console.error(error);
      return packageJson.version;
    }
  }

  useEffect(() => {
    Api.getResource("/assets/aboutEN.md").then((response) => {
      setMarkdown(response.data);
    });
    getCommits().then((groupedCommits) => {
      setCommits(groupedCommits);
    });
    fetchLatestVersion().then((latestVersion) => {
      setLatestVersion(latestVersion);
    });
  }, []);

  useEffect(() => {
    window.addEventListener("click", handleLinkClick, false);
    return () => {
      window.removeEventListener("click", handleLinkClick, false);
    };
  }, []);

  async function getCommits() {
    try {
      const response = await Api.getCommits();
      const commits = response.data;
      const groupedCommits = commits.reduce((groups, commit: Commit) => {
        const date = new Date(commit.commit.committer.date);
        const day = `${date.getFullYear()}-${
          date.getMonth() + 1
        }-${date.getDate()}`;
        if (!groups[day]) {
          groups[day] = [];
        }
        groups[day].push(commit);
        return groups;
      }, {});
      return groupedCommits;
    } catch (error) {
      console.error(error);
    }
  }

  const handleLinkClick = (e) => {
    if (e.target.tagName === "A" && e.target.href.startsWith("http")) {
      e.preventDefault();
      shell.openExternal(e.target.href);
    }
  };

  //get all links at blank and add event listener
  useEffect(() => {
    const links = document.querySelectorAll('a[href^="http"]');
    links.forEach((link) => {
      link.addEventListener("click", handleLinkClick);
    });
    return () => {
      links.forEach((link) => {
        link.removeEventListener("click", handleLinkClick);
      });
    };
  }, []);

  const showLastVersion = () => {
    if (latestVersion !== packageJson.version) {
      return (
        <div>
          <h3>Latest Version</h3>
          <p>
            {latestVersion}
            <Button
              variant="primary"
              size="sm"
              href="https://github.com/alexwing/Syncdrome/releases/"
              target="_blank"
              className="mx-4"
            >
              <Icon.Download className="mr-1" /> Download new version
            </Button>
          </p>
        </div>
      );
    }
  };

  return (
    <Container style={{ overflowY: "scroll", height: "100vh" }}>
      <Breadcrumb className="mt-3">
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item active>About</Breadcrumb.Item>
      </Breadcrumb>
      <ReactMarkdown linkTarget="_blank" children={markdown} />
      <h3>Version</h3>
      <p>{packageJson.version}</p>
      {showLastVersion()}
      {Object.keys(commits).length > 0 && (
        <div>
          <h5>Change Log</h5>
          {Object.entries(commits).map(([date, commits]) => (
            <div key={date}>
              <h6>{date}</h6>
              <ul style={{ listStyleType: "none" }}>
                {commits.map((commit) => (
                  <li key={commit.sha}>{commit.commit.message}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
};

export default About;
