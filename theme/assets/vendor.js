(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    var val = aliases[name];
    return (val && name !== val) ? expandAlias(val) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = typeof window === 'undefined' ? this : window;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};

require.register("@bikeshaving/crank/cjs/crank.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "@bikeshaving/crank");
  (function() {
    'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const NOOP = () => { };
function wrap(value) {
    return value === undefined ? [] : Array.isArray(value) ? value : [value];
}
function unwrap(arr) {
    return arr.length === 0 ? undefined : arr.length === 1 ? arr[0] : arr;
}
/**
 * Ensures a value is an array.
 *
 * This function does the same thing as wrap() above except it handles nulls
 * and iterables, so it is appropriate for wrapping user-provided children.
 */
function arrayify(value) {
    return value == null
        ? []
        : Array.isArray(value)
            ? value
            : typeof value === "string" ||
                typeof value[Symbol.iterator] !== "function"
                ? [value]
                : [...value];
}
function isIteratorLike(value) {
    return value != null && typeof value.next === "function";
}
function isPromiseLike(value) {
    return value != null && typeof value.then === "function";
}
/***
 * SPECIAL TAGS
 *
 * Crank provides a couple tags which have special meaning for the renderer.
 ***/
/**
 * A special tag for grouping multiple children within the same parent.
 *
 * All non-string iterables which appear in the element tree are implicitly
 * wrapped in a fragment element.
 *
 * This tag is just the empty string, and you can use the empty string in
 * createElement calls or transpiler options to avoid having to reference this
 * export directly.
 */
const Fragment = "";
// TODO: We assert the following symbol tags as any because typescript support
// for symbol tags in JSX doesn’t exist yet.
// https://github.com/microsoft/TypeScript/issues/38367
/**
 * A special tag for rendering into a root node passed via a root prop.
 *
 * This tag is useful for creating element trees with multiple roots, for
 * things like modals or tooltips.
 *
 * Renderer.prototype.render will implicitly wrap passed in element trees in an
 * implicit Portal element.
 */
const Portal = Symbol.for("crank.Portal");
/**
 * A special tag which preserves whatever was previously rendered in the
 * element’s position.
 *
 * Copy elements are useful for when you want to prevent a subtree from
 * rerendering as a performance optimization. Copy elements can also be keyed,
 * in which case the previously rendered keyed element will be preserved.
 */
const Copy = Symbol.for("crank.Copy");
/**
 * A special tag for injecting raw nodes or strings via a value prop.
 *
 * If the value prop is a string, Renderer.prototype.parse() will be called on
 * the string and the result of that method will be inserted.
 */
const Raw = Symbol.for("crank.Raw");
const ElementSymbol = Symbol.for("crank.Element");
/*** ELEMENT FLAGS ***/
/**
 * A flag which is set when the element is mounted, used to detect whether an
 * element is being reused so that we clone it rather than accidentally
 * overwriting its state.
 *
 * IMPORTANT: Changing this flag value would likely be a breaking changes in terms
 * of interop between elements created by different versions of Crank.
 */
const IsInUse = 1 << 0;
/**
 * A flag which tracks whether the element has previously rendered children,
 * used to clear elements which no longer render children in the next render.
 * We may deprecate this and make elements without explicit children
 * uncontrolled.
 */
const HadChildren = 1 << 1;
// To save on filesize, we mangle the internal properties of Crank classes by
// hand. These internal properties are prefixed with an underscore. Refer to
// their definitions to see their unabbreviated names.
/**
 * Elements are the basic building blocks of Crank applications. They are
 * JavaScript objects which are interpreted by special classes called renderers
 * to produce and manage stateful nodes.
 *
 * @template {Tag} [TTag=Tag] - The type of the tag of the element.
 *
 * @example
 * // specific element types
 * let div: Element<"div">;
 * let portal: Element<Portal>;
 * let myEl: Element<MyComponent>;
 *
 * // general element types
 * let host: Element<string | symbol>;
 * let component: Element<Component>;
 *
 * Typically, you use a helper function like createElement to create elements
 * rather than instatiating this class directly.
 */
class Element {
    constructor(tag, props, key, ref) {
        this._f = 0;
        this.tag = tag;
        this.props = props;
        this.key = key;
        this.ref = ref;
        this._ch = undefined;
        this._n = undefined;
        this._fb = undefined;
        this._ic = undefined;
        this._ov = undefined;
    }
    get hadChildren() {
        return (this._f & HadChildren) !== 0;
    }
}
Element.prototype.$$typeof = ElementSymbol;
function isElement(value) {
    return value != null && value.$$typeof === ElementSymbol;
}
/**
 * Creates an element with the specified tag, props and children.
 *
 * This function is usually used as a transpilation target for JSX transpilers,
 * but it can also be called directly. It additionally extracts the crank-key
 * and crank-ref props so they aren’t accessible to renderer methods or
 * components, and assigns the children prop according to any additional
 * arguments passed to the function.
 */
function createElement(tag, props, ...children) {
    let key;
    let ref;
    const props1 = {};
    if (props != null) {
        for (const name in props) {
            switch (name) {
                case "crank-key":
                    // We have to make sure we don’t assign null to the key because we
                    // don’t check for null keys in the diffing functions.
                    if (props["crank-key"] != null) {
                        key = props["crank-key"];
                    }
                    break;
                case "crank-ref":
                    if (typeof props["crank-ref"] === "function") {
                        ref = props["crank-ref"];
                    }
                    break;
                default:
                    props1[name] = props[name];
            }
        }
    }
    if (children.length > 1) {
        props1.children = children;
    }
    else if (children.length === 1) {
        props1.children = children[0];
    }
    return new Element(tag, props1, key, ref);
}
/**
 * Clones a given element, shallowly copying the props object.
 *
 * Used internally to make sure we don’t accidentally reuse elements when
 * rendering.
 */
function cloneElement(el) {
    if (!isElement(el)) {
        throw new TypeError("Cannot clone non-element");
    }
    return new Element(el.tag, { ...el.props }, el.key, el.ref);
}
function narrow(value) {
    if (typeof value === "boolean" || value == null) {
        return undefined;
    }
    else if (typeof value === "string" || isElement(value)) {
        return value;
    }
    else if (typeof value[Symbol.iterator] === "function") {
        return createElement(Fragment, null, value);
    }
    return value.toString();
}
/**
 * Takes an array of element values and normalizes the output as an array of
 * nodes and strings.
 *
 * @returns Normalized array of nodes and/or strings.
 *
 * Normalize will flatten only one level of nested arrays, because it is
 * designed to be called once at each level of the tree. It will also
 * concatenate adjacent strings and remove all undefined values.
 */
function normalize(values) {
    const result = [];
    let buffer;
    for (let i = 0; i < values.length; i++) {
        const value = values[i];
        if (!value) ;
        else if (typeof value === "string") {
            buffer = (buffer || "") + value;
        }
        else if (!Array.isArray(value)) {
            if (buffer) {
                result.push(buffer);
                buffer = undefined;
            }
            result.push(value);
        }
        else {
            // We could use recursion here but it’s just easier to do it inline.
            for (let j = 0; j < value.length; j++) {
                const value1 = value[j];
                if (!value1) ;
                else if (typeof value1 === "string") {
                    buffer = (buffer || "") + value1;
                }
                else {
                    if (buffer) {
                        result.push(buffer);
                        buffer = undefined;
                    }
                    result.push(value1);
                }
            }
        }
    }
    if (buffer) {
        result.push(buffer);
    }
    return result;
}
/**
 * Finds the value of the element according to its type.
 * @returns The value of the element.
 */
function getValue(el) {
    if (typeof el._fb !== "undefined") {
        return typeof el._fb === "object" ? getValue(el._fb) : el._fb;
    }
    else if (el.tag === Portal) {
        return undefined;
    }
    else if (typeof el.tag !== "function" && el.tag !== Fragment) {
        return el._n;
    }
    return unwrap(getChildValues(el));
}
function getInflightValue(el) {
    return ((typeof el.tag === "function" && el._n._iv) || el._ic || getValue(el));
}
/**
 * Walks an element’s children to find its child values.
 *
 * @returns A normalized array of nodes and strings.
 */
function getChildValues(el) {
    const values = [];
    const children = wrap(el._ch);
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child) {
            values.push(typeof child === "string" ? child : getValue(child));
        }
    }
    return normalize(values);
}
/**
 * An abstract class which is subclassed to render to different target
 * environments. This class is responsible for kicking off the rendering
 * process, caching previous trees by root, and creating, mutating and
 * disposing of nodes.
 *
 * @template TNode - The type of the node for a rendering environment.
 * @template TScope - Data which is passed down the tree.
 * @template TRoot - The type of the root for a rendering environment.
 * @template TResult - The type of exposed values.
 */
class Renderer {
    constructor() {
        this._cache = new WeakMap();
    }
    /**
     * Renders an element tree into a specific root.
     *
     * @param children - An element tree. You can render null with a previously
     * used root to delete the previously rendered element tree from the cache.
     * @param root - The node to be rendered into. The renderer will cache
     * element trees per root.
     * @param ctx - An optional context that will be the ancestor context of all
     * elements in the tree. Useful for connecting renderers which call each
     * other so that events/provisions properly propagate. The context for a
     * given root must be the same or an error will be thrown.
     *
     * @returns The result of rendering the children, or a possible promise of
     * the result if the element tree renders asynchronously.
     */
    render(children, root, ctx) {
        let portal;
        if (typeof root === "object" && root !== null) {
            portal = this._cache.get(root);
        }
        if (portal === undefined) {
            portal = createElement(Portal, { children, root });
            portal._n = ctx;
            if (typeof root === "object" && root !== null && children != null) {
                this._cache.set(root, portal);
            }
        }
        else {
            if (portal._n !== ctx) {
                throw new Error("Context mismatch");
            }
            portal.props = { children, root };
            if (typeof root === "object" && root !== null && children == null) {
                this._cache.delete(root);
            }
        }
        const value = update(this, root, portal, ctx, undefined, portal);
        // We return the child values of the portal because portal elements
        // themselves have no readable value.
        if (isPromiseLike(value)) {
            return value.then(() => {
                const result = this.read(unwrap(getChildValues(portal)));
                if (root == null) {
                    unmount(this, portal, undefined, portal);
                }
                return result;
            });
        }
        const result = this.read(unwrap(getChildValues(portal)));
        if (root == null) {
            unmount(this, portal, undefined, portal);
        }
        return result;
    }
    /**
     * Called when an element’s value is exposed via render, schedule, refresh,
     * refs, or generator yield expressions.
     *
     * @param value - The value of the element being read. Can be a node, a
     * string, undefined, or an array of nodes and strings, depending on the
     * element.
     *
     * @returns Varies according to the specific renderer subclass. By default,
     * it exposes the element’s value.
     *
     * This is useful for renderers which don’t want to expose their internal
     * nodes. For instance, the HTML renderer will convert all internal nodes to
     * strings.
     *
     */
    read(value) {
        return value;
    }
    /**
     * Called in a preorder traversal for each host element.
     *
     * Useful for passing data down the element tree. For instance, the DOM
     * renderer uses this method to keep track of whether we’re in an SVG
     * subtree.
     *
     * @param el - The host element.
     * @param scope - The current scope.
     *
     * @returns The scope to be passed to create and scope for child host
     * elements.
     *
     * This method sets the scope for child host elements, not the current host
     * element.
     */
    scope(_el, scope) {
        return scope;
    }
    /**
     * Called for each string in an element tree.
     *
     * @param text - The string child.
     * @param scope - The current scope.
     *
     * @returns The escaped string.
     *
     * Rather than returning text nodes for whatever environment we’re rendering
     * to, we defer that step for Renderer.prototype.arrange. We do this so that
     * adjacent strings can be concatenated and the actual element tree can be
     * rendered in a normalized form.
     */
    escape(text, _scope) {
        return text;
    }
    /**
     * Called for each Raw element whose value prop is a string.
     *
     * @param text - The string child.
     * @param scope - The current scope.
     *
     * @returns The parsed node or string.
     */
    parse(text, _scope) {
        return text;
    }
    /**
     * Called for each host element when it is committed for the first time.
     *
     * @param el - The host element.
     * @param scope - The current scope.
     *
     * @returns A “node” which determines the value of the host element.
     */
    create(_el, _scope) {
        throw new Error("Not implemented");
    }
    /**
     * Called for each host element when it is committed.
     *
     * @param el - The host element.
     * @param node - The node associated with the host element.
     *
     * @returns The return value is ignored.
     *
     * Used to mutate the node associated with an element when new props are
     * passed.
     */
    patch(_el, _node) {
        return;
    }
    // TODO: pass hints into arrange about where the dirty children start and end
    /**
     * Called for each host element so that elements can be arranged into a tree.
     *
     * @param el - The host element.
     * @param node - The node associated with the host element.
     * @param children - An array of nodes and strings from child elements.
     *
     * @returns The return value is ignored.
     *
     * This method is also called by child components contexts as the last step
     * of a refresh.
     */
    arrange(_el, _node, _children) {
        return;
    }
    // TODO: remove(): a method which is called to remove a child from a parent
    // to optimize arrange
    /**
     * Called for each host element when it is unmounted.
     *
     * @param el - The host element.
     * @param node - The node associated with the host element.
     *
     * @returns The return value is ignored.
     */
    dispose(_el, _node) {
        return;
    }
    /**
     * Called at the end of the rendering process for each root of the tree.
     *
     * @param root - The root prop passed to portals or the render method.
     *
     * @returns The return value is ignored.
     */
    complete(_root) {
        return;
    }
}
/*** PRIVATE RENDERER FUNCTIONS ***/
function mount(renderer, root, host, ctx, scope, el) {
    el._f |= IsInUse;
    if (typeof el.tag === "function") {
        el._n = new Context(renderer, root, host, ctx, scope, el);
        return updateCtx(el._n);
    }
    else if (el.tag === Raw) {
        return commit(renderer, scope, el, []);
    }
    else if (el.tag !== Fragment) {
        if (el.tag === Portal) {
            root = el.props.root;
        }
        else {
            el._n = renderer.create(el, scope);
            renderer.patch(el, el._n);
        }
        host = el;
        scope = renderer.scope(host, scope);
    }
    return updateChildren(renderer, root, host, ctx, scope, el, el.props.children);
}
function update(renderer, root, host, ctx, scope, el) {
    if (typeof el.tag === "function") {
        return updateCtx(el._n);
    }
    else if (el.tag === Raw) {
        return commit(renderer, scope, el, []);
    }
    else if (el.tag !== Fragment) {
        if (el.tag === Portal) {
            root = el.props.root;
        }
        else {
            renderer.patch(el, el._n);
        }
        host = el;
        scope = renderer.scope(host, scope);
    }
    return updateChildren(renderer, root, host, ctx, scope, el, el.props.children);
}
function createChildrenByKey(children) {
    const childrenByKey = new Map();
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (typeof child === "object" && typeof child.key !== "undefined") {
            childrenByKey.set(child.key, child);
        }
    }
    return childrenByKey;
}
function updateChildren(renderer, root, host, ctx, scope, el, children) {
    const oldChildren = wrap(el._ch);
    const newChildren = arrayify(children);
    const newChildren1 = [];
    const values = [];
    let graveyard;
    let seenKeys;
    let childrenByKey;
    let isAsync = false;
    let i = 0;
    for (let j = 0, il = oldChildren.length, jl = newChildren.length; j < jl; j++) {
        let oldChild = i >= il ? undefined : oldChildren[i];
        let newChild = narrow(newChildren[j]);
        // ALIGNMENT
        let oldKey = typeof oldChild === "object" ? oldChild.key : undefined;
        let newKey = typeof newChild === "object" ? newChild.key : undefined;
        if (newKey !== undefined && seenKeys && seenKeys.has(newKey)) {
            console.error("Duplicate key", newKey);
            newKey = undefined;
        }
        if (oldKey === newKey) {
            if (childrenByKey !== undefined && newKey !== undefined) {
                childrenByKey.delete(newKey);
            }
            i++;
        }
        else {
            if (!childrenByKey) {
                childrenByKey = createChildrenByKey(oldChildren.slice(i));
            }
            if (newKey === undefined) {
                while (oldChild !== undefined && oldKey !== undefined) {
                    i++;
                    oldChild = oldChildren[i];
                    oldKey = typeof oldChild === "object" ? oldChild.key : undefined;
                }
                i++;
            }
            else {
                oldChild = childrenByKey.get(newKey);
                if (oldChild !== undefined) {
                    childrenByKey.delete(newKey);
                }
                if (!seenKeys) {
                    seenKeys = new Set();
                }
                seenKeys.add(newKey);
            }
        }
        // UPDATING
        let value;
        if (typeof oldChild === "object" &&
            typeof newChild === "object" &&
            oldChild.tag === newChild.tag) {
            if (oldChild.tag === Portal &&
                oldChild.props.root !== newChild.props.root) {
                renderer.arrange(oldChild, oldChild.props.root, []);
                renderer.complete(oldChild.props.root);
            }
            // TODO: implement Raw element parse caching
            if (oldChild !== newChild) {
                oldChild.props = newChild.props;
                oldChild.ref = newChild.ref;
                newChild = oldChild;
            }
            value = update(renderer, root, host, ctx, scope, newChild);
        }
        else if (typeof newChild === "object") {
            if (newChild.tag === Copy) {
                value =
                    typeof oldChild === "object"
                        ? getInflightValue(oldChild)
                        : oldChild;
                if (typeof newChild.ref === "function") {
                    if (isPromiseLike(value)) {
                        value.then(newChild.ref).catch(NOOP);
                    }
                    else {
                        newChild.ref(value);
                    }
                }
                newChild = oldChild;
            }
            else {
                if (newChild._f & IsInUse) {
                    newChild = cloneElement(newChild);
                }
                value = mount(renderer, root, host, ctx, scope, newChild);
                if (isPromiseLike(value)) {
                    newChild._fb = oldChild;
                }
            }
        }
        else if (typeof newChild === "string") {
            newChild = value = renderer.escape(newChild, scope);
        }
        newChildren1[j] = newChild;
        values[j] = value;
        isAsync = isAsync || isPromiseLike(value);
        if (typeof oldChild === "object" && oldChild !== newChild) {
            if (!graveyard) {
                graveyard = [];
            }
            graveyard.push(oldChild);
        }
    }
    el._ch = unwrap(newChildren1);
    // cleanup
    for (; i < oldChildren.length; i++) {
        const oldChild = oldChildren[i];
        if (typeof oldChild === "object" && typeof oldChild.key === "undefined") {
            if (!graveyard) {
                graveyard = [];
            }
            graveyard.push(oldChild);
        }
    }
    if (childrenByKey !== undefined && childrenByKey.size > 0) {
        if (!graveyard) {
            graveyard = [];
        }
        graveyard.push(...childrenByKey.values());
    }
    if (isAsync) {
        let values1 = Promise.all(values).finally(() => {
            if (graveyard) {
                for (let i = 0; i < graveyard.length; i++) {
                    unmount(renderer, host, ctx, graveyard[i]);
                }
            }
        });
        let onvalues;
        values1 = Promise.race([
            values1,
            new Promise((resolve) => (onvalues = resolve)),
        ]);
        if (el._ov) {
            el._ov(values1);
        }
        el._ic = values1.then((values) => commit(renderer, scope, el, normalize(values)));
        el._ov = onvalues;
        return el._ic;
    }
    if (graveyard) {
        for (let i = 0; i < graveyard.length; i++) {
            unmount(renderer, host, ctx, graveyard[i]);
        }
    }
    if (el._ov) {
        el._ov(values);
        el._ov = undefined;
    }
    return commit(renderer, scope, el, normalize(values));
}
function commit(renderer, scope, el, values) {
    if (el._ic) {
        el._ic = undefined;
    }
    if (el._fb) {
        el._fb = undefined;
    }
    let value;
    if (typeof el.tag === "function") {
        value = commitCtx(el._n, values);
    }
    else if (el.tag === Raw) {
        if (typeof el.props.value === "string") {
            el._n = renderer.parse(el.props.value, scope);
        }
        else {
            el._n = el.props.value;
        }
        value = el._n;
    }
    else if (el.tag === Fragment) {
        value = unwrap(values);
    }
    else {
        if (el.tag === Portal) {
            renderer.arrange(el, el.props.root, values);
            renderer.complete(el.props.root);
        }
        else {
            renderer.arrange(el, el._n, values);
        }
        value = el._n;
        if (values.length) {
            el._f |= HadChildren;
        }
        else {
            el._f &= ~HadChildren;
        }
    }
    if (el.ref) {
        el.ref(renderer.read(value));
    }
    return value;
}
function unmount(renderer, host, ctx, el) {
    if (typeof el.tag === "function") {
        unmountCtx(el._n);
        ctx = el._n;
    }
    else if (el.tag === Portal) {
        host = el;
        renderer.arrange(host, host.props.root, []);
        renderer.complete(host.props.root);
    }
    else if (el.tag !== Fragment) {
        if (isEventTarget(el._n)) {
            const listeners = getListeners(ctx, host);
            for (let i = 0; i < listeners.length; i++) {
                const record = listeners[i];
                el._n.removeEventListener(record.type, record.callback, record.options);
            }
        }
        host = el;
        renderer.dispose(host, host._n);
    }
    const children = wrap(el._ch);
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (typeof child === "object") {
            unmount(renderer, host, ctx, child);
        }
    }
}
/*** CONTEXT FLAGS ***/
/**
 * A flag which is set when the component is being updated by the parent and
 * cleared when the component has committed. Used to determine whether the
 * nearest host ancestor needs to be rearranged.
 */
