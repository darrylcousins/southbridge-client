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

/**
 * Box products display, shows included as well as excluded items and addons
 *
 * @yields {Element} DOM component
 */

function* BoxProducts({selectedIncludes, selectedAddons, selectedExcludes}) {

  /**
   * Handle mouse up on selected components
   *
   * @function handleMouseUp
   * @param {object} ev The firing event
   * @listens click
   */
  const handleMouseUp = (ev) => {
    let id;
    if (ev.target.tagName === "DIV") {
      switch(ev.target.getAttribute("name")) {
        case "selectedAddons":
          id = ev.target.getAttribute("data-item");
          this.dispatchEvent(moveProductEvent(id, "selectedAddons", "possibleAddons"));
          break;
        case "selectedExcludes":
          id = ev.target.getAttribute("data-item");
          this.dispatchEvent(moveProductEvent(id, "selectedExcludes", "selectedIncludes"));
          break;
      }
    }
  };
  this.addEventListener("mouseup", handleMouseUp);

  //for (const {selectedIncludes: newIncludes, selectedAddons: newAddons, selectedExcludes: newExcludes} of this) {
  for ({selectedIncludes, selectedAddons, selectedExcludes} of this) {
    yield (
      <div id="defaultBox" class="absolute o-0">
        <div class="ttu b pt2">Box Products</div>
        <div class="w-100 bb b--silver pv2 mb2 fl cf">
          { !selectedIncludes.length ? (
              <div>Build your own box with available products.</div>
          ) : (
           selectedIncludes.map(el => 
            <div
              class="fl f6 ph3 ma1 ba br-pill b--streamside-blue bg-streamside-blue white"
            >
                {el.shopify_title} {(el.quantity > 1) ? `(${el.quantity}) ${getPrice(el, true)}` : ""}
            </div>
          ))}
          {selectedAddons.map(el => 
            <div
              class="fl f6 ph3 ma1 ba br-pill b--streamside-maroon bg-streamside-maroon white pointer"
              name="selectedAddons"
              data-item={el.shopify_product_id}
              data-title={el.shopify_title}
              title="Remove from your box"
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
                  name="selectedExcludes"
                  data-item={el.shopify_product_id}
                  data-title={el.shopify_title}
                  title="Remove from your box"
                >
                  {el.shopify_title} &#x2718;
                </div>)}
            </div>
          </div>
        ) : ""}
      </div>
    )
  }
};


export default AnimationWrapper(BoxProducts);
