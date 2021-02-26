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

const hasOwnProp = Object.prototype.hasOwnProperty;
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
   * A message to the user - on 4s fade out
   *
   * @member flashMessage
   * @type {string}
   */
  let flashMessage = "Please select a delivery date";
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
   * Contains array of current box dates duplicating fetchJson.keys
   *
   * @member fetchDates
   * @type {Array}
   */
  let fetchDates = [];
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
   * The selected box after user select: fetchJson[selectedDate]
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
   * Show box customize options
   *
   * @member editBoxActive
   * @type {boolean}
   */
  let editBoxActive;
  /**
   * Show box customize options
   *
   * @member editBoxActive
   * @type {boolean}
   */
  let editBoxActiveComplete;
  /**
   * Display date selection menu if active
   *
   * @member menuSelectDate
   * @type {boolean}
   */
  let menuSelectDate= false;
  /**
   * Display add product menu if active
   *
   * @member menuAddItem
   * @type {boolean}
   */
  let menuAddItem = false;
  /**
   * Display remove product menu if active
   *
   * @member menuRemoveItem
   * @type {boolean}
   */
  let menuRemoveItem = false;
  /**
   * Display edit quantities form modal
   *
   * @member modalQtyForm
   * @type {boolean}
   */
  let modalQtyForm = false;
  /**
   * The price element - updated on change, and set after fetch
   *
   * @member priceElement
   * @type {Element}
   */
  let priceElement;
  /**
   * The total price TODO here in development udating on refresh - production
   * may actuall use priceElement as above
   *
   * @member priceElement
   * @type {Element}
   */
  let totalPrice = productJson.variants[0].price;
  /**
   * Have we loaded data from an existing cart?
   *
   * @member loadedFromCart
   * @type {boolean} false
   */
  let loadedFromCart = false;
  /**
   * Store height of the edit form to animate its display
   *
   * @member boxEditHeight
   * @type {number} 0
   */
  let boxEditHeight = 0;
  /**
   * Make up a string price
   *
   * @param {number} num The integer number to use
   * @returns {string} Price string
   */
  const toPrice = (num) => `$${(num * 0.01).toFixed(2)}`;
  /**
   * Figure the price for the element, if it's a standard included product only
   * extra quantities greater than one incur a price
   *
   * @param {object} el The target element
   * @param {boolean} includes Is this a standard included product?
   * @returns {string} Price string
   */
  const getPrice = (el, includes) => toPrice(el.shopify_price * (includes ? el.quantity - 1 : el.quantity));

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
   *
   * @function moveItem
   * @param id {number} The shopify_id of the product
   * @param from {array} The list to remove item from
   * @param to {array} The list to add the item to
   */
  const moveItem = (id, from, to) => {
    let i;
    for (i = 0; i < from.length; i++) {
      if (from[i].shopify_id === id) {
        to.push(from[i]);
        from.splice(i, 1);
      }
    }
    updatePriceElement();
  };

  /**
   * Load the product items
   *
   * @function loadBox
   * @param date {string} The selected date
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
      item.shopify_title = el.shopify_title.replace(/^- ?/, '');
      const found = checkLoadPresence(el);
      item.quantity = found ? found.quantity : 1;
      return item;
    });
    possibleAddons = selectedBox.addOnProducts.map(el => {
      const item = {...el};
      item.shopify_title = el.shopify_title.replace(/^- ?/, '');
      item.quantity = 1;
      return item;
    });

    // TODO find another smarter, cleaner way to do this. The purpose of this
    // algorithm is to match addons and excludes when switching between dates
    // and so is not done initially when loading cart data.

    // tmp arrays for filter tests
    let tmpIncludedIds = selectedIncludes.map(el => el.shopify_id);
    let tmpAddonIds = possibleAddons.map(el => el.shopify_id);

    selectedExcludes = selectedExcludes.filter(el => tmpIncludedIds.includes(el.shopify_id));
    selectedAddons = selectedAddons.filter(el => tmpAddonIds.includes(el.shopify_id));

    // re-build tmp arrays
    tmpIncludedIds = selectedExcludes.map(el => el.shopify_id);
    tmpAddonIds = selectedAddons.map(el => el.shopify_id);

    selectedIncludes = selectedIncludes.filter(el => !tmpIncludedIds.includes(el.shopify_id));
    possibleAddons = possibleAddons.filter(el => !tmpAddonIds.includes(el.shopify_id));

    totalPrice = selectedBox.shopify_price;
  };

  /**
   * Set the selected box and set up product arrays, called after selecting
   * date.
   *
   * @function selectBox
   * @param date {string} The selected date
   */
  const selectBox = async (date) => {
    selectedDate = date;
    if (!hasOwnProp.call(fetchJson, selectedDate)) {
      loading = false;
      this.refresh();
      const ts = new Date(date).getTime();
      await Fetch(`${baseUrl}box-by-date-and-product/${idMap[productJson.id]}/${ts}`)
        .then(({error, json}) => {
          if (error) {
            fetchError = error;
          } else {
            fetchJson[selectedDate] = json;
            selectedBox = fetchJson[selectedDate];
            loadBox();
          }
          loading = false;
          this.refresh();
        })
    } else {
      selectedBox = fetchJson[selectedDate];
      loadBox();
      this.refresh();
    }
  };

  /**
   * Handle change on selected input elements
   *
   * @function handleChange
   * @param {object} ev The firing event
   * @listens change
   */
  const handleChange = (ev) => {
    if (ev.target.tagName === "INPUT") {
      if (ev.target.name === "quantity") {
        switch(ev.target.getAttribute("data-id")) {
          case "includes":
            selectedIncludes.forEach(el => {
              if (el.shopify_id === ev.target.id) {
                if (parseInt(ev.target.value) === 0) {
                  el.quantity = 1;
                  flashMessage = `${el.shopify_title} removed.`;
                  moveItem(el.shopify_id, selectedIncludes, selectedExcludes);
                } else {
                  el.quantity = ev.target.value;
                  flashMessage = `${el.shopify_title} quantity changed to ${el.quantity}.`;
                }
              }
            });
            break;
          case "addons":
            selectedAddons.forEach(el => {
              if (el.shopify_id === ev.target.id) {
                if (parseInt(ev.target.value) === 0) {
                  el.quantity = 1;
                  flashMessage = `Add on ${el.shopify_title} removed.`;
                  moveItem(el.shopify_id, selectedAddons, possibleAddons);
                } else {
                  el.quantity = ev.target.value;
                  flashMessage = `${el.shopify_title} quantity changed to ${el.quantity}.`;
                }
              }
            });
            break;
        }
        updatePriceElement();
        this.refresh();
      }
    }
  };

  this.addEventListener("change", handleChange);

  /**
   * Set up edit box either when page loaded from collection and choosing to
   * edit box or after selecting checkbox
   *
   * @function handleEditBoxActive
   */
  const handleEditBoxActive = async (ev) => {
    const boxEdit = document.getElementById("container-box-edit");
    const description = document.querySelector("#product-description");
    const footer = document.querySelector("#footer");
    const addButton = document.querySelector("#add-button");
    if (boxEdit) {
      boxEdit.style.width = `${description.clientWidth}px`;
      const boxEditRect = boxEdit.getBoundingClientRect();
      boxEditHeight = boxEditRect.height;
    };
    console.log('no box here', boxEdit);

    // animate out of the way
    const deltaY = boxEditHeight;
    let animation;

    let keyFrames = {
      duration: 600,
      easing: "ease-in-out",
      fill: "both"
    };

    if (boxEdit) {
      [description, footer, addButton].forEach(el => {
        animation = el.animate([{
          transformOrigin: "top left",
          transform: `translate(0px, ${deltaY}px)`
        }], keyFrames);
        animation.addEventListener("finish", () => {
          boxEdit.classList.add("transition-fade");
        });
      });
    } else {
      [description, footer, addButton].forEach(el => {
        animation = el.animate([{
          transformOrigin: "top left",
          transform: "none"
        }], keyFrames);
      });
    };
  };

  /**
   * Handle click event on selected elements
   *
   * @function handleClick
   * @param {object} ev The firing event
   * @listens click
   */
  const handleClick = async (ev) => {
    if (ev.target.tagName === "INPUT") {
      if (ev.target.type === "checkbox" && ev.target.id === "toggleEditBox") {

        if (!editBoxActiveComplete === null) editBoxActiveComplete = null;
        editBoxActive = !editBoxActive;
        await this.refresh();

        handleEditBoxActive();
      }
    }
  };

  this.addEventListener("click", handleClick);

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
        case "selectDate":
          menuSelectDate = !menuSelectDate;
          modalQtyForm = menuRemoveItem = menuAddItem = false;
          this.refresh()
          break;
        case "removeItem":
          menuRemoveItem = !menuRemoveItem;
          modalQtyForm = menuSelectDate = menuAddItem = false;
          this.refresh()
          break;
        case "addItem":
          menuAddItem= !menuAddItem;
          modalQtyForm = menuRemoveItem = menuSelectDate = false;
          this.refresh()
          break;
        case "qtyForm":
          modalQtyForm= !modalQtyForm;
          menuSelectDate = menuRemoveItem = menuSelectDate = false;
          this.refresh()
          break;
        case "qtyFormClose":
          modalQtyForm= false;
          this.refresh()
          break;
      }

    } else if (ev.target.tagName === "DIV") {

      switch(ev.target.getAttribute("name")) {
        case "selectDate":
          const date = ev.target.getAttribute("data-item");
          if (typeof selectedDate === 'undefined') {
            flashMessage = `Delivery date chosen ${date}`;
          } else {
            flashMessage = `Delivery date changed to ${date}`;
          }
          selectBox(date);
          menuSelectDate = false;
          this.refresh()
          break;
        case "removeItem":
          flashMessage = `${ev.target.getAttribute("data-title")} removed.`;
          moveItem(ev.target.getAttribute("data-item"), selectedIncludes, selectedExcludes);
          menuRemoveItem = false;
          this.refresh()
          break;
        case "addItem":
          flashMessage = `${ev.target.getAttribute("data-title")} added.`;
          moveItem(ev.target.getAttribute("data-item"), possibleAddons, selectedAddons);
          menuAddItem = false;
          this.refresh()
          break;
        case "selectedAddon":
          flashMessage = `Add on ${ev.target.getAttribute("data-title")} removed.`;
          moveItem(ev.target.getAttribute("data-item"), selectedAddons, possibleAddons);
          this.refresh()
          break;
        case "selectedExclude":
          flashMessage = `${ev.target.getAttribute("data-title")} added back.`;
          moveItem(ev.target.getAttribute("data-item"), selectedExcludes, selectedIncludes);
          this.refresh()
          break;
      }
    }
  };

  this.addEventListener("mouseup", handleMouseUp);

  /**
   * Uses fetch to collect current boxes from api and then refreshs `this`
   * (Called as soon as the element is mounted.)
   *
   * @function fetchData
   */
  const fetchData = async () => {
    const fetchUrl = `${baseUrl}current-boxes-by-product/${idMap[productJson.id]}`;
    const {error, json} = await Fetch(fetchUrl);
    if (error) {
      fetchError = error;
    } else {
      fetchJson = json;
      fetchDates = Object.keys(fetchJson);
      // if only one bypass the date select
      if (fetchDates.length === 1) {
        selectBox(fetchDates[0]); // be wary - do we need to refresh component?
        flashMessage = "";
      }
    }
    loading = false;
    this.refresh();
  };

  /**
   * Uses fetch to collect current dates from api
   *
   * @function fetchCurrentDates
   */
  const fetchCurrentDates = async () => {
    const fetchUrl = `${baseUrl}current-box-dates`;
    const {error, json} = await Fetch(fetchUrl);
    if (error) {
      fetchError = error;
    } else {
      fetchDates = json;
      if (fetchDates.length === 1) {
        //selectBox(fetchDates[0]); // this causes a flicket because drop down already rendered
        flashMessage = "";
      }
    }
    loading = false;
    //this.refresh();
  };

  /**
   * Load current cart if cart.items.length - called from `fetchCart` which is caalled immdiately the component loads
   */
  const loadCart = async (cart) => {
    // product_type from liquid object would be (?) cart.items[x].product.type
    const [box] = cart.items.filter(el => el.product_type === "Container Box");
    selectedDate = box.properties["Delivery Date"];

    // loading dates can happen asynchronously to loading selected box
    await Fetch(`${baseUrl}current-box-dates`)
      .then(({error, json}) => {
        if (error) {
          fetchError = error;
        } else {
          fetchDates = json;
        }
        this.refresh();
      })

    fetchBox({ box, cart });
  };

  /**
   * Uses fetch to collect current cart for the session 
   *
   * @function fetchBox
   */
  const fetchBox = async ({ box, cart }) => {
    // get the box data
    if (!selectedDate) {
      console.warn("Calling loadBox with no selectedDate");
      return;
    };
    const ts = new Date(selectedDate).getTime();
    await Fetch(`${baseUrl}box-by-date-and-product/${idMap[productJson.id]}/${ts}`)
      .then(({error, json}) => {
        if (error) {
          fetchError = error;
        } else {
          fetchJson[selectedDate] = json;
          selectedBox = fetchJson[selectedDate];

          const removedItems = box ? box.properties["Removed Items"].split(',').map(el => el.trim()) : [];

          // get the excluded items
          selectedExcludes = selectedBox.includedProducts
            .filter(el => removedItems.includes(el.shopify_title));

          const checkPresence = (product) => {
            if (!cart) return false;
            const found = cart.items.find(el => el.variant_id === product.shopify_variant_id);
            if (typeof found === "undefined") return false;
            return found;
          }

          // get the included box items filtering out those already excluded if loaded from cart
          selectedIncludes = selectedBox.includedProducts
            .filter(el => !removedItems.includes(el.shopify_title))
            .map(el => {
              const item = {...el};
              item.shopify_title = el.shopify_title.replace(/^- ?/, '');
              const found = checkPresence(el);
              item.quantity = found ? found.quantity + 1 : 1;
              return item;
            });
          // get the addon products and their quantity if loaded from cart
          selectedAddons = selectedBox.addOnProducts
            .filter(el => checkPresence(el))
            .map(el => {
              const item = {...el};
              item.shopify_title = el.shopify_title.replace(/^- ?/, '');
              const found = checkPresence(el);
              item.quantity = found.quantity;
              return item;
            });
          // get defined possible addons filtering out those that have been added o the cart
          possibleAddons = selectedBox.addOnProducts
            .filter(el => !checkPresence(el))
            .map(el => {
              const item = {...el};
              item.shopify_title = el.shopify_title.replace(/^- ?/, '');
              item.quantity = 1;
              return item;
            });
          }
        loading = false;
        updatePriceElement();
        flashMessage = "Loaded box from your cart";
        loadedFromCart = true;
        this.refresh();
      })
  };

  /**
   * Uses fetch to collect current cart for the session 
   *
   * @function fetchCart
   */
  const fetchCart = async () => {
      /*
    const json = JSON.parse(document.querySelector("#cart-json").textContent);
    if (json.items.length === 0) {
      fetchCurrentDates();
    } else {
      loadCart(json);
    }
    */
    const {error, json} = await Fetch("/cart.js");
    if (error) {
      fetchError = error;
      this.refresh();
    } else {
      if (!json.items) throw "Failed to load cart data";
      if (json.items.length === 0) {
        fetchCurrentDates();
      } else {
        loadCart(json);
      }
    }
  };

  /**
   * Submit cart data as made up from makeCart - also the callee
   *
   */
  const submitCart = async ({ cart }) => {

    const data = {
      items: cart.items.map(item => {
        return {
          id: variantMap[item.variant_id],
          quantity: item.quantity,
          properties: item.properties
        }
      })
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
   * Make up cart data for submission. Doing this is a simple as submitting to
   * cart/add.js with an array of items
   *
   * TODO: Not in necessary - could call submitCart directly - see collection.js for example
   *
   */
  const makeCart = () => {
    const cart = {};
    cart.total_price = totalPrice;

    const makeTitle = (el) => {
      let title = el.shopify_title;
      if (el.quantity > 1) {
        title = `${title} (${el.quantity})`;
      }
      return title
    };

    cart.items = [];
    // first item is the box itself
    cart.items.push({
      quantity: 1,
      title: selectedBox.shopify_title,
      product_id: selectedBox.shopify_product_id,
      variant_id: selectedBox.shopify_variant_id,
      handle: selectedBox.shopify_handle,
      product_type: "Container Box",
      properties: {
        "Delivery Date": selectedDate,
        "Including": selectedIncludes.map(el => makeTitle(el)).join(),
        "Removed Items": selectedExcludes.map(el => el.shopify_title).join(),
        //"Add on Items": selectedAddons.map(el => makeTitle(el)).join()
      }
    })
    // following that are any addon items
    selectedAddons.forEach(el => {
      cart.items.push({
        quantity: el.quantity,
        title: el.shopify_title,
        product_id: el.shopify_product_id,
        variant_id: el.shopify_variant_id,
        handle: el.shopify_handle,
        product_type: "Box Produce",
        properties: {
          "Delivery Date": selectedDate,
          "Add on product to": selectedBox.shopify_title
        }
      })
    })
    // following that are any addon items that are already included in box but are extras
    selectedIncludes.forEach(el => {
      if (el.quantity > 1) {
        cart.items.push({
          quantity: el.quantity - 1,
          title: el.shopify_title,
          product_id: el.shopify_product_id,
          variant_id: el.shopify_variant_id,
          handle: el.shopify_handle,
          product_type: "Box Produce",
          properties: {
            "Delivery Date": selectedDate,
            "Add on product to": selectedBox.shopify_title
          }
        })
      }
    })

    // this is of the same structure as a fetched cart
    submitCart({ cart });
  }

  fetchCart(); // the first thing to happem

  if (window.location.search) {
    // we have a selected date coming for the collection - TODO check for cart or handle from the collection
    const d = new Date(parseInt(window.location.search.slice(1)));
    selectedDate = d.toDateString();
    editBoxActive = true;
    editBoxActiveComplete = true;
    fetchBox({ box: null, cart: null });
    // fails because element not yet rendered
    //handleEditBoxActive(); // run the algorithm to display edit options
  }

  for await ({productJson} of this) {
    yield (
      <div class="mt2 sans-serif" id="container-box">
        { fetchError && <Error msg={fetchError} /> }
        { !loading ? (
          <Fragment>
            { flashMessage && (
              <Flash>{ flashMessage }</Flash>
            )}
            { (fetchDates.length > 0) ? (
              <Fragment>
                { !selectedDate && (
                  <div class="warn fg-warn br2 w-100 ba pa1 mb2 tc">
                    <span class="f3 b pr1">&#33;</span>
                    Please choose a date for delivery
                  </div>
                )}

                <div class="relative">
                  <SelectMenu
                    id="selectDate"
                    menu={fetchDates.map(el => ({text: el, item: el}))}
                    title="Select Date"
                    active={menuSelectDate}
                  >
                    { selectedDate ? selectedDate : "Select delivery date" }&nbsp;&nbsp;&nbsp;&#9662;
                  </SelectMenu>
                </div>
              </Fragment>
            ) : (
              <div class="warn fg-warn br2 w-100 ba pa1 mb2 tc">
                <span class="f3 b pr1">&#33;</span>
                No boxes scheduled for delivery, please come back later.
              </div>
            )}

            { selectedBox && (

              <Fragment>

                { modalQtyForm && (
                  <QuantityForm includes={selectedIncludes} addons={selectedAddons} totalPrice={totalPrice} />
                )}

                <div class="ttu b pt2">Box Products</div>
                <div class="w-100 bb b--silver pv2 fl cf">
                  {selectedIncludes.map(el => 
                    <div
                      class="fl f6 ph3 ma1 ba br-pill b--streamside-blue bg-streamside-blue white"
                    >
                        {el.shopify_title} {(el.quantity > 1) ? `(${el.quantity}) ${getPrice(el, true)}` : ""}
                    </div>
                  )}
                  {selectedAddons.map(el => 
                    <div
                      class="fl f6 ph3 ma1 ba br-pill b--streamside-maroon bg-streamside-maroon white pointer"
                      name="selectedAddon"
                      data-item={el.shopify_id}
                      data-title={el.shopify_title}
                    >
                    {el.shopify_title} ({el.quantity}) {getPrice(el)} &#x2718;
                    </div>
                  )}
                </div>

                <div class="cf" />

                { selectedExcludes.length ? (
                  <div class="cf">
                    <div class="ttu b">
                      Excluded Products
                    </div>
                    <div class="fw1 f6 gray">
                      A suprise item will be substitued
                    </div>
                    <div class="w-100 bb b--silver pv2 fl">
                      {selectedExcludes.map(el =>
                        <div
                          class="fl f6 ph3 ma1 ba br-pill b--streamside-orange bg-streamside-orange white pointer"
                          name="selectedExclude"
                          data-item={el.shopify_id}
                          data-title={el.shopify_title}
                        >
                          {el.shopify_title} &#x2718;
                        </div>)}
                    </div>
                  </div>
                ) : ""}

                <div class="w-100 pv3 gray dt">
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

              </Fragment>
            )}

            { selectedBox && editBoxActive && (
              <div class={`${!editBoxActiveComplete && "absolute o-0" } w-100`} id="container-box-edit">
                <div>

                  { (selectedIncludes.length > 0) && (
                    <SelectMenu
                      id="removeItem"
                      menu={selectedIncludes.map(el => ({text: el.shopify_title, item: el.shopify_id}))}
                      title="Remove items from your box"
                      active={menuRemoveItem}
                    >
                      Select items you'd prefer not to receive&nbsp;&nbsp;&nbsp;&#9662;
                    </SelectMenu>
                  )}

                  { (possibleAddons.length > 0) && (
                    <SelectMenu
                      id="addItem"
                      menu={possibleAddons.map(el => ({text: el.shopify_title, item: el.shopify_id}))}
                      title="Add items to your box"
                      active={menuAddItem}
                    >
                      Select items you'd like to add to the box&nbsp;&nbsp;&nbsp;&#9662;
                    </SelectMenu>
                  )}

                </div>

                <div class="ttu b pt2">Available Products</div>
                <div class="bb b--silver pv2 fl">
                  {possibleAddons.map(el =>
                    <div
                      class="fl f6 ph3 ma1 ba br-pill b--streamside-maroon bg-streamside-maroon white"
                    >
                        {el.shopify_title} {getPrice(el)}
                    </div>)}
                </div>
                <div class="cf" />
              </div>
            )}

            { selectedDate && (
              <button
                type="submit"
                name="add"
                id="add-button"
                aria-label="Add to cart"
                class="f6 ttu w-100 tracked dim outline-0 debut-yellow b--debut-brown ba ba1 bg-debut-brown br2 pa2 mb1 pointer"
                data-add-to-cart=""
                onclick={makeCart}
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
            )}
          </Fragment>
        ) : <BarLoader />}

      </div>
    );
  };
}

export default ContainerBoxApp;
