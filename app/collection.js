/** @jsx createElement */
/**
 * Home page client app for collection listings
 *
 * @author Darryl Cousins <darryljcousins@gmail.com>
 * @module app/home-page
 * @requires @bikeshaving/crank
 * @listens DOMContentLoaded
 */
import "regenerator-runtime/runtime"; // regeneratorRuntime error
import { createElement, Fragment } from "@bikeshaving/crank/cjs";
import { renderer } from "@bikeshaving/crank/cjs/dom";

import { Fetch, PostFetch } from "./components/fetch";
import Error from "./components/error";
import BarLoader from "./components/bar-loader";
import SelectMenu from "./components/select-menu";

function* BoxContent ({productJson}) {
  /** 
   * Only required on developement site where id's don't match boxes - can be
   * updated once we can duplicated box mongo db
   */
  const idMap = {
    // small
    "6163982876822": "5571286728870",
    // med
    "6163982975126": "5571286794406",
    // med fruit
    "6163982844054": "5576573878438",
    // med bread
    "6163982942358": "5577031352486",
    // big
    "6163982680214": "5571286696102",
    // custom
    "6163982647446": "5598426005670",
  }
  /** 
   * Only required on developement site where id's don't match boxes - can be
   * updated once we can duplicated box mongo db
   */
  const variantMap = JSON.parse(document.querySelector("#variant-map").textContent);
  /**
   * Base url to api
   *
   * @member baseUrl
   * @type {string}
   */
  const baseUrl = "https://streamsidedev.cousinsd.net/api/";
  /**
   * The selected date after user select, one of fetchJson.keys
   *
   * @member selectedDate
   * @type {string}
   */
  let selectedDate;
  /**
   * Display date selection menu if active
   *
   * @member menuSelectDate
   * @type {boolean}
   */
  let menuSelectDate= false;
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
   * Included products - disregarding delivery date for now
   *
   * @member includedProducts
   * @type {object}
   */
  let includedProducts = [];
  /**
   * Handle mouse up on selected components
   *
   * @function handleMouseUp
   * @param {object} ev The firing event
   * @listens click
   */
  const handleMouseUp = (ev) => {
    if (ev.target.tagName === "BUTTON") {

      switch(ev.target.id) {
        case `selectDate${productJson.id}`:
          menuSelectDate = !menuSelectDate;
          this.refresh()
          break;
      }

    } else if (ev.target.tagName === "DIV") {

      switch(ev.target.getAttribute("name")) {
        case `selectDate${productJson.id}`:
          const date = ev.target.getAttribute("data-item");
          selectedDate = date;
          //selectBox(date);
          menuSelectDate = false;
          this.refresh()
          break;
      }
    }
  };

  this.addEventListener("mouseup", handleMouseUp);

  /**
   * Customize box clicked - reload page to box product
   *
   * @function customizeBox
   */
  const customizeBox = () => {
    const url = `${productJson.url}?${Date.parse(selectedDate)}`;
    if (typeof window.swup === 'undefined') {
      window.location = url;
    } else {
      window.swup.loadPage({ url });
    }
  };

  /**
   * Submit cart data as made up from makeCart - also the callee
   *
   * @function submitCart
   */
  const submitCart = async ({ cart }) => {

    const data = {
      id: variantMap[fetchJson[selectedDate].shopify_variant_id],
      quantity: 1,
      properties: {
        "Delivery Date": selectedDate,
        "Including": includedProducts.join(','),
      }
    };
    const headers = {"Content-Type": "application/json"};
    const src = "/cart/add.js";
    const {error, json} = await PostFetch({src, data, headers});

    const url = "/cart";
    if (typeof window.swup === 'undefined') {
      window.location = url;
    } else {
      window.swup.loadPage({ url });
    }
  };

  /**
   * Gather box includes for display, watch for dates
   *
   * @function selectBox
   * @param date {string} The selected date
   */
  const getData = async () => {
    await Fetch(`${baseUrl}current-boxes-by-product/${idMap[productJson.id]}`)
      .then(({error, json}) => {
        if (error) {
          fetchError = error;
        } else {
          if (Object.keys(json).length > 0) {
            fetchDates = Object.keys(json);
            includedProducts = json[fetchDates[0]].includedProducts.map(el => el.shopify_title.replace(/^- ?/, ""));
            fetchJson = json;
          }
        }
        loading = false;
        this.refresh();
      })
  };

  // get loaded
  getData();

  while(true) {
    yield (
      <Fragment>
        { fetchError && <Error msg={fetchError} /> }
        { loading ? <BarLoader /> : (
          <Fragment>
            <div class="w-100 pv2">
              { !includedProducts.length ? (
                fetchDates.length ? (
                  <div>Build your own box with available products.</div>
                ) : (
                  <div>No boxes scheduled for delivery, we will post next week's boxes shortly. Please try again later.</div>
                )
              ) : (
                includedProducts.map(el => (
                  <a
                    href={`/products/${el.replace(/ /g, '-').toLowerCase()}`}
                    class="link pointer o-90 fl f6 ph3 ma1 ba br-pill b--streamside-blue bg-transparent fg-streamside-blue"
                  >
                      { el }
                  </a>
              )))}
            </div>
            <div class="cf" />
            { fetchDates.length ? (
              <Fragment>
                <div class="relative w-100 pt3-ns cf">
                  <div class={selectedDate ? "w-100 w-third-ns fl" : "w-100 fl"}>
                    <SelectMenu
                      id={`selectDate${productJson.id}`}
                      menu={fetchDates.map(el => ({text: el, item: el}))}
                      title="Select Date"
                      active={menuSelectDate}
                    >
                      { selectedDate ? selectedDate : "Select delivery date" }&nbsp;&nbsp;&nbsp;&#9662;
                    </SelectMenu>
                  </div>
                  { selectedDate && (
                    <Fragment>
                      <div class="w-100 w-third-ns fl pl1">
                        <button
                          type="button"
                          name="add"
                          aria-label="Add to cart"
                          class="di f6 ttu w-100 tracked dim outline-0 debut-yellow b--debut-brown ba ba1 bg-debut-brown br2 pa2 mb1 pointer"
                          onclick={submitCart}
                        >
                            Add to cart
                        </button>
                      </div>
                      <div class="w-100 w-third-ns fl pl1">
                        <button
                          type="button"
                          name="customize"
                          aria-label="Customize box"
                          class="di f6 ttu w-100 tracked dim outline-0 debut-yellow b--debut-brown ba ba1 bg-debut-brown br2 pa2 mb1 pointer"
                          onclick={customizeBox}
                        >
                          Customize box
                        </button>
                      </div>
                    </Fragment>
                  )}
                </div>
              </Fragment>
            ) : (
              <div>&nbsp;</div>
            )}

          </Fragment>
        )}
      </Fragment>
    );
  };
}

const init = () => {
  const content = document.querySelectorAll("p[name='box-content']");
  content.forEach(async el => {
    const json = JSON.parse(el.parentNode.querySelector("script").textContent);
    await renderer.render(<BoxContent productJson={json} />, el);
  });
};

document.addEventListener("DOMContentLoaded", async () => {
  // do your setup here
  // init();
});

// imported by initialize
export default { init };
