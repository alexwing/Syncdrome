import React from 'react';
import { Tooltip, Badge, OverlayTrigger } from 'react-bootstrap';
import { BookmarkPlusFill } from 'react-bootstrap-icons';

export const AddBookmarkBadge = ({ item, key2, key, connected, setBookmarkSelected, setShowAddBookmarkModal }) => {
  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      {item.bookmark.description}
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
        color: item.bookmark ? "#16ab9c" : "#cdcdcd",
      }}
      className="ms-4"
      onClick={() => {
        setBookmarkSelected(
          item.bookmark
            ? item.bookmark
            : {
                id: null,
                name: item.fileName,
                path: key2,
                volume: key,
                description: "",
              }
        );
        setShowAddBookmarkModal(true);
      }}
    >
      <BookmarkPlusFill size={16} />
    </Badge>
  );

  return item.bookmark && item.bookmark.description ? (
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