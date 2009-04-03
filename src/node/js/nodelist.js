    /**
     * The NodeList Utility provides a DOM-like interface for interacting with DOM nodes.
     * @module node
     * @submodule node-list
     */    

    /**
     * The NodeList class provides a wrapper for manipulating DOM NodeLists.
     * NodeList properties can be accessed via the set/get methods.
     * Use Y.get() to retrieve NodeList instances.
     *
     * <strong>NOTE:</strong> NodeList properties are accessed using
     * the <code>set</code> and <code>get</code> methods.
     *
     * @class NodeList
     * @constructor
     */

/* Array._diff
    from: http://www.deepakg.com/prog/2009/01/ruby-like-difference-between-two-arrays-in-javascript/
*/
var DIFF_DELIM = '__::__';
Y.Array._diff = function(a, b) {
    var strA = DIFF_DELIM + a.join(DIFF_DELIM + DIFF_DELIM) + DIFF_DELIM,
        strB = DIFF_DELIM +  b.join(DIFF_DELIM + '|' + DIFF_DELIM) + DIFF_DELIM,
        reB = Y.DOM._getRegExp('(' + strB + ')', 'g'),
        reStart = Y.DOM._getRegExp('^' + DIFF_DELIM),
        reEnd = Y.DOM._getRegExp(DIFF_DELIM + '$'),
        strDiff = strA.replace(reB,'').replace(reStart, '').replace(reEnd, ''),
        diff = strDiff.split(DIFF_DELIM + DIFF_DELIM);

    return diff;
};

Y.Array.diff = function(a, b) {
    return {
        added: Y.Array._diff(b, a),
        removed: Y.Array._diff(a, b)
    }; 
};

var g_nodes = [],
    g_slice = Array.prototype.slice,

    NodeList = function(config) {
        NodeList.superclass.constructor.apply(this, arguments);
    };


NodeList.NAME = 'NodeList';

NodeList.ATTRS = {
    style: {
        value: {}
    }
};

NodeList._instances = [];

NodeList.each = function(instance, fn, context) {
    var nodes = g_nodes[instance._yuid];
    if (nodes && nodes.length) {
        Y.Array.each(nodes, fn, context || instance);
    } else {
        Y.log('no nodes bound to ' + this, 'warn', 'NodeList');
    }
};

// call with instance context
NodeList.DEFAULT_SETTER = function(attr, val) {
    NodeList.each(this, function(node) {
    var instance = Y.Node._instances[node._yuid];
        // TODO: use node.set if instance exists
        if (instance) {
            instance.set(attr, val);
        } else {
            node[attr] = val;
        }
    });
};

// call with instance context
NodeList.DEFAULT_GETTER = function(attr) {
    var ret = [],
        instance,
        val;

    // TODO: use node.get if instance exists
    NodeList.each(this, function(node) {
        instance = Y.Node._instances[node._yuid];
        if (instance) {
            val = instance.get(attr);
        } else {
            val = node[attr];
        }
        ret[ret.length] = val;
    });
    return ret;
};

Y.extend(NodeList, Y.Base);

Y.mix(NodeList.prototype, {
    initializer: function(config) {
        var doc = config.doc || Y.config.doc,
            nodes = config.nodes || [];

        if (typeof nodes === 'string') {
            this._query = nodes;
            nodes = Y.Selector.query(nodes, doc);
        }

        NodeList._instances[this._yuid] = this;
        g_nodes[this._yuid] = nodes;
    },

    // TODO: move to Attribute
    hasAttr: function(attr) {
        return this._conf.get(attr);  
    },

    get: function(attr) {
        if (!this.hasAttr(attr)) {
            this._addDOMAttr(attr);
        }

        return NodeList.superclass.constructor.prototype.get.apply(this, arguments);
    },

    set: function(attr, val) {
        if (!this.hasAttr(attr)) {
            this._addDOMAttr(attr);
        }

        NodeList.superclass.constructor.prototype.set.apply(this, arguments);
    },

    on: function(type, fn, context, arg) {
        var args = g_slice.call(arguments, 0),
            ret;

        args.splice(2, 0, g_nodes[this._yuid]);
        if (Node.DOM_EVENTS[type]) {
            Y.Event.attach.apply(Y.Event, args);
        }

        return NodeList.superclass.constructor.prototype.on.apply(this, arguments);
    },

    destructor: function() {
        g_nodes[this._yuid] = [];
        delete NodeList._instances[this._yuid];
    },

    refresh: function() {
        var doc;
        if (this._query) {
            if (g_nodes[this._yuid] &&
                g_nodes[this._yuid][0] && 
                g_nodes[this._yuid][0].ownerDocument) {
                doc = g_nodes[this._yuid][0].ownerDocument;
            }

            g_nodes[this._yuid] = Y.Selector.query(this._query, doc || Y.config.doc);        
        }
    },

    size: function() {
        return g_nodes[this._yuid].length;
    },

    toString: function() {
        var str = '',
            errorMsg = this._yuid + ': not bound to any nodes',
            nodes = g_nodes[this._yuid] || {};

        if (nodes) {
            var node = nodes[0];
            str += node[NODE_NAME];
            if (node.id) {
                str += '#' + node.id; 
            }

            if (node.className) {
                str += '.' + node.className.replace(' ', '.'); 
            }

            if (nodes.length > 1) {
                str += '...[' + nodes.length + ' items]';
            }
        }
        return str || errorMsg;
    },

    _addDOMAttr: function(attr) {
        // TODO: block non-dom attributes/properties
        this.addAttr(attr, {
            getter: function() {
                return NodeList.DEFAULT_GETTER.call(this, attr);
            },

            setter: function(val) {
                NodeList.DEFAULT_SETTER.call(this, attr, val);
            },
            //value: val
        });
    }
}, true);

Y.NodeList = NodeList;
Y.all = function(nodes, doc, restrict) {
    var nodelist = new NodeList({
        nodes: nodes,
        doc: doc,
        restrict: restrict
    });

    // zero-length result returns null
    return nodelist.size() ? nodelist : null;
};