import { useEffect, useState } from "react";
import { Breadcrumb, Card, Col, Form, Row } from "react-bootstrap";
import { AlertModel, Bookmark } from "../models/Interfaces";
import React from "react";
import * as Icon from "react-bootstrap-icons";
import {
  Accordion,
  Alert,
  Badge,
  Button,
  Container,
  ListGroup,
  Spinner,
} from "react-bootstrap";
import Api from "../helpers/api";
import ConfirmDialog from "../components/ConfirmDialog";
import AddBookmarkModal from "../components/AddBookmarkModal";

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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [bookmarkToDelete, setBookmarkToDelete] = useState<Number | null>(null);
  const [bookmarkSelected, setBookmarkSelected] = useState({} as Bookmark);
  const [showAddBookmarkModal, setShowAddBookmarkModal] = useState(false);
  const [alert, setAlert] = useState({
    title: "",
    message: "",
    type: "danger",
  } as AlertModel);
  const [showAlert, setShowAlert] = useState(false);

  const loadBookmarks = async () => {
    setLoading(true);
    Api.getBookmarks()
      .then((response) => {
        console.log(response.data);
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
        filterBookmarks(bookmarksByVolume);
        setLoading(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const deleteBookmark = (id: Number | null) => {
    if (id === null) {
      return;
    }
    Api.deleteBookmark(id).then(() => {
      loadBookmarks();
    });
  };
  useEffect(() => {
    loadBookmarks();
  }, []);

  const filterBookmarks = (bookmarksByVolume) => {
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
  };

  /***
   *  Add/Edit bookmark to file
   *  @param bookmark
   *  This function is called when the user adds/edit a bookmark
   *  It updates the file state with the new bookmark
   */
  const onAddBookmarkHandler = () => {
    setShowAddBookmarkModal(false);
    loadBookmarks();
  };

  useEffect(() => {
    filterBookmarks(bookmarksByVolume);
  }, [search]);

  const handleOK = () => {
    setShowConfirmDialog(false);
    deleteBookmark(bookmarkToDelete);
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
  };

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
      {!loading && bookmarksByVolumeFiltered.length === 0 && (
        <Alert variant="warning" className="text-center">
          <h3>
            <Icon.ExclamationTriangleFill
              size={30}
              className="me-3"
              color="orange"
            />
            No bookmarks found
          </h3>
        </Alert>
      )}
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
                      <span>
                        <small>{bookmark.path}\</small>
                        <strong>{bookmark.name}</strong>
                      </span>
                      <ListGroup.Item className="d-flex justify-content-between p-0 m-0 border-0">
                        <Badge bg="warning" className="me-2 bookmark-desc text-dark">
                          {bookmark.description}
                        </Badge>
                        <Button
                          className="m-0 p-0 me-2"
                          variant="link"
                          onClick={() => {
                            setBookmarkSelected(bookmark);
                            setShowAddBookmarkModal(true);
                          }}
                        >
                          <Icon.PencilSquare color="blue" size={20} />
                        </Button>
                        <Button
                         className="m-0 p-0"
                          variant="link"
                          onClick={() => {
                            setShowConfirmDialog(true);
                            setBookmarkToDelete(bookmark.id);
                          }}
                        >
                          <Icon.Trash color="red" size={20} />
                        </Button>
                      </ListGroup.Item>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          ))}
        </Col>
      </Row>
      <ConfirmDialog
        title="Delete bookmark"
        message="Are you sure you want to delete this bookmark?"
        show={showConfirmDialog}
        handleOK={handleOK}
        handleCancel={handleCancel}
      />
      <AddBookmarkModal
        show={showAddBookmarkModal}
        onHide={() => setShowAddBookmarkModal(false)}
        bookmark={bookmarkSelected}
        onAddBookmark={onAddBookmarkHandler}
      />
    </Container>
  );
};

export default bookmarks;
