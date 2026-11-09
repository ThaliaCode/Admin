function priceListNewFormat(id, priceList, product, units) {
	let newPriceList = [];
	const defaultPriceList = {
		price: 0,
		ranges: [{ from: 0, to: 0, price: 0 }],
		units: {},
	};
	if (id) {
		newPriceList = priceList.map((price) => {
			const newPrice = { ...price };
			newPrice.showRanges = false;
			if (product.priceList[price.id]) {
				newPrice[price.id] = product.priceList[price.id];
				if (units) {
					newPrice[price.id].units = { ...units };
				}
			} else {
				newPrice[price.id] = defaultPriceList;
			}
			return newPrice;
		});
	} else {
		newPriceList = priceList.map((list) => {
			const newList = { ...list };
			newList.showRanges = false;
			newList[list.id] = defaultPriceList;
			return newList;
		});
	}
	return newPriceList;
}
function getThisPropertysValue(property) {
	return function inner(Obj) {
		return Obj[property];
	};
}

function getPropertysValue(val) {
	return function inner(obj) {
		if (typeof obj[val] === 'object') {
			return obj[val];
		}
		return obj[val];
	};
}

function buildMainObject(...obs) {
	return function inner(id, ...arg) {
		const newObj = {};
		[...obs].forEach((object) => {
			const iden = object[id];
			newObj[iden] = {};
			[...arg].forEach((el) => {
				newObj[iden][el] = getPropertysValue(el)(object);
			});
		});
		return newObj;
	};
}
function formattingPriceList(collection) {
	const newObj = {};
	collection.forEach((p) => {
		newObj[p.id] = p[p.id];
	});
	return newObj;
}

/* eslint-disable */
const compose =
	(...fns) =>
	(...args) =>
		fns.reduceRight((res, fn) => [fn.call(null, ...res)], args)[0];

function setNewProperty(property, value) {
	return function p(obj) {
		const newObj = { ...obj };
		newObj[property] = typeof value === 'function' ? value(obj) : value;
		return newObj;
	};
}

function setNewProp(property, v) {
	return function p(obj, index) {
		const newObj = { ...obj };
		newObj[property] = typeof v === 'function' ? v(obj, index) : v;
		return newObj;
	};
}

function getRightPrice(quantity, priceList) {
	const range = priceList.ranges.find((r) => quantity >= r.from && quantity <= r.to);
	return range ? range.price : priceList.price;
}

function updatePrice(id) {
	return function p(product) {
		const newProduct = { ...product };
		const quantity = newProduct.quantity;
		const priceList = newProduct.priceList[id];
		const price = getRightPrice(quantity, priceList);
		return setNewProperty('price', price)(newProduct);
	};
}

function decimals(decimal) {
	return function inner(value) {
		return Math.trunc(value * 10 ** decimal) / 10 ** decimal;
	};
}

function equitativeAmount(total, div) {
	return function inner(obj) {
		let newObj = { ...obj };
		const ratio = Number(total / div);
		newObj = setNewProperty('paid', ratio)(newObj);
		return newObj;
	};
}

function distributeAmount(total, cardsLength, cards, note, statusN) {
	const ntc = cards ? cards.find((c) => c.code === 'cntc') : null;
	const noteAmount = note && note.creditNote ? note.creditNote.amount : 0;
	const newTotal = ntc ? total - Number(noteAmount) : total;
	const newDiv = ntc && cardsLength > 1 ? cardsLength - 1 : cardsLength;
	const makeLoop = newDiv !== 1;
	const flagStatusN = statusN ? statusN === 'primary' : false;
	const ratio = makeLoop
		? Math.trunc(Number(newTotal / newDiv))
		: Number(newTotal / newDiv);
	return function inner(obj, index) {
		if (!obj.paid && !obj.edit) {
			if (obj.code === 'cntc' && flagStatusN) {
				return setNewProperty('paid', 0)(obj);
			} else if (makeLoop) {
				const diff = Number((newTotal - ratio * (newDiv - 1)).toFixed(2));
				const distributeRatio = index + 1 === newDiv ? diff : ratio;
				if (ntc && noteAmount > total) {
					return setNewProperty('paid', 0)(obj);
				}
				return setNewProperty('paid', distributeRatio)(obj);
			} else if (ntc && noteAmount > total) {
				return setNewProperty('paid', 0)(obj);
			} else if (obj.code === 'cntc' && statusN === 'primary') {
				return setNewProperty('paid', 0)(obj);
			}
			return setNewProperty('paid', Number(ratio.toFixed(2)))(obj);
		}
		return setNewProperty('paid', Number(obj.paid.toFixed(2)))(obj);
	};
}

function reduceCompose(fn2, fn1) {
	return function inner(list, value) {
		return fn2(list, fn1(value));
	};
}

function filteByEquality(...args) {
	const [value, ...props] = [...args];
	return function inner(list, obj) {
		let newList = [...list];
		const newProps = [...props];
		newProps.forEach((v) => {
			if (obj[value].toString() === v) {
				newList = newList.concat(obj);
			}
		});
		return newList;
	};
}

