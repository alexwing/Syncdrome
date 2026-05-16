import React, { useEffect, useState } from "react";
import { Breadcrumb, Button, Container } from "react-bootstrap";
import ReactMarkdown from "react-markdown";
// import { shell } from "electron";
import packageJson from "../../../package.json";
import { Commit } from "../models/Interfaces";
import * as Icon from "react-bootstrap-icons";
import Api from "../helpers/api";
import { useTranslation } from "../context/languageContext";

const About = () => {
  const { t } = useTranslation();
  const [markdown, setMarkdown] = useState("");
  const [commits, setCommits] = useState<{ [key: string]: Commit[] }>({});
  const [latestVersion, setLatestVersion] = useState<string | null>(null);

  async function fetchLatestVersion() {
    try {
      const response = await Api.getLatestVersion();
      // the tag_name property contains the version number of the latest release
      return response.data.tag_name.replace("v", "");
    } catch (error) {
      console.error(error);
      return packageJson.version.replace("v", "");
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
      //shell.openExternal(e.target.href);
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

  // Returns true only if `published` is strictly newer than `running`.
  const isNewerVersion = (published: string, running: string) => {
    const parse = (v: string) =>
      v
        .replace(/^v/, "")
        .split(".")
        .map((n) => parseInt(n, 10) || 0);
    const a = parse(published);
    const b = parse(running);
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      const diff = (a[i] || 0) - (b[i] || 0);
      if (diff !== 0) return diff > 0;
    }
    return false;
  };

  // Show only the commit title (first line), not the description body.
  const cleanCommitMessage = (message: string) =>
    message.split("\n")[0].trim();

  const showLastVersion = () => {
    if (latestVersion && isNewerVersion(latestVersion, packageJson.version)) {
      return (
        <div>
          <h3>{t("about.latestVersion")}</h3>
          <p>
            {latestVersion}
            <Button
              variant="primary"
              size="sm"
              href="https://github.com/alexwing/Syncdrome/releases/"
              target="_blank"
              className="mx-4"
            >
              <Icon.Download className="mr-1" /> {t("about.downloadNewVersion")}
            </Button>
          </p>
        </div>
      );
    }
  };

  return (
    <Container style={{ overflowY: "scroll", height: "100vh" }}>
      <Breadcrumb className="mt-3">
        <Breadcrumb.Item href="/">{t("common.home")}</Breadcrumb.Item>
        <Breadcrumb.Item active>{t("nav.about")}</Breadcrumb.Item>
      </Breadcrumb>
      <ReactMarkdown
        components={{
          a: ({ node, ...props }) => (
            <a {...props} target="_blank" rel="noreferrer" />
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
      <h3>{t("about.version")}</h3>
      <p>{packageJson.version}</p>
      {showLastVersion()}
      {Object.keys(commits).length > 0 && (
        <div>
          <h5>{t("about.changeLog")}</h5>
          {Object.entries(commits).map(([date, commits]) => (
            <div key={date}>
              <h6>{date}</h6>
              <ul style={{ listStyleType: "none" }}>
                {commits.map((commit) => (
                  <li key={commit.sha}>
                    {cleanCommitMessage(commit.commit.message)}
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
