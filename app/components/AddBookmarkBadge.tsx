import React, { useState } from "react";
import { Tooltip, Badge, OverlayTrigger } from "react-bootstrap";
import { BookmarkPlusFill } from "react-bootstrap-icons";
import AddBookmarkModal from "./AddBookmarkModal";
import { addBookmark } from "../helpers/utils";
import { Bookmark } from "../models/Interfaces";

export const AddBookmarkBadge = ({
  isBookmarked,
  fileName,
  path,
  volume,
  description,
  setFiles,
}) => {

  const [showAddBookmarkModal, setShowAddBookmarkModal] = useState(false);
  const [bookmarkSelected, setBookmarkSelected] = useState({} as Bookmark);

  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      {description}
    </Tooltip>
  );

  const badge = (
    <Badge
      bg="none"
      style={{
        position: "absolute",
        right: "-23px",
        top: "8px",
        width: "28px",
        height: "28px",
        cursor: "pointer",
        color: isBookmarked ? "#16ab9c" : "#cdcdcd",
      }}
      className="ms-4"
      onClick={() => {
        setBookmarkSelected(
          isBookmarked
            ? isBookmarked
            : {
                id: null,
                name: fileName,
                path: path,
                volume: volume,
                description: "",
              }
        );
        setShowAddBookmarkModal(true);
      }}
    >
      <BookmarkPlusFill size={16} />
      <AddBookmarkModal
        show={showAddBookmarkModal}
        onHide={() => setShowAddBookmarkModal(false)}
        bookmark={bookmarkSelected}
        onAddBookmark={(bookmark) => addBookmark(bookmark, setBookmarkSelected, setFiles)}
      />      
    </Badge>
  );

  return isBookmarked && description ? (
    <OverlayTrigger
      placement="left"
      delay={{ show: 250, hide: 400 }}
      overlay={renderTooltip}
    >
      {badge}
    </OverlayTrigger>
  ) : (
    badge
  );
};
