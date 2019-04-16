# SVG&lt;use&gt;It
![npm (tag)](https://img.shields.io/npm/v/svg-use-it/latest.svg?style=flat-square)

## About

In many web projects there are browser lists including IE10 and 11
which sadly don't support SVG fragment identifiers on external resources.

This polyfill solves this problem by simply inlining the referenced shapes from
the given file **without user agent sniffing**.

## Usage

SVG gives us the ability to use instances of shapes which is pretty amazing for
icon libraries.
Just add a `svg` tag to your markup with a `use` tag as child and add your
resource's file path with the id hash of your desired shape like this:

```html
<svg viewBox="0 0 64 64">
    <!-- referencing id "menu" from "/path/to/my/icons.svg" -->
    <use xlink:href="/path/to/my/icons.svg#menu"></use>
</svg>
```

Just import `svgUseIt` into your script (which gets included at the bottom of
your HTML) or execute it on `DOMContentLoaded`:
```javascript
import svgUseIt from 'svg-use-it';

document.addEventListener('DOMContentLoaded', () => {
	svgUseIt();
});
```

## Options
`svgUseIt` takes two paramters:

### rootSelector
Provide a root selector to search in `<string>`.

* Default: `body`
* Optional: true

### blacklist
You can pass an array of direct children of [rootSelector](#rootSelector) to be
ignored for replacement.

* Default: `[]`
* Optional: true

## Good to know

### Feature detection
Of course this polyfill should only do its job on browsers that don't support
fragment identifiers from external resources.
So I researched for a feature that could identify each IE except for MSEdge.
Due to the fact, that `documentMode` is *just* supported in
Internet Explorer <= 11, we can use it here to detect support for external
fragments.

```javascript
// false on all browsers except for IE <= 11
Boolean(document.documentMode);
```
