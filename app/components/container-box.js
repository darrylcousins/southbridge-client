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
import SelectMenu from "./select-menu";
import Flash from "./flash";
import AnimationWrapper from "./animation-wrapper";
import { Fetch, PostFetch } from "./fetch";
import { shallowEqual } from "../lib";
import { selectDateEvent, selectorOpenEvent, moveProductEvent, quantityUpdateEvent } from "./events";
import getPrice from "./price";
import DateSelector from "./container/date-selector";
import BoxProducts from "./container/box-products";
import QuantityForm from "./container/quantity-form";
import ProductSelector from "./container/product-selector";
import { sortObjectByKey } from "../helpers";

const hasOwnProp = Object.prototype.hasOwnProperty;
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
   * Upcoming delivery dates, same as Object.keys(fetchJson)
   *
   * @member fetchDates
   * @type {object}
   */
  let fetchDates = [];
  /**
   * The selected date after user select, one of fetchJson.keys
   *
   * @member selectedDate
   * @type {string}
   */
  let selectedDate;
  /**
   * The selected box : fetchJson[selectedDate]
   *
   * @member selectedBox
   * @type {object}
   */
  let selectedBox;
  /**
   * Items included in the box, initially matches selectedBox.includedProducts unless pulling from cart data
   * but can be edited by the user
   *
   * @member selectedIncludes
   * @type {Array}
   */
  let selectedIncludes = [];
  /**
   * Items that can be included in the box, initially matches selectedBox.addOnProducts unless pulling from cart data
   *
   * @member possibleAddons
   * @type {Array}
   */
  let possibleAddons = [];
  /**
   * Items excluded from the box by the user - can only be items initially in selectedBox.includedProducts
   *
   * @member selectedExcludes
   * @type {Array}
   */
  let selectedExcludes = [];
  /**
   * Items added to the box by the user, can only be items found in selectedBox.addOnProducts
   *
   * @member selectedAddons
   * @type {Array}
   */
  let selectedAddons = [];
  /**
   * The total price TODO here in development udating on refresh - production
   * may actuall use priceElement as above
   *
   * @member priceElement
   * @type {Element}
   */
  let totalPrice = productJson.variants[0].price;
  /**
   * Show box flag - using this to animate in after loading
   *
   * @member showBoxActive
   * @type {boolean}
   */
  let showBoxActive = false;
  /**
   * Show box customize options - used to animate in the options
   *
   * @member editBoxActive
   * @type {boolean}
   */
  let editBoxActive = false;
  /**
   * Display edit quantities form modal
   *
   * @member modalQtyForm
   * @type {boolean}
   */
  let modalQtyForm = false;
  /**
   * Have we loaded data from an existing cart?
   *
   * @member loadedFromCart
   * @type {boolean} false
   */
  let loadedFromCart = false;
  /**
   * Hold on to the product id of the box in the cart, useful to easily check
   * if this box is the same as in the cart, particulary as we only allow one
   * box per order
   *
   * @member cartBoxId
   * @type {number} false
   */
  let cartBoxId = null;
  /**
   * Extra items in the current cart, stored as object of id: quantity
   *
   * @member cartAddons
   * @type {object}
   */
  const cartAddons = {};
  /**
   * Removed items recorded in the current cart
   *
   * @member cartRemovedItems
   * @type {Array}
   */
  let cartRemovedItems = [];
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
  /**
   * Load the product items after selectedBox is made
   *
   * @function loadBox
   */
  const loadBox = () => {
    // may have upped the quantity of standard included product
    const checkLoadPresence = (product) => {
      const found = selectedIncludes.find(el => el.shopify_variant_id === product.shopify_variant_id);
      if (typeof found === "undefined") return false;
      return found;
    }

    selectedIncludes = selectedBox.includedProducts.map(el => {
      const item = {...el};
      const found = checkLoadPresence(el);
      item.quantity = found ? found.quantity : 1;
      return item;
    });
    possibleAddons = selectedBox.addOnProducts.map(el => {
        const item = {...el};
        item.quantity = 1;
        return item;
      })
      .filter(el => !selectedIncludes.find(ob => ob.shopify_title === el.shopify_title));

    // TODO find another smarter, cleaner way to do this. The purpose of this
    // algorithm is to match addons and excludes when switching between dates
    // and so is not done initially when loading cart data.
    // SEE container-box.bak.js

    // NOTE me thinks that I need to run a different routing depending on having a cart.

    // handle cart inclusions - cartRemovedItems and cartAddons are collected in "init"
    const cartAddonIds = Object.keys(cartAddons);

    // find current addon selection that are possible for this box and use has already selected addons
    const currentSelectedAddons = selectedAddons
      .filter(el => possibleAddons.map(el => el.shopify_product_id).includes(el.shopify_product_id));
    console.log('current addons', currentSelectedAddons);

    console.log(possibleAddons.map(el => el.shopify_title));
    // problem now is that I assume a cart
    if (cartAddonIds.length) {
      console.log('cart add ids', cartAddonIds);
      selectedAddons = possibleAddons
        .filter(el => cartAddonIds.includes(el.shopify_variant_id))
        .map(el => {
          const item = {...el};
          if (cartAddonIds.includes(el.shopify_variant_id)) item.quantity = cartAddons[el.shopify_variant_id];
          return item;
        });
    } else {
      // but even I may have changed the selectedAddons???
      console.log('no cart add ids', cartAddonIds);
      selectedAddons = selectedAddons
        .filter(el => possibleAddons.map(el => el.shopify_product_id).includes(el.shopify_product_id));
    }
    
    possibleAddons = possibleAddons.filter(el => !cartAddonIds.includes(el.shopify_variant_id));
    selectedExcludes = selectedIncludes.filter(el => cartRemovedItems.includes(el.shopify_title));
    selectedIncludes = selectedIncludes
      .map(el => {
        const item = {...el};
        if (el.shopify_title === "Carrot bunch") {
        }
        if (cartAddonIds.includes(el.shopify_variant_id)) {
          item.quantity += cartAddons[el.shopify_variant_id];
        }
        return item;
      })
      .filter(el => !cartRemovedItems.includes(el.shopify_title));

    // and what happens when the date is changed?

    //totalPrice = selectedBox.shopify_price;
    updatePriceElement();
    //console.log("box loaded");
  };

  /**
   * Make up cart data, submit to cart.js and redirect page
   *
   * @function submitCart
   */
  const submitCart = async () => {

    const makeTitle = (el) => {
      let title = el.shopify_title;
      if (el.quantity > 1) {
        title = `${title} (${el.quantity})`;
      }
      return title
    };

    const data = {};
    data.items = [];
    // following that are any addon items
    selectedAddons.forEach(el => {
      const id = el.shopify_variant_id;
      if (id) {
        data.items.push({
          quantity: el.quantity,
          id: el.shopify_variant_id,
          properties: {
            "Delivery Date": selectedDate,
            "Add on product to": selectedBox.shopify_title
          }
        })
      }
    })
    // following that are any addon items that are already included in box but are extras
    selectedIncludes.forEach(el => {
      if (el.quantity > 1) {
        data.items.push({
          quantity: el.quantity - 1,
          id: el.shopify_variant_id,
          properties: {
            "Delivery Date": selectedDate,
            "Add on product to": selectedBox.shopify_title
          }
        })
      }
    })
    // first item is the box itself
    data.items.push({
      quantity: 1,
      id: selectedBox.shopify_variant_id,
      properties: {
        "Delivery Date": selectedDate,
        "Including": selectedIncludes.map(el => makeTitle(el)).join(),
        "Removed Items": selectedExcludes.map(el => el.shopify_title).join(),
        "Add on Items": selectedAddons.map(el => makeTitle(el)).join()
      }
    })
    const headers = {"Content-Type": "application/json"};
    const {error: clearError, json: clearJson} = await PostFetch({src: "/cart/clear.js", data, headers});

    if (clearError) {
      console.warn(clearError); // what to do here??
      return;
    }

    const {error, json} = await PostFetch({src: "/cart/add.js", data, headers});
    const url = "/cart";
    if (typeof window.swup === 'undefined') {
      window.location = url;
    } else {
      window.swup.loadPage({ url });
    }
  };

  /**
   * Handle click event on selected elements
   *
   * @function handleClick
   * @param {object} ev The firing event
   * @listens click
   */
  const handleClick = async (ev) => {
    if (ev.target.tagName === "INPUT" || ev.target.tagName === "DIV") {
      if ((ev.target.type === "checkbox" && ev.target.id === "toggleEditBox") || ev.target.id === "toggleInput") {
        editBoxActive = !editBoxActive;
        this.refresh();
      }
    }
    if (ev.target.tagName === "BUTTON") {
      if (ev.target.id === "qtyForm") {
        modalQtyForm= !modalQtyForm;
        this.refresh()
      }
      if (ev.target.id === "qtyFormClose") {
        modalQtyForm= !modalQtyForm;
        this.refresh()
      }
    }
  };

  this.addEventListener("click", handleClick);

  /**
   * Select the date for box
   *
   * @function handleDateSelect
   * @param ev {object} The event object with ev.detail.date to be selected
   * @listens selectDateEvent
   */
  const handleDateSelect = (ev) => {
    selectedDate = ev.detail.date;
    selectedBox = fetchJson[selectedDate];
    loadBox();
    showBoxActive = true;
    this.refresh();
  };
  this.addEventListener("selectDateEvent", handleDateSelect);

  /** 
   * Map strings to the lists
   *
   * @function listMap
   */
  const listMap = (str) => {
    let list;
    switch(str) {
      case 'possibleAddons':
        list = possibleAddons;
        break;
      case 'selectedAddons':
        list = selectedAddons;
        break;
      case 'selectedIncludes':
        list = selectedIncludes;
        break;
      case 'selectedExcludes':
        list = selectedExcludes;
        break;
    }
    return list;
  }
  /**
   * Update priceElement on relevant changes
   *
   * @function updatePriceElement
   */
  const updatePriceElement = () => {
    let start = selectedBox.shopify_price;
    selectedIncludes.forEach(el => {
      if (el.quantity > 1) start += el.shopify_price * (el.quantity - 1);
    });
    selectedAddons.forEach(el => {
      start += el.shopify_price * el.quantity;
    });
    totalPrice = start;
    // ensure that this.refresh is called
    document.querySelector("#product-price").innerHTML = `$${(totalPrice * 0.01).toFixed(2)}`;
  };
  /**
   * Move product between product lists of addon, excludes etc
   * * ev.detail.id - product id
   * * ev.detail.from - moving from this list
   * * ev.detail.to - move to this list
   *
   * @function moveItem
   * @param ev {object} The event object with ev.detail
   * @listens moveProductEvent
   */
  const moveProduct = (ev) => {
    let fromList = listMap(ev.detail.from);
    let toList = listMap(ev.detail.to);
    const id = ev.detail.id;
    let i;
    for (i = 0; i < fromList.length; i++) {
      if (fromList[i].shopify_product_id === parseInt(id, 10)) {
        toList.push(fromList[i]);
        fromList.splice(i, 1);
      }
    }
    toList = sortObjectByKey(toList, 'shopify_title');

    updatePriceElement();
    this.refresh();
  };
  this.addEventListener("moveProductEvent", moveProduct);
  /**
   * Quantity changed by quantity form
   * * ev.detail.id - product id
   * * ev.detail.quantity - the value changed
   * * ev.detail.list - the list: either selectedIncludes or selectedAddons
   *
   * @function quantityUpdated
   * @param ev {object} The event object with ev.detail
   * @listens quantityUpdateEvent
   */
  const quantityUpdate = (ev) => {
    const productList = listMap(ev.detail.list);
    let targetList;
    if (ev.detail.list === "selectedIncludes") targetList = "selectedExcludes";
    if (ev.detail.list === "selectedAddons") targetList = "possibleAddons";
    productList.forEach(el => {
      if (el.shopify_product_id === parseInt(ev.detail.id, 10)) {
        if (parseInt(ev.detail.quantity) === 0) {
          el.quantity = 1;
          moveProduct({detail: {id: el.shopify_product_id, from: ev.detail.list, to: targetList}});
        } else {
          el.quantity = ev.detail.quantity;
        }
      }
    });
    updatePriceElement();
    this.refresh();
  };
  this.addEventListener("quantityUpdateEvent", quantityUpdate);

  /**
   * Gather box includes for display, watch for dates, cart items and date
   * already selected from collection
   *
   * @function init
   */
  const init = async () => {
    await Fetch(
      `${baseUrl}current-boxes-by-product/${productJson.id}`
    ).then(async ({ error, json }) => {
      if (error) {
        fetchError = error;
      } else {
        if (Object.keys(json).length > 0) {
          fetchDates = Object.keys(json);
          fetchJson = json;
          if (fetchDates.length === 1) {
            selectedDate = fetchDates[0];
            selectedBox = fetchJson[selectedDate];
            showBox = true;
          }
        }
      }

      let showBox;
      // in both the following circumstances we should present entire edit box
      if (cartJson.items) {
        // find the selected date from the items
        for (const item of cartJson.items) {
          if (item.product_type === "Container Box") {
            // get the delivery date regardless of which box
            selectedDate = item.properties["Delivery Date"];
            // using date if available
            if (hasOwnProp.call(fetchJson, selectedDate)) selectedBox = fetchJson[selectedDate];
            showBox = true;
            // can assume same removed items for a different box
            if (hasOwnProp.call(item.properties, "Removed Items")) {
              cartRemovedItems = item.properties["Removed Items"].split(",");
            }
            cartBoxId = item.product_id;

            if (item.product_id === productJson.id) {
              // only now are we sure that this is the same box
              loadedFromCart = true;
              //fetchBox({ box: box, cart: cartJson }); // ???
            }
          }
          if (item.product_type === "Box Produce") {
            // these are included in the box as addons
            cartAddons[item.variant_id] = item.quantity;
          }
        }
      }
      if (window.location.search) {
        // use the selected date
        const d = new Date(parseInt(window.location.search.slice(1), 10));
        selectedDate = d.toDateString();
        selectedBox = fetchJson[selectedDate];
        showBox = true;
        //fetchBox({ box: null, cart: null });
      }


      // either a single delivery date, or selectd date, or box in cart
      if (showBox) {
        loadBox();
        this.schedule(() => {
          setTimeout(() => { // helps to keep things smooth on load
            showBoxActive = true;
            this.refresh();
          }, 300);
        });
      }

      loading = false;
      //moveProduct({detail: {id:"5571290923174", from:"selectedIncludes", to:"selectedExcludes"}});
      this.refresh();

    });
  };

  await init();  // set up script

  for await ({ productJson } of this) {
    yield (
      <div class="mt2 sans-serif" id="container-box">
        {loading ? (
          <BarLoader />
        ) : (
          <Fragment>
            { modalQtyForm && (
              <QuantityForm selectedIncludes={selectedIncludes} selectedAddons={selectedAddons} totalPrice={totalPrice} />
            )}

            <DateSelector fetchDates={fetchDates} selectedDate={selectedDate} />
            <BoxProducts
              selectedIncludes={selectedIncludes}
              selectedExcludes={selectedExcludes}
              selectedAddons={selectedAddons}
              isActive={showBoxActive}
              componentId="defaultBox"
            />
            { showBoxActive && (
              <Fragment>
                <div id="toggleInput" class="pointer z-max w-100 pv3 gray dt">
                  <div class="dtc">
                    <input
                      class="b--silver mr2"
                      type="checkbox"
                      id="toggleEditBox"
                      checked={editBoxActive}
                    />
                    <label
                      for="toggleEditBox"
                      htmlFor="toggleEditBox"
                    class="pointer"
                    >
                      Customize your box
                    </label>
                  </div>
                  <div class="dtc">
                    <div class="tr">
                      <button
                        class="f6 outline-0 gray b--gray ba ba1 bg-transparent br2 pa1 mb1 pointer"
                        title="Change product quantities"
                        id="qtyForm"
                        type="button"
                        >
                        Change quantities
                      </button>
                    </div>
                  </div>
                </div>

                <ProductSelector
                  selectedIncludes={selectedIncludes}
                  possibleAddons={possibleAddons}
                  isActive={editBoxActive}
                  componentId="productSelector"
                />

                { selectedDate && (
                  <Fragment>
                    { cartBoxId && (selectedBox.shopify_product_id !== cartBoxId) && (
                      <div class="warn fg-warn br2 w-100 ba mb2 tc">
                        <span class="f3 b pr1">&#33;</span>
                        Adding this box to your cart will remove the box currently in your cart.
                      </div>
                    )}
                    <button
                      type="submit"
                      name="add"
                      id="add-button"
                      aria-label="Add to cart"
                      class="f6 ttu w-100 tracked dim outline-0 debut-yellow b--debut-brown ba ba1 bg-debut-brown br2 pa2 mb1 pointer"
                      data-add-to-cart=""
                      onclick={submitCart}
                    >
                      <span data-add-to-cart-text="">{ loadedFromCart ? "Update selection" : "Add to cart" }</span>{" "}
                      <span class="dn" data-loader="">
                        <svg
                          aria-hidden="true"
                          focusable="false"
                          role="presentation"
                          class="icon icon-spinner"
                          viewbox="0 0 20 20"
                        >
                          <path
                            d="M7.229 1.173a9.25 9.25 0 1 0 11.655 11.412 1.25 1.25 0 1 0-2.4-.698 6.75 6.75 0 1 1-8.506-8.329 1.25 1.25 0 1 0-.75-2.385z"
                            fill="#919EAB"
                          ></path>
                        </svg>
                      </span>
                    </button>
                  </Fragment>
                )}
              </Fragment>
            )}
          </Fragment>
        )}
      </div>
    );
  }
}
  /*
            <TextParagraph
              isActive={editBoxActive}
              componentId="myText"
            />
            */

export default ContainerBoxApp;
