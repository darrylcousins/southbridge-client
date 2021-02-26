/** @jsx createElement */
/**
 * Form for editing quantities
 *
 * @module app/quantity-form
 * @exports {Element} QuantityForm
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement, Fragment } from "@bikeshaving/crank/cjs";

/**
 * Component to update quantities in box
 *
 * @returns {Element} DOM component
 */
const QuantityForm = ({ includes, addons }) => {
  const toPrice = (num) => `$${(num * 0.01).toFixed(2)}`;
  const getPrice = (el, includes) => toPrice(el.shopify_price * (includes ? el.quantity - 1 : el.quantity));

  const titleStyle = "pa2 ba outline-0 w-70 input-reset br2 bt bb bl br-0 br--left";
  const quantityStyle = "pa2 ba w-10 input-reset br2 ba br--left br--right";
  const priceStyle = "pa2 ba outline-0 w-20 input-reset br2 bt bb br bl-0 br--right";

  const TitleInput = ({ el }) => (
    <input
      class={titleStyle}
      type="text"
      readonly
      name="title"
      value={`${el.shopify_title} (${toPrice(el.shopify_price)})`}
    />
  );

  const QuantityInput = ({ el, id }) => (
    <input
      class={quantityStyle}
      type="number"
      steps="1"
      min="0"
      name="quantity"
      data-id={id}
      id={el.shopify_id}
      value={el.quantity}
      autocomplete="off"
    />
  );

  const PriceInput = ({ el, includes }) => (
    <input
      class={priceStyle}
      type="text"
      readonly
      name="title"
      value={getPrice(el, includes)}
    />
  );

  return (
    <div class="relative">
      <div class="absolute w-100 ba bg-near-white z-9999">
        <button
          class="bn outline-0 bg-transparent pa0 no-underline mid-gray dim o-70 absolute top-0 right-1"
          name="close"
          type="button"
          id="qtyFormClose"
          title="Close modal"
        >
          &#x2716;
          <span class="dn">Close modal</span>
        </button>
        <div class="pa2 bg-white">
          <p class="fw2 ttu tracked mt2 mb1 f7 tc">Included:</p>
          {includes.map(el => 
            <div class="mv1 center">
              <TitleInput el={el} />
              <QuantityInput el={el} id="includes" />
              <PriceInput el={el} includes={true} />
            </div>
          )}
          {(addons.length > 0) && (
            <Fragment>
              <p class="fw2 ttu tracked mt2 mb1 f7 tc">Extras:</p>
              {addons.map(el => 
                <div class="mv1 center">
                  <TitleInput el={el} />
                  <QuantityInput el={el} id="addons" />
                  <PriceInput el={el} includes={false} />
                </div>
              )}
            </Fragment>
          )}
          <div class="tr">
            <button
              class="f6 pv1 ph2 ma1 outline-0 bg-light-gray dark-gray b--gray ba br2 pointer"
              name="close"
              type="button"
              id="qtyFormClose"
              title="Close modal"
              >
                Close
              </button>
          </div>
        </div>
      </div>
    </div>
  )
};

export default QuantityForm;