const IsUpdating = 1 << 0;
/**
 * A flag which is set when the component function or generator is
 * synchronously executing. This flags is used to ensure that a component which
 * triggers a second update in the course of rendering does not cause an stack
 * overflow or a generator error.
 */
const IsExecuting = 1 << 1;
/**
 * A flag used to make sure multiple values are not pulled from context prop
 * iterators without a yield.
 */
const IsIterating = 1 << 2;
/**
 * A flag used by async generator components in conjunction with the
 * onavailable (_oa) callback to mark whether new props can be pulled via the
 * context async iterator. See the Symbol.asyncIterator method and the
 * resumeCtx function.
 */
const IsAvailable = 1 << 3;
/**
 * A flag which is set when a generator components returns, i.e. the done
 * property on the generator is set to true or throws. Done components will
 * stick to their last rendered value and ignore further updates.
 */
const IsDone = 1 << 4;
/**
 * A flag which is set when the component is unmounted. Unmounted components
 * are no longer in the element tree and cannot refresh or rerender.
 */
const IsUnmounted = 1 << 5;
/**
 * A flag which indicates that the component is a sync generator component.
 */
const IsSyncGen = 1 << 6;
/**
 * A flag which indicates that the component is an async generator component.
 */
const IsAsyncGen = 1 << 7;
const provisionMaps = new WeakMap();
const scheduleMap = new WeakMap();
const cleanupMap = new WeakMap();
/**
 * A class which is instantiated and passed to every component as its this
 * value. Contexts form a tree just like elements and all components in the
 * element tree are connected via contexts. Components can use this tree to
 * communicate data upwards via events and downwards via provisions.
 *
 * @template [TProps=*] - The expected shape of the props passed to the
 * component. Used to strongly type the Context iterator methods.
 * @template [TResult=*] - The readable element value type. It is used in
 * places such as the return value of refresh and the argument passed to
 * schedule and cleanup callbacks.
 */
