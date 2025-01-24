import React, { useState } from "react";
import { Tooltip, Badge, OverlayTrigger } from "react-bootstrap";
import { BookmarkPlusFill } from "react-bootstrap-icons";
import AddBookmarkModal from "./AddBookmarkModal";
import { Bookmark, FileType } from "../models/Interfaces";

interface AddBookmarkBadgeProps {
  isBookmarked: boolean;
  fileName: string;
  path: string;
  volume: string;
  description: string;
  setFiles: (files: any) => void;
  onAddBookmark: (bookmark: Bookmark) => void;
}

export const AddBookmarkBadge: React.FC<AddBookmarkBadgeProps> = ({
  isBookmarked,
  fileName,
  path,
  volume,
  description,
  onAddBookmark,
}) => {
  const [showAddBookmarkModal, setShowAddBookmarkModal] = useState(false);
  const [bookmarkSelected, setBookmarkSelected] = useState({} as Bookmark);

  const renderTooltip = (props: any) => (
    <Tooltip id="button-tooltip" {...props}>
      {description}
    </Tooltip>
  );

  /***
   *  Add bookmark to file
   *  @param bookmark
   *  @param setBookmarkSelected
   *  @param setFiles
   *  This function is called when the user adds a bookmark to a file
   *  It updates the file state with the new bookmark
   */
  const addBookmark = (
    bookmark: { volume: string | number; path: string | number; name: any },
    setBookmarkSelected: {
      (value: React.SetStateAction<Bookmark>): void;
      (arg0: any): void;
    }
  ) => {
    setBookmarkSelected(bookmark);
  };

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
            ? bookmarkSelected
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
      { !showAddBookmarkModal ? null : <AddBookmarkModal
        show={showAddBookmarkModal}
        onHide={() => {
          setShowAddBookmarkModal(false);
          setBookmarkSelected({} as Bookmark);
        }}
        bookmark={bookmarkSelected}
        onAddBookmark={(bookmark: Bookmark) => {
          addBookmark(bookmark, setBookmarkSelected);
          onAddBookmark(bookmark);
        }}
      /> }      
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
