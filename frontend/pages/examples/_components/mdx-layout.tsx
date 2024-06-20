import React, { useEffect } from "react";
import CustomNav from "./CustomNav";
import "prismjs/themes/prism-tomorrow.min.css";

function MdxLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CustomNav />
      <div
        className="prose mt-4 mx-auto"
      >
        {children}
      </div>
    </>
  );
}

export default MdxLayout;