class Context {
    /**
     * @internal
     * Contexts should never be instantiated directly.
     */
    constructor(renderer, root, host, parent, scope, el) {
        this._f = 0;
        this._re = renderer;
        this._rt = root;
        this._ho = host;
        this._pa = parent;
        this._sc = scope;
        this._el = el;
        this._it = undefined;
        this._oa = undefined;
        this._ib = undefined;
        this._iv = undefined;
        this._eb = undefined;
        this._ev = undefined;
    }
    /**
     * The current props of the associated element.
     *
     * Typically, you should read props either via the first parameter of the
     * component or via the context iterator methods. This property is mainly for
     * plugins or utilities which wrap contexts.
     */
    get props() {
        return this._el.props;
    }
    /**
     * The current value of the associated element.
     *
     * Typically, you should read values via refs, generator yield expressions,
     * or the refresh, schedule or cleanup methods. This property is mainly for
     * plugins or utilities which wrap contexts.
     */
    get value() {
        return this._re.read(getValue(this._el));
    }
    *[Symbol.iterator]() {
        while (!(this._f & IsDone)) {
            if (this._f & IsIterating) {
                throw new Error("Context iterated twice without a yield");
            }
            else if (this._f & IsAsyncGen) {
                throw new Error("Use for await…of in async generator components");
            }
            this._f |= IsIterating;
            yield this._el.props;
        }
    }
    async *[Symbol.asyncIterator]() {
        // We use a do while loop rather than a while loop to handle an edge case
        // where an async generator component is unmounted synchronously.
        do {
            if (this._f & IsIterating) {
                throw new Error("Context iterated twice without a yield");
            }
            else if (this._f & IsSyncGen) {
                throw new Error("Use for…of in sync generator components");
            }
            this._f |= IsIterating;
            if (this._f & IsAvailable) {
                this._f &= ~IsAvailable;
            }
            else {
                await new Promise((resolve) => (this._oa = resolve));
                if (this._f & IsDone) {
                    break;
                }
            }
            yield this._el.props;
        } while (!(this._f & IsDone));
    }
    /**
     * Re-executes a component.
     *
     * @returns The rendered value of the component or a promise thereof if the
     * component or its children execute asynchronously.
     *
     * The refresh method works a little differently for async generator
     * components, in that it will resume the Context’s props async iterator
     * rather than resuming execution. This is because async generator components
     * are perpetually resumed independent of updates, and rely on the props
     * async iterator to suspend.
     */
    refresh() {
        if (this._f & IsUnmounted) {
            console.error("Component is unmounted");
            return this._re.read(undefined);
        }
        else if (this._f & IsExecuting) {
            console.error("Component is already executing");
            return this._re.read(undefined);
        }
        resumeCtx(this);
        return this._re.read(runCtx(this));
    }
    /**
     * Registers a callback which fires when the component commits. Will only
     * fire once per callback and update.
     */
    schedule(callback) {
        let callbacks = scheduleMap.get(this);
        if (!callbacks) {
            callbacks = new Set();
            scheduleMap.set(this, callbacks);
        }
        callbacks.add(callback);
    }
    /**
     * Registers a callback which fires when the component unmounts. Will only
     * fire once per callback.
     */
    cleanup(callback) {
        let callbacks = cleanupMap.get(this);
        if (!callbacks) {
            callbacks = new Set();
            cleanupMap.set(this, callbacks);
        }
        callbacks.add(callback);
    }
    consume(key) {
        for (let parent = this._pa; parent !== undefined; parent = parent._pa) {
            const provisions = provisionMaps.get(parent);
            if (provisions && provisions.has(key)) {
                return provisions.get(key);
            }
        }
    }
    provide(key, value) {
        let provisions = provisionMaps.get(this);
        if (!provisions) {
            provisions = new Map();
            provisionMaps.set(this, provisions);
        }
        provisions.set(key, value);
    }
    addEventListener(type, listener, options) {
        let listeners;
        if (listener == null) {
            return;
        }
        else {
            const listeners1 = listenersMap.get(this);
            if (listeners1) {
                listeners = listeners1;
            }
            else {
                listeners = [];
                listenersMap.set(this, listeners);
            }
        }
        options = normalizeOptions(options);
        let callback;
        if (typeof listener === "object") {
            callback = () => listener.handleEvent.apply(listener, arguments);
        }
        else {
            callback = listener;
        }
        const record = { type, callback, listener, options };
        if (options.once) {
            record.callback = function () {
                const i = listeners.indexOf(record);
                if (i !== -1) {
                    listeners.splice(i, 1);
                }
                return callback.apply(this, arguments);
            };
        }
        if (listeners.some((record1) => record.type === record1.type &&
            record.listener === record1.listener &&
            !record.options.capture === !record1.options.capture)) {
            return;
        }
        listeners.push(record);
        for (const value of getChildValues(this._el)) {
            if (isEventTarget(value)) {
                value.addEventListener(record.type, record.callback, record.options);
            }
        }
    }
    removeEventListener(type, listener, options) {
        const listeners = listenersMap.get(this);
        if (listener == null || listeners == null) {
            return;
        }
        const options1 = normalizeOptions(options);
        const i = listeners.findIndex((record) => record.type === type &&
            record.listener === listener &&
            !record.options.capture === !options1.capture);
        if (i === -1) {
            return;
        }
        const record = listeners[i];
        listeners.splice(i, 1);
        for (const value of getChildValues(this._el)) {
            if (isEventTarget(value)) {
                value.removeEventListener(record.type, record.callback, record.options);
            }
        }
    }
    dispatchEvent(ev) {
        const path = [];
        for (let parent = this._pa; parent !== undefined; parent = parent._pa) {
            path.push(parent);
        }
        // We patch the stopImmediatePropagation method because ev.cancelBubble
        // only informs us if stopPropagation was called and there are no
        // properties which inform us if stopImmediatePropagation was called.
        let immediateCancelBubble = false;
        const stopImmediatePropagation = ev.stopImmediatePropagation;
        setEventProperty(ev, "stopImmediatePropagation", () => {
            immediateCancelBubble = true;
            return stopImmediatePropagation.call(ev);
        });
        setEventProperty(ev, "target", this);
        // The only possible errors in this block are errors thrown in callbacks,
        // and dispatchEvent is designed to only these errors rather than throwing
        // them. Therefore, we place all code in a try block, log errors in the
        // catch block use unsafe return statement in the finally block.
        //
        // Each early return within the try block returns true because while the
        // return value is overridden in the finally block, TypeScript
        // (justifiably) does not recognize the unsafe return statement.
        try {
            setEventProperty(ev, "eventPhase", CAPTURING_PHASE);
            for (let i = path.length - 1; i >= 0; i--) {
                const target = path[i];
                const listeners = listenersMap.get(target);
                if (listeners) {
                    setEventProperty(ev, "currentTarget", target);
                    for (const record of listeners) {
                        if (record.type === ev.type && record.options.capture) {
                            record.callback.call(this, ev);
                            if (immediateCancelBubble) {
                                return true;
                            }
                        }
                    }
                }
                if (ev.cancelBubble) {
                    return true;
                }
            }
            {
                const listeners = listenersMap.get(this);
                if (listeners) {
                    setEventProperty(ev, "eventPhase", AT_TARGET);
                    setEventProperty(ev, "currentTarget", this);
                    for (const record of listeners) {
                        if (record.type === ev.type) {
                            record.callback.call(this, ev);
                            if (immediateCancelBubble) {
                                return true;
                            }
                        }
                    }
                    if (ev.cancelBubble) {
                        return true;
                    }
                }
            }
            if (ev.bubbles) {
                setEventProperty(ev, "eventPhase", BUBBLING_PHASE);
                for (let i = 0; i < path.length; i++) {
                    const target = path[i];
                    const listeners = listenersMap.get(target);
                    if (listeners) {
                        setEventProperty(ev, "currentTarget", target);
                        for (const record of listeners) {
                            if (record.type === ev.type && !record.options.capture) {
                                record.callback.call(this, ev);
                                if (immediateCancelBubble) {
                                    return true;
                                }
                            }
                        }
                    }
                    if (ev.cancelBubble) {
                        return true;
                    }
                }
            }
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setEventProperty(ev, "eventPhase", NONE);
            setEventProperty(ev, "currentTarget", null);
            // eslint-disable-next-line no-unsafe-finally
            return !ev.defaultPrevented;
        }
    }
}
/*** PRIVATE CONTEXT FUNCTIONS ***/
/**
 * This function is responsible for executing the component and handling all
 * the different component types.
 *
 * @returns {[block, value]} A tuple where
 * block - A possible promise which represents the duration during which the
 * component is blocked from updating.
 * value - A possible promise resolving to the rendered value of children.
 *
 * Each component type will block according to the type of the component.
 * - Sync function components never block and will transparently pass updates
 * to children.
 * - Async function components and async generator components block while
 * executing itself, but will not block for async children.
 * - Sync generator components block while any children are executing, because
 * they are expected to only resume when they’ve actually rendered.
 */
function stepCtx(ctx) {
    const el = ctx._el;
    if (ctx._f & IsDone) {
        return [undefined, getValue(el)];
    }
    const initial = !ctx._it;
    if (initial) {
        try {
            ctx._f |= IsExecuting;
            clearEventListeners(ctx);
            const result = el.tag.call(ctx, el.props);
            if (isIteratorLike(result)) {
                ctx._it = result;
            }
            else if (isPromiseLike(result)) {
                // async function component
                const result1 = result instanceof Promise ? result : Promise.resolve(result);
                const value = result1.then((result) => updateCtxChildren(ctx, result));
                return [result1, value];
            }
            else {
                // sync function component
                return [undefined, updateCtxChildren(ctx, result)];
            }
        }
        finally {
            ctx._f &= ~IsExecuting;
        }
    }
    // The value passed back into the generator as the argument to the next
    // method is a promise if an async generator component has async children.
    // Sync generator components only resume when their children have fulfilled
    // so ctx._el._ic (the element’s inflight children) will never be defined.
    let oldValue;
    if (initial) {
        // The argument passed to the first call to next is ignored.
        oldValue = undefined;
    }
    else if (ctx._el._ic) {
        oldValue = ctx._el._ic.then(ctx._re.read, () => ctx._re.read(undefined));
    }
    else {
        oldValue = ctx._re.read(getValue(el));
    }
    let iteration;
    try {
        ctx._f |= IsExecuting;
        iteration = ctx._it.next(oldValue);
    }
    catch (err) {
        ctx._f |= IsDone;
        throw err;
    }
    finally {
        ctx._f &= ~IsExecuting;
    }
    if (isPromiseLike(iteration)) {
        // async generator component
        if (initial) {
            ctx._f |= IsAsyncGen;
        }
        const value = iteration.then((iteration) => {
            if (!(ctx._f & IsIterating)) {
                ctx._f &= ~IsAvailable;
            }
            ctx._f &= ~IsIterating;
            if (iteration.done) {
                ctx._f |= IsDone;
            }
            try {
                const value = updateCtxChildren(ctx, iteration.value);
                if (isPromiseLike(value)) {
                    return value.catch((err) => handleChildError(ctx, err));
                }
                return value;
            }
            catch (err) {
                return handleChildError(ctx, err);
            }
        }, (err) => {
            ctx._f |= IsDone;
            throw err;
        });
        return [iteration, value];
    }
    // sync generator component
    if (initial) {
        ctx._f |= IsSyncGen;
    }
    ctx._f &= ~IsIterating;
    if (iteration.done) {
        ctx._f |= IsDone;
    }
    let value;
    try {
        value = updateCtxChildren(ctx, iteration.value);
        if (isPromiseLike(value)) {
            value = value.catch((err) => handleChildError(ctx, err));
        }
    }
    catch (err) {
        value = handleChildError(ctx, err);
    }
    if (isPromiseLike(value)) {
        return [value.catch(NOOP), value];
    }
    return [undefined, value];
}
/**
 * Called when the inflight block promise settles.
 */
