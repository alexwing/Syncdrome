import React, { useState } from "react";
import { Tooltip, Badge, OverlayTrigger } from "react-bootstrap";
import { BookmarkPlusFill } from "react-bootstrap-icons";
import AddBookmarkModal from "./AddBookmarkModal";
import { Bookmark } from "../models/Interfaces";

interface AddBookmarkBadgeProps {
  isBookmarked: boolean;
  fileName: string;
  path: string;
  volume: string;
  description: string;
  /** El marcador completo cuando ya existe (necesario para editarlo). */
  bookmark?: Bookmark;
  setFiles: (files: any) => void;
  onAddBookmark: (bookmark: Bookmark) => void;
}

export const AddBookmarkBadge: React.FC<AddBookmarkBadgeProps> = ({
  isBookmarked,
  fileName,
  path,
  volume,
  description,
  bookmark,
  onAddBookmark,
}) => {
  const [showAddBookmarkModal, setShowAddBookmarkModal] = useState(false);

  // Al editar, usar el marcador real (con su id); al crear, uno nuevo.
  const target: Bookmark =
    isBookmarked && bookmark
      ? bookmark
      : {
          id: null,
          name: fileName,
          path: path,
          volume: volume,
          description: description || "",
        };

  const renderTooltip = (props: any) => (
    <Tooltip id="button-tooltip" {...props}>
      {description}
    </Tooltip>
  );

  const badge = (
    <Badge
      bg="none"
      style={{
        cursor: "pointer",
        color: isBookmarked ? "#16ab9c" : "#cdcdcd",
      }}
      onClick={(e) => {
        e.stopPropagation();
        setShowAddBookmarkModal(true);
      }}
    >
      <BookmarkPlusFill size={16} />
    </Badge>
  );

  return (
    <>
      {isBookmarked && description ? (
        <OverlayTrigger
          placement="left"
          delay={{ show: 250, hide: 400 }}
          overlay={renderTooltip}
        >
          {badge}
        </OverlayTrigger>
      ) : (
        badge
      )}
      {/* El modal va FUERA del badge: si estuviera dentro, los clics del
          modal burbujean por el portal hasta el onClick del badge y
          reinician el estado a mitad de edición. */}
      {showAddBookmarkModal && (
        <AddBookmarkModal
          show={showAddBookmarkModal}
          onHide={() => setShowAddBookmarkModal(false)}
          bookmark={target}
          onAddBookmark={(saved: Bookmark) => {
            setShowAddBookmarkModal(false);
            onAddBookmark(saved);
          }}
        />
      )}
    </>
  );
};
