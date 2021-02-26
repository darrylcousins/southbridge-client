/** @jsx createElement */
/**
 * Router and starting  point of the box app.
 * Renders [crank]{@link https://www.npmjs.com/@bikeshaving/crank} elements
 *
 * @author Darryl Cousins <darryljcousins@gmail.com>
 * @module app/initialize
 * @requires @bikeshaving/crank
 * @listens DOMContentLoaded
 */
import { createElement } from "@bikeshaving/crank/cjs";
import { renderer } from "@bikeshaving/crank/cjs/dom";
import ContainerBoxApp from "./components/container-box";
import ProductBoxApp from "./components/product-box";

const init = async () => {
  const productJson = JSON.parse(document.getElementById("product-json").textContent);
  if (productJson.type === "Container Box") {
    await renderer.render(<ContainerBoxApp productJson={productJson} />, document.querySelector("#app"));
  } else if (productJson.type === "Box Produce") {
    await renderer.render(<ProductBoxApp productJson={productJson} />, document.querySelector("#app"));
  } else {
    return;
  }
};

// imported by initialize
export default { init };
