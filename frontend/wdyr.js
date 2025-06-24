import React from "react";
import whyDidYouRender from "@welldone-software/why-did-you-render";
// Make sure to only include the library in development
if (process.env.NODE_ENV === "development") {
  whyDidYouRender(React, {
    trackAllPureComponents: true
  });
}
