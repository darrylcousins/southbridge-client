/**
 * Handle page transitions for site
 *
 * @author Darryl Cousins <darryljcousins@gmail.com>
 * @module app/standalone/transitions
 * @listens DOMContentLoaded
 */
import "regenerator-runtime/runtime"; // regeneratorRuntime error
import Swup from "swup";
import collection from "./collection";
import boxApp from "./box-app";

const init = () => {

  const page_type = document.querySelector("#swup").getAttribute("data-page-type");

  switch (page_type) {
    case "index":
      collection.init();
      break;
    case "collection":
      collection.init();
      break;
    case "product":
      boxApp.init();
      break;
    case "page":
      break;
  };

};

document.addEventListener("DOMContentLoaded", async () => {
  // do your setup here
  //const main = document.querySelectorAll("#swup");
  //console.log('page loaded in transitions, HERE');
  const swup = new Swup();
  window.swup = swup;
  init();
  swup.on('contentReplaced', init);
  //swup.on('willReplaceContent', () => window.observer.disconnect());
});

