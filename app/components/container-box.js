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
import QuantityForm from "./quantity-form";
import SelectMenu from "./select-menu";
import Flash from "./flash";
import { Fetch, PostFetch } from "./fetch";
import { shallowEqual } from "../lib";

/**
 * BoxApp crank component
 *
 * @function BoxApp
 * @param {object} props The property object
 * @param {object} props.productJson Shopify product data as extracted from
 * product page json script tag
 * @returns {Element} A crank DOM component
 */
async function* ContainerBoxApp({productJson}) {
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
   * Uses fetch to collect current cart for the session 
   *
   * @function fetchCart
   */
  const fetchCart = async () => {
    const json = JSON.parse(document.querySelector("#cart-json").textContent);
    if (json.items.length === 0) {
      //fetchCurrentDates();
    } else {
      //loadCart(json);
    }
    console.log(json);
  };

  fetchCart(); // the first thing to happem

  for await ({productJson} of this) {
    yield (
      <div class="mt2 sans-serif" id="container-box">
        { fetchError && <Error msg={fetchError} /> }
        { !loading ? (
          <Loading />
        ) : (
          <p>Here we are then</p>
        )}
      </div>
    );
  };
}

export default ContainerBoxApp;
