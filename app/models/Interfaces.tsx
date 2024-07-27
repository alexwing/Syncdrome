export interface AlertModel {
  title: string;
  message: string;
  type: "danger" | "success" | "warning";
}

export interface Commit {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    committer: {
      date: string;
    };
  };
}

export interface DrivesProps {
  conected: boolean;
  letter: string;
  name: string;
  freeSpace: number;
  size: number;
  sync: boolean;
  syncDate: string;
  onlyMedia: boolean;
}

export interface AlertMessageProps {
  show: boolean;
  alertMessage: AlertModel;
  onHide: () => void;
  autoClose?: number;ok
}

export interface FileType {
  icon: string;
  color: string;
  extensions: string[];
  media: string[];
}

export interface FileTypes {
  [key: string]: FileType;
}

export interface Bookmark {
  id: Number | null;
  name: string;
  path: string;
  volume: string;
  description: string;
}

export interface Settings {
  folder: string;
  NODE_ENV: string;
  extensions: FileTypes;
}

export interface IFile {
  name: string;
  fileName: string;
  folder: string;
  extension: string;
  bookmark?: Bookmark;
}

export interface IFileList {
  [key: string]: IFile[];
}

export interface LogFile{
  info: string;
  refresh: string;
  summary: string;
}

export interface FileCleanerProps {
  path: string;
  filename: string;
}