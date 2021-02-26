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
import QuantityForm from "./quantity-form.js";
import SelectMenu from "./select-menu";
import Flash from "./flash";
import IconCart from "./icon-cart";
import { Fetch } from "./fetch";
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
function* ProductBoxApp({productJson}) {
  /**
   * If fetching data was unsuccessful.
   *
   * @member fetchError
   * @type {object|string|null}
   */
  let fetchError = null;
  /**
   * If there is a cart and this is the container box
   *
   * @member cartJson
   * @type {object|null}
   */
  let cartJson = null;
  /**
   * If there is a cart and these are the addon items
   *
   * @member cartAddons
   * @type {array}
   */
  let cartAddons = null;
  /**
   * If there is a cart and this is the container box
   *
   * @member cartBox
   * @type {object|null}
   */
  let cartBox = null;
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
  let flashMessage = "";
  /**
   * The total price TODO here in development udating on refresh - production
   * may actuall use priceElement as above
   *
   * @member priceElement
   * @type {Element}
   */
  let totalPrice = productJson.variants[0].price;

  /**
   * Uses fetch to collect current cart for the session 
   *
   * @function fetchCart
   */
  const fetchCart = async () => {
    const {error, json} = await Fetch("/cart.js");
    if (error) {
      fetchError = error;
      this.refresh();
    } else {
      if (!json.items) {
        fetchError = "Failed to load cart data";
        this.refresh();
        return;
      }
      console.log(json);
      cartJson = json;
      cartBox = json.items.find(el => el.product_type === "Container Box");
      cartAddons = json.items.filter(el => el.product_type === "Box Produce");
      console.log(cartBox);
      // Can we match this product to a cart item?
      const match = json.items.find(el => {
        return productJson.variants.find(variant => {
          return variant.id === parseInt(el.variant_id);
        });
      });
      if (typeof match === "undefined") {
        // no we don't
        console.log('no');
      } else {
        console.log('yes');
        // use fetch to get container box data and disply image etc - can't do
        // so here without providing api authentication but probably can when
        // within the site itself, including credentials. So settle for the
        // moment with providing title and whatever else we can glean from the
        // cart data.
        // so what to do now 1. show thus, 2. give the option to add to box?
      }
      loading = false;
      this.refresh();
    }
  };

  fetchCart();

  while(true) {
    yield (
      <div class="mt2 sans-serif center measure">
        { fetchError && <Error msg={fetchError} /> }
        { !loading ? (
          <Fragment>
            { flashMessage && (
              <Flash>{ flashMessage }</Flash>
            )}
            { cartBox && (
              <Fragment>
                <IconCart />
                <div>{cartBox.title} {cartBox.properties["Delivery Date"]}</div>
                <div>{cartJson.total_price}</div>
                <div>
                  {cartAddons.map(el => (
                    <div>{el.title} {el.quantity} {el.properties["Delivery Date"]}</div>
                  ))}
                </div>
              </Fragment>
            )}
          </Fragment>
        ) : (
          <div>Here?</div>
        )}
      </div>
    )
  }
}

export default ProductBoxApp;
