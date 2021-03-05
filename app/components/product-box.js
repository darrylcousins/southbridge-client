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

import AddToCartButton from "./add-button.js";
import TextButton from "./text-button.js";
import BarLoader from "./bar-loader.js";
import ProductDescription from "./product-description.js";
import QuantityForm from "./container/quantity-form.js";
import SelectMenu from "./select-menu";
import Flash from "./flash";
import IconCart from "./icon-cart";
import { Fetch } from "./fetch";
import { shallowEqual } from "../lib";

const hasOwnProp = Object.prototype.hasOwnProperty;
/**
 * BoxApp crank component
 *
 * @generator
 * @param {object} props The property object
 * @param {object} props.productJson Shopify product data as extracted from
 * product page json script tag
 * @yields {Element} A crank DOM component
 */
async function* ProductBoxApp({productJson}) {
  /**
   * If fetching data was unsuccessful.
   *
   * @member fetchError
   * @type {object|string|null}
   */
  let fetchError = null;
  /**
   * Contains box data as collected from api/current-boxes-for-box-product,
   * these are the boxes of which this product is either an included product or
   * possible add on.
   *
   * @member fetchJson
   * @type {object}
   */
  let fetchJson = {};
  /**
   * The box ids: Object.keys(fetchJson)
   *
   * @member fetchDates
   * @type {object}
   */
  let fetchBoxes = [];
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
   * If there is a cart and this is the container box
   *
   * @member cartBox
   * @type {object|null}
   */
  let cartBox = null;
  /**
  * This current product is included in the cart container box
   *
   * @member productInCart
   * @type {boolean}
   */
  let inCart = false;
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
   * The cart price??
   *
   * @member priceElement
   * @type {Element}
   */
  let totalPrice = productJson.variants[0].price;
  /**
   * Gather box includes for display, watch for dates, cart items and date
   * already selected from collection
   *
   * @function init
   */
  const init = async () => {
    console.log(productJson.id);
    await Fetch(
      `${baseUrl}current-boxes-for-box-product/${productJson.id}`
    ).then(async ({ error, json }) => {
      if (error) {
        fetchError = error;
      } else {
        if (Object.keys(json).length > 0) {
          fetchBoxes = Object.keys(json);
          fetchJson = json;
          const addOn = [];
          const included = [];
          Object.entries(fetchJson).forEach(([id, byDeliveryDate]) => {
            byDeliveryDate.forEach(box => {
              console.log(box);
              if (box.addOnProduct) {
              }
              if (box.includedProduct) {
              }
            });
          });
        }
      }
      // in both the following circumstances we should present entire edit box
      if (cartJson.items) {
        // find the selected date from the items
        for (const item of cartJson.items) {
          if (item.product_type === "Container Box") {
            // get the delivery date regardless of which box
            cartBox = item;
            cartBox.deliveryDate = item.properties["Delivery Date"];
            // group by applicable type
          }
          if (item.product_type === "Box Produce") {
            // these are included in the box as addons
            if (item.product_id === productJson.id) {
              // this product is in the cart
              inCart = true;
            }
          }
        }
      }

      loading = false;
      this.refresh();
    });
  };

  await init();  // set up script

  for await ({ productJson } of this) {
    yield (
      <div class="mt2 sans-serif center measure">
        { fetchError && <Error msg={fetchError} /> }
        { !loading ? (
          <Fragment>
            { cartBox && (
              <Fragment>
                <IconCart />
                <a href={cartBox.url}><img width="100" src={cartBox.image} alt={cartBox.product_title} /></a>
                <div>{cartBox.title} {cartBox.deliveryDate}</div>
                <div>{cartJson.total_price}</div>
                { fetchBoxes.map(el => (
                  <Fragment>
                    { fetchJson[el].map(box => (
                      <div>{box.shopify_title} {box.delivered}
                        <span>&nbsp;
                        { box.addOnProduct && "Add on product" }
                        { box.includedProduct && "Included product" }
                        </span>
                      </div>
                    ))}
                  </Fragment>
                ))}
              </Fragment>
            )}
            { !cartBox && (
              <Fragment>
                { Object.entries(fetchJson).map(([id, byDeliveryDate]) => (
                  <Fragment>
                    { byDeliveryDate.map(box => (
                      <div>{box.shopify_title} {box.delivered}
                        <span>&nbsp;
                        { box.addOnProduct && "Add on product" }
                        { box.includedProduct && "Included product" }
                        </span>
                      </div>
                    ))}
                  </Fragment>
                ))}
              </Fragment>
            )}
          </Fragment>
        ) : (
          <BarLoader />
        )}
      </div>
    )
  }
}

export default ProductBoxApp;
