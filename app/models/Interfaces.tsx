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
  autoClose?: number ;
}

export interface FileType {
  icon: string;
  color: string;
  extensions: string[];
}

export interface FileTypes {
  [key: string]: FileType;
}