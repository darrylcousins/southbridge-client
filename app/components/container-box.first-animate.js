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
import "regenerator-runtime/runtime"; // regeneratorRuntime error
import { createElement, Fragment } from "@bikeshaving/crank/cjs";
import { renderer } from "@bikeshaving/crank/cjs/dom";

import Error from "./error";
import BarLoader from "./bar-loader";
import QuantityForm from "./container/quantity-form";
import SelectMenu from "./select-menu";
import Flash from "./flash";
import AnimationWrapper from "./animation-wrapper";
import { Fetch, PostFetch } from "./fetch";
import { shallowEqual } from "../lib";

const Paragraph = () => (
  <p id="myText" class="absolute o-0 tl lh-copy black-60 mh0 mv2">
    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
    tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
    commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
    velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
    occaecat cupidatat non proident, sunt in culpa qui officia deserunt
    mollit anim id est laborum.
  </p>
);

const TextParagraph = AnimationWrapper(Paragraph);

/**
 * ContainerBoxApp crank component
 *
 * @generator ContainerBoxApp
 * @param {object} props The property object
 * @param {object} props.productJson Shopify product data as extracted from
 * product page json script tag
 * @yields {Element} A crank DOM component
 */
async function* ContainerBoxApp({ productJson }) {
  /**
   * Only required on developement site where id's don't match boxes - can be
   * updated once we can duplicated box mongo db
   */
  const idMap = {
    // small
    6163982876822: "5571286728870",
    // med
    6163982975126: "5571286794406",
    // med fruit
    6163982844054: "5576573878438",
    // med bread
    6163982942358: "5577031352486",
    // big
    6163982680214: "5571286696102",
    // custom
    6163982647446: "5598426005670",
  };
  /**
   * If fetching data was unsuccessful.
   *
   * @member fetchError
   * @type {object|string|null}
   */
  let fetchError = null;
  /**
   * Display loading indicator while fetching data
   *
   * @member loading
   * @type {boolean}
   */
  let loading = true;
  /**
   * Base url to api
   *
   * @member baseUrl
   * @type {string}
   */
  const baseUrl = "https://streamsidedev.cousinsd.net/api/";
  /**
   * Contains box data as collected from [api/current-boxes-by-product]{@link
   * module:api/current-boxes-by-product}. The data uses delivery date as keys to unsorted
   * array of box data.
   *
   * @member fetchJson
   * @type {object}
   */
  let fetchJson = {};
  /**
   * Upcoming delivery dates
   *
   * @member fetchDates
   * @type {object}
   */
  let fetchDates = [];
  /**
   * Show box customize options
   *
   * @member editBoxActive
   * @type {boolean}
   */
  let editBoxActive;
  /**
   * Contains cart data collected from html template json data
   * This will then also contain a selected date
   *
   * @member cartJson
   * @type {object}
   */
  const cartJson = await JSON.parse(
    document.querySelector("#cart-json").textContent
  );

  const handleEditBoxActive = async (show) => {
    console.log(editBoxActive);
    if (show) {
      // insert the component with "absolute o-0"
      await this.refresh();
      console.log('refreshing yes');
      // when unmounting component do this last!!
    }

    const targetId = "myText";
    // now the component is in the dom
    const target = document.getElementById(targetId);
    console.log(target);

    const childs = [] // find all items that need to be animated out of the way
    // find next child as node
    //let nextChild = document.querySelector("#app").nextSibling;
    let nextChild = target.nextSibling;
    while (nextChild) {
      if (nextChild.nodeName !== "#text") childs.push(nextChild);
      nextChild = nextChild.nextSibling;
    }
    const app = document.getElementById("app");
    nextChild = app.nextSibling;
    while (nextChild) {
      if (nextChild.nodeName !== "#text") childs.push(nextChild);
      nextChild = nextChild.nextSibling;
    }
    const footer = document.getElementById("footer");
    if (footer) childs.push(footer);

    // set width to app width
    target.style.width = `${app.clientWidth}px`;

    const options = {
      duration: 600,
      easing: "ease-in-out",
      fill: "both"
    };

    const targetBox = target.getBoundingClientRect();

    // animate out of the way
    const deltaY = targetBox.height;
    let animation;

    if (show) { // if not here we need to handle that as an error
      childs.forEach(el => {
        animation = el.animate([{
          transformOrigin: "top left",
          transform: `translate(0px, ${deltaY}px)`
        }], options);
      });
      animation.addEventListener("finish", () => {
        target.animate([{
          opacity: 1
        }], options);
      });
    } else { // target has been removed from dom so move childs back to place
      let childanimation;
      animation = target.animate([{
        opacity: 0
      }], options);
      //animation.addEventListener("finish", () => {
      childs.forEach(el => {
        childanimation = el.animate([{
          transformOrigin: "top left",
          transform: "none"
        }], options);
      });
      childanimation.addEventListener("finish", () => {
        this.refresh();
      });
      //})
    };
  };

  /**
   * Gather box includes for display, watch for dates
   *
   * @function getData
   */
  const getData = async () => {
    await Fetch(
      `${baseUrl}current-boxes-by-product/${idMap[productJson.id]}`
    ).then(({ error, json }) => {
      if (error) {
        fetchError = error;
      } else {
        if (Object.keys(json).length > 0) {
          fetchDates = Object.keys(json);
          fetchJson = json;
          console.log(fetchDates);
        }
      }
      // ok, I've got the dates and all data needed to start presenting
      // However we may already have a selected date from location.search query string or from cartdata
      // components which I then want to animate into view by o
      // 1. await refresh
      // 2. animated child siblings down
      // 3. animated fade to o-1 of the rendered element
      // This will be the common pattern - use a wrapper??


      // in both the following circumstances we should present entire edit box
      if (cartJson.items) {
        // find the selected date from the items
        for (item of cartJson.items) {
          console.warn(item);
          if (item.product.id === productJson.id) {
            // ??
            selectedDate = item.properties["Delivery Date"];
            editBoxActive = true;
            //fetchBox({ box: box, cart: cartJson }); // ???
            break;
          }
        }
      }
      if (window.location.search) {
        // use the selected date
        const d = new Date(parseInt(window.location.search.slice(1), 10));
        selectedDate = d.toDateString();
        editBoxActive = true;
        //fetchBox({ box: null, cart: null });
      }

      loading = false;
      editBoxActive = true;
      this.refresh();

    });
    if (editBoxActive) {
      function awaitRender() {
        console.log('checking');
        if(!document.getElementById("myText")) {
          setTimeout(awaitRender, 100);
        } else {
          // wait another fraction to avoid flicker
          setTimeout(() => handleEditBoxActive(editBoxActive), 200);
        }
      }
      awaitRender();
    }
  };

  await getData();

  /**
   * Handle click event on selected elements
   *
   * @function handleClick
   * @param {object} ev The firing event
   * @listens click
   */
  const handleClick = async (ev) => {
    console.log(ev.target.tagName);
    if (ev.target.tagName === "INPUT" || ev.target.tagName === "DIV") {
      if ((ev.target.type === "checkbox" && ev.target.id === "toggleEditBox") || ev.target.id === "toggleInput") {

        editBoxActive = !editBoxActive;

        handleEditBoxActive(editBoxActive);
      }
    }
  };

  this.addEventListener("click", handleClick);

  for await ({ productJson } of this) {
    yield (
      <div class="mt2 sans-serif" id="container-box">
        {loading ? (
          <BarLoader />
        ) : (
          <Fragment>
            <input
              class="b--silver mr2"
              type="checkbox"
              id="toggleEditBox"
              checked={editBoxActive}
            />
            <label
              for="toggleEditBox"
              htmlFor="toggleEditBox"
            >
              Customize your box
            </label>
            { editBoxActive && <TextParagraph /> }
          </Fragment>
        )}
      </div>
    );
  }
}

export default ContainerBoxApp;
