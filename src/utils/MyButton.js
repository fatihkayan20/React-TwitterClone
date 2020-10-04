import { IconButton, Tooltip } from "@material-ui/core";
import React from "react";

export default ({
  children,
  onClick,
  tip,
  btnClassName,
  tipClassName,
  placement = "top",
}) => (
  <Tooltip placement="top" title={tip} className={tipClassName}>
    <IconButton onClick={onClick} className={btnClassName}>
      {children}
    </IconButton>
  </Tooltip>
);
