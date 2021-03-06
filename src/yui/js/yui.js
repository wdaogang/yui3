(function() {

    var _instances = {}, 
        _startTime = new Date().getTime(), 
        p, 
        i,

        add = function () {
            if (window.addEventListener) {
                return function(el, type, fn, capture) {
                    el.addEventListener(type, fn, (!!capture));
                };
            } else if (window.attachEvent) {
                return function(el, type, fn) {
                    el.attachEvent("on" + type, fn);
                };
            } else {
                return function(){};
            }
        }(),

        remove = function() {
            if (window.removeEventListener) {
                return function (el, type, fn, capture) {
                    el.removeEventListener(type, fn, !!capture);
                };
            } else if (window.detachEvent) {
                return function (el, type, fn) {
                    el.detachEvent("on" + type, fn);
                };
            } else {
                return function(){};
            }
        }(),

        globalListener = function() {
            YUI.Env.windowLoaded = true;
            YUI.Env.DOMReady = true;
            remove(window, 'load', globalListener);
        },

// @TODO: this needs to be created at build time from module metadata

        _APPLY_TO_WHITE_LIST = {
            'io.xdrReady': 1,
            'io.start': 1,
            'io.success': 1,
            'io.failure': 1
        },

        SLICE = Array.prototype.slice;
        
// reduce to one or the other
if (typeof YUI === 'undefined' || !YUI) {

    /**
     * The YUI global namespace object.  If YUI is already defined, the
     * existing YUI object will not be overwritten so that defined
     * namespaces are preserved.  
     *
     * @class YUI
     * @constructor
     * @global
     * @uses EventTarget
     * @param o Optional configuration object.  This object is stored
     * in YUI.config.  See config for the list of supported properties.
     */

    /*global YUI*/
    // Make a function, disallow direct instantiation
    YUI = function(o) {

        var Y = this;

        // Allow instantiation without the new operator
        if (!(Y instanceof YUI)) {
            return new YUI(o);
        } else {
            // set up the core environment
            Y._init(o);

            // bind the specified additional modules for this instance
            Y._setup();

            return Y;
        }
    };
}

// The prototype contains the functions that are required to allow the external
// modules to be registered and for the instance to be initialized.
YUI.prototype = {

    /**
     * Initialize this YUI instance
     * @param o config options
     * @private
     */
    _init: function(o) {

        o = o || {};

        // find targeted window/frame
        // @TODO create facades
        var v = '@VERSION@', Y = this;
        o.win = o.win || window || {};
        o.win = o.win.contentWindow || o.win;
        o.doc = o.win.document;
        o.debug = ('debug' in o) ? o.debug : true;
        o.useBrowserConsole = ('useBrowserConsole' in o) ? o.useBrowserConsole : true;
        o.throwFail = ('throwFail' in o) ? o.throwFail : true;
    
        // add a reference to o for anything that needs it
        // before _setup is called.
        Y.config = o;

        Y.Env = {
            // @todo expand the new module metadata
            mods: {},
            _idx: 0,
            _used: {},
            _attached: {},
            _yidx: 0,
            _uidx: 0,
            _loaded: {}
        };


        if (v.indexOf('@') > -1) {
            v = 'test';
        }

        Y.version = v;

        Y.Env._loaded[v] = {};

        if (YUI.Env) {
            Y.Env._yidx = (++YUI.Env._yidx);
            Y.Env._guidp = ('yui_' + this.version + '-' + Y.Env._yidx + '-' + _startTime).replace(/\./g, '_');
            Y.id = Y.stamp(Y);
            _instances[Y.id] = Y;
        }

        Y.constructor = YUI;


        // this.log(this.id + ') init ');
    },
    
    /**
     * Finishes the instance setup. Attaches whatever modules were defined
     * when the yui modules was registered.
     * @method _setup
     * @private
     */
    _setup: function(o) {
        this.use("yui-base");
        // @TODO eval the need to copy the config
        this.config = this.merge(this.config);
    },

    /**
     * Executes a method on a YUI instance with
     * the specified id if the specified method is whitelisted.
     * @method applyTo
     * @param id {string} the YUI instance id
     * @param method {string} the name of the method to exectute.
     * Ex: 'Object.keys'
     * @param args {Array} the arguments to apply to the method
     * @return {object} the return value from the applied method or null
     */
    applyTo: function(id, method, args) {

        if (!(method in _APPLY_TO_WHITE_LIST)) {
            this.error(method + ': applyTo not allowed');
            return null;
        }

        var instance = _instances[id], nest, m, i;

        if (instance) {

            nest = method.split('.'); 
            m = instance;

            for (i=0; i<nest.length; i=i+1) {

                m = m[nest[i]];

                if (!m) {
                    this.error('applyTo not found: ' + method);
                }
            }

            return m.apply(instance, args);
        }

        return null;
    }, 

    /**
     * Register a module
     * @method add
     * @param name {string} module name
     * @param fn {Function} entry point into the module that
     * is used to bind module to the YUI instance
     * @param version {string} version string
     * @param details optional config data: 
     * requires   - features that should be present before loading
     * optional   - optional features that should be present if load optional defined
     * use  - features that should be attached automatically
     * skinnable  -
     * rollup
     * omit - features that should not be loaded if this module is present
     * @return {YUI} the YUI instance
     *
     */
    add: function(name, fn, version, details) {

        // this.log('Adding a new component ' + name);

        // @todo expand this to include version mapping
        // @todo may want to restore the build property
        // @todo fire moduleAvailable event
        
        // if (this.Lang.isFunction(fn)) {

            YUI.Env.mods[name] = {
                name: name, 
                fn: fn,
                version: version,
                details: details || {}
            };

        // } else {
        //     
        //     var c = Y.config;
        //     c.modules = c.modules || {};
        //     c.modules[name] = c.modules[name] || fn;

        // }

        return this; // chain support
    },

    _attach: function(r, fromLoader) {

        var mods = YUI.Env.mods,
            attached = this.Env._attached,
            i, l = r.length, name, m, d, req, use;

        for (i=0; i<l; i=i+1) {

            name = r[i]; 
            m    = mods[name];

            if (!attached[name] && m) {

                attached[name] = true;

                d   = m.details; 
                req = d.requires; 
                use = d.use;

                if (req) {
                    this._attach(this.Array(req));
                }

                // this.log('attaching ' + name, 'info', 'yui');

                if (m.fn) {
                    m.fn(this);
                }

                if (use) {
                    this._attach(this.Array(use));
                }
            }
        }

    },

    /**
     * Bind a module to a YUI instance
     * @param modules* {string} 1-n modules to bind (uses arguments array)
     * @param *callback {function} callback function executed when 
     * the instance has the required functionality.  If included, it
     * must be the last parameter.
     *
     * @TODO 
     * Implement versioning?  loader can load different versions?
     * Should sub-modules/plugins be normal modules, or do
     * we add syntax for specifying these?
     *
     * YUI().use('dragdrop')
     * YUI().use('dragdrop:2.4.0'); // specific version
     * YUI().use('dragdrop:2.4.0-'); // at least this version
     * YUI().use('dragdrop:2.4.0-2.9999.9999'); // version range
     * YUI().use('*'); // use all available modules
     * YUI().use('lang+dump+substitute'); // use lang and some plugins
     * YUI().use('lang+*'); // use lang and all known plugins
     *
     *
     * @return {YUI} the YUI instance
     */
    use: function() {

        if (this._loading) {
            this._useQueue.add(SLICE.call(arguments, 0));
            return this;
        }

        var Y = this, 
            a=SLICE.call(arguments, 0), 
            mods = YUI.Env.mods, 
            used = Y.Env._used,
            loader, 
            firstArg = a[0], 
            dynamic = false,
            callback = a[a.length-1],
            k, i, l, missing = [], 
            r = [], 
            f = function(name) {

                // only attach a module once
                if (used[name]) {
                    // Y.log(name + ' already used', 'info', 'yui');
                    return;
                }

                var m = mods[name], j, req, use;

                if (m) {

                    // Y.log('USING ' + name, 'info', 'yui');

                    used[name] = true;

                    req = m.details.requires;
                    use = m.details.use;
                } else {

                    // CSS files don't register themselves, see if it has been loaded
                    if (!YUI.Env._loaded[Y.version][name]) {
                        Y.log('module not found: ' + name, 'info', 'yui');
                        missing.push(name);
                    } else {
                        // probably css
                        // Y.log('module not found BUT HAS BEEN LOADED: ' + name, 'info', 'yui');
                        used[name] = true;
                    }
                }

                // make sure requirements are attached
                if (req) {
                    if (Y.Lang.isString(req)) {
                        f(req);
                    } else {
                        for (j = 0; j < req.length; j = j + 1) {
                            // Y.log('using module\'s requirements: ' + name, 'info', 'yui');
                            f(req[j]);
                        }
                    }
                }

                // add this module to full list of things to attach
                // Y.log('adding to requires list: ' + name);
                r.push(name);

            },

            onComplete = function(fromLoader) {

                // Y.log('Use complete');

                fromLoader = fromLoader || {
                    success: true,
                    msg: 'not dynamic'
                };

                if (Y.Env._callback) {

                    var cb = Y.Env._callback;
                    Y.Env._callback = null;
                    cb(Y, fromLoader);
                }

                if (Y.fire) {
                    Y.fire('yui:load', Y, fromLoader);
                }

                // process queued use requests as long until done 
                // or dynamic load happens again.
                this._loading = false;
                while (this._useQueue && this._useQueue.size() && !this._loading) {
                    Y.use.apply(Y, this._useQueue.next());
                }
            };

        // Y.log(Y.id + ': use called: ' + a + ' :: ' + callback);

        // The last argument supplied to use can be a load complete callback
        if (typeof callback === 'function') {
            a.pop();
            Y.Env._callback = callback;
        } else {
            callback = null;
        }

        // YUI().use('*'); // bind everything available
        if (firstArg === "*") {
            a = [];
            for (k in mods) {
                if (mods.hasOwnProperty(k)) {
                    a.push(k);
                }
            }

            // Y.log('Use *: ' + a);

            return Y.use.apply(Y, a);

        }
        
        // Y.log('loader before: ' + a.join(','));

        // use loader to expand dependencies and sort the 
        // requirements if it is available.
        if (Y.Loader) {
            dynamic = true;
            this._useQueue = this._useQueue || new Y.Queue();
            loader = new Y.Loader(Y.config);
            loader.require(a);
            loader.ignoreRegistered = true;
            loader.allowRollup = false;
            loader.calculate();
            a = loader.sorted;
        }

        // Y.log('loader after: ' + a.join(','));

        l = a.length;

        // process each requirement and any additional requirements 
        // the module metadata specifies
        for (i=0; i<l; i=i+1) {
            f(a[i]);
        }

        // Y.log('all reqs: ' + r + ' --- missing: ' + missing + ', l: ' + l + ', ' + r[0]);

        // dynamic load
        if (Y.Loader && missing.length) {
            Y.log('Attempting to dynamically load the missing modules ' + missing, 'info', 'yui');
            this._loading = true;
            loader = new Y.Loader(Y.config);
            loader.onSuccess = onComplete;
            loader.onFailure = onComplete;
            loader.onTimeout = onComplete;
            loader.attaching = a;
            loader.require(missing);
            loader.insert();
        } else {
            Y._attach(r);
            onComplete();
        }

        return Y; // chain support var yui = YUI().use('dragdrop');
    },


    /**
     * Returns the namespace specified and creates it if it doesn't exist
     * <pre>
     * YUI.namespace("property.package");
     * YUI.namespace("YAHOO.property.package");
     * </pre>
     * Either of the above would create YUI.property, then
     * YUI.property.package (YAHOO is scrubbed out, this is
     * to remain compatible with YUI2)
     *
     * Be careful when naming packages. Reserved words may work in some browsers
     * and not others. For instance, the following will fail in Safari:
     * <pre>
     * YUI.namespace("really.long.nested.namespace");
     * </pre>
     * This fails because "long" is a future reserved word in ECMAScript
     *
     * @method namespace
     * @param  {string*} arguments 1-n namespaces to create 
     * @return {object}  A reference to the last namespace object created
     */
    namespace: function() {
        var a=arguments, o=null, i, j, d;
        for (i=0; i<a.length; i=i+1) {
            d = ("" + a[i]).split(".");
            o = this;
            for (j=(d[0] == "YAHOO") ? 1 : 0; j<d.length; j=j+1) {
                o[d[j]] = o[d[j]] || {};
                o = o[d[j]];
            }
        }
        return o;
    },

    // this is replaced if the log module is included
    log: function() {

    },

    /**
     * Report an error.  The reporting mechanism is controled by
     * the 'throwFail' configuration attribute.  If throwFail is
     * not specified, the message is written to the Logger, otherwise
     * a JS error is thrown
     * @method error
     * @param msg {string} the error message
     * @param e {Error} Optional JS error that was caught.  If supplied
     * and throwFail is specified, this error will be re-thrown.
     * @return {YUI} this YUI instance
     */
    error: function(msg, e) {
        if (this.config.throwFail) {
            throw (e || new Error(msg)); 
        } else {
            this.message(msg, "error"); // don't scrub this one
        }

        return this;
    },

    /**
     * Generate an id that is unique among all YUI instances
     * @method guid
     * @param pre {string} optional guid prefix
     * @return {string} the guid
     */
    guid: function(pre) {
        var id =  this.Env._guidp + (++this.Env._uidx);
        return (pre) ? (pre + id) : id;
    },

    /**
     * Returns a guid associated with an object.  If the object
     * does not have one, a new one is created unless readOnly
     * is specified.
     * @method stamp
     * @param o The object to stamp
     * @param readOnly {boolean} if true, a valid guid will only
     * be returned if the object has one assigned to it.
     * @return {string} The object's guid or null
     */
    stamp: function(o, readOnly) {

        if (!o) {
            return o;
        }

        var uid = (typeof o === 'string') ? o : o._yuid;

        if (!uid) {
            uid = this.guid();
            if (!readOnly) {
                try {
                    o._yuid = uid;
                } catch(e) {
                    uid = null;
                }
            }
        }

        return uid;
    }
};

// Give the YUI global the same properties as an instance.
// This makes it so that the YUI global can be used like the YAHOO
// global was used prior to 3.x.  More importantly, the YUI global
// provides global metadata, so env needs to be configured.
// @TODO review

    p = YUI.prototype;

    // inheritance utilities are not available yet
    for (i in p) {
        if (true) {
            YUI[i] = p[i];
        }
    }

    // set up the environment
    YUI._init();

    // add a window load event at load time so we can capture
    // the case where it fires before dynamic loading is
    // complete.
    add(window, 'load', globalListener);

    YUI.Env.add = add;
    YUI.Env.remove = remove;

    /*
     * Subscribe to an event.  The signature differs depending on the
     * type of event you are attaching to.
     * @method on 
     * @param type {string|function|object} The type of the event.  If
     * this is a function, this is dispatched to the aop system.  If an
     * object, it is parsed for multiple subsription definitions
     * @param fn {Function} The callback
     * @param elspec {any} DOM element(s), selector string(s), and or
     * Node ref(s) to attach DOM related events to (only applies to
     * DOM events).
     * @param
     * @return the event target or a detach handle per 'chain' config
     */

})();