function advanceCtx(ctx) {
    // _ib - inflightBlock
    // _iv - inflightValue
    // _eb - enqueuedBlock
    // _ev - enqueuedValue
    ctx._ib = ctx._eb;
    ctx._iv = ctx._ev;
    ctx._eb = undefined;
    ctx._ev = undefined;
    if (ctx._f & IsAsyncGen && !(ctx._f & IsDone)) {
        runCtx(ctx);
    }
}
/**
 * Enqueues and executes the component associated with the context.
 *
 * The functions stepCtx, advanceCtx and runCtx work together to implement the
 * async queueing behavior of components. The runCtx function calls the stepCtx
 * function, which returns two results in a tuple. The first result, called the
 * “block,” is a possible promise which represents the duration for which the
 * component is blocked from accepting new updates. The second result, called
 * the “value,” is the actual result of the update. The runCtx function caches
 * block/value from the stepCtx function on the context, according to whether
 * the component blocks. The “inflight” block/value properties are the
 * currently executing update, and the “enqueued” block/value properties
 * represent an enqueued next stepCtx. Enqueued steps are dequeued every time
 * the current block promise settles.
 */
function runCtx(ctx) {
    if (!ctx._ib) {
        try {
            const [block, value] = stepCtx(ctx);
            if (block) {
                ctx._ib = block
                    .catch((err) => {
                    if (!(ctx._f & IsUpdating)) {
                        return propagateError(ctx._pa, err);
                    }
                })
                    .finally(() => advanceCtx(ctx));
                // stepCtx will only return a block if the value is asynchronous
                ctx._iv = value;
            }
            return value;
        }
        catch (err) {
            if (!(ctx._f & IsUpdating)) {
                return propagateError(ctx._pa, err);
            }
            throw err;
        }
    }
    else if (ctx._f & IsAsyncGen) {
        return ctx._iv;
    }
    else if (!ctx._eb) {
        let resolve;
        ctx._eb = ctx._ib
            .then(() => {
            try {
                const [block, value] = stepCtx(ctx);
                resolve(value);
                if (block) {
                    return block.catch((err) => {
                        if (!(ctx._f & IsUpdating)) {
                            return propagateError(ctx._pa, err);
                        }
                    });
                }
            }
            catch (err) {
                if (!(ctx._f & IsUpdating)) {
                    return propagateError(ctx._pa, err);
                }
            }
        })
            .finally(() => advanceCtx(ctx));
        ctx._ev = new Promise((resolve1) => (resolve = resolve1));
    }
    return ctx._ev;
}
/**
 * Called to make props available to the props async iterator for async
 * generator components.
 */
function resumeCtx(ctx) {
    if (ctx._oa) {
        ctx._oa();
        ctx._oa = undefined;
    }
    else {
        ctx._f |= IsAvailable;
    }
}
function updateCtx(ctx) {
    ctx._f |= IsUpdating;
    resumeCtx(ctx);
    return runCtx(ctx);
}
function updateCtxChildren(ctx, children) {
    return updateChildren(ctx._re, ctx._rt, ctx._ho, ctx, ctx._sc, ctx._el, narrow(children));
}
function commitCtx(ctx, values) {
    if (ctx._f & IsUnmounted) {
        return;
    }
    const listeners = listenersMap.get(ctx);
    if (listeners && listeners.length) {
        for (let i = 0; i < values.length; i++) {
            const value = values[i];
            if (isEventTarget(value)) {
                for (let j = 0; j < listeners.length; j++) {
                    const record = listeners[j];
                    value.addEventListener(record.type, record.callback, record.options);
                }
            }
        }
    }
    if (!(ctx._f & IsUpdating)) {
        const listeners = getListeners(ctx._pa, ctx._ho);
        if (listeners.length) {
            for (let i = 0; i < values.length; i++) {
                const value = values[i];
                if (isEventTarget(value)) {
                    for (let j = 0; j < listeners.length; j++) {
                        const record = listeners[j];
                        value.addEventListener(record.type, record.callback, record.options);
                    }
                }
            }
        }
        const host = ctx._ho;
        const hostValues = getChildValues(host);
        ctx._re.arrange(host, host.tag === Portal ? host.props.root : host._n, hostValues);
        if (hostValues.length) {
            host._f |= HadChildren;
        }
        else {
            host._f &= ~HadChildren;
        }
        ctx._re.complete(ctx._rt);
    }
    ctx._f &= ~IsUpdating;
    const value = unwrap(values);
    const callbacks = scheduleMap.get(ctx);
    if (callbacks && callbacks.size) {
        // We must clear the set of callbacks before calling them, because a
        // callback which refreshes the component would otherwise cause a stack
        // overflow.
        const callbacks1 = Array.from(callbacks);
        callbacks.clear();
        const value1 = ctx._re.read(value);
        for (const callback of callbacks1) {
            callback(value1);
        }
    }
    return value;
}
// TODO: async unmounting
function unmountCtx(ctx) {
    ctx._f |= IsUnmounted;
    clearEventListeners(ctx);
    const callbacks = cleanupMap.get(ctx);
    if (callbacks && callbacks.size) {
        const value = ctx._re.read(getValue(ctx._el));
        for (const cleanup of callbacks) {
            cleanup(value);
        }
        callbacks.clear();
    }
    if (!(ctx._f & IsDone)) {
        ctx._f |= IsDone;
        resumeCtx(ctx);
        if (ctx._it && typeof ctx._it.return === "function") {
            try {
                ctx._f |= IsExecuting;
                const iteration = ctx._it.return();
                if (isPromiseLike(iteration)) {
                    iteration.catch((err) => propagateError(ctx._pa, err));
                }
            }
            finally {
                ctx._f &= ~IsExecuting;
            }
        }
    }
}
/*** EVENT TARGET UTILITIES ***/
// EVENT PHASE CONSTANTS
// https://developer.mozilla.org/en-US/docs/Web/API/Event/eventPhase
const NONE = 0;
const CAPTURING_PHASE = 1;
const AT_TARGET = 2;
const BUBBLING_PHASE = 3;
const listenersMap = new WeakMap();
function normalizeOptions(options) {
    if (typeof options === "boolean") {
        return { capture: options };
    }
    else if (options == null) {
        return {};
    }
    return options;
}
function isEventTarget(value) {
    return (value != null &&
        typeof value.addEventListener === "function" &&
        typeof value.removeEventListener === "function" &&
        typeof value.dispatchEvent === "function");
}
function setEventProperty(ev, key, value) {
    Object.defineProperty(ev, key, { value, writable: false, configurable: true });
}
/**
 * A function to reconstruct an array of every listener given a context and a
 * host element.
 *
 * This function exploits the fact that contexts retain their nearest ancestor
 * host element. We can determine all the contexts which are directly listening
 * to an element by traversing up the context tree and checking that the host
 * element passed in matches the parent context’s host element.
 *
 * TODO: Maybe we can pass in the current context directly, rather than
 * starting from the parent?
 */
function getListeners(ctx, host) {
    let listeners = [];
    while (ctx !== undefined && ctx._ho === host) {
        const listeners1 = listenersMap.get(ctx);
        if (listeners1) {
            listeners = listeners.concat(listeners1);
        }
        ctx = ctx._pa;
    }
    return listeners;
}
function clearEventListeners(ctx) {
    const listeners = listenersMap.get(ctx);
    if (listeners && listeners.length) {
        for (const value of getChildValues(ctx._el)) {
            if (isEventTarget(value)) {
                for (const record of listeners) {
                    value.removeEventListener(record.type, record.callback, record.options);
                }
            }
        }
        listeners.length = 0;
    }
}
/*** ERROR HANDLING UTILITIES ***/
// TODO: generator components which throw errors should be recoverable
function handleChildError(ctx, err) {
    if (ctx._f & IsDone || !ctx._it || typeof ctx._it.throw !== "function") {
        throw err;
    }
    resumeCtx(ctx);
    let iteration;
    try {
        ctx._f |= IsExecuting;
        iteration = ctx._it.throw(err);
    }
    catch (err) {
        ctx._f |= IsDone;
        throw err;
    }
    finally {
        ctx._f &= ~IsExecuting;
    }
    if (isPromiseLike(iteration)) {
        return iteration.then((iteration) => {
            if (iteration.done) {
                ctx._f |= IsDone;
            }
            return updateCtxChildren(ctx, iteration.value);
        }, (err) => {
            ctx._f |= IsDone;
            throw err;
        });
    }
    if (iteration.done) {
        ctx._f |= IsDone;
    }
    return updateCtxChildren(ctx, iteration.value);
}
function propagateError(ctx, err) {
    if (ctx === undefined) {
        throw err;
    }
    let result;
    try {
        result = handleChildError(ctx, err);
    }
    catch (err) {
        return propagateError(ctx._pa, err);
    }
    if (isPromiseLike(result)) {
        return result.catch((err) => propagateError(ctx._pa, err));
    }
    return result;
}

exports.Context = Context;
exports.Copy = Copy;
exports.Element = Element;
exports.Fragment = Fragment;
exports.Portal = Portal;
exports.Raw = Raw;
exports.Renderer = Renderer;
exports.cloneElement = cloneElement;
exports.createElement = createElement;
exports.isElement = isElement;
//# sourceMappingURL=crank.js.map
  })();
});

require.register("@bikeshaving/crank/cjs/dom.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "@bikeshaving/crank");
  (function() {
    'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var crank = require('./crank.js');

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
class DOMRenderer extends crank.Renderer {
    render(children, root, ctx) {
        if (root == null || typeof root.nodeType !== "number") {
            throw new TypeError(`Render root is not a node. Received: ${JSON.stringify(root && root.toString())}`);
        }
        return super.render(children, root, ctx);
    }
    parse(text) {
        if (typeof document.createRange === "function") {
            return document.createRange().createContextualFragment(text);
        }
        else {
            const fragment = document.createDocumentFragment();
            const childNodes = new DOMParser().parseFromString(text, "text/html").body
                .childNodes;
            for (let i = 0; i < childNodes.length; i++) {
                fragment.appendChild(childNodes[i]);
            }
            return fragment;
        }
    }
    scope(el, scope) {
        switch (el.tag) {
            case crank.Portal:
            case "foreignObject":
                return undefined;
            case "svg":
                return SVG_NAMESPACE;
            default:
                return scope;
        }
    }
    create(el, ns) {
        if (typeof el.tag !== "string") {
            throw new Error(`Unknown tag: ${el.tag.toString()}`);
        }
        else if (el.tag === "svg") {
            ns = SVG_NAMESPACE;
        }
        return ns
            ? document.createElementNS(ns, el.tag)
            : document.createElement(el.tag);
    }
    patch(el, node) {
        const isSVG = node.namespaceURI === SVG_NAMESPACE;
        for (let name in el.props) {
            let forceAttribute = false;
            const value = el.props[name];
            switch (name) {
                case "children":
                    break;
                case "style": {
                    const style = node.style;
                    if (style == null) {
                        node.setAttribute("style", value);
                    }
                    else {
                        if (value == null) {
                            node.removeAttribute("style");
                        }
                        else if (typeof value === "string") {
                            if (style.cssText !== value) {
                                style.cssText = value;
                            }
                        }
                        else {
                            for (const styleName in value) {
                                const styleValue = value && value[styleName];
                                if (styleValue == null) {
                                    style.removeProperty(styleName);
                                }
                                else if (style.getPropertyValue(styleName) !== styleValue) {
                                    style.setProperty(styleName, styleValue);
                                }
                            }
                        }
                    }
                    break;
                }
                case "class":
                case "className":
                    if (value === true) {
                        node.setAttribute("class", "");
                    }
                    else if (!value) {
                        node.removeAttribute("class");
                    }
                    else if (!isSVG) {
                        if (node.className !== value) {
                            node["className"] = value;
                        }
                    }
                    else if (node.getAttribute("class") !== value) {
                        node.setAttribute("class", value);
                    }
                    break;
                // Gleaned from:
                // https://github.com/preactjs/preact/blob/05e5d2c0d2d92c5478eeffdbd96681c96500d29f/src/diff/props.js#L111-L117
                // TODO: figure out why we use setAttribute for each of these
                case "form":
                case "list":
                case "type":
                case "size":
                    forceAttribute = true;
                // fallthrough
                default: {
                    if (value == null) {
                        node.removeAttribute(name);
                    }
                    else if (typeof value === "function" ||
                        typeof value === "object" ||
                        (!forceAttribute && !isSVG && name in node)) {
                        if (node[name] !== value) {
                            node[name] = value;
                        }
                    }
                    else if (value === true) {
                        node.setAttribute(name, "");
                    }
                    else if (value === false) {
                        node.removeAttribute(name);
                    }
                    else if (node.getAttribute(name) !== value) {
                        node.setAttribute(name, value);
                    }
                }
            }
        }
    }
    arrange(el, node, children) {
        if (el.tag === crank.Portal &&
            (node == null || typeof node.nodeType !== "number")) {
            throw new TypeError(`Portal root is not a node. Received: ${JSON.stringify(node && node.toString())}`);
        }
        if (!("innerHTML" in el.props) &&
            ("children" in el.props || el.hadChildren)) {
            if (children.length === 0) {
                node.textContent = "";
            }
            else {
                let oldChild = node.firstChild;
                let i = 0;
                while (oldChild !== null && i < children.length) {
                    const newChild = children[i];
                    if (oldChild === newChild) {
                        oldChild = oldChild.nextSibling;
                        i++;
                    }
                    else if (typeof newChild === "string") {
                        if (oldChild.nodeType === Node.TEXT_NODE) {
                            if (oldChild.data !== newChild) {
                                oldChild.data = newChild;
                            }
                            oldChild = oldChild.nextSibling;
                        }
                        else {
                            node.insertBefore(document.createTextNode(newChild), oldChild);
                        }
                        i++;
                    }
                    else if (oldChild.nodeType === Node.TEXT_NODE) {
                        const nextSibling = oldChild.nextSibling;
                        node.removeChild(oldChild);
                        oldChild = nextSibling;
                    }
                    else {
                        node.insertBefore(newChild, oldChild);
                        i++;
                        // TODO: This is an optimization but we need to think a little more about other cases like prepending.
                        if (oldChild !== children[i]) {
                            const nextSibling = oldChild.nextSibling;
                            node.removeChild(oldChild);
                            oldChild = nextSibling;
                        }
                    }
                }
                while (oldChild !== null) {
                    const nextSibling = oldChild.nextSibling;
                    node.removeChild(oldChild);
                    oldChild = nextSibling;
                }
                for (; i < children.length; i++) {
                    const newChild = children[i];
                    node.appendChild(typeof newChild === "string"
                        ? document.createTextNode(newChild)
                        : newChild);
                }
            }
        }
    }
}
const renderer = new DOMRenderer();

exports.DOMRenderer = DOMRenderer;
exports.renderer = renderer;
//# sourceMappingURL=dom.js.map
  })();
});

