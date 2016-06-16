// Anchor element as parser for URls as stated here: https://gist.github.com/jlong/2428561
const parser = document.createElement('a');

// Cache for already inlined files
let inlinedCache = [];

/**
 * @param  {String} filePath File path
 * @return {Boolean}         File already inlined
 */
function inCache(path) {
	return Boolean(inlinedCache.indexOf(path) !== -1);
}

/**
 * @param  {SVGUseElement} element <use> element
 * @param  {String}        xlink   Xlink attribute
 */
function changeXlink(element, xlink) {
	element.setAttribute('xlink:href', xlink);
}

/**
 * @param  {Array}         files   Previous returned value, in this case Array of file paths
 * @param  {SVGUseElement} element Xlink attribute
 * @return {Array}                 File paths to SVG resources
 */
function processItems(files, element) {
	parser.href = element.getAttribute('xlink:href');

	const filePath = parser.pathname;
	if (filePath) {
		if (files.indexOf(filePath) === -1) {
			files.push(filePath);
		}

		changeXlink(element, parser.hash);
	}

	return files;
}

/**
 * @param  {Element | String} content Content to insert
 */
function inlineFile(content) {
	const body = document.body;
	body.insertBefore(content, body.firstChild);
}

/**
 * Callback for XHR request
 */
function fileLoaded() {
	const response = this.response;
	if (
		!inCache(this.responseUrl) &&
		this.readyState === 4 &&
		response &&
		response.contentType === 'image/svg+xml'
	) {
		inlineFile(response.documentElement);
		inlinedCache.push(this.responseUrl);
	}
}

/**
 * @param  {String} filePath File path to request
 */
function fetchFile(filePath) {
	// Using XMLHttpRequest here due to lack of fetch support in browsers not supporting fragments
	const xhr = new XMLHttpRequest();

	xhr.addEventListener('load', fileLoaded);
	xhr.addEventListener('error', console.error);
	xhr.open('GET', filePath);
	xhr.responseType = 'document';
	xhr.send();
}

/**
 * @param {String} root      Entry component
 * @param {Array}  blacklist Blacklist for child nodes
 */
export default function(rootSelector = 'body', blacklist = []) {
	// Element name to query for
	const query = 'use'

	// building the negotiation for blacklisting
	const negotiations = blacklist.map(item => {
		return [':not(', item, ')'].join('');
	}).join('');

	// complete seletor for elements
	const selector = negotiations ?
		[rootSelector, '>', negotiations, query].join(' ') :
		[rootSelector, query].join(' ');
	const root = document.querySelector(rootSelector);
	const matches = root.querySelectorAll(selector) || [];
	const resourceFiles = Array
		.prototype
		.slice
		.call(matches)
		.reduce(processItems, []);

	resourceFiles.forEach(fetchFile);
}