function filteByMajorTo(...args) {
	const [vale, ...props] = [...args];
	return function inner(list, obj) {
		let newList = [...list];
		const newProps = [...props];
		newProps.forEach((v) => {
			if (Number(obj[value]) >= Number(v)) {
				newList = newList.concat(obj);
			}
		});
		return newList;
	};
}

function filterCollectionByEquality(val, ...rest) {
	let [prop1, prop2] = [...rest];
	if (!prop2) {
		prop2 = prop1;
	}
	return reduceCompose(filteByEquality(prop2, ...val), getPropertysValue(prop1));
}

function filterCollectionMajorAndEqualTo(val, ...rest) {
	let [prop1, prop2] = [...rest];
	if (!prop2) {
		prop2 = prop1;
	}
	return reduceCompose(filteByMajorTo(prop2, ...val), getPropertysValue(prop1));
}

function reduce(fn, col, acc = []) {
	return col.reduce(fn, acc);
}

function filter(fn, col) {
	return col.filter(fn);
}

function removeItemFromArrayByIndex(index, arr) {
	return arr.reduce((list, item, ind) => {
		const newList = [...list];
		if (index === ind) {
			return newList;
		}
		return newList.concat(item);
	}, []);
}

function updateItemInCollection(...args) {
	const [item, matchProperty, propertyToUpdate, value] = [...args];
	const newValue = value === null || value === undefined ? item[propertyToUpdate] : value;
	return function inner(currentItem) {
		let newItem = { ...currentItem };
		if (item[matchProperty] === currentItem[matchProperty]) {
			newItem = setNewProperty(propertyToUpdate, newValue)(newItem);
		}
		return newItem;
	};
}

function getDeeper(...args) {
	return function inner(item) {
		let newItem = null;
		if (item && item.length) {
			[newItem] = item;
		} else {
			newItem = { ...item };
		}
		args.forEach((el) => {
			newItem = (newItem || {})[el];
		});
		return newItem;
	};
}

function getNewDeeper(props) {
	const args = props.split('.');
	return function inner(item) {
		let newItem = null;
		if (item.length) {
			[newItem] = item;
		} else {
			newItem = { ...item };
		}
		args.forEach((el) => {
			newItem = (newItem || {})[el];
		});
		return newItem;
	};
}

/* eslint-disable prefer-const */
function equality(...args) {
	let [prop1, prop2] = args;
	if (!prop2) {
		prop2 = prop1;
	}
	return function inner(item) {
		if (typeof item === 'object') {
			return item[prop1] === (typeof prop2 === 'function' ? prop2.call() : prop2);
		}
		return item === (typeof prop1 === 'function' ? prop1.call() : prop1);
	};
}

/* eslint-disable prefer-const */
function notEquality(...args) {
	let [prop1, prop2] = args;
	if (!prop2) {
		prop2 = prop1;
	}
	return function inner(item) {
		if (typeof item === 'object') {
			return item[prop1] !== (typeof prop2 === 'function' ? prop2.call() : prop2);
		}
		return item !== (typeof prop1 === 'function' ? prop1.call() : prop1);
	};
}

/**
 *
 * @param {Array} collection1
 * @param { Array[0]} arr1 - arreglo de elementos
 * @param { Array[1]} prop1 - propiedad a usar para coincidencias
 * @param {Array} collection2
 * @param { Array[0]} arr2 - arreglo de elementos
 * @param { Array[1]} prop2 - propiedad a usar para coincidencias
 */
function matchBetweenArrays(collection1, collection2) {
	var [arr1, prop1] = collection1;
	var [arr2, prop2] = collection2;
	var list = [];
	if (prop2) {
		arr1.forEach((a) => {
			var val = a[prop1] || a;
			var match = find(equality(prop2, val), arr2);
			if (match) {
				list = list.concat(match);
			}
		});
	}
	if (
		arr1.every((a) => typeof a === 'string' || typeof a === 'number') &&
		arr2.every((a) => typeof a === 'string' || typeof a === 'number')
	) {
		arr1.forEach((a) => {
			var match = arr2.find((b) => a === b);
			list = match ? list.concat(match) : list;
		});
	}
	if (
		arr1.every((a) => typeof a === 'object') &&
		arr2.every((a) => typeof a === 'string' || typeof a === 'number')
	) {
		arr2.forEach((a) => {
			var match = arr1.find((b) => a === b[prop1]);
			list = match ? list.concat(match) : list;
		});
	}
	return list;
}

function find(fn, col) {
	return col.find(fn);
}

function map(fn, col) {
	return col.map(fn);
}

function setNewPropertyByFunction(prop, fn, flag = true) {
	return function inner(item, index) {
		if (index === null || index === undefined) {
			if (item.length) {
				const [newItem, newIndex] = item;
				return [setNewProperty(prop, fn(newItem, newIndex))(newItem), newIndex];
			}
			return setNewProperty(prop, fn(item, index))(item);
		}
		if (flag) {
			return [setNewProperty(prop, fn(item, index))(item), index];
		}
		return setNewProperty(prop, fn(item, index))(item);
	};
}