/**
 * The config object contains all of the configuration options for
 * the YUI instance.  This object is supplied by the implementer 
 * when instantiating a YUI instance.  Some properties have default
 * values if they are not supplied by the implementer.
 * @class config
 * @static
 */

/**
 * Turn debug statements on or off
 * @property debug
 * @type boolean
 * @default true
 */

/**
 * Log to the browser console if debug is on and the browser has a
 * supported console
 * @property useBrowserConsole
 * @type boolean
 * @default true
 */

/**
 * A hash of log sources that should be logged.  If specified, only log messages from these sources will be logged.
 * @property logInclude
 * @type object
 */

/**
 * A hash of log sources that should be not be logged.  If specified, all sources are logged if not on this list.</li>
 * @property logExclude
 * @type object
 */

/**
 * Set to true if the yui seed file was dynamically loaded in 
 * order to bootstrap components relying on the window load event 
 * and onDOMReady.
 * @property injected
 * @type object
 */

/**
 * If throwFail is set, Y.fail will generate or re-throw a JS Error.  Otherwise the failure is logged.
 * @property throwFail
 * @type boolean
 * @default true
 */

/**
 * The window/frame that this instance should operate in
 * @property win
 * @type Window
 * @default the window hosting YUI
 */

/**
 * The document associated with the 'win' configuration
 * @property doc
 * @type Document
 * @default the document hosting YUI
 */

