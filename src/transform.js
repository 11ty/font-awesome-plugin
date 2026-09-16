import debugUtil from "debug";
import matchHelper from "posthtml-match-helper";
import { findIconDefinition } from "@fortawesome/fontawesome-svg-core";

import { mergeAttrs, faIconToHtml } from "./icon-to-html.js";
import PREFIXES from "./prefixes.js";

const PRESERVED_CLASSES = new Set([
	// fixed width
	"fa-fw",

	// Sizing: https://docs.fontawesome.com/web/style/size
	// Relative sizing
	"fa-2xs",
	"fa-xs",
	"fa-sm",
	"fa-lg",
	"fa-xl",
	"fa-2xl",
	// Literal sizing
	"fa-1x",
	"fa-2x",
	"fa-3x",
	"fa-4x",
	"fa-5x",
	"fa-6x",
	"fa-7x",
	"fa-8x",
	"fa-9x",
	"fa-10x",
]);

const VALID_PREFIXES = new Set(PREFIXES.prefixes);

// Prefixes tried in order when markup has no style (e.g. v4 `fa fa-github`)
const FALLBACK_PREFIXES = ["fas", "far", "fab"];

const debug = debugUtil("Eleventy:FontAwesome");

function filterAttrs(attrs = {}) {
	if(attrs.class && typeof attrs.class === "string") {
		let newClass = attrs.class.split(" ").filter(cls => {
			if(PRESERVED_CLASSES.has(cls)) {
				return true;
			}
			if(cls === "fa" || VALID_PREFIXES.has(cls) || cls.startsWith("fa-")) {
				return false;
			}

			return true;
		}).join(" ");
		if(newClass) {
			attrs.class = newClass;
		} else {
			delete attrs.class;
		}
	}
	return attrs;
}

function isAnEligibleIconByClassName(className = "", ignores = []) {
	let s = className.split(" ");
	if(s.find(cls => ignores.includes(cls))) {
		return false;
	}
	return s.find(cls => {
		return cls.startsWith("fa-") || VALID_PREFIXES.has(cls)
	});
}

function findIconMetadata(className = "") {
	let classes = className.split(" ");
	let style;
	let family = "classic"; // optional, defaults to classic
	let prefix;
	let iconName;

	for(let cls of classes) {
		// Pro icons
		if(VALID_PREFIXES.has(cls)) {
			prefix = cls;
			family = PREFIXES.prefixToFamilyStyleMap[cls].family;
			style = PREFIXES.prefixToFamilyStyleMap[cls].style;
		}

		if(!cls.startsWith("fa-")) {
			continue;
		}

		cls = cls.slice("fa-".length);

		if(PREFIXES.styles.includes(cls)) {
			if(!prefix) {
				style = cls;
			}
		} else if(PREFIXES.families.includes(cls)) {
			if(!prefix) {
				family = cls;
			}
		} else if(PRESERVED_CLASSES.has(cls)) {
			// do nothing
		} else if(!iconName || cls.length > iconName.length) {
			iconName = cls;
		}
	}

	if(!prefix && style && family) {
		prefix = PREFIXES.familyStyleToPrefixMap[family][style];
	}

	return { prefix, style, family, iconName };
}

function classToIconSelector(className = "") {
	let { prefix, iconName } = findIconMetadata(className);
	if(!iconName) {
		return;
	}
	if(!prefix) {
		prefix = FALLBACK_PREFIXES.find(p => findIconDefinition({ prefix: p, iconName }));
	}
	if(prefix) {
		return `${prefix}:${iconName}`;
	}
}

function Transform(eleventyConfig, options = {}) {
	// options.transform (transform selector)
	// options.bundle (bundle name)
	// options.ignoredClasses (array to filter out nodes that have these classes)
	// options.generateId (function to return an `id` attribute string)
	// options.defaultAttributes (object)
	// options.failOnError
	// options.useXlinkHref

	let transformSelector = options.transform || "i[class]";
	let bundleName = options.bundle;
	let managers = eleventyConfig.getBundleManagers();
	if(!managers[bundleName]) {
		throw new Error(`Missing ${bundleName} Bundle Manager for Font Awesome icon plugin.`);
	}

	eleventyConfig.htmlTransformer.addPosthtmlPlugin(
		"html",
		function (context = {}) {
			let pageUrl = context?.url;
			return function (tree, ...args) {
				tree.match(matchHelper(transformSelector), function (node) {
					if(isAnEligibleIconByClassName(node.attrs.class, options.ignoredClasses)) {
						try {
							let selector = classToIconSelector(node.attrs.class);
							if(!selector) {
								throw new Error("Could not find icon: " + node.attrs.class);
							}

							let { ref, html, viewBox } = faIconToHtml(selector);
							if(pageUrl && managers[bundleName] && html) {
								managers[bundleName].addToPage(pageUrl, [ html ]);

								let attrs = mergeAttrs(node.attrs, options.defaultAttributes);
								let content = [];

								// set generateId to falsy to disable this feature.
								if(typeof options.generateId === "function" && Array.isArray(node?.content) && node.content.length > 0) {
									// See https://docs.fontawesome.com/web/dig-deeper/accessibility#making-icons-accessible-manually
									let id = options.generateId();
									attrs["aria-labelledby"] = id;
									attrs.role = "img";

									delete attrs["aria-hidden"];

									content.push({
										tag: "title",
										attrs: {
											id,
										},
										content: [...node?.content],
									});
								}

								let svgAttributes = {
									href: `#${ref}`,
								};

								if(options.useXlinkHref) {
									svgAttributes["xlink:href"] = `#${ref}`;
								}

								content.push({
									tag: "use",
									attrs: svgAttributes,
								});

								// Match Font Awesome’s own SVG output so the icon has an intrinsic aspect ratio
								attrs.viewBox = viewBox;

								return {
									tag: "svg",
									attrs: filterAttrs(attrs),
									content,
								};
							}
						} catch(e) {
							if(options.failOnError) {
								throw new Error(`Error with icon, via class="${node?.attrs?.class || "(unknown)"}". Resolved to: ${JSON.stringify(findIconMetadata(node.attrs.class))}. Original error message: ${e.message}`, {
									cause: e
								});
							} else {
								debug(`Could not find icon for class="%o" (ignoring via \`failOnError\` option)`, node?.attrs?.class);
								return node;
							}
						}
					}

					return node;
				});
			};
		}, // pluginOptions = {},
	);
}

export { filterAttrs, findIconMetadata, classToIconSelector, Transform };
