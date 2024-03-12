/* 
This file list all the bookmarks agrouped by volume and file. It also has a search bar to filter the bookmarks by name.
*/

import { useEffect, useState } from "react";
import { Breadcrumb, Card, Col, Form, Row } from "react-bootstrap";
import { Bookmark } from "../models/Interfaces";
import React from "react";
import {
  Accordion,
  Alert,
  Badge,
  Button,
  Container,
  ListGroup,
  OverlayTrigger,
  Spinner,
  Tooltip,
} from "react-bootstrap";
import Api from "../helpers/api";

interface bookmarksByVolume {
  volume: string;
  bookmarks: Bookmark[];
}

const bookmarks = () => {
  const [search, setSearch] = useState("");
  const [bookmarksByVolume, setBookmarksByVolume] = useState(
    [] as bookmarksByVolume[]
  );
  const [bookmarksByVolumeFiltered, setBookmarksByVolumeFiltered] = useState(
    [] as bookmarksByVolume[]
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Api.getBookmarks().then((response) => {
      const volumes = response.data
        .map((bookmark) => bookmark.path.split("\\")[0])
        .filter((value, index, self) => self.indexOf(value) === index);
      const bookmarksByVolume = volumes.map((volume) => {
        return {
          volume: volume,
          bookmarks: response.data.filter((bookmark) =>
            bookmark.path.startsWith(volume)
          ),
        };
      });
      setBookmarksByVolume(bookmarksByVolume);
      setBookmarksByVolumeFiltered(bookmarksByVolume);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (search === "" || search === null) {
      setBookmarksByVolumeFiltered(bookmarksByVolume);
      return;
    }
    const filteredBookmarks = bookmarksByVolume.map((volume) => {
      return {
        volume: volume.volume,
        bookmarks: volume.bookmarks.filter(
          (bookmark) =>
            bookmark.name.toLowerCase().includes(search.toLowerCase()) ||
            bookmark.description.toLowerCase().includes(search.toLowerCase())
        ),
      };
    });
    //remove empty volumes
    filteredBookmarks.forEach((volume, index) => {
      if (volume.bookmarks.length === 0) {
        filteredBookmarks.splice(index, 1);
      }
    });
    setBookmarksByVolumeFiltered(filteredBookmarks);
  }, [search]);

  return (
    <Container style={{ overflowY: "scroll", height: "100vh" }}>
      <Breadcrumb className="mt-3">
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item active>Bookmarks</Breadcrumb.Item>
      </Breadcrumb>
      <h2>Bookmarks</h2>
      <Row className="p-3 m-0">
        <Col xs={12} className="p-0">
          <Form.Group controlId="search">
            <Form.Control
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>
      {loading && (
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      )}
      <Row className="p-3 m-0">
        <Col xs={12} className="p-0">
          {bookmarksByVolumeFiltered.map((volume, index) => (
            <Card key={index}>
              <Card.Header>
                <h5 className="m-0">{volume.volume}</h5>
              </Card.Header>
              <Card.Body>
                <ListGroup>
                  {volume.bookmarks.map((bookmark, bookmarkIndex) => (
                    <ListGroup.Item
                      key={`bookmark-${bookmarkIndex}`}
                      className="d-flex justify-content-between"
                    >
                      <span><small>{bookmark.path}\</small><strong>{bookmark.name}</strong></span>
                      <Badge bg="secondary">{bookmark.description}</Badge>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          ))}
        </Col>
      </Row>
    </Container>
  );
};

export default bookmarks;
