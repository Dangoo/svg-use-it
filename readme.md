# SVGuseIt

## About

In many web projects there are browser lists including IE10 and 11
which sadly don't support fragment identifiers on external resources.

This polyfill solves this problem by simply inlining the references shapes from
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

Just import *SVGuseIt* into your script and execute it on `DOMContentLoaded`:
```javascript
import svgUseIt from 'svg-use-it';

document.addEventListener('DOMContentLoaded', () => {
	svgUseIt();
});
```

## Options

### rootSelector
Provide a root selector to search in `<string>`.
Default: `body`

### blacklist
You can pass an array of direct children of [rootSelector](#rootSelector) to be
ignored for replacement.
Default: `[]`
