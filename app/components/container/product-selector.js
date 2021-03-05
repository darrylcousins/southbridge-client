/** @jsx createElement */
/**
 * The box produst component used by container-box
 * Exported wrapped in animation wrapper
 *
 * @module app/components/container/dateSelector
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement, Fragment } from "@bikeshaving/crank/cjs";

import AnimationWrapper from "../animation-wrapper";
import getPrice from "../price";
import { moveProductEvent } from "../events";
import { selectorOpenEvent } from "../events";
import SelectMenu from "../select-menu";

/**
 * Box products display, shows included as well as excluded items and addons
 *
 * @yields {Element} DOM component
 */
function* ProductSelector({selectedIncludes, possibleAddons}) {

  /**
   * Display remove item selection menu if active
   *
   * @member removeItemOpen
   * @type {boolean}
   */
  let removeItemOpen = false;
  /**
   * Display add item selection menu if active
   *
   * @member addItemOpen
   * @type {boolean}
   */
  let addItemOpen = false;
  /**
   * Selector id for add item select menu
   *
   * @member addItemId
   * @type {string}
   */
  const addItemId = "addItem";
  /**
   * Selector id for remove item select menu
   *
   * @member removeItemId
   * @type {string}
   */
  const removeItemId = "removeItem";
  /**
   * Handle mouse up on selected components
   *
   * @function handleMouseUp
   * @param {object} ev The firing event
   * @listens click
   */
  const handleMouseUp = (ev) => {
    let id;
    if (ev.target.tagName === "BUTTON") {
      switch(ev.target.id) {
        case addItemId:
          this.dispatchEvent(selectorOpenEvent(addItemId));
          break;
        case removeItemId:
          this.dispatchEvent(selectorOpenEvent(removeItemId));
          break;
      }
    } else if (ev.target.tagName === "DIV") {
      switch(ev.target.getAttribute("name")) {
        case addItemId:
          this.dispatchEvent(selectorOpenEvent(null));
          id = ev.target.getAttribute("data-item");
          this.dispatchEvent(moveProductEvent(id, "possibleAddons", "selectedAddons"));
          break;
        case removeItemId:
          this.dispatchEvent(selectorOpenEvent(null));
          id = ev.target.getAttribute("data-item");
          this.dispatchEvent(moveProductEvent(id, "selectedIncludes", "selectedExcludes"));
          break;
        case "possibleAddons":
          id = ev.target.getAttribute("data-item");
          this.dispatchEvent(moveProductEvent(id, "possibleAddons", "selectedAddons"));
          break;
      }
    }
  };
  this.addEventListener("mouseup", handleMouseUp);
  /**
   * Handle selector open event, if matching selectorId the menu is open, else close
   *
   * @function handleSelectorOpen
   * @param {object} ev The firing event
   * @listens selectorOpenEvent
   */
  const handleSelectorOpen = (ev) => {
    if (addItemId === ev.detail.selector) {
      addItemOpen = !addItemOpen;
      removeItemOpen = false;
    } else if (removeItemId === ev.detail.selector) {
      removeItemOpen = !removeItemOpen;
      addItemOpen = false;
    } else {
      addItemOpen = false;
      removeItemOpen = false;
    }
    this.refresh();
  };
  this.addEventListener("selectorOpenEvent", handleSelectorOpen)

  for ({selectedIncludes, possibleAddons} of this) {
    yield (
      <div id="productSelector" class="absolute o-0">
        <div>

          { (selectedIncludes.length > 0) && (
            <SelectMenu
              id={removeItemId}
              menu={selectedIncludes.map(el => ({text: el.shopify_title, item: el.shopify_product_id}))}
              title="Remove items from your box"
              active={removeItemOpen}
            >
              Select items you'd prefer not to receive&nbsp;&nbsp;&nbsp;&#9662;
            </SelectMenu>
          )}

          { (possibleAddons.length > 0) && (
            <SelectMenu
              id={addItemId}
              menu={possibleAddons.map(el => ({text: el.shopify_title, item: el.shopify_product_id}))}
              title="Add items to your box"
              active={addItemOpen}
            >
              Select items you'd like to add to the box&nbsp;&nbsp;&nbsp;&#9662;
            </SelectMenu>
          )}

        </div>

        <div class="ttu b pt2">Available Products</div>
        <div class="bb b--silver pv2 fl">
          {possibleAddons.map(el =>
            <div
              class="pointer fl f6 ph3 ma1 ba br-pill b--streamside-maroon bg-streamside-maroon white"
              data-item={el.shopify_product_id}
              data-title={el.shopify_title}
              name="possibleAddons"
              title="Add into your box"
            >
                {el.shopify_title} {getPrice(el)}
            </div>)}
        </div>
      </div>
    )
  }
};

export default AnimationWrapper(ProductSelector);

