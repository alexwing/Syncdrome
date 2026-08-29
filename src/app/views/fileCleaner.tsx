import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Breadcrumb,
  Button,
  Container,
  Form,
} from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";
import classNames from "classnames";
import { open } from "@tauri-apps/plugin-dialog";
import Api from "../helpers/api";
import "../styles/components/fileCleaner.css";
import ConfirmDialog from "../components/ConfirmDialog";
import {
  AlertModel,
  FileCleanerProps,
  Settings,
  Substitution,
  TypeAlert,
} from "../models/Interfaces";
import {
  computeRenamePlan,
  countMatchesBySource,
  detectConflicts,
  RenameSegment,
  SegmentSource,
} from "../helpers/renameEngine";
import AlertMessage from "../components/AlertMessage";
import { useTranslation } from "../context/languageContext";

const RULE_COLORS = ["#f2b04b", "#b58def", "#7fb3e8", "#e8a3c0", "#8fd3c7", "#d3c98f"];
const PATTERN_COLOR = "#e06666";

const sourceColor = (source?: SegmentSource): string => {
  if (source === undefined || source === "cleanup" || source === "pattern") {
    return PATTERN_COLOR;
  }
  return RULE_COLORS[source % RULE_COLORS.length];
};

const FileCleaner = () => {
  const { t } = useTranslation();
  const initialPattenrTerm = localStorage.getItem("patternTerm") || "";
  const [originFolder, setOriginFolder] = useState("");
  const [folderInput, setFolderInput] = useState("");
  const [substitutions, setSubstitutions] = useState<Substitution[]>(
    [] as Substitution[]
  );
  const [baseFiles, setBaseFiles] = useState<FileCleanerProps[]>([]);
  const [manualEdits, setManualEdits] = useState<Record<string, string>>({});
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [onlyChanges, setOnlyChanges] = useState(false);
  const [hoveredSource, setHoveredSource] = useState<SegmentSource | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(0);
  const [pattern, setPattern] = useState(initialPattenrTerm);
  const [showAlert, setShowAlert] = useState(false);
  const [alert, setAlert] = useState({} as AlertModel);
  const [config, setConfig] = useState({} as Settings);

  // get config from server
  const getConfig = async () => {
    try {
      const response: any = await Api.getSettings();
      setConfig(response);
      if (response.pattern) {
        setPattern(response.pattern);
      }
      if (response.defaultSubstitutions) {
        setSubstitutions(response.defaultSubstitutions);
      }
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

  const saveConfig = async (newConfig: Settings): Promise<any> => {
    try {
      setConfig({ ...config, ...newConfig });
      newConfig = { ...config, ...newConfig } as Settings;
      const response = await Api.saveSettings(newConfig);
      return response;
    } catch (error) {
      setAlert({
        title: t("common.error"),
        message: t("settings.errorSavingConfig"),
        type: TypeAlert.danger,
      });
      setShowAlert(true);
      throw new Error("Error saving config file");
    }
  };

  useEffect(() => {
    getConfig();
  }, []);

  async function changeOriginFolder() {
    try {
      const folder = await open({
        directory: true,
        multiple: false,
        title: t("settings.selectFolder"),
      });
      if (folder) {
        setOriginFolder(folder as string);
        setFolderInput(folder as string);
      }
    } catch (error) {
      console.error("Error al abrir el diálogo:", error);
    }
  }

  const commitFolderInput = () => {
    if (folderInput.trim() && folderInput.trim() !== originFolder) {
      setOriginFolder(folderInput.trim());
    }
  };

  const loadFileNames = async () => {
    if (originFolder) {
      setLoading(true);
      try {
        const files = await Api.getFilesInFolder(originFolder);
        setBaseFiles(files as FileCleanerProps[]);
        setManualEdits({});
        setExcluded(new Set());
        setEditingFile(null);
      } catch (error: any) {
        setBaseFiles([]);
        setAlert({
          title: t("common.error"),
          message: String(error),
          type: TypeAlert.danger,
        });
        setShowAlert(true);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (originFolder) {
      loadFileNames();
    }
  }, [originFolder]);

  const handleAddSubstitution = () => {
    setSubstitutions([{ find: "", replace: "" }, ...substitutions]);
  };

  const handleDeleteSubstitution = (index: number) => {
    setDeleteIndex(index);
    setShowConfirm(true);
  };

  const deleteSubstitution = (index: number) => {
    const newSubstitutions = [...substitutions];
    newSubstitutions.splice(index, 1);
    setSubstitutions(newSubstitutions);
    setShowConfirm(false);
    setDeleteIndex(0);
    saveConfig({ ...config, pattern, defaultSubstitutions: newSubstitutions });
  };

  const handleSubstitutionChange = (
    index: number,
    field: keyof Substitution,
    value: string
  ) => {
    const newSubstitutions = substitutions.map((s, i) =>
      i === index ? { ...s, [field]: value } : s
    );
    setSubstitutions(newSubstitutions);
  };

  const handlePatternChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    localStorage.setItem("patternTerm", event.target.value);
    setPattern(event.target.value);
  };

  // Filas calculadas: plan de renombrado + destino + conflicto por archivo.
  const rows = useMemo(() => {
    const computed = baseFiles.map((file) => {
      const plan = computeRenamePlan(file.filename, substitutions, pattern);
      const manual = manualEdits[file.filename];
      const target = manual !== undefined ? manual : plan.fixed;
      const changed = target !== file.filename;
      const active = changed && !excluded.has(file.filename);
      return { file, plan, manual, target, changed, active, conflict: false };
    });
    const conflicts = detectConflicts(
      computed.map((r) => ({
        filename: r.file.filename,
        target: r.target,
        active: r.active,
      }))
    );
    for (const row of computed) {
      row.conflict = row.active && conflicts.has(row.target.toLowerCase());
    }
    return computed;
  }, [baseFiles, substitutions, pattern, manualEdits, excluded]);

  const matchCounts = useMemo(
    () => countMatchesBySource(rows.map((r) => r.plan)),
    [rows]
  );

  const changedCount = rows.filter((r) => r.changed).length;
  const conflictCount = rows.filter((r) => r.conflict).length;
  const toApply = rows.filter((r) => r.active && !r.conflict);
  const visibleRows = onlyChanges ? rows.filter((r) => r.changed) : rows;

  const toggleExcluded = (filename: string) => {
    const next = new Set(excluded);
    if (next.has(filename)) next.delete(filename);
    else next.add(filename);
    setExcluded(next);
  };

  const startEditing = (filename: string, current: string) => {
    setEditingFile(filename);
    setEditValue(current);
  };

  const commitEdit = () => {
    if (editingFile === null) return;
    const row = rows.find((r) => r.file.filename === editingFile);
    const value = editValue.trim();
    setManualEdits((prev) => {
      const next = { ...prev };
      if (!value || (row && value === row.plan.fixed)) {
        delete next[editingFile];
      } else {
        next[editingFile] = value;
      }
      return next;
    });
    setEditingFile(null);
  };

  const restoreComputed = (filename: string) => {
    setManualEdits((prev) => {
      const next = { ...prev };
      delete next[filename];
      return next;
    });
  };

  const applyChanges = () => {
    const payload = toApply.map((r) => ({
      path: r.file.path,
      filename: r.file.filename,
      fixed: r.target,
    }));
    if (payload.length === 0) return;
    Api.renameFilesInFolder(payload)
      .then((response) => {
        const results = response as FileCleanerProps[];
        const byName = new Map(results.map((r) => [r.filename, r]));
        setBaseFiles((prev) =>
          prev.map((file) => {
            const res = byName.get(file.filename);
            if (!res) return file;
            if (res.status === "success") {
              return {
                ...file,
                path: res.path,
                filename: res.fixed || file.filename,
                status: "success",
                message: undefined,
              };
            }
            return { ...file, status: res.status, message: res.message };
          })
        );
        setManualEdits({});
        setAlert({
          title: t("fileCleaner.filesRenamed"),
          message: "",
          type: TypeAlert.success,
        });
        setShowAlert(true);
      })
      .catch((error) => {
        setAlert({
          title: t("fileCleaner.errorRenaming"),
          message: error.message,
          type: TypeAlert.danger,
        });
        setShowAlert(true);
      });
  };

  const segmentSpan = (seg: RenameSegment, index: number) => {
    const hot =
      hoveredSource !== null &&
      seg.source === hoveredSource &&
      seg.source !== undefined;
    if (seg.kind === "keep") {
      return <span key={index}>{seg.text}</span>;
    }
    const style: React.CSSProperties = hot
      ? { background: sourceColor(seg.source), color: "#1b1b1b" }
      : {};
    return (
      <span
        key={index}
        className={seg.kind === "del" ? "seg-del" : "seg-add"}
        style={style}
      >
        {seg.text}
      </span>
    );
  };

  const rowStatus = (row: (typeof rows)[number]) => {
    if (row.file.status === "success") {
      return <span className="cleaner-status text-success">{t("fileCleaner.renamed")}</span>;
    }
    if (row.file.status === "error") {
      return (
        <span className="cleaner-status text-danger" title={row.file.message}>
          {t("fileCleaner.renameError")}
        </span>
      );
    }
    if (row.conflict) {
      return <span className="cleaner-status cleaner-conflict">{t("fileCleaner.conflict")}</span>;
    }
    if (row.manual !== undefined) {
      return <span className="cleaner-status cleaner-edited">{t("fileCleaner.edited")}</span>;
    }
    if (row.changed) {
      return <Icon.Check2 size={14} className="text-success" />;
    }
    return null;
  };

  const cleanerRow = (row: (typeof rows)[number]) => {
    const { file, plan } = row;
    const isEditing = editingFile === file.filename;
    return (
      <div
        key={file.filename}
        className={classNames("cleaner-row", {
          "cleaner-row-conflict": row.conflict,
          "cleaner-row-unchanged": !row.changed,
        })}
      >
        <span className="cleaner-check">
          {row.changed && (
            <Form.Check
              type="checkbox"
              checked={row.active}
              onChange={() => toggleExcluded(file.filename)}
            />
          )}
        </span>
        <span className="cleaner-original">
          {plan.segments
            .filter((s) => s.kind !== "add")
            .map((s, i) => segmentSpan(s, i))}
        </span>
        <span className="cleaner-arrow">
          {row.changed && (
            <Icon.ArrowRight
              size={13}
              className={row.conflict ? "cleaner-conflict" : "cleaner-arrow-icon"}
            />
          )}
        </span>
        <span className="cleaner-new">
          {isEditing ? (
            <Form.Control
              size="sm"
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitEdit();
                if (e.key === "Escape") setEditingFile(null);
              }}
            />
          ) : row.changed ? (
            <span
              className="cleaner-new-text"
              title={t("fileCleaner.colNew")}
              onClick={() => startEditing(file.filename, row.target)}
            >
              {row.manual !== undefined ? (
                <span className="cleaner-edited">{row.target}</span>
              ) : (
                plan.segments
                  .filter((s) => s.kind !== "del")
                  .map((s, i) => segmentSpan(s, i))
              )}
              {row.conflict && (
                <small className="cleaner-conflict ms-2">
                  ⚠ {t("fileCleaner.conflictWith")} «{row.target}»
                </small>
              )}
            </span>
          ) : (
            <span
              className="text-muted cleaner-new-text"
              title={t("fileCleaner.colNew")}
              onClick={() => startEditing(file.filename, row.target)}
            >
              {t("fileCleaner.unchanged")}
            </span>
          )}
          {row.manual !== undefined && !isEditing && (
            <Badge
              bg="none"
              className="cleaner-restore"
              title={t("fileCleaner.restoreComputed")}
              onClick={() => restoreComputed(file.filename)}
            >
              <Icon.ArrowCounterclockwise size={13} />
            </Badge>
          )}
        </span>
        <span className="cleaner-col-status">{rowStatus(row)}</span>
      </div>
    );
  };

  const showAlertMessage = (
    <AlertMessage
      show={showAlert}
      alertMessage={alert}
      onHide={() => setShowAlert(false)}
      autoClose={2000}
      ok={true}
    />
  );

  return (
    <Container className="container-scroll">
      <Breadcrumb className="mt-3">
        <Breadcrumb.Item href="/">{t("common.home")}</Breadcrumb.Item>
        <Breadcrumb.Item active>{t("fileCleaner.title")}</Breadcrumb.Item>
      </Breadcrumb>
      <h2>{t("fileCleaner.title")}</h2>

      <div className="d-flex gap-3 align-items-start mt-3 pb-4">
        {/* Carril de receta */}
        <div className="cleaner-rail">
          <div className="cleaner-card">
            <div className="cleaner-card-label">{t("fileCleaner.originFolder")}</div>
            <div className="d-flex gap-2">
              <Form.Control
                size="sm"
                type="text"
                placeholder={t("fileCleaner.enterOriginFolder")}
                value={folderInput}
                onChange={(e) => setFolderInput(e.target.value)}
                onBlur={commitFolderInput}
                onKeyDown={(e) => e.key === "Enter" && commitFolderInput()}
              />
              <Button variant="outline-secondary" size="sm" onClick={changeOriginFolder}>
                …
              </Button>
            </div>
            {baseFiles.length > 0 && (
              <small className="text-muted">
                {baseFiles.length} {t("fileCleaner.files")} ·{" "}
                <span className="cleaner-accent">
                  {changedCount} {t("fileCleaner.filesChangeShort")}
                </span>
              </small>
            )}
          </div>

          <div
            className="cleaner-card"
            onMouseEnter={() => setHoveredSource("pattern")}
            onMouseLeave={() => setHoveredSource(null)}
          >
            <div className="cleaner-card-label">
              <span className="rule-dot" style={{ background: PATTERN_COLOR }}></span>
              {t("fileCleaner.patternDeletes")}
              <span className="rule-count">
                {matchCounts.get("pattern") || 0} {t("fileCleaner.matches")}
              </span>
            </div>
            <Form.Control
              size="sm"
              type="text"
              className="cleaner-mono"
              placeholder={t("fileCleaner.enterPattern")}
              onChange={handlePatternChange}
              value={pattern || ""}
            />
          </div>

          <div className="cleaner-card">
            <div className="cleaner-card-label">
              {t("fileCleaner.substitutionRules")}
              <span className="ms-auto d-inline-flex gap-1">
                <Badge bg="none" className="cleaner-icon-btn" onClick={handleAddSubstitution}>
                  <Icon.PlusCircle size={16} color="green" />
                </Badge>
                <Badge
                  bg="none"
                  className="cleaner-icon-btn"
                  onClick={() =>
                    saveConfig({
                      ...config,
                      pattern: pattern,
                      defaultSubstitutions: substitutions,
                    })
                  }
                >
                  <Icon.Save size={15} color="#6ea8fe" />
                </Badge>
              </span>
            </div>
            <div className="cleaner-rules-list d-flex flex-column gap-1">
              {substitutions.map((substitution, index) => (
                <div
                  key={index}
                  className="cleaner-rule"
                  onMouseEnter={() => setHoveredSource(index)}
                  onMouseLeave={() => setHoveredSource(null)}
                >
                  <span
                    className="rule-dot"
                    style={{ background: RULE_COLORS[index % RULE_COLORS.length] }}
                  ></span>
                  <Form.Control
                    size="sm"
                    className="cleaner-mono"
                    value={substitution.find}
                    onChange={(e) =>
                      handleSubstitutionChange(index, "find", e.target.value)
                    }
                  />
                  <Icon.ArrowRight size={11} className="flex-shrink-0" />
                  <Form.Control
                    size="sm"
                    className="cleaner-mono"
                    value={substitution.replace}
                    onChange={(e) =>
                      handleSubstitutionChange(index, "replace", e.target.value)
                    }
                  />
                  <span className="rule-count">{matchCounts.get(index) || 0}</span>
                  <Badge
                    bg="none"
                    className="cleaner-icon-btn"
                    onClick={() => handleDeleteSubstitution(index)}
                  >
                    <Icon.Trash size={13} color="#dc3545" />
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <Button
            variant="success"
            disabled={toApply.length === 0}
            onClick={applyChanges}
          >
            <Icon.Check2All className="me-2" size={16} />
            {t("fileCleaner.applyCount", { count: toApply.length })}
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            disabled={!originFolder}
            onClick={loadFileNames}
          >
            <Icon.ArrowRepeat className="me-2" size={14} />
            {t("fileCleaner.reload")}
          </Button>
        </div>

        {/* Lista con diff */}
        <div className="flex-grow-1" style={{ minWidth: 0 }}>
          {showAlertMessage}
          {loading && (
            <div className="text-center mt-4">
              <Icon.ArrowRepeat size={24} className="cleaner-spin" />
            </div>
          )}
          {!loading && baseFiles.length === 0 && (
            <Alert variant="info" className="text-center">
              <Icon.FileEarmarkText className="m-2" size={28} />
              {t("fileCleaner.noFiles")}
            </Alert>
          )}
          {!loading && baseFiles.length > 0 && (
            <>
              <div className="cleaner-toolbar">
                <span>
                  {t("fileCleaner.filesChange", {
                    changed: changedCount,
                    total: baseFiles.length,
                  })}
                  {conflictCount > 0 && (
                    <span className="cleaner-conflict">
                      {" "}· {t("fileCleaner.conflictsCount", { count: conflictCount })}
                    </span>
                  )}
                </span>
                <Form.Check
                  type="switch"
                  id="only-changes"
                  label={t("fileCleaner.onlyChanges")}
                  checked={onlyChanges}
                  onChange={(e) => setOnlyChanges(e.target.checked)}
                />
              </div>
              <div className="cleaner-colhead">
                <span className="cleaner-check"></span>
                <span className="cleaner-original">{t("fileCleaner.colOriginal")}</span>
                <span className="cleaner-arrow"></span>
                <span className="cleaner-new">{t("fileCleaner.colNew")}</span>
                <span className="cleaner-col-status">{t("fileCleaner.colStatus")}</span>
              </div>
              {visibleRows.map(cleanerRow)}
              <div className="cleaner-statusbar">
                <span>
                  {baseFiles.length} {t("fileCleaner.files")} · {toApply.length}{" "}
                  {t("fileCleaner.selectedForRename")}
                  {conflictCount > 0 &&
                    ` · ${conflictCount} ${t("fileCleaner.conflictsExcluded")}`}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        title={t("settings.deleteSubstitutionTitle")}
        message={t("fileCleaner.confirmDeleteRule")}
        show={showConfirm}
        handleCancel={() => setShowConfirm(false)}
        handleOK={() => deleteSubstitution(deleteIndex)}
      />
    </Container>
  );
};

export default FileCleaner;

