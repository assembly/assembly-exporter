// # AssemblyExporter for Adobe Illustrator
// 
// AssemblyExporter helps you organize and mass export assets directly from Adobe Illustrator mockups.
// 
// ## Acknowledgments
// 
// AssemblyExport is a tagged reimagination of the New York Times MultiExport (Copyright 2011) by Matthew Ericson.
// 
// It has been rewritten from scratch to handle Assembly's need to better export assets directly from mockups.
// 
// We hope it saves you as much time as it saves us.
// 
// ## Installation
// 
// ## Compiliation
// 
// ## Usage
// 
// ### Export  Modes
// 
// #### All Artboards
// 
// Exports all artboards, plain and simple.
// 
// #### Moneyboards
// 
// Exports all artboards prefaced with $ (for example $HomePage).
// 
// Moneyboard are an easy way for you to designate and mass export full mockups while ignoring individual assets.
// 
// They're called moneyboard because they're the ones that wow the clients and get you paid.
// 
// #### Tagged Artboards
// 
//     Underscore.js 1.3.3
//     (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore may be freely distributed under the MIT license.
//     Portions of Underscore are inspired or borrowed from Prototype,
//     Oliver Steele's Functional, and John Resig's Micro-Templating.
//     For all details and documentation:
//     http://documentcloud.github.com/underscore

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var push             = ArrayProto.push,
      slice            = ArrayProto.slice,
      unshift          = ArrayProto.unshift,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) { return new wrapper(obj); };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root['_'] = _;
  }

  // Current version.
  _.VERSION = '1.3.3';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    return results;
  };

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError('Reduce of empty array with no initial value');
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var reversed = _.toArray(obj).reverse();
    if (context && !initial) iterator = _.bind(iterator, context);
    return initial ? _.reduce(reversed, iterator, memo, context) : _.reduce(reversed, iterator);
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    each(obj, function(value, index, list) {
      if (!iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if a given value is included in the array or object using `===`.
  // Aliased as `contains`.
  _.include = _.contains = function(obj, target) {
    var found = false;
    if (obj == null) return found;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    found = any(obj, function(value) {
      return value === target;
    });
    return found;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    return _.map(obj, function(value) {
      return (_.isFunction(method) ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See: https://bugs.webkit.org/show_bug.cgi?id=80797
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = Math.floor(Math.random() * ++index);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, val, context) {
    var iterator = lookupIterator(obj, val);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      if (a === void 0) return 1;
      if (b === void 0) return -1;
      return a < b ? -1 : a > b ? 1 : 0;
    }), 'value');
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(obj, val) {
    return _.isFunction(val) ? val : function(obj) { return obj[val]; };
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(obj, val, behavior) {
    var result = {};
    var iterator = lookupIterator(obj, val);
    each(obj, function(value, index) {
      var key = iterator(value, index);
      behavior(result, key, value);
    });
    return result;
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, val) {
    return group(obj, val, function(result, key, value) {
      (result[key] || (result[key] = [])).push(value);
    });
  };

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = function(obj, val) {
    return group(obj, val, function(result, key, value) {
      result[key] || (result[key] = 0);
      result[key]++;
    });
  };

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator) {
    iterator || (iterator = _.identity);
    var value = iterator(obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >> 1;
      iterator(array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(obj) {
    if (!obj)                                 return [];
    if (_.isArray(obj) || _.isArguments(obj)) return slice.call(obj);
    if (_.isFunction(obj.toArray))            return obj.toArray();
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, function(value){ return !!value; });
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    each(input, function(value) {
      if (_.isArray(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator) {
    var initial = iterator ? _.map(array, iterator) : array;
    var results = [];
    _.reduce(initial, function(memo, value, index) {
      if (isSorted ? (_.last(memo) !== value || !memo.length) : !_.include(memo, value)) {
        memo.push(value);
        results.push(array[index]);
      }
      return memo;
    }, []);
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, []));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(slice.call(arguments, 1), true, []);
    return _.filter(array, function(value){ return !_.include(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(args, "" + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, l = list.length; i < l; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i, l;
    if (isSorted) {
      i = _.sortedIndex(array, item);
      return array[i] === item ? i : -1;
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
    for (i = 0, l = array.length; i < l; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item) {
    if (array == null) return -1;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);
    var i = array.length;
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Binding with arguments is also known as `curry`.
  // Delegates to **ECMAScript 5**'s native `Function.bind` if available.
  // We check for `func.bind` first, to fail fast when `func` is undefined.
  _.bind = function bind(func, context) {
    var bound, args;
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length == 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    var context, args, timeout, throttling, more, result;
    var whenDone = _.debounce(function(){ more = throttling = false; }, wait);
    return function() {
      context = this; args = arguments;
      var later = function() {
        timeout = null;
        if (more) func.apply(context, args);
        whenDone();
      };
      if (!timeout) timeout = setTimeout(later, wait);
      if (throttling) {
        more = true;
      } else {
        throttling = true;
        result = func.apply(context, args);
      }
      whenDone();
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func].concat(slice.call(arguments, 0));
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    if (times <= 0) return func();
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    return _.map(obj, _.identity);
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    return _.map(obj, function(value, key) {
      return [key, value];
    });
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    return _.reduce(obj, function(memo, value, key) {
      memo[value] = key;
      return memo;
    }, {});
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = _.flatten(slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = _.flatten(slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.include(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (obj[prop] == null) obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, stack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a._chain) a = a._wrapped;
    if (b._chain) b = b._wrapped;
    // Invoke a custom `isEqual` method if one is provided.
    if (a.isEqual && _.isFunction(a.isEqual)) return a.isEqual(b);
    if (b.isEqual && _.isFunction(b.isEqual)) return b.isEqual(a);
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = stack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (stack[length] == a) return true;
    }
    // Add the first object to the stack of traversed objects.
    stack.push(a);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          // Ensure commutative equality for sparse arrays.
          if (!(result = size in a == size in b && eq(a[size], b[size], stack))) break;
        }
      }
    } else {
      // Objects with different constructors are not equivalent.
      if ('constructor' in a != 'constructor' in b || a.constructor != b.constructor) return false;
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], stack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    stack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType == 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return _.isNumber(obj) && isFinite(obj);
  };

  // Is the given value `NaN`?
  _.isNaN = function(obj) {
    // `NaN` is the only value for which `===` is not reflexive.
    return obj !== obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    for (var i = 0; i < n; i++) iterator.call(context, i);
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    return min + (0 | Math.random() * (max - min + 1));
  };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named property is a function then invoke it;
  // otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return null;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object, ensuring that
  // they're correctly added to the OOP wrapper as well.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      addToWrapper(name, _[name] = obj[name]);
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = idCounter++;
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /.^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    '\\':   '\\',
    "'":    "'",
    r:      '\r',
    n:      '\n',
    t:      '\t',
    u2028:  '\u2028',
    u2029:  '\u2029'
  };

  for (var key in escapes) escapes[escapes[key]] = key;
  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
  var unescaper = /\\(\\|'|r|n|t|u2028|u2029)/g;

  // Within an interpolation, evaluation, or escaping, remove HTML escaping
  // that had been previously added.
  var unescape = function(code) {
    return code.replace(unescaper, function(match, escape) {
      return escapes[escape];
    });
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    settings = _.defaults(settings || {}, _.templateSettings);

    // Compile the template source, taking care to escape characters that
    // cannot be included in a string literal and then unescape them in code
    // blocks.
    var source = "__p+='" + text
      .replace(escaper, function(match) {
        return '\\' + escapes[match];
      })
      .replace(settings.escape || noMatch, function(match, code) {
        return "'+\n((__t=(" + unescape(code) + "))==null?'':_.escape(__t))+\n'";
      })
      .replace(settings.interpolate || noMatch, function(match, code) {
        return "'+\n((__t=(" + unescape(code) + "))==null?'':__t)+\n'";
      })
      .replace(settings.evaluate || noMatch, function(match, code) {
        return "';\n" + unescape(code) + "\n__p+='";
      }) + "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // The OOP Wrapper
  // ---------------

  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.
  var wrapper = function(obj) { this._wrapped = obj; };

  // Expose `wrapper.prototype` as `_.prototype`
  _.prototype = wrapper.prototype;

  // Helper function to continue chaining intermediate results.
  var result = function(obj, chain) {
    return chain ? _(obj).chain() : obj;
  };

  // A method to easily add functions to the OOP wrapper.
  var addToWrapper = function(name, func) {
    wrapper.prototype[name] = function() {
      var args = slice.call(arguments);
      unshift.call(args, this._wrapped);
      return result(func.apply(_, args), this._chain);
    };
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result(obj, this._chain);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      return result(method.apply(this._wrapped, arguments), this._chain);
    };
  });

  // Start chaining a wrapped Underscore object.
  wrapper.prototype.chain = function() {
    this._chain = true;
    return this;
  };

  // Extracts the result from a wrapped and chained object.
  wrapper.prototype.value = function() {
    return this._wrapped;
  };

}).call(this);

﻿///////////////////////////////////////////////////////
//    AssemblyExporter.jsx
//    (c) 2012 Sophia Chou, Assembly Development Corp.
///////////////////////////////////////////////////////

var doc = app.activeDocument;

//
// Utils
//

var Utils = {};

Utils.stringTimes = function(str,times) {
	return _.map(_.range(times),function(){return str}).join('')
}

Utils.setItemVisibility = function(itemObject,answer) {
	if (itemObject.typename == "GroupItem") {
		try {
			itemObject.hidden = !answer;
		} catch (e) {
			$.writeln("Couldn't modifying group.\n", e);
		}
	} else if (itemObject.typename == "Layer") {
		itemObject.visible = answer;
	}
}

Utils.geometricBoundsOfLayer = function(layer) {
	var x0,y0,x1,y1 = null;
	var len = layer.pageItems.length;
	for (var i = 0; i < len; i++) {
		var gb = layer.pageItems[i].geometricBounds;
		if ((x0 == null) || (gb[0] < x0))
			x0 = gb[0];
		if ((y0 == null) || (gb[1] > y0))
			y0 = gb[1];
		if ((x1 == null) || (gb[2] > x1))
			x1 = gb[2];
		if ((y1 == null) || (gb[3] < y1))
			y1 = gb[3];
	}
	return [x0,y0,x1,y1];
}

Utils.isLayerInArtboard = function(layer,artboard) {
	var layer_gb = this.geometricBoundsOfLayer(layer);
	if (layer_gb == [null,null,null,null])
		return false;
	var artboard_gb = artboard.artboardRect;

	if ( ((layer_gb[0] <= artboard_gb[0]) && (layer_gb[2] >= artboard_gb[0])) || ((layer_gb[0] >= artboard_gb[0]) && (layer_gb[0] <= artboard_gb[2])) ) {
		if ( ((layer_gb[1] <= artboard_gb[1]) && (layer_gb[1] >= artboard_gb[3])) || ((layer_gb[1] >= artboard_gb[1]) && (layer_gb[3] <= artboard_gb[1])) ) {
			return true;
		}
	}
	return false;
}

var AE = {};

AE.modes = [
	{
		name: "all_artboards",
		label: "All Artboards",
		description: """Exports all artboards, plain and simple.

Exported filenames won't include the $ or any #hash or -dash tags."""

	},{
		name: "moneyboards",
		label: "Moneyboards",
		description: """Exports all artboards prefaced with $ (for example $HomePage).

Moneyboard are an easy way for you to designate and mass export full mockups while ignoring asset artboards.

They're called moneyboard because they're the ones that wow the clients and get you paid."""
	},{
		name: "tagged_artboards",
		label: "Tagged Artboards",
		description: """Exports artboards while hiding all layers and groups without a matching tag. 

#hashtags: An artboard "logo #fg" hides all layers and groups, except those tagged with #fg. Exports to "logo.png".

-dashtags: An artboard "logo #fg -active -inactive" does the same, but individually exports "logo-active.png" using -active content and "logo-inactive.png" using -inactive content.

Moneyboards are ignored."""
	}
]

//
// Prefs
//

AE.INFO_LAYER_NAME = '__AssemblyExporter__';

AE.info_layer = null;

AE.pref_xml = null;

AE.prefs = {
	prefix: null,
	suffix: null,
	base_path: null,
	transparency: false,
	format: null,
	mode: null
}

AE.prefs_default = {
	prefix: "",
	suffix: "",
	transparency: true,
	base_path: "~/Desktop",
	scaling: "100%",
	format: "PNG 24",
	mode: "tagged_artboards"
}

AE.initPrefs = function() {
	var parse_success = false;
	var delete_message =  "Please delete the "+this.INFO_LAYER_NAME+" layer and try again.";

	try {
		this.info_layer = doc.layers.getByName(this.INFO_LAYER_NAME);
	} catch (e) {
		this.info_layer = doc.layers.add();
		this.info_layer.name = this.INFO_LAYER_NAME;
		var info_xml = this.info_layer.textFrames.add();
		var saved_data = new XML( '<prefs></prefs>' );
		saved_data.appendChild( new XML('<prefix></prefix>') );
		saved_data.appendChild( new XML('<suffix></suffix>') );
		saved_data.appendChild( new XML('<base_path>'+this.prefs_default.base_path+'</base_path>') );
		saved_data.appendChild( new XML('<scaling>'+this.prefs_default.scaling+'</scaling>') );
		saved_data.appendChild( new XML('<transparency>'+this.prefs_default.transparency+'</transparency>') );
		saved_data.appendChild( new XML('<format>'+this.prefs_default.format+'</format>') );
		saved_data.appendChild( new XML('<mode>'+this.prefs_default.mode+'</mode>') );
		info_xml.contents = saved_data.toXMLString();
		this.info_layer.printable = false;
		this.info_layer.visible = false;
		this.info_layer.opacity = 0;
	}

	// get xml out of the 1 text item on that layer and parse it
	if ( this.info_layer.textFrames.length != 1 ) {
		Window.alert(delete_message);
	} else {
		try {    
			this.prefs_xml = new XML( this.info_layer.textFrames[0].contents );
			this.prefs.prefix = this.prefs_xml.prefix;
			this.prefs.suffix = this.prefs_xml.suffix;
			this.prefs.base_path = this.prefs_xml.base_path;    
			this.prefs.transparency = this.prefs_xml.transparency == "true" ? true : false;
			this.prefs.format = this.prefs_xml.format;
			this.prefs.mode = this.prefs_xml.mode;
			if ( ! this.prefs_xml.scaling || this.prefs_xml.scaling == "" ) {
				this.prefs.scaling = this.prefs_default.scaling;
			} else {
				this.prefs.scaling		= this.prefs_xml.scaling;
			}
			parse_success = true;
		} catch ( e ) {
			Window.alert(delete_message);
		}
	}
	return parse_success;
}

//
//  Doc Layer and Group Tree
//

AE.object2id = function(obj) {
	r = [];

	while (obj != doc) {
		//r.push(obj.name);
		var parent = obj.parent;
		var siblings;
		if (obj.typename == "GroupItem") {
			r.push("g");
			siblings = parent.groupItems;
		} else if (obj.typename == "Layer") {
			r.push("l");
			siblings = parent.layers;
		}
		for (i = 0; i<siblings.length; i++) {
			if (siblings[i] == obj) {
				r.push(i);
				break;
			}
		}
		obj = parent;
	}

	return r;
}

AE.setDocLayerGroupTreeDefaults = function() {
	AE.docLayerGroupTree = { "children": [] };
	AE.docLayerObjectIndex = {};
	AE.docGroupObjectIndex = {};
	AE.docLayerTreeIndex = {};
	AE.docGroupTreeIndex = {};
}

AE.docItemToTreeItem = function(item,type,id,parent) {
	if (parent == null) {
		parent = {};
	}
	if (parent.hash_tags == null)
		parent.hash_tags = [];

	var dash_tag = AE.firstDashTag(item.name);

	var r = {"children": []}
	r.type = type
	r.id = id;
	r.name = item.name;
	if (item.typename == "GroupItem") {
		r.initially_visible = !item.hidden;
	} else if (item.typename == "Layer") {
		r.initially_visible = item.visible; 
	}
	r.hash_tags = _.union(parent.hash_tags,AE.nameHashTags(item.name));
	r.dash_tag = dash_tag ? dash_tag : parent.dash_tag;
	r.bubbled_hash_tags = r.hash_tags;
	r.bubbled_dash_tags = r.dash_tag ? [r.dash_tag] : [];

	if (r.hash_tags.length) {
		parent.bubbled_hash_tags = _.union(r.hash_tags,parent.bubbled_hash_tags);
	}
	if (r.dash_tag) {
		parent.bubbled_dash_tags = _.union([r.dash_tag],parent.bubbled_dash_tags);
	}
	return r;
}

AE.createTreeForLayers = function(layers,parent_path) {
	if (!parent_path) { parent_path = []; }
	var untreed_layer_ids = [];
	for (i = 0; i < layers.length; i++) {
		var path = parent_path.concat(i);
		AE.docLayerObjectIndex[AE.object2id(layers[i])] = path;
		untreed_layer_ids.push(i);
	}
	while (untreed_layer_ids.length != 0) {
		var marked_for_removal = [];
		for (ii = 0; ii < untreed_layer_ids.length; ii++) {
			var i = untreed_layer_ids[ii];
			var path = parent_path.concat(i);
			var layer = layers[i];
			var tree_parent_index;
			if (layer.parent == doc) {
				tree_parent_index = [];
			} else if (AE.docLayerTreeIndex[AE.docLayerObjectIndex[AE.object2id(layer.parent)]]) {
				tree_parent_index = AE.docLayerTreeIndex[AE.docLayerObjectIndex[AE.object2id(layer.parent)]];
			}
			if (tree_parent_index) {
				// add layer to subtree
				var tree_parent = AE.docLayerGroupItemFromIndex(tree_parent_index);
				var tree_parent_children = tree_parent['children'];
				tree_parent_children.push(AE.docItemToTreeItem(layer, "layer", path, tree_parent));
				// set layer tree index
				tree_index = tree_parent_index.concat(tree_parent_children.length-1);
				AE.docLayerTreeIndex[path] = tree_index;
				// mark for removal from  untreed_layer_ids 
				marked_for_removal.push(ii);
			}
		}
		untreed_layer_ids = _.difference(untreed_layer_ids, marked_for_removal);
	}
	for (i = 0; i < layers.length; i++) {
		if (layers[i].layers.length > 0) {
			AE.createTreeForLayers(layers[i].layers,parent_path.concat(i)); 
		}
	}
}

AE.createTreeForGroups = function() {
	var untreed_group_ids = [];
	for (i = 0; i < doc.groupItems.length; i++) {
		AE.docGroupObjectIndex[AE.object2id(doc.groupItems[i])] = i;
		untreed_group_ids.push(i);
	}
	var depth = 0;
	var MAX_DEPTH = 50;
	while (untreed_group_ids.length != 0 && (MAX_DEPTH > 0 && depth < MAX_DEPTH)) {
		var marked_for_removal = [];
		for (ii = 0; ii < untreed_group_ids.length; ii++) {
			var i = untreed_group_ids[ii];
			var group = doc.groupItems[i];
			var tree_parent_index = AE.docLayerGroupItemIndexFromObject(group.parent);
			if (tree_parent_index) {
				if (true) { // for debugging

				}
				// add group to subtree
				var tree_parent = AE.docLayerGroupItemFromIndex(tree_parent_index);
				var tree_parent_children = tree_parent['children'];
				tree_parent_children.push(AE.docItemToTreeItem(group, "group", i, tree_parent));
				// set group tree index
				var tree_index = tree_parent_index.concat(tree_parent_children.length-1);
				AE.docGroupTreeIndex[i] = tree_index;
				// mark for removal from  untreed_group_ids
				marked_for_removal.push(ii);
			}
		}
		untreed_group_ids = _.difference(untreed_group_ids, marked_for_removal);
		depth++;
	}
}



AE.docLayerGroupItemFromIndex = function(aid) {
	var r = AE.docLayerGroupTree;
	for (j = 0; j < aid.length; j++) {
		r = r.children[aid[j]];
	}
	return r;
}

AE.treeItem = function() {
	return AE.docLayerGroupItemFromIndex(arguments);
}

AE.docLayerGroupItemIndexFromObject = function(obj) {
	var aid = null;
	var id = AE.object2id(obj);
	if (AE.docLayerTreeIndex[AE.docLayerObjectIndex[id]]) {
		aid = AE.docLayerTreeIndex[AE.docLayerObjectIndex[id]];
	} else if (AE.docGroupTreeIndex[AE.docGroupObjectIndex[id]]) {
		aid = AE.docGroupTreeIndex[AE.docGroupObjectIndex[id]];
	}
	return aid;
}

AE.docLayerGroupItemFromObject = function(obj) {
	var r = null;
	var aid = AE.docLayerGroupItemIndexFromObject(obj);
	if (aid) {
		r = AE.docLayerGroupItemFromIndex(aid);
	}
	return r;
}

AE.docItemShouldBeVisible = function (item,hash_tags,dash_tag) {
	return false;
}

AE.treeItemToObject = function(item) {
	if (item.type == "group") {
		return doc.groupItems[item.id]; 
	} else if (item.type == "layer") {
		var r = doc;
		for (var i = 0; i < item.id.length; i++) {
			r = r.layers[item.id[i]];
		}
		return r;
	}
}

AE.revertTree = function(item) {
	if (!item)
		item = AE.docLayerGroupTree;
	if (item['initially_visible'] != null) {
		Utils.setItemVisibility(AE.treeItemToObject(item),item['initially_visible']);
	}
	for (var i = 0; i < item.children.length; i++) {
		AE.revertTree(item.children[i]);
	}
}


AE.itemDepth = function(item) {
	r = 1;
	i = item;
	while (i.parent != doc) {
		r++;
		i = i.parent;
	}
	return r;
}

AE.maskTree = function(hash_tags, dash_tag, item) {
	if (!hash_tags.length && dash_tag == null) {
		AE.revertTree();
		return;
	}

	if (!item) {
		item = AE.docLayerGroupTree;
	} else {
	}

	if (item != AE.docLayerGroupTree) {
		var itemObject = AE.treeItemToObject(item);
		var answer = item.initially_visible;
		if (hash_tags.length && dash_tag != null) {
			if (_.intersection(hash_tags,item.bubbled_hash_tags).length) {
				answer = (item.dash_tag == null || dash_tag == item.dash_tag);
			} else {
				answer = (dash_tag == item.dash_tag);
			}
		} else if (hash_tags.length) {
			answer = (_.intersection(hash_tags,item.bubbled_hash_tags).length != 0);
		} else if (dash_tag != null) {
			answer = (item.dash_tag == null || dash_tag == item.dash_tag);
		}
		Utils.setItemVisibility(itemObject,answer);
	}

	for (var i = 0; i < item.children.length; i++) {
		AE.maskTree(hash_tags, dash_tag, item.children[i]);
	}
}


AE.createDocLayerGroupTree = function() {
	AE.setDocLayerGroupTreeDefaults();
	AE.createTreeForLayers(doc.layers);
	AE.createTreeForGroups();
}


//
// Export
//

AE.getFormatInfo = function() {
	var r  = {};
	if (this.prefs.format =='PNG 8') {
		r.ext = ".png";
		r.type = ExportType.PNG8;
	} else if (this.prefs.format == 'PNG 24') {
		r.ext = ".png";
		r.type = ExportType.PNG24;
	} else if (this.prefs.format == 'JPG') {
		r.ext = ".jpg";
		r.type = ExportType.JPEG;
	} else if (this.prefs.format == 'PDF') {
		r.ext = ".pdf";
	} else if (this.prefs.format == 'EPS') {
		r.ext = ".eps";
	}
	return r;
}


AE.getFormatOptions = function() {
	var options;
	if (this.prefs.format =='PNG 8') {
		options = new ExportOptionsPNG8();
		options.antiAliasing = true;
		options.transparency = this.prefs.transparency;
		options.artBoardClipping = true;
		options.horizontalScale = this.prefs.scaling;
		options.verticalScale = this.prefs.scaling;
	} else if (this.prefs.format == 'PNG 24') {
		options = new ExportOptionsPNG24();
		options.antiAliasing = true;
		options.transparency = this.prefs.transparency;
		options.artBoardClipping = true;
		options.horizontalScale = this.prefs.scaling;
		options.verticalScale = this.prefs.scaling;
	} else if (this.prefs.format == 'PDF') {
		options = new PDFSaveOptions();
		options.compatibility = PDFCompatibility.ACROBAT5;
		options.generateThumbnails = true;
		options.preserveEditability = false;
	} else if (this.prefs.format == 'JPG') {
		options = new ExportOptionsJPEG();
		options.antiAliasing = true;
		options.artBoardClipping = true;
		options.horizontalScale = this.prefs.scaling;
		options.verticalScale = this.prefs.scaling;
	} else if (this.prefs.format == 'EPS') {
		options = new EPSSaveOptions();
		options.embedLinkedFiles = true;
		options.includeDocumentThumbnails = true;
		options.saveMultipleArtboards = true;
	}
	return options;
}

AE.exportFile = function(fn,info,options) {
	var destFile = new File(fn);
	if (info.ext == ".pdf") {
		options.artboardRange = (i+1).toString();
		doc.saveAs(fn, options)
	} else if (info.ext == ".eps") {
		options.artboardRange = (i+1).toString();
		doc.saveAs(destFile, options);
	} else {
		doc.exportFile(destFile, info.type, options);
	}
}

AE.artboardPureName = function(artboard_name) {
	var words = artboard_name.split(' ');
	var k = [];
	for(var i = 0; i < words.length; i++){
		if (words[i].length == 0) { return }
		var fl = words[i][0];
		if ( fl == "$") {
			k.push(words[i].substr(1,words[i].length));
		} else if (fl == "#") {
			// nopping
		} else if (fl == "-") {
			// nopping
			// k.push(words[i]);
		} else {
		 k.push(words[i])
		}
	}
	return k.join(' ');
}

AE.nameHashTags = function(name) {
	var words = name.split(' ');
	var k = [];
	for(var i = 0; i < words.length; i++){
		if (words[i].length == 0) { return }
		var fl = words[i][0];
		if (fl == "#") {
			k.push(words[i].substr(1,words[i].length));
		}
	}
	return k;
}

AE.firstDashTag = function(name) {
	var dt = AE.nameDashTags(name);
	if (dt.length > 0) {
		return dt[0];
	}
}

AE.nameDashTags = function(name) {
	var words = name.split(' ');
	var k = [];
	for(var i = 0; i < words.length; i++){
		if (words[i].length == 0) { return }
		var fl = words[i][0];
		if (fl == "-") {
			k.push(words[i].substr(1,words[i].length));
		}
	}
	return k;
}

AE.runExport = function() {  
	var format_options = this.getFormatOptions();
	var format_info = this.getFormatInfo();
	var num_artboards = doc.artboards.length;
	var num_exported = 0;
	var starting_artboard = 0;

	if (this.prefs.mode == "tagged_artboards") {
		AE.createDocLayerGroupTree();
	}

	for (var i = starting_artboard; i < num_artboards; i++ ) {
		var should_export = false;
		var artboard = doc.artboards[i];
		var artboard_name = doc.artboards[i].name;
		starting_artboard = doc.artboards.setActiveArtboardIndex(i);

		if (this.prefs.mode == "all_artboards") {
			// TODO make sure something visible is in the artboard
			should_export = true;
		} else if (this.prefs.mode == "moneyboards") {
			if ( artboard_name.match(/^\$/) ) {
				// TODO make sure something visible is in the artboard
				should_export = true;
			}
		} else if (this.prefs.mode == "tagged_artboards") {
			if ( artboard_name.match(/^\$/) ) {
				// nopping
			} else {
				var hash_tags = AE.nameHashTags(artboard_name);
				var dash_tags = AE.nameDashTags(artboard_name);
				if (dash_tags.length > 0) {
					for (i = 0; i < dash_tags.length; i++) {
						var dash_tag = dash_tags[i];
						AE.maskTree(hash_tags,dash_tag);
						var filename = this.prefs.base_path + "/" + this.prefs.prefix + AE.artboardPureName(artboard_name) + '-' + dash_tag + this.prefs.suffix + format_info.ext;
						AE.exportFile(filename, format_info, format_options);
					}
					should_export = false;
				} else {
					AE.maskTree(hash_tags,null);
					should_export = true;
				}
			}
		}
		if (should_export) {
			var filename = this.prefs.base_path + "/" + this.prefs.prefix + AE.artboardPureName(artboard_name) + this.prefs.suffix + format_info.ext;
			AE.exportFile(filename, format_info, format_options);
		}
	}

	if (this.prefs.mode == "tagged_artboards") {
		AE.revertTree();
	}

	this.dialog.close();
}

//
//  Init
//

AE.dialog = null;

AE.savePrefs = function() {
	this.prefs_xml.base_path = this.prefs.base_path;
	this.prefs_xml.scaling = this.prefs.scaling;
	this.prefs_xml.prefix = this.prefs.prefix;
	this.prefs_xml.suffix = this.prefs.suffix;
	this.prefs_xml.transparency = this.prefs.transparency;
	this.prefs_xml.format = this.prefs.format;
	this.prefs_xml.mode = this.prefs.mode;
	this.info_layer.textFrames[0].contents = this.prefs_xml.toXMLString();
}


AE.showDialog = function() {
	this.dialog = new Window('dialog', 'Assembly Exporter');

	var column_group = this.dialog.add('group',undefined,'');
	column_group.orientation = 'row';
	column_group.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP]

	// Mode Panel
	var mode_panel = column_group.add('panel',undefined,'');

	// RIGHT Mode Row
	var mode_group = mode_panel.add('group', undefined, '');
	mode_group.orientation = 'row';
	mode_group.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP]

	var mode_group_label = mode_group.add('statictext', undefined, 'Mode:');
	mode_group_label.size = [ 100,20 ];

	var mode_group_select = mode_group.add('dropdownlist', undefined, _.map(AE.modes,function(i){ return i['label']; }));

	function selectedModeIndex() {
		for(var i = 0; i < AE.modes.length; i++) {
			if (AE.prefs.mode == AE.modes[i]['name']) {
				return i;
			}
		}
	}
	mode_group_select.selection = selectedModeIndex();

	// Description Row
	var description_group = mode_panel.add('group', undefined, '');
	description_group.orientation = 'row';
	description_group.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP]

	var description_group_label = description_group.add('statictext', undefined, AE.modes[selectedModeIndex()]['description'], {multiline: true});

	// Export type handler
	mode_group_select.onChange = function() {
		AE.prefs.mode = AE.modes[mode_group_select.selection.index]['name'];
		description_group_label.text = AE.modes[selectedModeIndex()]['description'];
		//AE.dialog.update();
	};

	// LEFT Settings Group
	var settings_group = column_group.add('group',undefined,'');
	settings_group.orientation = 'column';
	settings_group.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP]

	// Prefix Row
	var prefix_group = settings_group.add('group', undefined, '')
	prefix_group.orientation = 'row';
	prefix_group.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP]

	var prefix_label = prefix_group.add('statictext', undefined, 'File prefix:');
	prefix_label.size = [100,20]

	var prefix_input = prefix_group.add('edittext', undefined, this.prefs.prefix);
	prefix_input.size = [300,20];

	// Suffix Row
	var suffix_group = settings_group.add('group', undefined, '')
	suffix_group.orientation = 'row';
	suffix_group.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP]

	var suffix_label = suffix_group.add('statictext', undefined, 'File suffix:');
	suffix_label.size = [100,20]

	var suffix_input = suffix_group.add('edittext', undefined, this.prefs.suffix);
	suffix_input.size = [300,20];

	var scaling_group = settings_group.add('group', undefined, '')
	scaling_group.oreintation = 'row';
	scaling_group.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP]

	var scaling_label = scaling_group.add('statictext', undefined, 'Scaling:');
	scaling_label.size = [100,20]

	var scaling_input = scaling_group.add('edittext', undefined, this.prefs.scaling);
	scaling_input.size = [100,20];

	var scaling_label2 = scaling_group.add('statictext', undefined, '(Normally 100%; Use 200% for Retina dislay exports)');
	scaling_label2.size = [300,20]

	// Directory Row
	var directory_group = settings_group.add( 'group', undefined, '')
	directory_group.orientation = 'row'
	directory_group.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP]

	var directory_label = directory_group.add('statictext', undefined, 'Output directory:');
	directory_label.size = [100,20];

	var directory_input = directory_group.add('edittext', undefined, this.prefs.base_path);
	directory_input.size = [300,20];

	var directory_choose_button = directory_group.add('button', undefined, 'Choose ...' );
	directory_choose_button.onClick = function() { directory_input.text = Folder.selectDialog(); }

	// Transparency and Format Row
	var export_group = settings_group.add('group', undefined, '');
	export_group.orientation = 'row'
	export_group.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP]

	var format_label = export_group.add('statictext', undefined, 'Export format:');
	format_label.size = [ 100,20 ];

	var format_list = export_group.add('dropdownlist', undefined, [ 'PNG 8', 'PNG 24', 'PDF', 'JPG', 'EPS' ]);

	format_list.selection = 1;
	for ( var i=0; i < format_list.items.length; i++ ) {
		if ( AE.prefs.format == format_list.items[i].text ) {
			 format_list.selection = i;
		}
	}

	var transparency_input = export_group.add('checkbox', undefined, 'Transparency');
	transparency_input.value = this.prefs.transparency;

	// TODO add progress bar
	//var progress_bar = this.dialog.add( 'progressbar', undefined, 0, 100 );
	//progress_bar.size = [400,10]

	var button_panel = this.dialog.add('group', undefined, '');
	button_panel.orientation = 'row'

	button_panel.cancel_button = button_panel.add('button', undefined, 'Cancel', {name:'cancel'});
	button_panel.cancel_button.onClick = function() { AE.dialog.close() };

	button_panel.ok_button = button_panel.add('button', undefined, 'Export', {name:'ok'});
	button_panel.ok_button.onClick = function() {
		AE.prefs.prefix = prefix_input.text;
		AE.prefs.suffix = suffix_input.text;
		AE.prefs.base_path = directory_input.text;
		AE.prefs.transparency = transparency_input.value;
		AE.prefs.format = format_list.selection.text;
		AE.prefs.scaling = parseFloat( scaling_input.text.replace( /\% /, '' ));
		AE.prefs.mode = AE.modes[mode_group_select.selection.index]['name'];
		AE.savePrefs();
		AE.runExport();
	};

	this.dialog.show();
}

AE.init = function() {
	var parse_success = AE.initPrefs();
	if (parse_success) {
		AE.showDialog();
	}
}

AE.init();