/**
 * A list of modules that defines the YUI core (overrides the default)</li>
 * @property core
 * @type string[]
 */

/**
 * The default date format
 * @property dateFormat
 * @type string
 */

/**
 * The default locale
 * @property locale
 * @type string
 */

/**
 * The default interval when polling in milliseconds.
 * @property pollInterval
 * @type int
 * @default 20
 */

/**
 * The number of dynamic nodes to insert by default before
 * automatically removing them.  This applies to script nodes
 * because remove the node will not make the evaluated script
 * unavailable.  Dynamic CSS is not auto purged, because removing
 * a linked style sheet will also remove the style definitions.
 * @property purgethreshold
 * @type int
 * @default 20
 */

/**
 * The default interval when polling in milliseconds.
 * @property windowResizeDelay
 * @type int
 * @default 40
 */

/**
 * Base directory for dynamic loading
 * @property base
 * @type string
 */

/**
 * The secure base dir (not implemented)
 * For dynamic loading.
 * @property secureBase
 * @type string
 */

/**
 * The YUI combo service base dir. Ex: http://yui.yahooapis.com/combo?
 * For dynamic loading.
 * @property comboBase
 * @type string
 */

/**
 * The root path to prepend to module names for the combo service. Ex: 3.0.0b1/build/
 * For dynamic loading.
 * @property root
 * @type string
 */

