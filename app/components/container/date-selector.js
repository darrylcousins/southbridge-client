/** @jsx createElement */
/**
 * The date select component used by container-box
 *
 * @module app/components/container/dateSelector
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement, Fragment } from "@bikeshaving/crank/cjs";
import { selectDateEvent, selectorOpenEvent } from "../events";
import SelectMenu from "../select-menu";

/**
 * Date selector component
 *
 * @yields {Element} DOM component
 */
function* DateSelector({fetchDates, selectedDate}) {

  /**
   * Display date selection menu if active
   *
   * @member selectDateOpen
   * @type {boolean}
   */
  let selectDateOpen = false;
  /**
   * Selector id for select menu
   *
   * @member selectorId
   * @type {string}
   */
  const selectorId = "selectDate";
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
        case selectorId:
          this.dispatchEvent(selectorOpenEvent(selectorId));
          break;
      }
    } else if (ev.target.tagName === "DIV") {
      switch(ev.target.getAttribute("name")) {
        case selectorId:
          const date = ev.target.getAttribute("data-item");
          this.dispatchEvent(selectorOpenEvent(null));
          this.dispatchEvent(selectDateEvent(date));
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
    if (selectorId === ev.detail.selector) {
      selectDateOpen = !selectDateOpen;
    } else {
      selectDateOpen = false;
    }
    this.refresh();
  };
  this.addEventListener("selectorOpenEvent", handleSelectorOpen)

  for ({fetchDates, selectedDate} of this) {
    yield (
      <div id="dateSelector">
        { (fetchDates.length > 0) ? (
          <Fragment>
            { !selectedDate && (
              <div class="warn fg-warn br2 w-100 ba mb2 tc">
                <span class="f3 b pr1">&#33;</span>
                Please choose a date for delivery
              </div>
            )}

            <div class="relative">
              <SelectMenu
                id={selectorId}
                menu={fetchDates.map(el => ({text: el, item: el}))}
                title="Select Date"
                active={selectDateOpen}
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
      </div>
    )
  }
};

export default DateSelector;