require.register("@bikeshaving/crank/cjs/index.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "@bikeshaving/crank");
  (function() {
    'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var crank = require('./crank.js');



exports.Context = crank.Context;
exports.Copy = crank.Copy;
exports.Element = crank.Element;
exports.Fragment = crank.Fragment;
exports.Portal = crank.Portal;
exports.Raw = crank.Raw;
exports.Renderer = crank.Renderer;
exports.cloneElement = crank.cloneElement;
exports.createElement = crank.createElement;
exports.isElement = crank.isElement;
//# sourceMappingURL=index.js.map
  })();
});

require.register("@swup/plugin/lib/index.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "@swup/plugin");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Plugin = function () {
    function Plugin() {
        _classCallCheck(this, Plugin);

        this.isSwupPlugin = true;
    }

    _createClass(Plugin, [{
        key: "mount",
        value: function mount() {
            // this is mount method rewritten by class extending
            // and is executed when swup is enabled with plugin
        }
    }, {
        key: "unmount",
        value: function unmount() {
            // this is unmount method rewritten by class extending
            // and is executed when swup with plugin is disabled
        }
    }, {
        key: "_beforeMount",
        value: function _beforeMount() {
            // here for any future hidden auto init
        }
    }, {
        key: "_afterUnmount",
        value: function _afterUnmount() {}
        // here for any future hidden auto-cleanup


        // this is here so we can tell if plugin was created by extending this class

    }]);

    return Plugin;
}();

exports.default = Plugin;
  })();
});

require.register("@swup/progress-plugin/lib/ProgressBar.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "@swup/progress-plugin");
  (function() {
    'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ProgressBar = function () {
	function ProgressBar(_ref) {
		var _this = this;

		var _ref$className = _ref.className,
		    className = _ref$className === undefined ? null : _ref$className,
		    _ref$animationDuratio = _ref.animationDuration,
		    animationDuration = _ref$animationDuratio === undefined ? null : _ref$animationDuratio;

		_classCallCheck(this, ProgressBar);

		this.className = 'progress-bar';
		this.animationDuration = 300;
		this.minValue = 0.1;
		this.stylesheetElement = null;
		this.progressElement = null;
		this.hiding = false;
		this.trickleInterval = null;
		this.value = 0;
		this.visible = false;

		this.trickle = function () {
			var advance = Math.random() * 3 / 100;
			_this.setValue(_this.value + advance);
		};

		if (className !== null) {
			this.className = className;
		}
		if (animationDuration !== null) {
			this.animationDuration = animationDuration;
		}

		this.stylesheetElement = this.createStylesheetElement();
		this.progressElement = this.createProgressElement();
	} // ms


	_createClass(ProgressBar, [{
		key: 'show',
		value: function show() {
			if (!this.visible) {
				this.visible = true;
				this.installStylesheetElement();
				this.installProgressElement();
				this.startTrickling();
			}
		}
	}, {
		key: 'hide',
		value: function hide() {
			var _this2 = this;

			if (this.visible && !this.hiding) {
				this.hiding = true;
				this.fadeProgressElement(function () {
					_this2.uninstallProgressElement();
					_this2.stopTrickling();
					_this2.visible = false;
					_this2.hiding = false;
				});
			}
		}
	}, {
		key: 'setValue',
		value: function setValue(value) {
			this.value = Math.max(this.minValue, value);
			this.refresh();
		}

		// Private

	}, {
		key: 'installStylesheetElement',
		value: function installStylesheetElement() {
			document.head.insertBefore(this.stylesheetElement, document.head.firstChild);
		}
	}, {
		key: 'installProgressElement',
		value: function installProgressElement() {
			this.progressElement.style.width = '0';
			this.progressElement.style.opacity = '1';
			document.documentElement.insertBefore(this.progressElement, document.body);
			this.refresh();
		}
	}, {
		key: 'fadeProgressElement',
		value: function fadeProgressElement(callback) {
			this.progressElement.style.opacity = '0';
			setTimeout(callback, this.animationDuration * 1.5);
		}
	}, {
		key: 'uninstallProgressElement',
		value: function uninstallProgressElement() {
			if (this.progressElement.parentNode) {
				document.documentElement.removeChild(this.progressElement);
			}
		}
	}, {
		key: 'startTrickling',
		value: function startTrickling() {
			if (!this.trickleInterval) {
				this.trickleInterval = window.setInterval(this.trickle, this.animationDuration);
			}
		}
	}, {
		key: 'stopTrickling',
		value: function stopTrickling() {
			window.clearInterval(this.trickleInterval);
			delete this.trickleInterval;
		}
	}, {
		key: 'refresh',
		value: function refresh() {
			var _this3 = this;

			requestAnimationFrame(function () {
				_this3.progressElement.style.width = 10 + _this3.value * 90 + '%';
			});
		}
	}, {
		key: 'createStylesheetElement',
		value: function createStylesheetElement() {
			var element = document.createElement('style');
			element.type = 'text/css';
			element.textContent = this.defaultCSS;
			return element;
		}
	}, {
		key: 'createProgressElement',
		value: function createProgressElement() {
			var element = document.createElement('div');
			element.className = this.className;
			return element;
		}
	}, {
		key: 'defaultCSS',
		get: function get() {
			return '\n    .' + this.className + ' {\n        position: fixed;\n        display: block;\n        top: 0;\n        left: 0;\n        height: 3px;\n        background-color: black;\n        z-index: 9999;\n        transition:\n          width ' + this.animationDuration + 'ms ease-out,\n          opacity ' + this.animationDuration / 2 + 'ms ' + this.animationDuration / 2 + 'ms ease-in;\n        transform: translate3d(0, 0, 0);\n      }\n    ';
		}
	}]);

	return ProgressBar;
}();

exports.default = ProgressBar;
  })();
});

require.register("@swup/progress-plugin/lib/index.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "@swup/progress-plugin");
  (function() {
    'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _plugin = require('@swup/plugin');

var _plugin2 = _interopRequireDefault(_plugin);

var _ProgressBar = require('./ProgressBar');

var _ProgressBar2 = _interopRequireDefault(_ProgressBar);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SwupProgressPlugin = function (_Plugin) {
	_inherits(SwupProgressPlugin, _Plugin);

	function SwupProgressPlugin(options) {
		_classCallCheck(this, SwupProgressPlugin);

		var _this = _possibleConstructorReturn(this, (SwupProgressPlugin.__proto__ || Object.getPrototypeOf(SwupProgressPlugin)).call(this));

		_this.name = 'SwupProgressPlugin';

		_this.startShowingProgress = function () {
			_this.progressBar.setValue(0);
			_this.showProgressBarAfterDelay();
		};

		_this.stopShowingProgress = function () {
			_this.progressBar.setValue(1);
			_this.hideProgressBar();
		};

		_this.showProgressBar = function () {
			_this.progressBar.show();
		};

		_this.showProgressBarAfterDelay = function () {
			_this.progressBarTimeout = window.setTimeout(_this.showProgressBar, _this.options.delay);
		};

		_this.hideProgressBar = function () {
			_this.progressBar.hide();
			if (_this.progressBarTimeout != null) {
				window.clearTimeout(_this.progressBarTimeout);
				delete _this.progressBarTimeout;
			}
		};

		var defaultOptions = {
			className: 'swup-progress-bar',
			transition: 300,
			delay: 300
		};

		_this.options = _extends({}, defaultOptions, options);

		_this.progressBarTimeout = null;
		_this.progressBar = new _ProgressBar2.default({
			className: _this.options.className,
			animationDuration: _this.options.transition
		});
		return _this;
	}

	_createClass(SwupProgressPlugin, [{
		key: 'mount',
		value: function mount() {
			this.swup.on('transitionStart', this.startShowingProgress);
			this.swup.on('contentReplaced', this.stopShowingProgress);
		}
	}, {
		key: 'unmount',
		value: function unmount() {
			this.swup.off('transitionStart', this.startShowingProgress);
			this.swup.off('contentReplaced', this.stopShowingProgress);
		}
	}]);

	return SwupProgressPlugin;
}(_plugin2.default);

exports.default = SwupProgressPlugin;
  })();
});

