import React, { useState, useEffect, useContext } from "react";
import Api from "../helpers/api";
import { ThemeContext } from "../context/themeContext";
import { useTranslation } from "../context/languageContext";
import { Alert, Button, Form } from "react-bootstrap";

import {
  AlertModel,
  FileTypes,
  LanguageSetting,
  Settings,
  ThemeMode,
  TypeAlert,
} from "../models/Interfaces";
import AlertMessage from "../components/AlertMessage";
import ConfirmDialog from "../components/ConfirmDialog";
import FileTypeModal, { FileTypeDraft } from "../components/FileTypeModal";
import * as Icon from "react-bootstrap-icons";
import { open } from "@tauri-apps/plugin-dialog";

const Config = () => {
  const { mode, setMode } = useContext(ThemeContext);
  const { t, language, setLanguage } = useTranslation();
  const [folder, setFolder] = useState("");
  const [fileTypes, setFileTypes] = useState({} as FileTypes);
  const [newExtension, setNewExtension] = useState({ key: "", ext: "" });
  const [alert, setAlert] = useState({
    title: "",
    message: "",
    type: "danger",
  } as AlertModel);
  const [showAlert, setShowAlert] = useState(false);
  const [loadedConfig, setLoadedConfig] = useState({} as Settings);
  const [typeModal, setTypeModal] = useState<
    { mode: "add" } | { mode: "edit"; key: string } | null
  >(null);
  const [deleteTypeKey, setDeleteTypeKey] = useState<string | null>(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newConfig = {
      ...loadedConfig,
      folder,
      extensions: fileTypes,
    } as Settings;
    try {
      const response = Api.saveSettings(newConfig);
      getConfig();
      if (response.result === "error") {
        setAlert({
          title: t("common.error"),
          message: t("settings.configNotSavedReason") + response.message,
          type: TypeAlert.danger,
        });
        setShowAlert(true);
        return;
      }
      setAlert({
        title: t("common.success"),
        message: t("settings.configSaved"),
        type: TypeAlert.success,
      });
      setShowAlert(true);
    } catch (error) {
      setAlert({
        title: t("common.error"),
        message: t("settings.configNotSaved"),
        type: TypeAlert.danger,
      });
      setShowAlert(true);
    }
  };

  const getConfig = async () => {
    try {
      const response = await Api.getSettings();
      const config = response as Settings;
      setFolder(config.folder);
      setFileTypes(config.extensions);
      setLoadedConfig(config);
    } catch (error) {
      setAlert({
        title: t("common.error"),
        message: t("settings.configNotFound"),
        type: TypeAlert.danger,
      });
      setShowAlert(true);
      return;
    }
  };

  useEffect(() => {
    getConfig();
  }, []);

  const showAlertMessage = (
    <AlertMessage
      show={showAlert}
      alertMessage={alert}
      onHide={() => setShowAlert(false)}
      autoClose={2500}
    />
  );

  const openFolderHandler = (event) => {
    const driveLetter = folder.slice(0, 2);
    const folderPath = folder.slice(3);
    event.preventDefault();
    event.stopPropagation();
    Api.openFolder(folderPath, driveLetter);
  };

  const onChangeFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: t("settings.selectFolder"),
      });
      if (selected) {
        setFolder(selected as string);
      }
    } catch (error) {
      console.error("Error al abrir el diálogo:", error);
    }
  };

  const getFileIcon = (icon: string, color: string) => {
    const IconComponent = Icon[icon] || Icon.FileEarmark;
    return <IconComponent size={18} className="me-2" color={color} />;
  };

  const isMedia = (key: string, ext: string) =>
    fileTypes[key].media.includes(ext);

  const toggleMedia = (key: string, ext: string) => {
    const media = [...fileTypes[key].media];
    const index = media.indexOf(ext);
    if (index > -1) media.splice(index, 1);
    else media.push(ext);
    setFileTypes({ ...fileTypes, [key]: { ...fileTypes[key], media } });
  };

  const removeExtension = (key: string, ext: string) => {
    setFileTypes({
      ...fileTypes,
      [key]: {
        ...fileTypes[key],
        extensions: fileTypes[key].extensions.filter((e) => e !== ext),
        media: fileTypes[key].media.filter((e) => e !== ext),
      },
    });
  };

  const onAddExtension = (key: string) => {
    const ext = newExtension.ext.trim().toLowerCase().replace(/^\./, "");
    if (newExtension.key !== key || ext === "") return;
    for (const fileType in fileTypes) {
      if (fileTypes[fileType].extensions.includes(ext)) {
        setAlert({
          title: t("common.error"),
          message: t("settings.extensionExistsIn") + fileType,
          type: TypeAlert.danger,
        });
        setShowAlert(true);
        return;
      }
    }
    setFileTypes({
      ...fileTypes,
      [key]: {
        ...fileTypes[key],
        extensions: [...fileTypes[key].extensions, ext],
      },
    });
    setNewExtension({ key, ext: "" });
  };

  const saveType = (draft: FileTypeDraft) => {
    if (!typeModal) return;
    if (typeModal.mode === "add") {
      setFileTypes({
        ...fileTypes,
        [draft.name]: {
          icon: draft.icon,
          color: draft.color,
          extensions: [],
          media: [],
        },
      });
    } else {
      // Renombrar reconstruyendo el objeto para conservar el orden de las claves
      setFileTypes(
        Object.fromEntries(
          Object.entries(fileTypes).map(([k, v]) =>
            k === typeModal.key
              ? [draft.name, { ...v, icon: draft.icon, color: draft.color }]
              : [k, v]
          )
        ) as FileTypes
      );
    }
    setTypeModal(null);
  };

  const deleteType = () => {
    if (!deleteTypeKey) return;
    const next = { ...fileTypes };
    delete next[deleteTypeKey];
    setFileTypes(next);
    setDeleteTypeKey(null);
  };

  const categoryCard = (key: string) => {
    const type = fileTypes[key];
    return (
      <div key={key} className="settings-card">
        <div className="settings-card-label">
          {getFileIcon(type.icon, type.color)}
          <span className="text-capitalize">{key}</span>
          <span className="settings-card-count">
            {type.extensions.length} ext · {type.media.length} media
          </span>
          <span className="settings-card-tools">
            <Icon.PencilSquare
              size={14}
              role="button"
              title={t("settings.editType")}
              onClick={() => setTypeModal({ mode: "edit", key })}
            />
            <Icon.Trash
              size={14}
              role="button"
              title={t("settings.deleteType")}
              onClick={() => setDeleteTypeKey(key)}
            />
          </span>
        </div>
        <div className="d-flex gap-2">
          <Form.Control
            size="sm"
            type="text"
            placeholder={t("settings.extensionPlaceholder")}
            value={newExtension.key === key ? newExtension.ext : ""}
            onChange={(e) => setNewExtension({ key, ext: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAddExtension(key);
              }
            }}
          />
          <Button
            variant="outline-secondary"
            size="sm"
            type="button"
            onClick={() => onAddExtension(key)}
          >
            <Icon.PlusLg size={14} />
          </Button>
        </div>
        <div className="ext-chips">
          {type.extensions.map((ext) => (
            <span
              key={ext}
              className={`ext-chip ${isMedia(key, ext) ? "media" : ""}`}
              title={t("settings.chipHint")}
              onClick={() => toggleMedia(key, ext)}
            >
              {ext}
              <Icon.X
                size={13}
                className="chip-x"
                onClick={(e) => {
                  e.stopPropagation();
                  removeExtension(key, ext);
                }}
              />
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="settings-form">
      {showAlertMessage}

      <div className="settings-general">
        <div className="settings-card">
          <div className="settings-card-label">
            <Icon.Folder2Open size={16} className="me-2" />
            {t("settings.folder")}
          </div>
          <div className="d-flex gap-2">
            <Form.Control
              size="sm"
              type="text"
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
            />
            <Button
              variant="outline-secondary"
              size="sm"
              type="button"
              onClick={onChangeFolder}
            >
              …
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              type="button"
              title={t("explorer.showInFolder")}
              onClick={openFolderHandler}
            >
              <Icon.Folder2Open size={14} />
            </Button>
          </div>
          <small className="text-muted">{t("settings.folderHint")}</small>
        </div>

        <div className="settings-card">
          <div className="settings-card-label">
            <Icon.Palette size={16} className="me-2" />
            {t("settings.appearance")} · {t("settings.language")}
          </div>
          <div className="d-flex gap-2">
            <Form.Select
              size="sm"
              value={mode}
              onChange={(e) => setMode(e.target.value as ThemeMode)}
            >
              <option value="system">{t("settings.themeSystem")}</option>
              <option value="light">{t("settings.themeLight")}</option>
              <option value="dark">{t("settings.themeDark")}</option>
            </Form.Select>
            <Form.Select
              size="sm"
              value={language}
              onChange={(e) => setLanguage(e.target.value as LanguageSetting)}
            >
              <option value="system">{t("settings.themeSystem")}</option>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </Form.Select>
          </div>
          <small className="text-muted">{t("settings.appearanceHint")}</small>
        </div>

        <div className="settings-card settings-card-save">
          <Button variant="primary" type="submit">
            <Icon.Save size={16} className="me-2" />
            {t("common.save")}
          </Button>
          <small className="text-muted">{t("settings.saveHint")}</small>
        </div>
      </div>

      <div className="d-flex align-items-center justify-content-between">
        <div className="settings-section-title">{t("settings.fileTypes")}</div>
        <Button
          variant="outline-secondary"
          size="sm"
          type="button"
          onClick={() => setTypeModal({ mode: "add" })}
        >
          <Icon.PlusLg size={14} className="me-2" />
          {t("settings.addType")}
        </Button>
      </div>
      <Alert variant="info" className="px-3 py-2 mb-3 opacity-75">
        {t("settings.addRemoveInfo")}
      </Alert>
      <div className="settings-grid mb-4">
        {Object.keys(fileTypes).map((key) =>
          key === "default" ? null : categoryCard(key)
        )}
      </div>

      {typeModal && (
        <FileTypeModal
          show={true}
          initial={
            typeModal.mode === "edit"
              ? {
                  name: typeModal.key,
                  icon: fileTypes[typeModal.key].icon,
                  color: fileTypes[typeModal.key].color,
                }
              : undefined
          }
          takenNames={Object.keys(fileTypes).filter(
            (k) => typeModal.mode !== "edit" || k !== typeModal.key
          )}
          onSave={saveType}
          onHide={() => setTypeModal(null)}
        />
      )}
      <ConfirmDialog
        title={t("settings.deleteType")}
        message={t("settings.confirmDeleteType", { name: deleteTypeKey || "" })}
        subMessage={t("settings.deleteTypeNote")}
        show={deleteTypeKey !== null}
        handleCancel={() => setDeleteTypeKey(null)}
        handleOK={deleteType}
      />
    </form>
  );
};

export default Config;
