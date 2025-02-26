import React, { useState, useRef } from "react";

const ResizableDiv = ({ children }) => {
  const [dimensions, setDimensions] = useState({ width: 300, height: 200 });
  const isResizingRight = useRef(false);
  const isResizingBottom = useRef(false);
  const isResizingCorner = useRef(false);

  const handleMouseDownRight = (e) => {
    isResizingRight.current = true;
    const startX = e.clientX;
    const startWidth = dimensions.width;

    const handleMouseMove = (event) => {
      if (isResizingRight.current) {
        const newWidth = startWidth + (event.clientX - startX);
        setDimensions((prev) => ({ ...prev, width: Math.max(newWidth, 100) }));
      }
    };

    const handleMouseUp = () => {
      isResizingRight.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseDownBottom = (e) => {
    isResizingBottom.current = true;
    const startY = e.clientY;
    const startHeight = dimensions.height;

    const handleMouseMove = (event) => {
      if (isResizingBottom.current) {
        const newHeight = startHeight + (event.clientY - startY);
        setDimensions((prev) => ({
          ...prev,
          height: Math.max(newHeight, 100),
        }));
      }
    };

    const handleMouseUp = () => {
      isResizingBottom.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseDownCorner = (e) => {
    isResizingCorner.current = true;
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = dimensions.width;
    const startHeight = dimensions.height;

    const handleMouseMove = (event) => {
      if (isResizingCorner.current) {
        const newWidth = startWidth + (event.clientX - startX);
        const newHeight = startHeight + (event.clientY - startY);
        setDimensions({
          width: Math.max(newWidth, 100),
          height: Math.max(newHeight, 100),
        });
      }
    };

    const handleMouseUp = () => {
      isResizingCorner.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      style={{
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        border: "2px solid black",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {children}
      <div
        onMouseDown={handleMouseDownRight}
        style={{
          width: "10px",
          height: "100%",
          backgroundColor: "gray",
          position: "absolute",
          top: "0",
          right: "0",
          cursor: "ew-resize",
        }}
      ></div>
      <div
        onMouseDown={handleMouseDownBottom}
        style={{
          width: "100%",
          height: "10px",
          backgroundColor: "gray",
          position: "absolute",
          bottom: "0",
          left: "0",
          cursor: "ns-resize",
        }}
      ></div>
      <div
        onMouseDown={handleMouseDownCorner}
        style={{
          width: "10px",
          height: "10px",
          backgroundColor: "gray",
          position: "absolute",
          bottom: "0",
          right: "0",
          cursor: "nwse-resize",
        }}
      ></div>
    </div>
  );
};

export default ResizableDiv;