require.register("@swup/scroll-plugin/lib/index.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "@swup/scroll-plugin");
  (function() {
    'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _plugin = require('@swup/plugin');

var _plugin2 = _interopRequireDefault(_plugin);

var _scrl = require('scrl');

var _scrl2 = _interopRequireDefault(_scrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ScrollPlugin = function (_Plugin) {
    _inherits(ScrollPlugin, _Plugin);

    function ScrollPlugin(options) {
        _classCallCheck(this, ScrollPlugin);

        var _this = _possibleConstructorReturn(this, (ScrollPlugin.__proto__ || Object.getPrototypeOf(ScrollPlugin)).call(this));

        _this.name = "ScrollPlugin";

        _this.onSamePage = function () {
            _this.swup.scrollTo(0);
        };

        _this.onSamePageWithHash = function (event) {
            var link = event.delegateTarget;
            var element = document.querySelector(link.hash);
            var top = element.getBoundingClientRect().top + window.pageYOffset;
            _this.swup.scrollTo(top);
        };

        _this.onTransitionStart = function (popstate) {
            if (_this.options.doScrollingRightAway && !_this.swup.scrollToElement) {
                _this.doScrolling(popstate);
            }
        };

        _this.onContentReplaced = function (popstate) {
            if (!_this.options.doScrollingRightAway || _this.swup.scrollToElement) {
                _this.doScrolling(popstate);
            }
        };

        _this.doScrolling = function (popstate) {
            var swup = _this.swup;

            if (!popstate || swup.options.animateHistoryBrowsing) {
                if (swup.scrollToElement != null) {
                    var element = document.querySelector(swup.scrollToElement);
                    if (element != null) {
                        var top = element.getBoundingClientRect().top + window.pageYOffset;
                        swup.scrollTo(top);
                    } else {
                        console.warn('Element ' + swup.scrollToElement + ' not found');
                    }
                    swup.scrollToElement = null;
                } else {
                    swup.scrollTo(0);
                }
            }
        };

        var defaultOptions = {
            doScrollingRightAway: false,
            animateScroll: true,
            scrollFriction: 0.3,
            scrollAcceleration: 0.04
        };

        _this.options = _extends({}, defaultOptions, options);
        return _this;
    }

    _createClass(ScrollPlugin, [{
        key: 'mount',
        value: function mount() {
            var _this2 = this;

            var swup = this.swup;

            // add empty handlers array for submitForm event
            swup._handlers.scrollDone = [];
            swup._handlers.scrollStart = [];

            this.scrl = new _scrl2.default({
                onStart: function onStart() {
                    return swup.triggerEvent('scrollStart');
                },
                onEnd: function onEnd() {
                    return swup.triggerEvent('scrollDone');
                },
                onCancel: function onCancel() {
                    return swup.triggerEvent('scrollDone');
                },
                friction: this.options.scrollFriction,
                acceleration: this.options.scrollAcceleration
            });

            // set scrollTo method of swup and animate based on current animateScroll option
            swup.scrollTo = function (offset) {
                if (_this2.options.animateScroll) {
                    _this2.scrl.scrollTo(offset);
                } else {
                    swup.triggerEvent('scrollStart');
                    window.scrollTo(0, offset);
                    swup.triggerEvent('scrollDone');
                }
            };

            // disable browser scroll control on popstates when
            // animateHistoryBrowsing option is enabled in swup
            if (swup.options.animateHistoryBrowsing) {
                window.history.scrollRestoration = 'manual';
            }

            // scroll to the top of the page
            swup.on('samePage', this.onSamePage);

            // scroll to referenced element on the same page
            swup.on('samePageWithHash', this.onSamePageWithHash);

            // scroll to the referenced element
            swup.on('transitionStart', this.onTransitionStart);

            // scroll to the referenced element when it's in the page (after render)
            swup.on('contentReplaced', this.onContentReplaced);
        }
    }, {
        key: 'unmount',
        value: function unmount() {
            this.swup.scrollTo = null;

            delete this.scrl;
            this.scrl = null;

            this.swup.off('samePage', this.onSamePage);
            this.swup.off('samePageWithHash', this.onSamePageWithHash);
            this.swup.off('transitionStart', this.onTransitionStart);
            this.swup.off('contentReplaced', this.onContentReplaced);

            this.swup._handlers.scrollDone = null;
            this.swup._handlers.scrollStart = null;

            window.history.scrollRestoration = 'auto';
        }
    }]);

    return ScrollPlugin;
}(_plugin2.default);

exports.default = ScrollPlugin;
  })();
});

require.register("delegate/src/closest.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "delegate");
  (function() {
    var DOCUMENT_NODE_TYPE = 9;

/**
 * A polyfill for Element.matches()
 */
if (typeof Element !== 'undefined' && !Element.prototype.matches) {
    var proto = Element.prototype;

    proto.matches = proto.matchesSelector ||
                    proto.mozMatchesSelector ||
                    proto.msMatchesSelector ||
                    proto.oMatchesSelector ||
                    proto.webkitMatchesSelector;
}

/**
 * Finds the closest parent that matches a selector.
 *
 * @param {Element} element
 * @param {String} selector
 * @return {Function}
 */
function closest (element, selector) {
    while (element && element.nodeType !== DOCUMENT_NODE_TYPE) {
        if (typeof element.matches === 'function' &&
            element.matches(selector)) {
          return element;
        }
        element = element.parentNode;
    }
}

module.exports = closest;
  })();
});

require.register("delegate/src/delegate.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "delegate");
  (function() {
    var closest = require('./closest');

/**
 * Delegates event to a selector.
 *
 * @param {Element} element
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @param {Boolean} useCapture
 * @return {Object}
 */
function delegate(element, selector, type, callback, useCapture) {
    var listenerFn = listener.apply(this, arguments);

    element.addEventListener(type, listenerFn, useCapture);

    return {
        destroy: function() {
            element.removeEventListener(type, listenerFn, useCapture);
        }
    }
}

/**
 * Finds closest match and invokes callback.
 *
 * @param {Element} element
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @return {Function}
 */
function listener(element, selector, type, callback) {
    return function(e) {
        e.delegateTarget = closest(e.target, selector);

        if (e.delegateTarget) {
            callback.call(element, e);
        }
    }
}

module.exports = delegate;
  })();
});

