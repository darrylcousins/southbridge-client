/** @jsx createElement */
/**
 * AnimationWrapper - present a component by sliding siblings out of the way
 * and fading in, and then the reverse when uumounted
 *
 * @module app/components/AnimationWrapper
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement, Fragment } from "@bikeshaving/crank/cjs";

/**
 * Wrap a crank Component and provide animation functionality
 *
 * @function AnimationWrapper
 * @returns {Function} Return the wrapped component
 * @param {object} Component The component to be wrapped
 * @param {object} options Options for form and modal
 */
function AnimationWrapper(Component) {

  /**
   * Wrap a crank Component and provide animation functionality
   *
   * @function Wrapper
   * @yields {Element} Return the wrapped component
   * @param {object} props Property object
   */
  return async function* (props) {

    const animationOptions = {
      duration: 600,
      easing: "ease-in-out",
      fill: "both"
    };

    const animateChildren = async (childs, targetHeight) => {
      let animation;
      let style;
      let matrix;
      let matrixMatch;
      let deltaY;
      let Y;
      childs.forEach(el => {
        style = window.getComputedStyle(el)
        matrix = style['transform'] || style.webkitTransform || style.mozTransform;
        matrixMatch = matrix.match(/matrix.*\((.+)\)/);
        Y = 0;
        if (matrixMatch) {
          Y = parseInt(matrixMatch[1].split(', ')[5], 10);
        }
        deltaY = targetHeight + Y;
        animation = el.animate({
          transformOrigin: "top left",
          transform: `translateY(${deltaY}px)`
        }, animationOptions);
      });
      return animation;
    };

    const getChildren = (target) => {
      const childs = [] // find all items that need to be animated out of the way
      // find next child as node
      //let nextChild = document.querySelector("#app").nextSibling;
      let nextChild = target.nextSibling;
      while (nextChild) {
        if (nextChild.nodeName !== "#text") childs.push(nextChild);
        nextChild = nextChild.nextSibling;
      }

      const wrapper = document.getElementById(`wrapper-${target.id}`);
      if (wrapper) {
        nextChild = wrapper.nextSibling;
        while (nextChild) {
          if (nextChild.nodeName !== "#text") childs.push(nextChild);
          nextChild = nextChild.nextSibling;
        }
      }
      const app = document.getElementById("app");
      if (app) {
        nextChild = app.nextSibling;
        while (nextChild) {
          if (nextChild.nodeName !== "#text") childs.push(nextChild);
          nextChild = nextChild.nextSibling;
        }
        target.style.width = `${app.clientWidth}px`;
      }
      const footer = document.getElementById("footer");
      if (footer) childs.push(footer);
      return childs;
    };

    const animateMount = async (show, targetId) => {
      // now the component is in the dom
      const target = document.getElementById(targetId);
      const childs = getChildren(target);

      const targetBox = target.getBoundingClientRect();

      // animate out of the way
      let targetHeight = parseInt(targetBox.height, 10);;
      target.setAttribute("data-height", targetBox.height);
      let animation;
      let deltaY;
      let style;
      let matrix;
      let matrixMatch;
      let Y;

      if (show) { // if not here we need to handle that as an error
        animation = await animateChildren(childs, targetHeight);
        animation.addEventListener("finish", () => {
          target.animate({
            opacity: 1
          }, animationOptions);
        });
      } else { // target has been removed from dom so move childs back to place
        animation = target.animate({
          opacity: 0
        }, animationOptions);
        // how to ensure only move these with active object??? props change??
        childs.forEach(el => {
          style = window.getComputedStyle(el)
          matrix = style['transform'] || style.webkitTransform || style.mozTransform;
          matrixMatch = matrix.match(/matrix.*\((.+)\)/);
          Y = 0;
          if (matrixMatch) {
            Y = parseInt(matrixMatch[1].split(', ')[5], 10);
          }
          deltaY = Y - targetHeight;
          animation = el.animate({
            transformOrigin: "top left",
            transform: Y ? `translateY(${deltaY}px)` : "none"
          }, animationOptions);
        });
      };
    };

    let currentActive = props.isActive;

    for await (const props of this) {
      this.schedule(async () => {
        // has the refresh changed size of the wrapped component??
        const div = document.getElementById(props.componentId);
        if (div) {
          const dataHeight = div.getAttribute("data-height");
          let oldHeight;
          if (dataHeight) oldHeight = parseInt(dataHeight, 10);
          const currentHeight = div.getBoundingClientRect().height;
          if (dataHeight && oldHeight !== currentHeight && props.isActive) {
            div.setAttribute("data-height", currentHeight);
            const childs = getChildren(div);
            let targetHeight = currentHeight - oldHeight;
            if (props.componentId === "productSelector") targetHeight += 30; // margins ??
            await animateChildren(childs, targetHeight);
          }
        }
      });
      yield (
        <div id={`wrapper-${props.componentId}`}>
          <Component
            {...props}
          />
        </div>
      );

      function awaitRender() {
        if(!document.getElementById(props.componentId)) {
          setTimeout(awaitRender, 100);
        } else {
          // wait another fraction to avoid flicker
          setTimeout(() => animateMount(props.isActive, props.componentId), 100);
        }
      }
      if (currentActive !== props.isActive) {  // only open on first round if true
        // only make animation if changing view
        awaitRender();
      }
      currentActive = props.isActive;
    }
  };
}

export default AnimationWrapper;
