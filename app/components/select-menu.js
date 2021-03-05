/** @jsx createElement */
/**
 * Component
 *
 * @module app/product-description
 * @exports {Element} SelectDeliveryDate
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement, Fragment } from "@bikeshaving/crank/cjs";
import TextButton from "./text-button.js";

/**
 * Component
 *
 * @returns {Element} DOM component
 * <SelectMenu id="selectDate" menu={fetchDates} title="Select Date" active={menuSelectDate} />
 */
const SelectMenu = ({ id, active, title, menu, children }) => {
  const type = (id.startsWith("selectDate")) ? "ttu tracked" : "";
  return (
    <Fragment>
      <button
        class={`dib w-100 f6 ${type} outline-0 gray b--gray ba ba1 bg-transparent br2 pa2 mb1 pointer`}
        title={title}
        id={id}
        type="button"
        >
        { children }
      </button>
      { active && (
        <div class="absolute w-100 bg-white br2 z-max">
        {menu.map((el, idx, arr) => (
          <TextButton text={el.text} index={idx} array={arr} name={id} item={el.item} />
        ))}
        </div>
      )}
    </Fragment>
  )
};

export default SelectMenu;
