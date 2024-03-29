import React from "react";
import * as Icon from "react-bootstrap-icons";

 // get Icon component from extension
 const getFileIcon = (extension, fileIconMappings) => {
    for (const category in fileIconMappings) {
      if (
        fileIconMappings[category].extensions.includes(extension.toLowerCase())
      ) {
        const { icon, color } = fileIconMappings[category];
        const IconComponent = Icon[icon];
        return {
          category,
          icon: <IconComponent size={20} color={color} />,
        };
      }
    }
    // Si no encuentra una categoría, usa la categoría predeterminada
    const { icon, color } = fileIconMappings["default"];
    const IconComponent = Icon[icon];
    return {
      category: "default",
      icon: <IconComponent size={20} color={color} />,
    };
  };

  export { getFileIcon };