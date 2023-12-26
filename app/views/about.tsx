import React, { useEffect, useState } from "react";
import { Breadcrumb, Container } from "react-bootstrap";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import { shell } from "electron";
import packageJson from '../../package.json';

interface Commit {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    committer: {
      date: string;
    };
  };
}

const About = () => {
  const [markdown, setMarkdown] = useState("");
  const [commits, setCommits] = useState<{ [key: string]: Commit[] }>({});

  useEffect(() => {
    axios.get("/assets/aboutEN.md").then((response) => {
      setMarkdown(response.data);
    });
    getCommits().then((groupedCommits) => {
      setCommits(groupedCommits);
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
      const response = await axios.get(
        "https://api.github.com/repos/alexwing/Syncdrome/commits?sha=main"
      );
      const commits = response.data;
      const groupedCommits = commits.reduce((groups, commit: Commit) => {
        const date = new Date(commit.commit.committer.date);
        const day = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
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

  return (
    <Container style={{ overflowY: "scroll", height: "100vh" }}>
      <Breadcrumb className="mt-3">
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item active>About</Breadcrumb.Item>
      </Breadcrumb>
      <ReactMarkdown linkTarget="_blank" children={markdown} />
      <h3>Version</h3>
      <p>{packageJson.version}</p>
      {Object.keys(commits).length > 0 && (
        <div>
          <h5>Change Log</h5>          
          {Object.entries(commits).map(([date, commits]) => (
            <div key={date}>
              <h6>{date}</h6>
              <ul style={{ listStyleType: "none" }}>
                {commits.map((commit) => (
                  <li key={commit.sha}>
                    {commit.commit.message}
                  </li>
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