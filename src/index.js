// anchor element as parser for URls as stated here: https://gist.github.com/jlong/2428561
var parser = document.createElement('a');

/**
 * @param  {Object}        items   Previous returned value, in this case Object with use elements
 * @param  {SVGUseElement} element <use> element
 * @return {Object}                Object with sorted use elements
 */
function sortItems(items, element) {
	parser.href = element.getAttribute('xlink:href');

	var filePath = parser.pathname;

	var hash = parser.hash;

	if (!items[filePath]) {
		items[filePath] = {
			nodes: [],
			fragments: []
		};
	}

	var item = items[filePath];

	item.nodes.push({
		element: element,
		fragment: hash
	});

	if (item.fragments.indexOf(hash) === -1) {
		item.fragments.push(hash);
	}

	return items;
}

/**
 * @param  {SVGSVGElement}    doc SVG document
 * @param  {Array}            ids Fragment ids
 * @return {Array}            SVG symbols
 */
function getSymbols(doc, ids) {
	return Array
		.prototype
		.slice
		.call(doc.querySelectorAll(ids.join(',')))
		.reduce(function (items, item) {
			var key = ['#', item.id].join('');
			items[key] = item;
			return items;
		}, {});
}

/**
 * @param  {SVGUseElement}    item    SVG element to be replaced
 * @param  {SVGSymbolElement} content SVG contents to replace <use>
 */
function embed(item, content) {
	var parent = item.parentNode;

	// Setting viewBox attribute if not already set
	if (!parent.getAttribute('viewBox')) {
		parent.setAttribute('viewBox', content.getAttribute('viewBox'));
	}

	// creating new fragment as a store for the contents children
	var fragment = document.createDocumentFragment();
	var copy = content.cloneNode(true);

	// move each child to fragment
	while (copy.childNodes.length) {
		fragment.appendChild(copy.firstChild);
	}

	// replace use element by svg content
	parent.replaceChild(fragment, item);
}

/**
 * Callback for XHR request
 */
function fileLoaded(xhr, resourceFiles) {
	var response = xhr.response;

	if (
		xhr.readyState === 4 &&
		response &&
		response.contentType === 'image/svg+xml'
	) {
		var symbols = getSymbols(
			response.documentElement,
			resourceFiles.fragments
		);

		resourceFiles.nodes.forEach(function (item) {
			embed(item.element, symbols[item.fragment]);
		});
	}
}

/**
 * @param  {String} filePath File path to request
 */
function fetchFile(filePath, callback) {
	// using XMLHttpRequest here due to lack of fetch support in browsers not supporting fragments
	var xhr = new XMLHttpRequest();

	xhr.addEventListener('load', callback);
	xhr.addEventListener('error', console.error);
	xhr.open('GET', filePath);
	xhr.responseType = 'document';
	xhr.send();
}

/**
 * @param {String} rootSelector Entry component
 * @param {Array}  blacklist    Blacklist for child nodes
 * @param {String} query    	Query selector to search for
 */
function init(rootSelector, blacklist, query) {
	// building the negotiation for blacklisting
	var negotiations = blacklist.map(item => {
		return [':not(', item, ')'].join('');
	}).join('');

	// complete seletor for elements
	var selector = negotiations ?
		[rootSelector, '>', negotiations, query].join(' ') :
		[rootSelector, query].join(' ');
	var root = document.querySelector(rootSelector);
	var matches = root.querySelectorAll(selector);
	var resourceFiles = Array
		.prototype
		.slice
		.call(matches)
		.reduce(sortItems, {});

	Object.keys(resourceFiles).forEach(function (key) {
		var items = resourceFiles[key];
		fetchFile(key, function () {
			fileLoaded(this, items);
		});
	});
}

/**
 * @param {HTMLElement} testNode
 */
function supportsExternalFragments(testNode) {
	return testNode.getBoundingClientRect().width > 0;
}

/**
 * @param {String} rootSelector Entry component
 * @param {Array}  blacklist    Blacklist for child nodes
 */
export default function(rootSelector, blacklist) {
	// element name to query for
	var query = 'use';
	var supportsExternalFragments = supportsExternalFragments(
		document.querySelector(query)
	);

	if (!supportsExternalFragments) {
		// setting default values
		rootSelector = rootSelector || 'body';
		blacklist = blacklist || [];

		init(rootSelector, blacklist, query);
	}
}
