import React, { useEffect, useState } from "react";
import { Col, Form } from "react-bootstrap";
import ReactSelect from "react-select";
import { FileType, FileTypes } from "../models/Interfaces";
import * as Icon from "react-bootstrap-icons";

interface ExtensionSelectProps {
  className?: string;
  fileExtension: FileTypes;
  values?: string[];
  onValuesChange?: (values: any) => void;
}

//react component for file type selection, get file type from file extension parameter
const ExtensionSelect: React.FC<ExtensionSelectProps> = ({
  fileExtension,
  className,
  onValuesChange,
  values,
}) => {
  //FileTypes sorted by key
  const [sorted, setSorted] = useState<FileTypes>({});
  const [selected, setSelected] = useState<any>([]);	
  const handleSelect = (values: any) => {
    const selected = values.map((value: any) => value.value);
    onValuesChange?.(selected);
  };
  // get Icon component from extension
  const getFileIcon = (fileType: FileType) => {
    const IconComponent = Icon[fileType.icon];
    return {
      icon: <IconComponent size={20} className="me-2" color={fileType.color} />,
    };
  };
  useEffect(() => {
    if (values && sorted && Object.keys(sorted).length > 0) {
      const selected = values.map((value) => ({
        value: value,
        label: (
          <div>
            {getFileIcon(sorted[value])?.icon}
            {value}
          </div>
        ),
      }));
      setSelected(selected);
    }
  }, [values, sorted]);

  //sort file types by key
  useEffect(() => {
    const sorted = () => {
      const keys = Object.keys(fileExtension).sort();
      const sorted: FileTypes = {};
      keys.forEach((key) => {
        sorted[key] = fileExtension[key];
      });
      //remove "default" key
      delete sorted.default;
      return sorted;
    };
    setSorted(sorted());
  }, [fileExtension]);

  // Definir los datos de las opciones
  const options = Object.keys(sorted).map((key) => ({
    value: key,
    label: (
      <div>
        {getFileIcon(sorted[key])?.icon}
        {key}
      </div>
    ),
  }));

  return (
    <Form.Group as={Col} controlId="formGridState" className={className}>
      <ReactSelect
        isMulti
        defaultValue={options[0]}
        options={options}
        value={selected}
        className="basic-multi-select text-start"
        classNamePrefix="select"
        onChange={handleSelect}
        placeholder="Filter by file types"
      />
    </Form.Group>
  );
};

export default ExtensionSelect;
