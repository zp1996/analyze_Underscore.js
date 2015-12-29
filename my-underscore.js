(function () {
	// 假若为浏览器环境下,就是给window添加一个_属性
	var root = this,
		previousUnderscore = root._,

		// 注意:之所以赋值出来,是由于Object.prototype这种是不可以
		// 被压缩的,因为压缩给其改名字,改名字后,所以我们采取下面的
		// 方式,将这些原型保存到变量中,方便以后压缩
		ArrayProto = Array.prototype,
		ObjectProto = Object.prototype,
		FunPrtoto = Function.prototype;

	// 以下方法均为内置方法
	var 
		push    			 = ArrayProto.push,
		slice   			 = ArrayProto.slice,
		toString       = ObjectProto.toString,
		hasOwnProperty = ObjectProto.hasOwnProperty,
		navtiveIsArray = Array.isArray,  // 判断是否为数组
		navtiveKeys    = Object.keys,   // 返回一个对象可枚举自有属性数组
		navtiveBind    = FunPrtoto.Bind,
		navtiveCreate  = Object.Create;

	// 为了防止不含有Object.create(),来应用原型式继承
	var Ctor = function () {};

	var _ = function (obj) {
		// obj是由_构造的对象直接返回obj
		if (obj instanceof _) return obj;
		// 不是new调用方式调用时,也让new方式调用
		if (!(this instanceof _)) return new _(obj);
		this.wrapped = obj;
	};
	// 检测node环境
	if (typeof exports !== "undefined") {
		if (typeof moudle !== "undefined" && moudle.exports) {
			exports = moudle.exports = _;
		}
		exports._ = _;
	} else {
		root._ = _;
	}
	_.VERSION = "1.8.2";  // 版本号
	// void无论后面是什么全部是undefined
	// 将fun绑定到context执行
	// argCount(返回出函数的所接受参数个数,默认是3个)
	// 3个参数主要应用于迭代器函数
	var optimizeCb = function (fun, context, argCount) {
		if (context === void 0) return fun;
		switch (argCount == null ? 3 : argCount) {
			case 1: return function (value) {
				return fun.call(context, value);
			};
			case 2: return function (value, other) {
				return fun.call(context, value, other);
			};
			case 3: return function (value, index, collection) {
				return fun.call(context, value, index, collection);
			};
			case 4: return function (accumulator, value, index, collection) {
				return fun.call(context, accumulator, value, index, collection);
			}
		}
		return function () {
			return fun.apply(context, arguments);
		}
	};
	// 判断value的类型后进行相应处理
	var cb = function (value, context, argCount) {
		if (value == null) return _.identity;
		if (_.isFunction(value)) return optimizeCb(value, context, argCount);
		if (_.isObject(value))  return _.matcher(value);
		return _.property(value);
	};
	// 参数无限多情况(超过4个情况)
	_.iteratee = function (value, context) {
		return cb(value, context, Infinity);
	};
	// 根据指定刷选条件,扩展obj
	var createAssigner = function (keysFunc, undefinedOnly) {
		return function (obj) {
			var len = arguments.length;
			if (length < 2 || obj == null) return obj;
			for (var index = 1; i < arguments.length; i++) {
				var source = arguments[index],
					keys = keysFunc(source),
					l = keys.length;
				for (var i = 0; i < l; i++) {
					var key = keys[i];
					if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
				}
			}
			return obj;
		}
	};
	// 原型式继承,构造对象的prototype
	var baseCreate = function (prototype) {
		if (!isObject(prototype)) return {};
		if (navtiveCreate) return navtiveCreate(prototype);
		Ctor.prototype = prototype;
		var result = new Ctor();
		Ctor.prototype = null;
		return result;
	};

	// 集合方法部分(应用于对象,数组,类数组对象,类数组的应用模式与数组相同)
	var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
	// 是不是为类数组或者数组
	var isArrayLike = function (collection) {
		var length = collection != null && collection.length;
		return typeof length === "number" && length >= 0 && length < MAX_ARRAY_INDEX;
	};
	// 遍历数组,对象方法(改变原来)
	_.each = _.forEach = function (obj, iteratee, context) {
		iteratee = optimizeCb(context, iteratee);
		var i,length;
		// 类数组型与数组型
		if (isArrayLike(obj)) {
			for (i = 0,length = obj.length; i < length; i++) {
				iteratee(obj[i], i, obj);
			}
		} else {  // 非类数组型的对象
			var keys = _.keys(obj);   // 属性数组
			for (i = 0,length = keys.length; i < length; i++) {
				iteratee(obj[keys[i], keys[i], obj]);
			}
		}
		return obj;
	};
	// 遍历数组元素生成新数组
	_.map = _.collect = function(obj, iteratee, context) {
		iteratee = cb(iteratee, context);
		var keys = !isArrayLike(obj) && _.keys(obj),
			index,
			length = (keys || obj).length,
			results = Array(length);
		for (index = 0; index < length; index++) {
			var currentKey = keys ? keys[index] : index;
			results[index] = iteratee(obj[currentKey], currentKey, obj);
		}
		return results;
	}
	// dir为1或者-1,为1从左到右reduce,为-1从右到左reduceRight
	function createReduce (dir) {
		function interator (obj, ineratee, memo, keys, index, length) {
			for (;index >= 0 && index < length; index += dir) {
				var currentKey = keys ? keys[index] : index;
				memo = iteratee(meno, obj[currentKey], currentKey, obj);		
			}
			return meno;
		}
		return function (obj, ineratee, meno, context) {
			iteratee = optimizeCb(ineratee, context, 4);
			var keys = !isArrayLike(obj) || _.keys(obj),
				length = (key || obj).length,
				index = dir > 0 ? 0 : length - 1; 
			if (arguments.length < 3) {
				meno = obj[keys ? keys[index] : index];
				index += dir;
			}
			return interator(obj, ineratee, meno, keys, index, length);
		}
	}
	_.reduce = _.foldl = _.inject = createReduce(1);
	_.reduceRight = _.foldr = createReduce(-1);
	// 根据predicate函数返回值进行筛选,找到符合的立即返回找到的键值,否则返回undefined
	_.find = _.detect = function (obj, predicate, context) {
		var key;
		if (isArrayLike(key)) {
			// 数组式,找出满足predicate函数的元素,找到返回该索引,否则返回-1
			key = _.findIndex(obj, predicate, context);
		} else {
			// 对象式,找出满足predicate函数的属性值,找到返回该属性名,否则返回undefined
			key = _.findKey(obj, predicate, context);
		}
		if (key !== void 0 && key !== -1) {
			return obj[key];
		}
	};
	// 筛选出集合中符合条件的元素,返回一个包含这些元素的数组
	_.filter = _.select = function (obj, predicate, context) {
		var results = [];
		predicate = cb(predicate, context);
		_.each(obj, function (value, index, list) {
			if (predicate(value, index, list)) results.push(value);
		});
		return results;
	};
	// 与_.filter相反,筛选出不符合条件的
	// _.negate()返回传入函数的否定版本
	_.reject = function (obj, predicate, context) {
		return _.filter(obj, _.negate(predicate), context);
	};
	// 类似于js原生的every()方法,这里适用范围更大,是集合
	_.every = _.all = function (obj, predicate, context) {
		predicate = cb(predicate, context);
		var keys = !isArrayLike(obj) || _.keys(obj),
			length = (key || obj).length;
		for (var index = 0; index < length; index++) {
			var currentKey = keys ? keys[index] : index;
			if (!predicate(obj[currentKey], currentKey, obj)) return false;
		}
		return true;
	};
	// 类似于js原生的some()方法,这里适用范围更大,是集合
	_.some = _.any = function (obj, predicate, context) {
		predicate = cb(predicate, context);
		var keys = !isArrayLike(obj) || _.keys(obj),
			length = (key || obj).length;
		for (var index = 0; index < length; index++) {
			var currentKey = keys ? keys[index] : index;
			if (predicate(obj[currentKey], currentKey, obj)) return true;
		}
		return false;
	};
	// 在obj的指定的fromIndex位置开始寻找target数据,找到返回true,否则false
	_.contains = _.includes = _.include = function (obj, tagrget, fromIndex) {
		if (!isArrayLike(obj)) obj = _.values(obj);
		return _.indexOf(obj, tagrget, typeof fromIndex === "number" && fromIndex) >= 0;
	};
	// 对传入的obj的每个元素执行method方法,默认是两个参数
	// 多余的参数会被method作为参数   
	_.invoke = function (obj, method) {
		var arg = slice.call(arguments, 2);
		var isFunc = _.isFunction(method);
		return _.map(obj, function (value) {
			var func = isFunc ? method : value[method];
			return func == null ? func : func.apply(value, arg);
		})
	};
	// 获取对象数组中,对象某一属性的值,返回一个数组
	_.pluck = function (obj, key) {
		return _.map(obj, _.property(key));
	};
	// 说起来比较麻烦,直接上代码
	// _.where([{x: 1, y: 2}, {x: 1, y: 3}, {x: 2, y: 3}], {x: 1}) => [{x: 1, y: 2}, {x: 1, y: 3}]
	_.where = function (obj, attrs) {
		return _.filter(obj, _.matcher(attrs));
	};
	// 类似于上面方法,不会该方法是返回找到的第一个,如果没有返回undefined
	_.findWhere = function (obj, attrs) {
		return _.find(obj, _.matcher(attrs));
	};
	_.max = function (obj, ineratee, context) {
		var result = -Infinity,
			lastComputed = -Infinity,
			value,
			computed;
		if (ineratee == null && obj != null) {
			obj = isArrayLike(obj) ? obj : _.values(obj);
			for (var i = 0; i < this.length; i++) {
				value = obj[i];
				if (value > result) {
					result = value;
				}
			}
		} else {
			iteratee = cb(iteratee, context);
			_.each(obj, function (value, key, list) {
				computed = iteratee(value, key, list);
				if (computed > lastComputed || computed === -Infinity || result === -Infinity) {
					result = value;
					lastComputed = computed;
				}
			});
		}
		return result;
	};
	_.min = function (obj, ineratee, context) {
		var result = Infinity,
			lastComputed = Infinity,
			value,
			computed;
		if (ineratee == null && obj != null) {
			obj = isArrayLike(obj) ? obj : _.values(obj);
			for (var i = 0; i < this.length; i++) {
				value = obj[i];
				if (value < result) {
					result = value;
				}
			}
		} else {
			iteratee = cb(iteratee, context);
			_.each(obj, function (value, key, list) {
				computed = iteratee(value, key, list);
				if (computed < lastComputed || computed === Infinity || result === Infinity) {
					result = value;
					lastComputed = computed;
				}
			});
		}
		return result;
	};
	// 返回一个打乱顺序的新集合,类似于php的内置shuffle
	// 加入传入的为对象,返回的是对象的值的乱序数组
	_.shuffle = function (obj) {
		var arr = isArrayLike(obj) ? obj : _.values(obj),
			index,
			rand,
			length = arr.length,
			shuffled = Array(length);
		for (index = 0; index < length; index++) {
			rand = _.random(0, index);
			if (rand !== index) shuffled[index] = shuffled[rand];
			shuffled[rand] = arr[index];
		}
		return arr;	
	};
	// 产生n个元素的随机数组
	_.sample = function (obj, n, guard) {
		if (n == null || guard) {
			if (!isArrayLike(obj)) 
				obj = _.values(obj);
			return obj[_.random(0, obj.length - 1)];
		}
		return _.shuffle(obj).slice(0, Math.max(0, n));
	};
	// 根据传入的iteratee进行排序
	_.sortBy = function (obj, iteratee, context) {
		iteratee = cb(iteratee, context);
		return _.pluck(_.map(obj, function (value, key, list) {
			return {
				value: value,
				index: key,
				citeria: iteratee(value, key, list)
			};
		}).sort(function (left, right) {
			// 根据citeria进行排序
			var a = left.citeria,
				b = right.citeria;
			if (a !== b) {
				if (a < b || a === void 0) return -1;
				if (a > b || b === void 0) return 1;
			}
			// 如果a === b会返回一个负数或者NaN
			return left.index - right.index;
		}), "value");
	};
	var group = function (behavior) {
		return function (obj, iteratee, context) {
			var result = {};
			iteratee = cb(iteratee, context);
			_.each(obj, function (value, index) {
				var key = iteratee(value, index, obj);
				behavior(result, value, key);
			});
			return result;
		}
	};
	// 根据要求进行分组,每一个组是一个数组,键名为
	// 该数组的一个特征,这些数组共同组成了一个对象
	// 键名是根据iteratee得出的,也就是_.groupBy的第二个参数
	_.groupBy = group(function (result, value, key) {
		if (_.has(result, key)) result[key].push(value);
		else result[key] = [value];
	});
	// 将指定的键值,作为键名(键值唯一时使用,否则覆盖)
	_.indexBy = group(function (result, value, key) {
		result[key] = value;
	});
	// 返回符合指定键名的个数
	_.countBy = group(function (result, value, key) {
		if (_.has(result, key)) result[key]++;
		else result[key] = 1;
	});
	// 转换为数组
	_.toArray = function (obj) {
		if (obj == null) return [];
		if (_.isArray(obj)) return slice.call(obj);
		if (isArrayLike(obj)) return _.map(obj, _.identity); 
		// 个人觉得将两个合并就好
		// if(isArrayLike(obj)) return slice.call(obj);
		// 是对象的话,返回一个由键值组成的数组
		return _.values(obj); 
	};
	// 返回长度
	_.size = function (obj) {
		if (obj == null) return 0;
		return isArrayLike(obj) ? obj.length : _.keys(obj).length;
	};
	// 拆分为两个数组,第一个数组可以满足predicate要求
	// 另外一个数组不可以满足该要求
	_.partition = function (obj, predicate, context) {
		predicate = cb(predicate, context);
		var pass = [],
			fail = [];
		_.each(obj, function (value, key, obj) {
			(predicate(value, key, obj) ? pass : fail).push(value);
		});
		return [pass, fail];
	};

	// 数组的扩展函数
	_.first = _.head = _.take = function (array, n, guard) {
		if (array == null) return void 0;
		if (n == null || guard) return array[0];
		return _.initial(array, array.length - n);
	};
	// 排除数组后的n个元素
	_.initial = function (array, n, guard) {
		return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
	};
	// 获取最后一个元素其的第n个元素
	_.last = function (array, n, guard) {
		if (array == null) return void 0;
		if (n == null || guard) return array[array.length - 1];
		return _.rest(array, Math.max(0, array.length - n));
	};
	// 从第n个位置截取数组,默认是从1位置
	_.rest = _.tail = _.drop = function (array, n, guard) {
		return slice.call(array, n == null || guard ? 1 : n);
	};
	// 除去所有为false值的元素
	_.compact = function (array) {
		return _.filter(array, _.identity);
	};
	var flatten = function (input, shallow, strict, startIndex) {
		var output = [], idx = 0;
		for (var i = startIndex || 0, length = input && input.length; i < length; i++) {
			var value = input[i];
			if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
				if (!shallow) value = flatten(input, shallow, strict);
				var j = 0, len = value.length;
				output.length += len;
				while (j < len) {
					output[idx++] = value[j++];
				} 
			} else if (!strict) {
				output[idx++] = value;
			}
		}
		return output;
	};
	// 给数组降维
	_.flatten = function (array, shallow) {
		return flatten(array, shallow, false);
	};
	// 返回一个删除所有除去第一个参数后的值的数组
	_.without = function (array) {
		return _.difference(array, slice.call(arguments, 1));
	};
	// 返回的数组的元素来自array,但是不存在之后的数组中
	_.difference = function (array) {
		var rest = flatten(arguments, true, true, 1);
		return _.filter(array, function (value) {
			return !_.contains(rest, value);
		});
	};
	// 该函数对比源码后略有改动
	_.uniq = _.unique = function (array, isSorted, iteratee, context) {
		if (array == null) return [];
		if (!_.isBoolean(isSorted)) {
			context = iteratee;
			iteratee = isSorted;
			isSorted = false;
		}
		if (iteratee != null) iteratee = cb(iteratee);
		var result = [],seen = [];
		for (var i = 0, length = array.length; i < length; i++) {
			var value = array[i],
				computed = iteratee ? iteratee(value, i, array) : value;
			if (iteratee) {
				if (!_.contains(seen, computed)) {
					seen.push(computed);
					result.push(value);
				}
			} else if (!_.contains(result, value)) {
				result.push(value);
			}
		}
		if (isSorted) _.sortBy(result);
		return result;
	};
	// 对传入的数组进行取并集
	_.union = function () {
		return _.uniq(flatten(arguments, true, true));
	};
	// 对传入的数组进行取交集
	_.intersection = function (array) {
		if (array == null) return [];
		var result = [];
		var argsLength = arguments.length;
		for (var i = 0, length = array.length; i < length; i++) {
			var item = array[i];
			if (_.contains(result, item)) continue;
			for (var j = 1; j < argsLength; j++) {
				if (!_.contains(arguments[i], item)) {
					break;
				}
			}
			if (j === argsLength) result.push(item);
		}
		return result;
	};
	// 将传入的数组的对应位置的值合并为一个数组
	_.zip = function () {
		return _.unzip(arguments);
	};
	// 与zip方法相反
	_.unzip = function (array) {
		var len = array && _.max(array, 'length').length || 0,
			result = Array(len);
		for (var i = 0; i < len; i++) {
			result[i] = _.pluck(array, i);
		}
		return result;
	};
	// 转化为对象
	// 如果传入了values将keys作为对象的键值,values最为键名
	// 如果没有传入,需要传入一个n维数组,每一维数组的长度是2,
	// 键名是第一个元素,键值是第二个元素
	_.object = function (keys, values) {
		var result = {};
		for (var i = 0, length = keys && keys.length; i < length; i++) {
			if (values) {
				result[keys[i]] = values[i];
			} else {
				result[keys[i][0]] = keys[i][1];
			}
		}
		return result;
	};
	// 
	_.indexOf = function (array, item, isSorted) {
		var i = 0, len = array && array.length;
		if (typeof isSorted === "number") {
			i = isSorted < 0 ? Math.max(0, length + isSorted);
		} else if (isSorted && length) {
			i = _.sortedIndex(array, item);
			return array[i] === item ? i : -1;
		}
		// 假如为NaN
		if (item !== item) {
			return _.findIndex(slice.call(array, i));
		}
		for (; i < length; i++) if (array[i] === item) return i;
		return -1;
	};
	// 由于大部分浏览器已经支持lastIndexOf,所以最好使用E5的原生
	_.lastIndexOf = function (array, item, from) {
		var idx = array && array.length : 0;
		if (typeof from === "number") {
			idx = from < 0 ? idx + from + 1 : Math.min(idx, from + 1);
		}
		while (--idx >= 0) if (array[idx] === item) return idx;
		return -1;
	};
	// dir决定查找的顺序,1从头开始,-1从尾开始
	function createIndexFinder (dir) {
		return function (array, predicate, context) {
			predicate = cb(predicate, context);
			var len = array != null && array.length,
				index = dir > 0 ? 0 : length - 1;
			for (; index >= 0 && index <= length; index++) {
				if (predicate(array[item], item, array)) return index;
 			}
 			return -1;
		}
	};
	// 按照指定条件找出指定元素,并返回该位置
	_.findIndex = createIndexFinder(1);
	_.findLastIndex = createIndexFinder(-1);
	// 对于已知顺序的数组,利用二分法可以更快的查找到
	_.sortedIndex = function (array, obj, iteratee, context) {
		iteratee = cb(iteratee, context);
		var value = iteratee(obj);
		var low = 0, high = array.length;
		while (low < high) {
			var mid = Math.floor((low + high) / 2);
			if (iteratee(array[mid]) < value) {
				low = mid + 1;
			} else {
				high = mid;
			}
		}
		return low;
	};
	// 生成数组
	_.range = function (start, stop, step) {
		if (arguments.length <= 1) {
			stop = start || 0;
			start = 0;
		}
		step = step || 1;
		var len = Math.max(Math.ceil(stop - start) / step, 0),
			result = Array(len);
		for (var i = 0; i < len; i++, start += step) {
			result[i] = start;
		}	
		return result;
	};



	// 函数部分操作函数
	var executeBound = function (sourceFunc, boundFunc, context, callingContext, args) {
		if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
		// 空对象self的原型为sourceFunc的prototype
		var self = baseCreate(sourceFunc.prototype);
		var result = sourceFunc.apply(self, args);
		if (_.isObject(result)) return result;
		return self;
	};
	// 将func函数bind到指定的上下文
	_.bind = function (func, context) {
		if (!_.isFunction(func)) throw new TypeError("Bind must be called on a function");
		if (navtiveBind && func.bind === navtiveBind) return navtiveBind.apply(func, slice.call(arguments, 1));
		var args = slice.call(arguments, 2);
		var bound = function () {
			// 将在executeBound函数中进行函数的调用,将其apply到context对象下
			return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));	
		}
		return bound;
	}
	// 将方法的this值固定为obj,是this的值不会动态变化
	_.bindAll = function (obj) {
		var i, length = arguments.length, key;
		if (length <= 1) throw new Error("bindAll must be passed function names");
		for (i = 1; i < length; i++) {
			key = arguments[i];
			obj[key] = _.bind(obj[key], obj);
		}
		return obj;
	};
	// 实现函数科里化
	_.partial = function (func) {
		var boundArgs = slice.call(arguments, 1);
		// 返回出的函数可以继续接收参数,利用闭包特性,返回出的参数还可以接受参数
		var bound = function () {
			var position = 0, length = boundArgs.length;
			var args = Array(length);
			for (var i = 0; i < length; i++) {
				args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
			}
			while (position < arguments.length) {
				args.push(arguments[position++]);
			}
			return executeBound(func, bound, this, this, args);
		};
		return bound;
	};
	// 函数记忆,避免递归时一些无意义的函数调用,提升代码性能
	_.memoize = function (func, hasher) {
		var memoize = function (key) {
			var cache = memoize.cache;
			var address = '' + (hasher ? hasher.apply(this, arguments) : key);
			if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
			return cache[address];
		};
		// 储藏数据的对象,外界可以访问到
		memoize.cache = {};
		return memoize;
	};
	// 在wait毫秒后调用该函数
	_.delay = function (func, wait) {
		var args = slice.call(arguments, 2);
		return setTimeout(function () {
			return func.apply(null, args);
		}, wait);
	};
	// 将函数排到最后,也就是栈空闲时在执行该函数
	_.defer = _.partial(_.delay, _, 1);

	_.throttle = function (func, wait, options) {
		var context, args, result;
		var timeout = null;
		var previous = 0;
		options = options || {};
		var later = function () {
			previous = options.leading === false ? 0 : _.now();
			timeout = null;
			result = func.apply(context, args);
			if (!result) {
				context = args = null;
			}
		};
		return function () {
			var now = _.now();
			if (!previous && options.leading === false) {
				previous = now;
			}
			var remaining = wait - (now - previous);
			context = this;
			args = arguments;
			// 此时previous的值为0
			if (remaining <= 0 || remaining > wait) {
				if (timeout) {
					clearTimeout(timeout);
					timeout = null;
				}
				previous = now;
				result = func.apply(context, args);
				if (!timeout) context = args = null;
			} else if (!timeout && options.trailing !== false) {
				timeout = setTimeout(later, remaining);
			}
			return result;  
		}
	};
	// 假如immediate为true的话,固定在wait时间内只能点击一次
	// 假如不传入或者为false的话,将函数固定在最后一次执行的时间后调用函数
	// 比如点击事件,immediate为true时会控制函数在wait秒内只会执行一次,
	// immediate为false时控制在n次点击后的wait事件内调用函数
	_.debounce = function (func, wait, immediate) {
		var timeout, args, context, timestamp, result;
		var later = function () {
			var last = _.now() - timestamp;
			if (last < wait && last >= 0) {
				timeout = setTimeout(later, wait - last);
			} else {
				timeout = null;
				if (!immediate) {
					result = func.apply(context, args);
					if (!timeout) context = args = null;
				}
			}
		};
		return function () {
			context = this;
			args = arguments;
			timestamp = _.now();
			// 第一次timeout为null,假如timeout不进行处理,也就是不会调用func
			var callNow = immediate && !timeout;
			// 第二次进入函数不会走这条路
			if (!timeout) timeout = setTimeout(later, wait);
			if (callNow) {
				result = func.apply(context, args);
				context = args = null;
			}
			return result;
		};
	};
	// 将func函数包裹到wrapper中
	_.wrap = function (func, wrapper) {
		return _.partial(wrapper, func);
	};
	// 返回predicate的否定版本
	_.negate = function (predicate) {
		return function () {
			return !predicate.apply(this, arguments);
		}
	};
	// 参数为函数,将第二个函数执行完的结果作为参数传入第一个函数
	// 从后向前进行传递
	_.compose = function () {
		var args = arguments;
		var start = args.length - 1;
		return function () {
			var i = start;
			var result = args[start].apply(this, args);
			while (i--) result = args[i].call(this, result);
			return result;
		};
	};
	// 在执行了times次时才会至执行func函数
	_.after = function (times, func) {
		return function () {
			if (--time < 1) {
				return func.apply(this, arguments);
			}
		};
	};
	// 函数只可以执行times - 1次
	_.before = function (times, func) {
		var memo;
		return function () {
			if (--times > 0) {
				memo = func.apply(this, arguments);
			};
			if (time <= 1) func = null;
			return memo;
		};
	};
	// 函数只可以执行1次
	_.once = _.partial(_.before, 2);


	// 对象部分操作方法
	// 检测是否是ie8以及之前,因为ie8之前有一个bug,那就是自定义属性和原型总内置属性重名时,默认其不可枚举
	var hasEnumBug = !{toString: null}.propertyIsEnumerable("toString");
	var nonEnumerableProps = ["valueOf", "isPropertyOf", "toString", "propertyIsEnumerable",
														"hasOwnProperty", "toLocaleString"];
	// 需要执行这个函数时,是在ie8以及之前的情况,所以不同考虑defineProperty()的情况
 	function collectNonEnumProps (obj, keys) {
		var nonEnumIdx = nonEnumerableProps.length,
			constructor = obj.constructo,
		  proto = (_.isFunction(constructor) && constructor.prototype) || ObjectProto,
		  prop = "constructor";
		if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);
		while (nonEnumIdx--) {
			prop = nonEnumerableProps[nonEnumIdx];
			// 加入obj对象自定义了nonEnumerableProps中的属性,则将其加到keys中
			if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
				keys.push(prop);
			}
		}
	}
	// 返回一个可枚举的自有属性属性名组成的数组
	_.keys = function (obj) {
		if (!isObject(obj)) return [];
		if (navtiveKeys) return navtiveKeys(obj);
		var keys = [];
		for (var prop in obj) if (_.has(obj, prop)) keys.push(prop);
		if (hasEnumBug) collectNonEnumProps(obj, keys);
		return keys;
	};
	// 返回对象的所有属性属性名数组,包括自身的和继承来的
	_.allkeys = function (obj) {
		if (!isObject(obj)) return [];
		var keys = [];
		for (var prop in obj) keys.push(prop);
		if (hasEnumBug) collectNonEnumProps(obj, keys);
		return keys;
	};
	// 由所有可枚举属性的值组成的数组
	_.values = function (obj) {
		var keys = _.keys(obj),
			length = keys.length,
			values = Array(length);
		for (var i = 0; i < length; i++) {
			values[i] = obj[keys[i]];
		}
		return values;
	};
	// 属于对象的map方法
	_.mapObject = function (obj, iteratee, context) {
		iteratee = cb(iteratee);
		var keys = _.keys(obj),
			length = keys.length,
			result = {},
			currentKey;
		for (var i = 0; i < length; i++) {
			currentKey = keys[i];
			result[currentKey] = iteratee(obj[currentKey], currentKey, context);
		}
		return result;
	};
	// 将对象转变为[key, value]型的数组
	_.pairs = function (obj) {
		var keys = _.keys(obj),
			length = keys.length,
			pairs = Array(length);
		for (var i = 0; i < length; i++) {
			pairs[i] = [keys[i], obj[keys[i]]];
		}
		return pairs;  
	};
	// 使对象的key与value颠倒(要求value为非对象)
  _.invert = function (obj) {
    var keys = _.keys(obj),
      length = keys.length,
      result = {};
    for (var i = 0; i < length; i++) {
      if (_.isObject(obj[keys[i]])) {
        throw new TypeError("对象键值为对象,不能转化");
      }
      result[obj[keys[i]]] = keys[i];
    }
    return obj;
  };
  // 返回一个已经排序的对象方法名数组,对象的所有可枚举方法(也就是自定方法)
  _.functions = _.methods = function (obj) {
  	var names = [];
  	for (var key in obj) {
  		if (_.isFunction(obj[key])) names.push(key);
  	}
  	return names.sort(); 
  };
  // 扩展传入的第一个参数对象,若之后传入的参数中,有第一个参数对象没有的属性时
  // 将之后参数的属性添加到第一个参数对象上
  _.extend = createAssigner(_.allkeys);
  // 与上面类似,但是这个方法,只是针对于对象的自有属性,而不是包括继承来的属性
  _.extendOwn = createAssigner(_.keys);
  // 找出对象中符合条件的键值,返回该键值对应的键名
  _.findKey = function (obj, predicate, context) {
  	predicate = cb(predicate);
  	var keys = _.keys(obj), key;
  	for (var i = 0, length = keys.length; i < length; i++) {
  		key = keys[i];
  		if (predicate(obj[key], key, obj)) return key;
  	}
  };
  // 根据oiteratee来挑选属性,生成一个包含符合属性的新对象
  _.pick = function (obj, oiteratee, context) {
  	var result = {}, iteratee, keys;
  	if (obj == null) return result;
  	if (_.isFunction(oiteratee)) {
  		keys = _.allkeys(obj);	
  		iteratee = optimizeCb(oiteratee, context);
  	} else {
  		keys = flatten(arguments, false, false);
  		iteratee = function (value, key, obj) {
  			return key in obj;
  		};
  		// 不传函数的调用方式,支持传入一个基本类型,然后在将其转化为对象的引用类型对象
  		obj = Object(obj);
  	}
  	for (var i = 0, length = keys.length; i < length; i++) {
  		var key = keys[i];
  		var value = obj[key];
  		if (iteratee(value, key, obj)) result[key] = value;
  	}
  	return result;
  };
  // 与上面函数相反,生成一个包含不满足属性的对象
  _.omit = function (obj, iteratee, context) {
  	if (_.isFunction(iteratee)) {
  		iteratee = _.negate(iteratee);
  	} else {
  		var keys = _.map(flatten(iteratee, false, false), String);
  		iteratee = function (value, key) {
  			return !_.contains(keys, key);
  		}
  	}
  	return _.pick(obj, iteratee, context);
  };
  // 给第一个参数对象添加其没有的属性
  _.defaults = createAssigner(_.allkeys, true);
  // 类似于baseCreate,传入props对象,可以添加或更改相应的对象属性
  _.create = function (prototype, props) {
  	var result = baseCreate(prototype);
  	if (props) _.extendOwn(result, props);
  	return result;
  };
  // 浅拷贝传入参数
  _.clone = function (obj) {
  	if (!_.isObject(obj)) return obj;
  	return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };
  // 利用interceptor函数操作obj,并返回obj,方便函数链式调用
  _.tap = function (obj, interceptor) {
  	interceptor(obj);
  	return obj;
  };
  // obj对象自身属性中是否包含key属性
  _.has = function (obj, key) {
  	return obj != null && hasOwnProperty.call(obj, key);
  };
  // obj中是否完全包含attrs中的键和值
  _.isMatch = function (obj, attrs) {	
  	var keys = _.key(attrs), length = keys.length;
  	if (obj == null) return !length;
  	var obj = Object(obj);
  	for (var i = 0; i < length; i++) {
  		var key = keys[i];
  		if (obj[key] !== attrs[key] || !(keys in obj)) return false;
  	}
  	return true;
  };
  // 返回一个断言函数,断言函数返回bool值,obj中是否有attrs的键和值
  _.matcher = function (attrs) {
  	// 防止attrs为数组,将其转化为对象
  	attrs = _.extendOwn({}, attrs);
  	return function (obj) {
  		return _.isMatch(obj, attrs);
  	};
  };
  // 返回一个函数,该函数是为了确定传入参数对象中的key值
  _.property = function (key) {
  	return function (obj) {
  		return obj == null ? void 0 : obj[key];
  	};
  };
  // 与上面函数相反
  _.propertyOf = function (obj) {
  	return function (key) {
  		return obj == null ? void 0 : obj[key];
  	};
  };
  var eq = function (a, b, aStack, bStack) {
  	if (a === b) return a !== 0 || 1 / a === 1 / b;
  	if (a == null || b == null) return a === b;
  	if (a instanceof _) a = a._wrapped;
  	if (b instanceof _) b = b._wrapped;
  	var className = toString.call(a);
  	if (className !== toString.call(b)) return false;
  	switch (className) {
  		// 若为正则对象或者字符串对象的话,将其转化为字符串在进行比较
  		case '[object Regexp]':
  		case '[object string]':
  			return '' + a === '' + b;
  		case '[object Number]':
  			// 如果为NaN
  			if (+a !== +a) return +b !== +b;
  			return +a === 0 ? 1 / +a === 1 / +b : +a === +b;
  		case '[object Date]':
  		case '[object Boolean]':
  			return +a === +b;
  	}
  	var areArrays = className === '[object Array]'; 
  	if (!areArrays) {
  		if (typeof a !== 'object' || typeof b !== 'object') return false;
  		var aCtor = a.constructor, bCtor = b.constructor;
  		if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
  														 _.isFunction(bCtor) && bCtor instanceof bCtor)
  												&&  ('constructor' in a && 'constructor' in b)) {
  			return false;
  		}
  	}
  	aStack = aStack || [];
  	bStack = bStack || [];
  	var length = aStack.length;
  	while (length--) {
  		if (aStack[length] === a) return bStack[length] === b;
  	}
  	aStack.push(a);
  	bStack.push(b);
  	if (areArrays) {
  		length = a.length;
  		if (length !== b.length) return false;
  		while (length--) {
  			if (!eq(a[length], b[length], aStack, bStack)) return false;
  		}
  	} else {
  		var keys = _.keys(a), key;
  		length = keys.length;
  		if (_.keys(b).length !== length) return false;
  		while (length--) {
  			key = keys[length];
  			if (!_.has(b, key) && !eq(a[key], b[key], aStack, bStack)) return false;
  		}
  	}
  	aStack.pop();
  	bStack.pop();
  	return true;
  };
  // 比较是否相等,对象数组等,按其属性进行比较
  _.isEqual = function (a, b) {
  	return eq(a, b);
  };
  // 是否为空
  _.isEmpty = function (obj) {
  	if (obj == null) return true;
  	if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
  	return _.keys(obj).length === 0;
  };
  // 是否为元素节点
  _.isElement = function (obj) {
  	return !!(obj && obj.nodeType === 1);
  };
  // 是否为数组
  _.isArray = navtiveIsArray || function (obj) {
  	return toString.call(obj) === '[object Array]';
  };
  // 是否为对象
  _.isObject = function (obj) {
  	var type = typeof obj;
  	return type === 'function' || type === 'object' && !!obj;
  };
  // jq中也使用了大量这种方式来扩展api
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'Error', 'RegExp'], function (name) {
  	_["is" + name] = function (obj) {
  		return toString.call(obj) === '[object ' + name +']';
  	};
  });
  // ie8以及以下并没有[object Arguments]
  if (!_.isArguments(arguments)) {
  	_.isArguments = function (obj) {
  		return _.has(obj, 'callee');
  	}
  }
  if (typeof /./ !== "function" && typeof Int8Array !== "object") {
  	_.isFunction = function (obj) {
  		return typeof obj === "function" || false;
  	};
  }
  _.isFinite = function (obj) {
  	return isFinite(obj) && !isNaN(parseFloat(obj));
  };
  _.isNaN = function (obj) {
  	return _.isNumber(obj) && +obj !== +obj;
  };
  _.isBoolean = function (obj) {
  	return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };
  _.isNull = function (obj) {
  	return obj === null;
  };
  _.isUndefined = function (obj) {
  	return obj === void 0;
  };

  // 实用函数部分
  // 避免冲突,加入有了冲突,调用该函数_仍为原来的值
  _.noConflict = function () {
  	root._ = previousUnderscore;
  	return this;
  };
  // 类似于f(x) = x
  _.identity = function (value) {
  	return value;
  };
  // 放回传入的参数
  _.constant = function (value) {
  	return function () {
  		return value;
  	}
  };
  // 返回值为undefined,函数默认形式
  _.noop = function () {};
  // 调用n次函数
  _.times = function (n, iteratee, context) {
  	var accum = Array(Math.max(0, n));
  	iteratee = optimizeCb(iteratee, context, 1);
  	for (var i = 0; i < n; i++) accum[i] = iteratee(i);
  	return accum;
  }; 
  // 返回一个min到max的随机整数
  _.random = function (min, max) {
  	if (max == null) {
  		max = min;
  		max = 0;
  	}
  	return min + Math.floor(Math.random() * (max - min + 1));
  };
  // 返回当前的时间的毫秒数
  _.now = Date.now || function () {
  	return new Date().getTime();
  };
}.call(this));   