/**
 * A filter to apply to result urls.  This filter will modify the default
 * path for all modules.  The default path for the YUI library is the
 * minified version of the files (e.g., event-min.js).  The filter property
 * can be a predefined filter or a custom filter.  The valid predefined 
 * filters are:
 * <dl>
 *  <dt>DEBUG</dt>
 *  <dd>Selects the debug versions of the library (e.g., event-debug.js).
 *      This option will automatically include the Logger widget</dd>
 *  <dt>RAW</dt>
 *  <dd>Selects the non-minified version of the library (e.g., event.js).</dd>
 * </dl>
 * You can also define a custom filter, which must be an object literal 
 * containing a search expression and a replace string:
 * <pre>
 *  myFilter: &#123; 
 *      'searchExp': "-min\\.js", 
 *      'replaceStr': "-debug.js"
 *  &#125;
 * </pre>
 * For dynamic loading.
 * @property filter
 * @type string|object
 */

/**
 * Hash of per-component filter specification.  If specified for a given component, 
 * this overrides the filter config
 * For dynamic loading.
 * @property filters
 * @type object
 */

/**
 * Use the YUI combo service to reduce the number of http connections 
 * required to load your dependencies
 * For dynamic loading.
 * @property combine
 * @type boolean
 * @default true if 'base' is not supplied, false if it is.
 */