function removeItemFromArray(prop, propValue) {
	return function inner(arr) {
		const newArr = arr || [];
		return newArr.reduce((list, item) => {
			const newList = [...list];
			if (propValue === item[prop]) {
				return newList;
			}
			return newList.concat(item);
		}, []);
	};
}

function createPropertyByOtherOne(...args) {
	const [prop1, prop2] = args;
	return function inner(item) {
		let newItem = {};
		if (item.length) {
			[newItem] = item;
		} else {
			newItem = { ...item };
		}
		newItem[prop1] = getPropertysValue(prop2)(newItem);
		return newItem;
	};
}

function updateItemInCollectionByIndex(index, row, collection) {
	return collection.reduce((list, item, ind) => {
		if (ind === index) {
			return list.concat(row);
		}
		return list.concat(item);
	}, []);
}

function updateAllItemInCollection(matchProp, row, collection) {
	return collection.reduce((list, item) => {
		if (row[matchProp] === item[matchProp]) {
			return list.concat(row);
		}
		return list.concat(item);
	}, []);
}

function mergeObjects(obj1, obj2) {
	const newObj = { ...obj1 };
	Object.keys(obj2).forEach((key) => {
		if (!newObj[key]) {
			newObj[key] = obj2[key];
		}
	});
	return newObj;
}

function round(d) {
	return function inner(val) {
		val = Number(val);
		if (typeof val === 'number' && !isNaN(val)) {
			return Number(val.toFixed(d));
		}
		return 0;
	};
}

const isEmpty = (arg) => {
	if (Array.isArray(arg)) {
		return arg.length === 0;
	}
	if (typeof arg === 'object' && arg !== null) {
		return Object.keys(arg).length === 0;
	}
	if (typeof arg === 'string' || typeof arg === 'number') {
		return !arg;
	}
	return !arg;
};

const allAreTrue = (...arg) => arg.every((a) => a);

const atLeastOneTrue = (...arg) => arg.some((a) => a);

const randomKey = () => Math.random().toString(36).substr(2, 9);

function getPath(obj) {
	if (!obj || typeof obj !== 'object') {
		return undefined;
	}

	var keys;

	if (arguments.length === 2 && typeof arguments[1] === 'string') {
		if (!arguments[1]) return undefined;
		keys = arguments[1].split('.');
	} else {
		keys = Array.prototype.slice.call(arguments, 1);
		if (!keys.length) return undefined;
	}

	var current = obj;

	for (var i = 0; i < keys.length; i++) {
		if (
			current !== null &&
			current !== undefined &&
			typeof current === 'object' &&
			Object.prototype.hasOwnProperty.call(current, keys[i])
		) {
			current = current[keys[i]];
		} else {
			return undefined;
		}
	}

	return current;
}

/**
 * Clona profundamente un objeto o array de datos primitivos.
 * Ideal para datos que vienen de servicios (JSON).
 * @param {Object|Array} data - Objeto o array a clonar
 * @returns {Object|Array} - Nueva copia independiente
 */
function cloneData(data) {
	return JSON.parse(JSON.stringify(data));
}

// Taxes
function getTaxMultiplier(percentage = 0) {
	return 1 + percentage / 100;
}

function calculateSubtotalFromTotal(total, percentage = 0) {
	const multiplier = getTaxMultiplier(percentage);
	return total / multiplier;
}

function calculateTaxAmountFromTotal(total, percentage = 0) {
	const subtotal = calculateSubtotalFromTotal(total, percentage);
	return total - subtotal;
}

function calculateTotalFromSubtotal(subtotal, percentage = 0) {
	const multiplier = getTaxMultiplier(percentage);
	return subtotal * multiplier;
}

export default {
	allAreTrue,
	atLeastOneTrue,
	buildMainObject,
	compose,
	createPropertyByOtherOne,
	decimals,
	distributeAmount,
	equality,
	equitativeAmount,
	filteByEquality,
	filteByMajorTo,
	filter,
	filterCollectionByEquality,
	filterCollectionMajorAndEqualTo,
	find,
	formattingPriceList,
	getDeeper,
	getNewDeeper,
	getPropertysValue,
	getRightPrice,
	getThisPropertysValue,
	isEmpty,
	map,
	matchBetweenArrays,
	mergeObjects,
	notEquality,
	priceListNewFormat,
	reduce,
	reduceCompose,
	removeItemFromArray,
	removeItemFromArrayByIndex,
	round,
	setNewProp,
	setNewProperty,
	setNewPropertyByFunction,
	updateAllItemInCollection,
	updateItemInCollection,
	updateItemInCollectionByIndex,
	updatePrice,
	randomKey,
	getPath,
	cloneData,
	getTaxMultiplier,
	calculateSubtotalFromTotal,
	calculateTaxAmountFromTotal,
	calculateTotalFromSubtotal,
};
