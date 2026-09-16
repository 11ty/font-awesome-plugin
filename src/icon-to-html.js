import { escapeAttribute } from "entities";
import { library, findIconDefinition, icon } from "@fortawesome/fontawesome-svg-core";

// All of the free icon sets are included by default.
import { fas } from "@fortawesome/free-solid-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";

library.add(fas); // `house` or `fas:house`
library.add(far); // `user` or `far:user`
library.add(fab); // `fab:bluesky` (requires prefix)

function faIconToHtml(selector) {
	let prefix; // optional in some cases
	let iconName;
	if(selector.includes(":")) {
		[prefix, iconName] = selector.split(":");
	} else {
		iconName = selector;
	}

	let iconDef = findIconDefinition({
		prefix,
		iconName
	});

	let svg = icon(iconDef, {
		// TODO option to set the color embedded in the markup
		// styles: {
		// 	color: "#000",
		// },
		symbol: true,
	});

	let html = svg?.html;

	if(!iconDef || !html || !Array.isArray(html)) {
		throw new Error("Could not find icon: " + selector);
	}

	let [width, height] = iconDef.icon;

	return {
		ref: `${iconDef.prefix}-fa-${iconDef.iconName}`,
		html: html.join(""),
		viewBox: `0 0 ${width} ${height}`,
	}
}

function attrsToHtml(attrs = {}) {
	return Object.entries(attrs).map(entry => {
    let [key, value] = entry;

    return `${key}="${escapeAttribute(value)}"`;
  }).join(" ");
}

function mergeAttrs(attrs = {}, newAttrs = {}) {
	let newAttrsNoMutate = Object.assign({}, newAttrs);
	if(attrs.class && newAttrs.class) {
		attrs.class = Array.from(new Set(`${attrs.class} ${newAttrs.class}`.split(" "))).join(" ");
		delete newAttrsNoMutate.class;
	}
	if(attrs.style && newAttrs.style) {
		attrs.style = Array.from(new Set(`${attrs.style} ${newAttrs.style}`.split(";"))).join(" ");
		delete newAttrsNoMutate.style;
	}
	return Object.assign(attrs, newAttrsNoMutate);
}

export { mergeAttrs, attrsToHtml, faIconToHtml };