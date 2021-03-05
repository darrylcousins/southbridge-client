
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

export default getPrice;
