# `@11ty/font-awesome`

Optimized per-page tree-shaken SVG spritesheets for Eleventy with Font Awesome icons.

_**Requires Eleventy v3.0.1 or newer.**_

* Currently used in production on [11ty.dev](https://www.11ty.dev/) and [zachleat.com](https://www.zachleat.com/)

## Features

- Using [Font Awesome v7](https://fontawesome.com/icons): choose from any of the 2000+ free icons provided by Font Awesome or optionally add Pro sets too.
- Creates a customized per-page de-duplicated SVG sprite-sheet for _any_ template in Eleventy that outputs HTML (yes, even Markdown).
- Driven via HTML: copy HTML directly from the Font Awesome docs (e.g. `<i class="fa-regular fa-user"></i>`).
- SVG-only. No additional CSS or JavaScript is added.
- Optimized: Using an icon more than once will de-duplicate the SVG code for you and only include it once.

### Not yet supported

- Animation classes

## Usage

Install via [`npm` at `@11ty/font-awesome`](https://www.npmjs.com/package/@11ty/font-awesome):

```sh
npm install @11ty/font-awesome
```

Add to your configuration file:

```js
import fontAwesomePlugin from "@11ty/font-awesome";

export default function(eleventyConfig) {
	eleventyConfig.addPlugin(fontAwesomePlugin);
};
```

Add the HTML markup from any of the 2000+ free icons from the Font Awesome library directly into any Eleventy template type (yes, Markdown, too) (e.g. `<i class="fa-regular fa-user"></i>`):

- [Font Awesome Solid](https://fontawesome.com/search?o=r&ic=free&s=solid)
- [Font Awesome Regular](https://fontawesome.com/search?o=r&ic=free&s=regular)
- [Font Awesome Brands](https://fontawesome.com/search?o=r&ic=free&ip=brands)

Somewhere on your page (probably in an [Eleventy Layout file](https://www.11ty.dev/docs/layouts/)), you’ll want to output the spritesheet from the [Bundle Plugin](https://www.11ty.dev/docs/plugins/bundle/):

```njk
<!-- e.g. _includes/layout.njk -->

<main>
{{ content | safe }}
</main>

<!-- outputs all the icons used on the page -->
{% getBundle "fontawesome" %}
```

### Advanced Usage

#### Use Font Awesome Pro Icon sets (or Kits)

Read more on the available package sets on the [Font Awesome docs](https://docs.fontawesome.com/apis/javascript/import-icons#svg-icon-package-names).

```js
import fontAwesomePlugin from "@11ty/font-awesome";
import { fas } from "@fortawesome/pro-solid-svg-icons";
import { far } from "@fortawesome/pro-regular-svg-icons";
import { fal } from "@fortawesome/pro-light-svg-icons";
import { fat } from "@fortawesome/pro-thin-svg-icons";
import { fad } from "@fortawesome/pro-duotone-svg-icons";
import { fass } from "@fortawesome/sharp-solid-svg-icons";
import { fasr } from "@fortawesome/sharp-regular-svg-icons";
import { fasl } from "@fortawesome/sharp-light-svg-icons";
import { fast } from "@fortawesome/sharp-thin-svg-icons";
import { fasds } from "@fortawesome/sharp-duotone-solid-svg-icons";
import { all } from '@awesome.me/kit-KIT_CODE/icons'
```

```js
export default function(eleventyConfig) {
	eleventyConfig.addPlugin(fontAwesomePlugin, {
		sets: [fas, far, fal, fat, fad, fass, fasr, fasl, fast, fasds],
	})
};
```

Alternatively, you can [add to the Font Awesome library directly](https://docs.fontawesome.com/apis/javascript/icon-library#adding-icons-to-the-library):

```js
library.add(fas, far, fal, fat, fad, fass, fasr, fasl, fast, fasds);

// Kit icons
library.add(...all);

export default function(eleventyConfig) {
	eleventyConfig.addPlugin(fontAwesomePlugin)
};
```

##### Handling conflicts

This plugin will work alongside and play nicely with existing Font Awesome clientside JavaScript. If your Eleventy plugin bundle does not include an icon it will fail gracefully to be picked up by the clientside Font Awesome JavaScript library.

#### Use an Eleventy Shortcode

```js
import fontAwesomePlugin from "@11ty/font-awesome";

export default function(eleventyConfig) {
	eleventyConfig.addPlugin(fontAwesomePlugin, {
		transform: false, // disable the Eleventy transform
		shortcode: "icon",
	})
};
```

The above configuration will create a `{% icon %}` shortcode than can be used in templates like this (instead of the Eleventy transform and direct HTML usage):

```njk
{% icon "fab:font-awesome" %} Font Awesome
```

You’ll still need to use `{% getBundle "fontawesome" %}` as noted above to output the spritesheet.

#### Full Options List

Defaults shown.

```js
import fontAwesomePlugin from "@11ty/font-awesome";

export default function(eleventyConfig) {
	eleventyConfig.addPlugin(fontAwesomePlugin, {
		sets: false, // Array of additional icon sets
		transform: "i[class]", // Selector for icons, set falsy to disable the transform
		shortcode: false, // Optional shortcode name (string), false will disable
		bundle: "fontawesome", // Rename the Bundle Plugin name
		failOnError: false, // Whether to fail when an icon is not found
		defaultAttributes: {}, // Used in shortcode and transform <svg> output
	})
};
```