require.register("regenerator-runtime/runtime.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "regenerator-runtime");
  (function() {
    /**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }
  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function(obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = define(
    GeneratorFunctionPrototype,
    toStringTagSymbol,
    "GeneratorFunction"
  );

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      define(prototype, method, function(arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  define(Gp, toStringTagSymbol, "Generator");

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
  typeof module === "object" ? module.exports : {}
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}
  })();
});

require.register("scrl/lib/index.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "scrl");
  (function() {
    'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Scrl = function Scrl(options) {
    var _this = this;

    _classCallCheck(this, Scrl);

    this._raf = null;
    this._positionY = 0;
    this._velocityY = 0;
    this._targetPositionY = 0;
    this._targetPositionYWithOffset = 0;
    this._direction = 0;

    this.scrollTo = function (offset) {
        if (offset && offset.nodeType) {
            // the offset is element
            _this._targetPositionY = Math.round(offset.getBoundingClientRect().top + window.pageYOffset);
        } else if (parseInt(_this._targetPositionY) === _this._targetPositionY) {
            // the offset is a number
            _this._targetPositionY = Math.round(offset);
        } else {
            console.error('Argument must be a number or an element.');
            return;
        }

        // don't animate beyond the document height
        if (_this._targetPositionY > document.documentElement.scrollHeight - window.innerHeight) {
            _this._targetPositionY = document.documentElement.scrollHeight - window.innerHeight;
        }

        // calculated required values
        _this._positionY = document.body.scrollTop || document.documentElement.scrollTop;
        _this._direction = _this._positionY > _this._targetPositionY ? -1 : 1;
        _this._targetPositionYWithOffset = _this._targetPositionY + _this._direction;
        _this._velocityY = 0;

        if (_this._positionY !== _this._targetPositionY) {
            // start animation
            _this.options.onStart();
            _this._animate();
        } else {
            // page is already at the position
            _this.options.onAlreadyAtPositions();
        }
    };

    this._animate = function () {
        var distance = _this._update();
        _this._render();

        if (_this._direction === 1 && _this._targetPositionY > _this._positionY || _this._direction === -1 && _this._targetPositionY < _this._positionY) {
            // calculate next position
            _this._raf = requestAnimationFrame(_this._animate);
            _this.options.onTick();
        } else {
            // finish and set position to the final position
            _this._positionY = _this._targetPositionY;
            _this._render();
            _this._raf = null;
            _this.options.onTick();
            _this.options.onEnd();
            // this.triggerEvent('scrollDone')
        }
    };

    this._update = function () {
        var distance = _this._targetPositionYWithOffset - _this._positionY;
        var attraction = distance * _this.options.acceleration;

        _this._velocityY += attraction;

        _this._velocityY *= _this.options.friction;
        _this._positionY += _this._velocityY;

        return Math.abs(distance);
    };

    this._render = function () {
        window.scrollTo(0, _this._positionY);
    };

    // default options
    var defaults = {
        onAlreadyAtPositions: function onAlreadyAtPositions() {},
        onCancel: function onCancel() {},
        onEnd: function onEnd() {},
        onStart: function onStart() {},
        onTick: function onTick() {},
        friction: .7, // 1 - .3
        acceleration: .04

        // merge options
    };this.options = _extends({}, defaults, options);

    // set reverse friction
    if (options && options.friction) {
        this.options.friction = 1 - options.friction;
    }

    // register listener for cancel on wheel event
    window.addEventListener('mousewheel', function (event) {
        if (_this._raf) {
            _this.options.onCancel();
            cancelAnimationFrame(_this._raf);
            _this._raf = null;
        }
    }, {
        passive: true
    });
};

exports.default = Scrl;
  })();
});

require.register("swup/lib/helpers/Link.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "swup");
  (function() {
    'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Link = function () {
	function Link(elementOrUrl) {
		_classCallCheck(this, Link);

		if (elementOrUrl instanceof Element || elementOrUrl instanceof SVGElement) {
			this.link = elementOrUrl;
		} else {
			this.link = document.createElement('a');
			this.link.href = elementOrUrl;
		}
	}

	_createClass(Link, [{
		key: 'getPath',
		value: function getPath() {
			var path = this.link.pathname;
			if (path[0] !== '/') {
				path = '/' + path;
			}
			return path;
		}
	}, {
		key: 'getAddress',
		value: function getAddress() {
			var path = this.link.pathname + this.link.search;

			if (this.link.getAttribute('xlink:href')) {
				path = this.link.getAttribute('xlink:href');
			}

			if (path[0] !== '/') {
				path = '/' + path;
			}
			return path;
		}
	}, {
		key: 'getHash',
		value: function getHash() {
			return this.link.hash;
		}
	}]);

	return Link;
}();

exports.default = Link;
  })();
});

require.register("swup/lib/helpers/classify.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "swup");
  (function() {
    'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
var classify = function classify(text) {
	var output = text.toString().toLowerCase().replace(/\s+/g, '-') // Replace spaces with -
	.replace(/\//g, '-') // Replace / with -
	.replace(/[^\w\-]+/g, '') // Remove all non-word chars
	.replace(/\-\-+/g, '-') // Replace multiple - with single -
	.replace(/^-+/, '') // Trim - from start of text
	.replace(/-+$/, ''); // Trim - from end of text
	if (output[0] === '/') output = output.splice(1);
	if (output === '') output = 'homepage';
	return output;
};

exports.default = classify;
  })();
});

require.register("swup/lib/helpers/createHistoryRecord.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "swup");
  (function() {
    'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
var createHistoryRecord = function createHistoryRecord(url) {
	window.history.pushState({
		url: url || window.location.href.split(window.location.hostname)[1],
		random: Math.random(),
		source: 'swup'
	}, document.getElementsByTagName('title')[0].innerText, url || window.location.href.split(window.location.hostname)[1]);
};

exports.default = createHistoryRecord;
  })();
});

require.register("swup/lib/helpers/fetch.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "swup");
  (function() {
    'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var fetch = function fetch(setOptions) {
	var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

	var defaults = {
		url: window.location.pathname + window.location.search,
		method: 'GET',
		data: null,
		headers: {}
	};

	var options = _extends({}, defaults, setOptions);

	var request = new XMLHttpRequest();

	request.onreadystatechange = function () {
		if (request.readyState === 4) {
			if (request.status !== 500) {
				callback(request);
			} else {
				callback(request);
			}
		}
	};

	request.open(options.method, options.url, true);
	Object.keys(options.headers).forEach(function (key) {
		request.setRequestHeader(key, options.headers[key]);
	});
	request.send(options.data);
	return request;
};

exports.default = fetch;
  })();
});

require.register("swup/lib/helpers/getCurrentUrl.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "swup");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
var getCurrentUrl = function getCurrentUrl() {
	return window.location.pathname + window.location.search;
};

exports.default = getCurrentUrl;
  })();
});

require.register("swup/lib/helpers/getDataFromHtml.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "swup");
  (function() {
    'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _utils = require('../utils');

var getDataFromHtml = function getDataFromHtml(html, containers) {
	var fakeDom = document.createElement('html');
	fakeDom.innerHTML = html;
	var blocks = [];

	var _loop = function _loop(i) {
		if (fakeDom.querySelector(containers[i]) == null) {
			// page in invalid
			return {
				v: null
			};
		} else {
			(0, _utils.queryAll)(containers[i]).forEach(function (item, index) {
				(0, _utils.queryAll)(containers[i], fakeDom)[index].setAttribute('data-swup', blocks.length); // marks element with data-swup
				blocks.push((0, _utils.queryAll)(containers[i], fakeDom)[index].outerHTML);
			});
		}
	};

	for (var i = 0; i < containers.length; i++) {
		var _ret = _loop(i);

		if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
	}

	var json = {
		title: fakeDom.querySelector('title').innerText,
		pageClass: fakeDom.querySelector('body').className,
		originalContent: html,
		blocks: blocks
	};

	// to prevent memory leaks
	fakeDom.innerHTML = '';
	fakeDom = null;

	return json;
};

exports.default = getDataFromHtml;
  })();
});

require.register("swup/lib/helpers/index.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "swup");
  (function() {
    'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Link = exports.markSwupElements = exports.getCurrentUrl = exports.transitionEnd = exports.fetch = exports.getDataFromHtml = exports.createHistoryRecord = exports.classify = undefined;

var _classify = require('./classify');

var _classify2 = _interopRequireDefault(_classify);

var _createHistoryRecord = require('./createHistoryRecord');

var _createHistoryRecord2 = _interopRequireDefault(_createHistoryRecord);

var _getDataFromHtml = require('./getDataFromHtml');

var _getDataFromHtml2 = _interopRequireDefault(_getDataFromHtml);

var _fetch = require('./fetch');

var _fetch2 = _interopRequireDefault(_fetch);

var _transitionEnd = require('./transitionEnd');

var _transitionEnd2 = _interopRequireDefault(_transitionEnd);

var _getCurrentUrl = require('./getCurrentUrl');

var _getCurrentUrl2 = _interopRequireDefault(_getCurrentUrl);

var _markSwupElements = require('./markSwupElements');

var _markSwupElements2 = _interopRequireDefault(_markSwupElements);

var _Link = require('./Link');

var _Link2 = _interopRequireDefault(_Link);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var classify = exports.classify = _classify2.default;
var createHistoryRecord = exports.createHistoryRecord = _createHistoryRecord2.default;
var getDataFromHtml = exports.getDataFromHtml = _getDataFromHtml2.default;
var fetch = exports.fetch = _fetch2.default;
var transitionEnd = exports.transitionEnd = _transitionEnd2.default;
var getCurrentUrl = exports.getCurrentUrl = _getCurrentUrl2.default;
var markSwupElements = exports.markSwupElements = _markSwupElements2.default;
var Link = exports.Link = _Link2.default;
  })();
});

require.register("swup/lib/helpers/markSwupElements.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "swup");
  (function() {
    'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _utils = require('../utils');

var markSwupElements = function markSwupElements(element, containers) {
	var blocks = 0;

	var _loop = function _loop(i) {
		if (element.querySelector(containers[i]) == null) {
			console.warn('Element ' + containers[i] + ' is not in current page.');
		} else {
			(0, _utils.queryAll)(containers[i]).forEach(function (item, index) {
				(0, _utils.queryAll)(containers[i], element)[index].setAttribute('data-swup', blocks);
				blocks++;
			});
		}
	};

	for (var i = 0; i < containers.length; i++) {
		_loop(i);
	}
};

exports.default = markSwupElements;
  })();
});

require.register("swup/lib/helpers/transitionEnd.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "swup");
  (function() {
    'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
var transitionEnd = function transitionEnd() {
	var el = document.createElement('div');

	var transEndEventNames = {
		WebkitTransition: 'webkitTransitionEnd',
		MozTransition: 'transitionend',
		OTransition: 'oTransitionEnd otransitionend',
		transition: 'transitionend'
	};

	for (var name in transEndEventNames) {
		if (el.style[name] !== undefined) {
			return transEndEventNames[name];
		}
	}

	return false;
};

exports.default = transitionEnd;
  })();
});

require.register("swup/lib/index.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "swup");
  (function() {
    'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

// modules


var _delegate = require('delegate');

var _delegate2 = _interopRequireDefault(_delegate);

var _Cache = require('./modules/Cache');

var _Cache2 = _interopRequireDefault(_Cache);

var _loadPage = require('./modules/loadPage');

var _loadPage2 = _interopRequireDefault(_loadPage);

var _renderPage = require('./modules/renderPage');

var _renderPage2 = _interopRequireDefault(_renderPage);

var _triggerEvent = require('./modules/triggerEvent');

var _triggerEvent2 = _interopRequireDefault(_triggerEvent);

var _on = require('./modules/on');

var _on2 = _interopRequireDefault(_on);

var _off = require('./modules/off');

var _off2 = _interopRequireDefault(_off);

var _updateTransition = require('./modules/updateTransition');

var _updateTransition2 = _interopRequireDefault(_updateTransition);

var _getAnimationPromises = require('./modules/getAnimationPromises');

var _getAnimationPromises2 = _interopRequireDefault(_getAnimationPromises);

var _getPageData = require('./modules/getPageData');

var _getPageData2 = _interopRequireDefault(_getPageData);

var _plugins = require('./modules/plugins');

var _utils = require('./utils');

var _helpers = require('./helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Swup = function () {
	function Swup(setOptions) {
		_classCallCheck(this, Swup);

		// default options
		var defaults = {
			animateHistoryBrowsing: false,
			animationSelector: '[class*="transition-"]',
			linkSelector: 'a[href^="' + window.location.origin + '"]:not([data-no-swup]), a[href^="/"]:not([data-no-swup]), a[href^="#"]:not([data-no-swup])',
			cache: true,
			containers: ['#swup'],
			requestHeaders: {
				'X-Requested-With': 'swup',
				Accept: 'text/html, application/xhtml+xml'
			},
			plugins: [],
			skipPopStateHandling: function skipPopStateHandling(event) {
				return !(event.state && event.state.source === 'swup');
			}
		};

		// merge options
		var options = _extends({}, defaults, setOptions);

		// handler arrays
		this._handlers = {
			animationInDone: [],
			animationInStart: [],
			animationOutDone: [],
			animationOutStart: [],
			animationSkipped: [],
			clickLink: [],
			contentReplaced: [],
			disabled: [],
			enabled: [],
			openPageInNewTab: [],
			pageLoaded: [],
			pageRetrievedFromCache: [],
			pageView: [],
			popState: [],
			samePage: [],
			samePageWithHash: [],
			serverError: [],
			transitionStart: [],
			transitionEnd: [],
			willReplaceContent: []
		};

		// variable for id of element to scroll to after render
		this.scrollToElement = null;
		// variable for promise used for preload, so no new loading of the same page starts while page is loading
		this.preloadPromise = null;
		// variable for save options
		this.options = options;
		// variable for plugins array
		this.plugins = [];
		// variable for current transition object
		this.transition = {};
		// variable for keeping event listeners from "delegate"
		this.delegatedListeners = {};
		// so we are able to remove the listener
		this.boundPopStateHandler = this.popStateHandler.bind(this);

		// make modules accessible in instance
		this.cache = new _Cache2.default();
		this.cache.swup = this;
		this.loadPage = _loadPage2.default;
		this.renderPage = _renderPage2.default;
		this.triggerEvent = _triggerEvent2.default;
		this.on = _on2.default;
		this.off = _off2.default;
		this.updateTransition = _updateTransition2.default;
		this.getAnimationPromises = _getAnimationPromises2.default;
		this.getPageData = _getPageData2.default;
		this.log = function () {}; // here so it can be used by plugins
		this.use = _plugins.use;
		this.unuse = _plugins.unuse;
		this.findPlugin = _plugins.findPlugin;

		// enable swup
		this.enable();
	}

	_createClass(Swup, [{
		key: 'enable',
		value: function enable() {
			var _this = this;

			// check for Promise support
			if (typeof Promise === 'undefined') {
				console.warn('Promise is not supported');
				return;
			}

			// add event listeners
			this.delegatedListeners.click = (0, _delegate2.default)(document, this.options.linkSelector, 'click', this.linkClickHandler.bind(this));
			window.addEventListener('popstate', this.boundPopStateHandler);

			// initial save to cache
			var page = (0, _helpers.getDataFromHtml)(document.documentElement.outerHTML, this.options.containers);
			page.url = page.responseURL = (0, _helpers.getCurrentUrl)();
			if (this.options.cache) {
				this.cache.cacheUrl(page);
			}

			// mark swup blocks in html
			(0, _helpers.markSwupElements)(document.documentElement, this.options.containers);

			// mount plugins
			this.options.plugins.forEach(function (plugin) {
				_this.use(plugin);
			});

			// modify initial history record
			window.history.replaceState(Object.assign({}, window.history.state, {
				url: window.location.href,
				random: Math.random(),
				source: 'swup'
			}), document.title, window.location.href);

			// trigger enabled event
			this.triggerEvent('enabled');

			// add swup-enabled class to html tag
			document.documentElement.classList.add('swup-enabled');

			// trigger page view event
			this.triggerEvent('pageView');
		}
	}, {
		key: 'destroy',
		value: function destroy() {
			var _this2 = this;

			// remove delegated listeners
			this.delegatedListeners.click.destroy();

			// remove popstate listener
			window.removeEventListener('popstate', this.boundPopStateHandler);

			// empty cache
			this.cache.empty();

			// unmount plugins
			this.options.plugins.forEach(function (plugin) {
				_this2.unuse(plugin);
			});

			// remove swup data atributes from blocks
			(0, _utils.queryAll)('[data-swup]').forEach(function (element) {
				element.removeAttribute('data-swup');
			});

			// remove handlers
			this.off();

			// trigger disable event
			this.triggerEvent('disabled');

			// remove swup-enabled class from html tag
			document.documentElement.classList.remove('swup-enabled');
		}
	}, {
		key: 'linkClickHandler',
		value: function linkClickHandler(event) {
			// no control key pressed
			if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
				// index of pressed button needs to be checked because Firefox triggers click on all mouse buttons
				if (event.button === 0) {
					this.triggerEvent('clickLink', event);
					event.preventDefault();
					var link = new _helpers.Link(event.delegateTarget);
					if (link.getAddress() == (0, _helpers.getCurrentUrl)() || link.getAddress() == '') {
						// link to the same URL
						if (link.getHash() != '') {
							// link to the same URL with hash
							this.triggerEvent('samePageWithHash', event);
							var element = document.querySelector(link.getHash());
							if (element != null) {
								history.replaceState({
									url: link.getAddress() + link.getHash(),
									random: Math.random(),
									source: 'swup'
								}, document.title, link.getAddress() + link.getHash());
							} else {
								// referenced element not found
								console.warn('Element for offset not found (' + link.getHash() + ')');
							}
						} else {
							// link to the same URL without hash
							this.triggerEvent('samePage', event);
						}
					} else {
						// link to different url
						if (link.getHash() != '') {
							this.scrollToElement = link.getHash();
						}

						// get custom transition from data
						var customTransition = event.delegateTarget.getAttribute('data-swup-transition');

						// load page
						this.loadPage({ url: link.getAddress(), customTransition: customTransition }, false);
					}
				}
			} else {
				// open in new tab (do nothing)
				this.triggerEvent('openPageInNewTab', event);
			}
		}
	}, {
		key: 'popStateHandler',
		value: function popStateHandler(event) {
			if (this.options.skipPopStateHandling(event)) return;
			var link = new _helpers.Link(event.state ? event.state.url : window.location.pathname);
			if (link.getHash() !== '') {
				this.scrollToElement = link.getHash();
			} else {
				event.preventDefault();
			}
			this.triggerEvent('popState', event);
			this.loadPage({ url: link.getAddress() }, event);
		}
	}]);

	return Swup;
}();

exports.default = Swup;
  })();
});

require.register("swup/lib/modules/Cache.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "swup");
  (function() {
    'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Cache = exports.Cache = function () {
	function Cache() {
		_classCallCheck(this, Cache);

		this.pages = {};
		this.last = null;
	}

	_createClass(Cache, [{
		key: 'cacheUrl',
		value: function cacheUrl(page) {
			if (page.url in this.pages === false) {
				this.pages[page.url] = page;
			}
			this.last = this.pages[page.url];
			this.swup.log('Cache (' + Object.keys(this.pages).length + ')', this.pages);
		}
	}, {
		key: 'getPage',
		value: function getPage(url) {
			return this.pages[url];
		}
	}, {
		key: 'getCurrentPage',
		value: function getCurrentPage() {
			return this.getPage(window.location.pathname + window.location.search);
		}
	}, {
		key: 'exists',
		value: function exists(url) {
			return url in this.pages;
		}
	}, {
		key: 'empty',
		value: function empty() {
			this.pages = {};
			this.last = null;
			this.swup.log('Cache cleared');
		}
	}, {
		key: 'remove',
		value: function remove(url) {
			delete this.pages[url];
		}
	}]);

	return Cache;
}();

exports.default = Cache;
  })();
});

require.register("swup/lib/modules/getAnimationPromises.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "swup");
  (function() {
    'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _utils = require('../utils');

var _helpers = require('../helpers');

var getAnimationPromises = function getAnimationPromises() {
	var promises = [];
	var animatedElements = (0, _utils.queryAll)(this.options.animationSelector);
	animatedElements.forEach(function (element) {
		var promise = new Promise(function (resolve) {
			element.addEventListener((0, _helpers.transitionEnd)(), function (event) {
				if (element == event.target) {
					resolve();
				}
			});
		});
		promises.push(promise);
	});
	return promises;
};

exports.default = getAnimationPromises;
  })();
});

require.register("swup/lib/modules/getPageData.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "swup");
  (function() {
    'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _helpers = require('../helpers');

var getPageData = function getPageData(request) {
	// this method can be replaced in case other content than html is expected to be received from server
	// this function should always return {title, pageClass, originalContent, blocks, responseURL}
	// in case page has invalid structure - return null
	var html = request.responseText;
	var pageObject = (0, _helpers.getDataFromHtml)(html, this.options.containers);

	if (pageObject) {
		pageObject.responseURL = request.responseURL ? request.responseURL : window.location.href;
	} else {
		console.warn('Received page is invalid.');
		return null;
	}

	return pageObject;
};

exports.default = getPageData;
  })();
});

require.register("swup/lib/modules/loadPage.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "swup");
  (function() {
    'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _helpers = require('../helpers');

var loadPage = function loadPage(data, popstate) {
	var _this = this;

	// create array for storing animation promises
	var animationPromises = [],
	    xhrPromise = void 0;
	var animateOut = function animateOut() {
		_this.triggerEvent('animationOutStart');

		// handle classes
		document.documentElement.classList.add('is-changing');
		document.documentElement.classList.add('is-leaving');
		document.documentElement.classList.add('is-animating');
		if (popstate) {
			document.documentElement.classList.add('is-popstate');
		}
		document.documentElement.classList.add('to-' + (0, _helpers.classify)(data.url));

		// animation promise stuff
		animationPromises = _this.getAnimationPromises('out');
		Promise.all(animationPromises).then(function () {
			_this.triggerEvent('animationOutDone');
		});

		// create history record if this is not a popstate call
		if (!popstate) {
			// create pop element with or without anchor
			var state = void 0;
			if (_this.scrollToElement != null) {
				state = data.url + _this.scrollToElement;
			} else {
				state = data.url;
			}

			(0, _helpers.createHistoryRecord)(state);
		}
	};

	this.triggerEvent('transitionStart', popstate);

	// set transition object
	if (data.customTransition != null) {
		this.updateTransition(window.location.pathname, data.url, data.customTransition);
		document.documentElement.classList.add('to-' + (0, _helpers.classify)(data.customTransition));
	} else {
		this.updateTransition(window.location.pathname, data.url);
	}

	// start/skip animation
	if (!popstate || this.options.animateHistoryBrowsing) {
		animateOut();
	} else {
		this.triggerEvent('animationSkipped');
	}

	// start/skip loading of page
	if (this.cache.exists(data.url)) {
		xhrPromise = new Promise(function (resolve) {
			resolve();
		});
		this.triggerEvent('pageRetrievedFromCache');
	} else {
		if (!this.preloadPromise || this.preloadPromise.route != data.url) {
			xhrPromise = new Promise(function (resolve, reject) {
				(0, _helpers.fetch)(_extends({}, data, { headers: _this.options.requestHeaders }), function (response) {
					if (response.status === 500) {
						_this.triggerEvent('serverError');
						reject(data.url);
						return;
					} else {
						// get json data
						var page = _this.getPageData(response);
						if (page != null) {
							page.url = data.url;
						} else {
							reject(data.url);
							return;
						}
						// render page
						_this.cache.cacheUrl(page);
						_this.triggerEvent('pageLoaded');
					}
					resolve();
				});
			});
		} else {
			xhrPromise = this.preloadPromise;
		}
	}

	// when everything is ready, handle the outcome
	Promise.all(animationPromises.concat([xhrPromise])).then(function () {
		// render page
		_this.renderPage(_this.cache.getPage(data.url), popstate);
		_this.preloadPromise = null;
	}).catch(function (errorUrl) {
		// rewrite the skipPopStateHandling function to redirect manually when the history.go is processed
		_this.options.skipPopStateHandling = function () {
			window.location = errorUrl;
			return true;
		};

		// go back to the actual page were still at
		window.history.go(-1);
	});
};

exports.default = loadPage;
  })();
});

require.register("swup/lib/modules/off.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "swup");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
var off = function off(event, handler) {
	var _this = this;

	if (event != null) {
		if (handler != null) {
			if (this._handlers[event] && this._handlers[event].filter(function (savedHandler) {
				return savedHandler === handler;
			}).length) {
				var toRemove = this._handlers[event].filter(function (savedHandler) {
					return savedHandler === handler;
				})[0];
				var index = this._handlers[event].indexOf(toRemove);
				if (index > -1) {
					this._handlers[event].splice(index, 1);
				}
			} else {
				console.warn("Handler for event '" + event + "' no found.");
			}
		} else {
			this._handlers[event] = [];
		}
	} else {
		Object.keys(this._handlers).forEach(function (keys) {
			_this._handlers[keys] = [];
		});
	}
};

exports.default = off;
  })();
});

require.register("swup/lib/modules/on.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "swup");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
var on = function on(event, handler) {
	if (this._handlers[event]) {
		this._handlers[event].push(handler);
	} else {
		console.warn("Unsupported event " + event + ".");
	}
};

exports.default = on;
  })();
});

require.register("swup/lib/modules/plugins.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "swup");
  (function() {
    'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
var use = exports.use = function use(plugin) {
	if (!plugin.isSwupPlugin) {
		console.warn('Not swup plugin instance ' + plugin + '.');
		return;
	}

	this.plugins.push(plugin);
	plugin.swup = this;
	if (typeof plugin._beforeMount === 'function') {
		plugin._beforeMount();
	}
	plugin.mount();

	return this.plugins;
};

var unuse = exports.unuse = function unuse(plugin) {
	var pluginReference = void 0;

	if (typeof plugin === 'string') {
		pluginReference = this.plugins.find(function (p) {
			return plugin === p.name;
		});
	} else {
		pluginReference = plugin;
	}

	if (!pluginReference) {
		console.warn('No such plugin.');
		return;
	}

	pluginReference.unmount();

	if (typeof pluginReference._afterUnmount === 'function') {
		pluginReference._afterUnmount();
	}

	var index = this.plugins.indexOf(pluginReference);
	this.plugins.splice(index, 1);

	return this.plugins;
};

var findPlugin = exports.findPlugin = function findPlugin(pluginName) {
	return this.plugins.find(function (p) {
		return pluginName === p.name;
	});
};
  })();
});

require.register("swup/lib/modules/renderPage.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "swup");
  (function() {
    'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _utils = require('../utils');

var _helpers = require('../helpers');

var renderPage = function renderPage(page, popstate) {
	var _this = this;

	document.documentElement.classList.remove('is-leaving');

	// replace state in case the url was redirected
	var link = new _helpers.Link(page.responseURL);
	if (window.location.pathname !== link.getPath()) {
		window.history.replaceState({
			url: link.getPath(),
			random: Math.random(),
			source: 'swup'
		}, document.title, link.getPath());

		// save new record for redirected url
		this.cache.cacheUrl(_extends({}, page, { url: link.getPath() }));
	}

	// only add for non-popstate transitions
	if (!popstate || this.options.animateHistoryBrowsing) {
		document.documentElement.classList.add('is-rendering');
	}

	this.triggerEvent('willReplaceContent', popstate);

	// replace blocks
	for (var i = 0; i < page.blocks.length; i++) {
		document.body.querySelector('[data-swup="' + i + '"]').outerHTML = page.blocks[i];
	}

	// set title
	document.title = page.title;

	this.triggerEvent('contentReplaced', popstate);
	this.triggerEvent('pageView', popstate);

	// empty cache if it's disabled (because pages could be preloaded and stuff)
	if (!this.options.cache) {
		this.cache.empty();
	}

	// start animation IN
	setTimeout(function () {
		if (!popstate || _this.options.animateHistoryBrowsing) {
			_this.triggerEvent('animationInStart');
			document.documentElement.classList.remove('is-animating');
		}
	}, 10);

	// handle end of animation
	if (!popstate || this.options.animateHistoryBrowsing) {
		var animationPromises = this.getAnimationPromises('in');
		Promise.all(animationPromises).then(function () {
			_this.triggerEvent('animationInDone');
			_this.triggerEvent('transitionEnd', popstate);
			// remove "to-{page}" classes
			document.documentElement.className.split(' ').forEach(function (classItem) {
				if (new RegExp('^to-').test(classItem) || classItem === 'is-changing' || classItem === 'is-rendering' || classItem === 'is-popstate') {
					document.documentElement.classList.remove(classItem);
				}
			});
		});
	} else {
		this.triggerEvent('transitionEnd', popstate);
	}

	// reset scroll-to element
	this.scrollToElement = null;
};

exports.default = renderPage;
  })();
});

require.register("swup/lib/modules/triggerEvent.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "swup");
  (function() {
    'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
var triggerEvent = function triggerEvent(eventName, originalEvent) {
	// call saved handlers with "on" method and pass originalEvent object if available
	this._handlers[eventName].forEach(function (handler) {
		try {
			handler(originalEvent);
		} catch (error) {
			console.error(error);
		}
	});

	// trigger event on document with prefix "swup:"
	var event = new CustomEvent('swup:' + eventName, { detail: eventName });
	document.dispatchEvent(event);
};

exports.default = triggerEvent;
  })();
});

require.register("swup/lib/modules/updateTransition.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "swup");
  (function() {
    "use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
var updateTransition = function updateTransition(from, to, custom) {
	// transition routes
	this.transition = {
		from: from,
		to: to,
		custom: custom
	};
};

exports.default = updateTransition;
  })();
});

require.register("swup/lib/utils/index.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "swup");
  (function() {
    'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
var query = exports.query = function query(selector) {
	var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;

	if (typeof selector !== 'string') {
		return selector;
	}

	return context.querySelector(selector);
};

var queryAll = exports.queryAll = function queryAll(selector) {
	var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;

	if (typeof selector !== 'string') {
		return selector;
	}

	return Array.prototype.slice.call(context.querySelectorAll(selector));
};
  })();
});
require.alias("@bikeshaving/crank/cjs/index.js", "@bikeshaving/crank");
require.alias("@swup/plugin/lib/index.js", "@swup/plugin");
require.alias("@swup/progress-plugin/lib/index.js", "@swup/progress-plugin");
require.alias("@swup/scroll-plugin/lib/index.js", "@swup/scroll-plugin");
require.alias("delegate/src/delegate.js", "delegate");
require.alias("regenerator-runtime/runtime.js", "regenerator-runtime");
require.alias("scrl/lib/index.js", "scrl");
require.alias("swup/lib/index.js", "swup");require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');


//# sourceMappingURL=vendor.js.map