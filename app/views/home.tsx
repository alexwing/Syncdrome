import React, { useState, useEffect } from "react";
import Api from "../helpers/api";
import { NavPageContainer } from "react-windows-ui";
import {
  Accordion,
  Alert,
  Badge,
  Button,
  Container,
  ListGroup,
} from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";

const Home = () => {
  const [name, setName] = useState("");
  const [files, setFiles] = useState([]);
  const [found, setFound] = useState(true);
  const [fileIconMappings, setFileIconMappings] = useState({});

  const getConfig = async () => {
    const response = await Api.getSettings();
    console.log(response.data);
    setFileIconMappings(response.data.extensions);
  };
  useEffect(() => {
    getConfig();
  }, []);


  const handleInput = (e) => {
    setName(e.target.value);
  };

  // get all files and folders on load
  const handleSearch = (e) => {
    e.preventDefault();
    Api.getFind(name)
      .then((res) => {
        setFiles(res.data);
        console.log(res.data);
        if (Object.keys(res.data).length > 0) {
          setFound(true);
        } else {
          setFound(false);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const onConnectedElementHandler = (filename, folder, driveLetter) => {
    if (driveLetter) {
      Api.openFile(filename, folder, driveLetter);
    } else {
      alert("Drive not connected");
    }
  };

  const onConnectedFolderHandler = (folder, driveLetter, event) => {
    event.preventDefault();
    event.stopPropagation();
    if (driveLetter) {
      Api.openFolder(folder, driveLetter);
    } else {
      alert("Drive not connected");
    }
  };


  
  const getFileIcon = (extension) => {
    for (const category in fileIconMappings) {
      if (fileIconMappings[category].extensions.includes(extension.toLowerCase())) {
        const { icon, color } = fileIconMappings[category];
        const IconComponent = Icon[icon];
        return { category, icon: <IconComponent size={20} className="me-4" color={color} /> };
      }
    }
    // Si no encuentra una categoría, usa la categoría predeterminada
    const { icon, color } = fileIconMappings["default"];
    const IconComponent = Icon[icon];
    return { category: "default", icon: <IconComponent size={20} className="me-4" color={color} /> };
  };
  
  // set Icon component from url extension
  const getIcon = (url) => {
    const extension = url.split(".").pop();
    return getFileIcon(extension).icon;
  };

  //print count of files as  <Badge>
  const getFilesLength = (files) => {
    const length = files.length;
    if (length > 0) {
      return (
        <Badge
          bg="secondary"
          style={{
            position: "absolute",
            right: "60px",
            top: "13px",
            width: "50px",
          }}
        >
          {length}
        </Badge>
      );
    }
  };
  const openFile = (item, key2, key,connected) => {
    return (
      <Badge
        bg="info"
        style={{
          position: "absolute",
          right: "15px",
          top: "10px",
          width: "50px",
          cursor: "pointer",
        }}
        className="ms-4"
        onClick={() =>
          onConnectedElementHandler(item.fileName, key2, connected)
        }
      >
        Open
      </Badge>
    );
  };

  const openFolder = (folder, driveLetter) => {
    if (driveLetter) {
      return (
        <Badge
          bg="info"
          style={{
            position: "absolute",
            right: "114px",
            top: "13px",
            width: "50px",
          }}
          className="ms-4"
          onClick={(e) => onConnectedFolderHandler(folder, driveLetter, e)}
        >
          Open
        </Badge>
      );
    }
  };

  return (
    <Container style={{ overflowY: "scroll", height: "100vh" }}>
      <div className="centered pt-3">
        <img src="./assets/logo.png" alt="logo" className="logo" />
        <h1>Hard Drive Content Finder</h1>
      </div>
      <div className="container text-center pb-3">
        <form className="search" onSubmit={handleSearch}>
          <input
            value={name}
            onChange={handleInput}
            type="search"
            placeholder="Enter file or folder to search"
          />
          <Button variant="primary" type="submit" size="lg">
            <Icon.Search size={20} className="me-4" />
            Search
          </Button>
        </form>
      </div>
      <div className="container  pb-3">
        {!found && (
          <Alert variant="warning" className="text-center">
            <h3>Nothing found</h3>
          </Alert>
        )}
        <Accordion>
          {Object.keys(files).map((key, index) => (
            <Accordion.Item eventKey={index.toString()} key={index}>
              <Accordion.Header>
                <Icon.DeviceHddFill
                  size={20}
                  className="me-4"
                  color="dodgerblue"
                />
                {key}
                {files[key].connected && (
                  <Icon.CheckCircleFill
                    style={{ position: "absolute", right: "25px", top: "15px" }}
                    size={20}
                    className="me-4"
                    color="green"
                  />
                )}
              </Accordion.Header>
              <Accordion.Body>
                <Accordion>
                  {Object.keys(files[key].content).map(
                    (key2, index2) =>
                      files[key].content[key2].length > 0 &&
                      found && (
                        <Accordion.Item
                          eventKey={index2.toString()}
                          key={index2}
                        >
                          <Accordion.Header>
                            <Icon.FolderFill
                              size={20}
                              className="me-4"
                              color="#16ab9c"
                            />
                            {key2}
                            {getFilesLength(files[key].content[key2])}
                            {files[key].connected &&
                              openFolder(key2, files[key].connected)}
                          </Accordion.Header>
                          <Accordion.Body>
                            <ListGroup as="ul">
                              {files[key].content[key2].map((item) => (
                                <ListGroup.Item as="li" key={item.fileName}>
                                  {getIcon(item.fileName)}
                                  {item.fileName}
                                  {files[key].connected &&
                                    openFile(item, key2, key, files[key].connected)}
                                </ListGroup.Item>
                              ))}
                            </ListGroup>
                          </Accordion.Body>
                        </Accordion.Item>
                      )
                  )}
                </Accordion>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      </div>
    </Container>
  );
};

export default Home;