/**
 * A list of modules that should never be dynamically loaded
 * @property ignore
 * @type string[]
 */

/**
 * A list of modules that should always be loaded when required, even if already 
 * present on the page.
 * @property force
 * @type string[]
 */

/**
 * Node or id for a node that should be used as the insertion point for new nodes
 * For dynamic loading.
 * @property insertBefore
 * @type string
 */

/**
 * charset for dynamic nodes
 * @property charset
 * @type string
 */

/**
 * Object literal containing attributes to add to dynamically loaded script nodes.
 * @property jsAttributes
 * @type string
 */

/**
 * Object literal containing attributes to add to dynamically loaded link nodes.
 * @property cssAttributes
 * @type string
 */

/**
 * Number of milliseconds before a timeout occurs when dynamically 
 * loading nodes. If not set, there is no timeout.
 * @property timeout
 * @type int
 */

/**
 * Callback for the 'CSSComplete' event.  When dynamically loading YUI 
 * components with CSS, this property fires when the CSS is finished
 * loading but script loading is still ongoing.  This provides an
 * opportunity to enhance the presentation of a loading page a little
 * bit before the entire loading process is done.
 * @property onCSS
 * @type function
 */

/**
 * A list of module definitions to add to the list of YUI components.  
 * These components can then be dynamically loaded side by side with
 * YUI via the use() method.See Loader.addModule for the supported
 * module metadata.
 * @property modules
 * @type function
 */
 
