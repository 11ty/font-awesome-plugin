import test from "ava";
import { findIconDefinition } from "@fortawesome/fontawesome-svg-core";
import Eleventy from "@11ty/eleventy";
import fontAwesomePlugin from "../plugin.js";
import { findIconMetadata, filterAttrs } from "../src/transform.js";


test("Transform", async t => {
	let elev = new Eleventy("./test/virtual/", "./_site", {
		config: function(eleventyConfig) {
			eleventyConfig.addPlugin(fontAwesomePlugin);

			eleventyConfig.addTemplate("index.njk", `<i class="fa-regular fa-user"></i>
{% getBundle "fontawesome" %}`);
		}
	});

	let [result] = await elev.toJSON();
	t.is(result.content, `<svg aria-hidden="true"><use href="#far-fa-user" xlink:href="#far-fa-user"></use></svg>
<svg style="display: none;"><symbol data-prefix="far" data-icon="user" class="svg-inline--fa fa-user" role="img" viewBox="0 0 448 512" aria-hidden="true" id="far-fa-user"><path fill="currentColor" d="M144 128a80 80 0 1 1 160 0 80 80 0 1 1 -160 0zm208 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0zM48 480c0-70.7 57.3-128 128-128l96 0c70.7 0 128 57.3 128 128l0 8c0 13.3 10.7 24 24 24s24-10.7 24-24l0-8c0-97.2-78.8-176-176-176l-96 0C78.8 304 0 382.8 0 480l0 8c0 13.3 10.7 24 24 24s24-10.7 24-24l0-8z"></path></symbol></svg>`);
});

test("Transform using a missing (pro) icon", async t => {
	let elev = new Eleventy("./test/virtual/", "./_site", {
		config: function(eleventyConfig) {
			eleventyConfig.addPlugin(fontAwesomePlugin);

			eleventyConfig.addTemplate("index.njk", `<i class="fa-solid fa-left"></i>
{% getBundle "fontawesome" %}`);
		}
	});

	let [result] = await elev.toJSON();
	t.is(result.content.trim(), `<i class="fa-solid fa-left"></i>`);
});

test("Transform using a missing (pro) icon with fail on error", async t => {
	let elev = new Eleventy("./test/virtual/", "./_site", {
		config: function(eleventyConfig) {
			eleventyConfig.addPlugin(fontAwesomePlugin, {
				failOnError: true,
			});

			eleventyConfig.addTemplate("index.njk", `<i class="fa-solid fa-left"></i>
{% getBundle "fontawesome" %}`);
		}
	});
	elev.disableLogger();

	let e = await t.throwsAsync(() => elev.toJSON());
	t.is(e.originalError.originalError.message, `Error with icon, via class="fa-solid fa-left". Resolved to: {"prefix":"fas","style":"solid","family":"classic","iconName":"left"}. Original error message: Could not find icon: fas:left`);
});

test("Transform is working in layout", async t => {
	let elev = new Eleventy("./test/virtual/", "./_site", {
		config: function(eleventyConfig) {
			eleventyConfig.addPlugin(fontAwesomePlugin);

			eleventyConfig.addTemplate("_includes/layout.njk", `{{ content | safe }}
{% getBundle "fontawesome" %}`);
			eleventyConfig.addTemplate("index.njk", `<i class="fa-regular fa-user"></i>`, {
				layout: "layout.njk"
			});
		}
	});

	let [result] = await elev.toJSON();
	t.is(result.content, `<svg aria-hidden="true"><use href="#far-fa-user" xlink:href="#far-fa-user"></use></svg>
<svg style="display: none;"><symbol data-prefix="far" data-icon="user" class="svg-inline--fa fa-user" role="img" viewBox="0 0 448 512" aria-hidden="true" id="far-fa-user"><path fill="currentColor" d="M144 128a80 80 0 1 1 160 0 80 80 0 1 1 -160 0zm208 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0zM48 480c0-70.7 57.3-128 128-128l96 0c70.7 0 128 57.3 128 128l0 8c0 13.3 10.7 24 24 24s24-10.7 24-24l0-8c0-97.2-78.8-176-176-176l-96 0C78.8 304 0 382.8 0 480l0 8c0 13.3 10.7 24 24 24s24-10.7 24-24l0-8z"></path></symbol></svg>`);
});

test("Shortcode", async t => {
	let elev = new Eleventy("./test/virtual/", "./_site", {
		config: function(eleventyConfig) {
			eleventyConfig.addPlugin(fontAwesomePlugin, {
				transform: false,
				shortcode: "icon",
				defaultAttributes: {
					class: "zicon",
				}
			});

			eleventyConfig.addTemplate("index.njk", `{% icon "far:user" %}
{% getBundle "fontawesome" %}`);
		}
	});

	let [result] = await elev.toJSON();
	t.is(result.content, `<svg class="zicon"><use href="#far-fa-user" xlink:href="#far-fa-user"></use></svg>
<svg style="display: none;"><symbol data-prefix="far" data-icon="user" class="svg-inline--fa fa-user" role="img" viewBox="0 0 448 512" aria-hidden="true" id="far-fa-user"><path fill="currentColor" d="M144 128a80 80 0 1 1 160 0 80 80 0 1 1 -160 0zm208 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0zM48 480c0-70.7 57.3-128 128-128l96 0c70.7 0 128 57.3 128 128l0 8c0 13.3 10.7 24 24 24s24-10.7 24-24l0-8c0-97.2-78.8-176-176-176l-96 0C78.8 304 0 382.8 0 480l0 8c0 13.3 10.7 24 24 24s24-10.7 24-24l0-8z"></path></symbol></svg>`);
});

test("Shortcode with Accessible text", async t => {
	let elev = new Eleventy("./test/virtual/", "./_site", {
		config: function(eleventyConfig) {
			eleventyConfig.addPlugin(fontAwesomePlugin, {
				transform: false,
				shortcode: "icon",
				generateId: () => `shortcode-a11y`,
			});

			eleventyConfig.addTemplate("index.njk", `{% icon "far:user", { "alt": "A user" } %}
{% getBundle "fontawesome" %}`);
		}
	});

	let [result] = await elev.toJSON();
	t.is(result.content, `<svg aria-labelledby="shortcode-a11y" role="img"><use href="#far-fa-user" xlink:href="#far-fa-user"></use><title id="shortcode-a11y">A user</title></svg>
<svg style="display: none;"><symbol data-prefix="far" data-icon="user" class="svg-inline--fa fa-user" role="img" viewBox="0 0 448 512" aria-hidden="true" id="far-fa-user"><path fill="currentColor" d="M144 128a80 80 0 1 1 160 0 80 80 0 1 1 -160 0zm208 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0zM48 480c0-70.7 57.3-128 128-128l96 0c70.7 0 128 57.3 128 128l0 8c0 13.3 10.7 24 24 24s24-10.7 24-24l0-8c0-97.2-78.8-176-176-176l-96 0C78.8 304 0 382.8 0 480l0 8c0 13.3 10.7 24 24 24s24-10.7 24-24l0-8z"></path></symbol></svg>`);
});

test("Transform with defaultAttributes", async t => {
	let elev = new Eleventy("./test/virtual/", "./_site", {
		config: function(eleventyConfig) {
			eleventyConfig.addPlugin(fontAwesomePlugin, {
				defaultAttributes: {
					class: "zicon"
				}
			});

			eleventyConfig.addTemplate("index.njk", `<i class="fa-regular fa-user"></i>
{% getBundle "fontawesome" %}`);
		}
	});

	let [result] = await elev.toJSON();
	t.is(result.content, `<svg class="zicon"><use href="#far-fa-user" xlink:href="#far-fa-user"></use></svg>
<svg style="display: none;"><symbol data-prefix="far" data-icon="user" class="svg-inline--fa fa-user" role="img" viewBox="0 0 448 512" aria-hidden="true" id="far-fa-user"><path fill="currentColor" d="M144 128a80 80 0 1 1 160 0 80 80 0 1 1 -160 0zm208 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0zM48 480c0-70.7 57.3-128 128-128l96 0c70.7 0 128 57.3 128 128l0 8c0 13.3 10.7 24 24 24s24-10.7 24-24l0-8c0-97.2-78.8-176-176-176l-96 0C78.8 304 0 382.8 0 480l0 8c0 13.3 10.7 24 24 24s24-10.7 24-24l0-8z"></path></symbol></svg>`);
});

test("Transform with ignoredClasses", async t => {
	let elev = new Eleventy("./test/virtual/", "./_site", {
		config: function(eleventyConfig) {
			eleventyConfig.addPlugin(fontAwesomePlugin, {
				ignoredClasses: ["fak"],
				failOnError: true,
			});

			eleventyConfig.addTemplate("index.njk", `<i class="fak fa-dot"></i><i class="fa-regular fa-font-awesome"></i>
{% getBundle "fontawesome" %}`);
		}
	});

	let [result] = await elev.toJSON();
	t.is(result.content, `<i class="fak fa-dot"></i><svg aria-hidden="true"><use href="#far-fa-font-awesome" xlink:href="#far-fa-font-awesome"></use></svg>
<svg style="display: none;"><symbol data-prefix="far" data-icon="font-awesome" class="svg-inline--fa fa-font-awesome" role="img" viewBox="0 0 512 512" aria-hidden="true" id="far-fa-font-awesome"><path fill="currentColor" d="M91.7 96C106.3 86.8 116 70.5 116 52 116 23.3 92.7 0 64 0S12 23.3 12 52c0 16.7 7.8 31.5 20 41l0 419 48 0 0-64 389.6 0c14.6 0 26.4-11.8 26.4-26.4 0-3.7-.8-7.3-2.3-10.7L432 272 493.7 133.1c1.5-3.4 2.3-7 2.3-10.7 0-14.6-11.8-26.4-26.4-26.4L91.7 96zM80 400l0-256 356.4 0-48.2 108.5c-5.5 12.4-5.5 26.6 0 39L436.4 400 80 400z"></path></symbol></svg>`);
});

test("findIconMetadata", async t => {
	t.deepEqual(findIconMetadata("fa-regular fa-user"), { family: "classic", iconName: "user", prefix: "far", style: "regular" });
	t.deepEqual(findIconMetadata("fas fa-starfighter fa-fw"), { family: "classic", iconName: "starfighter", prefix: "fas", style: "solid" });
	t.deepEqual(findIconMetadata("fal fa-arrow-up-right"), { family: "classic", iconName: "arrow-up-right", prefix: "fal", style: "light" });
});

test("filterAttrs", async t => {
	t.deepEqual(filterAttrs({
		class: "fas fa-sparkles fa-2xl"
	}), {
		class: "fa-2xl"
	});
});

test("Old tshirt syntax", async t => {
	let def = findIconDefinition({ prefix: 'fas', iconName: 'tshirt' });
	t.is(def.iconName, "shirt");

	// tshirt is used here, not yet normalized via aliases
	t.deepEqual(findIconMetadata("fas fa-tshirt"), { family: "classic", iconName: "tshirt", prefix: "fas", style: "solid" });
});

test("Old tshirt syntax (html)", async t => {
	let elev = new Eleventy("./test/virtual/", "./_site", {
		config: function(eleventyConfig) {
			eleventyConfig.addPlugin(fontAwesomePlugin, {
				failOnError: true,
			});

			eleventyConfig.addTemplate("index.njk", `<i class="fas fa-tshirt"></i>
{% getBundle "fontawesome" %}`);
		}
	});

	let [result] = await elev.toJSON();
	t.is(result.content, `<svg aria-hidden="true"><use href="#fas-fa-shirt" xlink:href="#fas-fa-shirt"></use></svg>
<svg style="display: none;"><symbol data-prefix="fas" data-icon="shirt" class="svg-inline--fa fa-shirt" role="img" viewBox="0 0 640 512" aria-hidden="true" id="fas-fa-shirt"><path fill="currentColor" d="M320.2 112c44.2 0 80-35.8 80-80l53.5 0c17 0 33.3 6.7 45.3 18.7L617.6 169.4c12.5 12.5 12.5 32.8 0 45.3l-50.7 50.7c-12.5 12.5-32.8 12.5-45.3 0l-41.4-41.4 0 224c0 35.3-28.7 64-64 64l-192 0c-35.3 0-64-28.7-64-64l0-224-41.4 41.4c-12.5 12.5-32.8 12.5-45.3 0L22.9 214.6c-12.5-12.5-12.5-32.8 0-45.3L141.5 50.7c12-12 28.3-18.7 45.3-18.7l53.5 0c0 44.2 35.8 80 80 80z"></path></symbol></svg>`);
});

test("Accessible text", async t => {
	let elev = new Eleventy("./test/virtual/", "./_site", {
		config: function(eleventyConfig) {
			eleventyConfig.addPlugin(fontAwesomePlugin, {
				failOnError: true,
				generateId: () => `demo-static-id`, // override for test
			});

			eleventyConfig.addTemplate("index.njk", `<i class="fas fa-tshirt">shirt</i>
{% getBundle "fontawesome" %}`);
		}
	});

	let [result] = await elev.toJSON();
	t.is(result.content, `<svg aria-labelledby="demo-static-id" role="img"><title id="demo-static-id">shirt</title><use href="#fas-fa-shirt" xlink:href="#fas-fa-shirt"></use></svg>
<svg style="display: none;"><symbol data-prefix="fas" data-icon="shirt" class="svg-inline--fa fa-shirt" role="img" viewBox="0 0 640 512" aria-hidden="true" id="fas-fa-shirt"><path fill="currentColor" d="M320.2 112c44.2 0 80-35.8 80-80l53.5 0c17 0 33.3 6.7 45.3 18.7L617.6 169.4c12.5 12.5 12.5 32.8 0 45.3l-50.7 50.7c-12.5 12.5-32.8 12.5-45.3 0l-41.4-41.4 0 224c0 35.3-28.7 64-64 64l-192 0c-35.3 0-64-28.7-64-64l0-224-41.4 41.4c-12.5 12.5-32.8 12.5-45.3 0L22.9 214.6c-12.5-12.5-12.5-32.8 0-45.3L141.5 50.7c12-12 28.3-18.7 45.3-18.7l53.5 0c0 44.2 35.8 80 80 80z"></path></symbol></svg>`);
});

test("Disable accessible text", async t => {
	let elev = new Eleventy("./test/virtual/", "./_site", {
		config: function(eleventyConfig) {
			eleventyConfig.addPlugin(fontAwesomePlugin, {
				failOnError: true,
				generateId: false,
			});

			eleventyConfig.addTemplate("index.njk", `<i class="fas fa-tshirt">shirt</i>
{% getBundle "fontawesome" %}`);
		}
	});

	let [result] = await elev.toJSON();
	t.is(result.content, `<svg aria-hidden="true"><use href="#fas-fa-shirt" xlink:href="#fas-fa-shirt"></use></svg>
<svg style="display: none;"><symbol data-prefix="fas" data-icon="shirt" class="svg-inline--fa fa-shirt" role="img" viewBox="0 0 640 512" aria-hidden="true" id="fas-fa-shirt"><path fill="currentColor" d="M320.2 112c44.2 0 80-35.8 80-80l53.5 0c17 0 33.3 6.7 45.3 18.7L617.6 169.4c12.5 12.5 12.5 32.8 0 45.3l-50.7 50.7c-12.5 12.5-32.8 12.5-45.3 0l-41.4-41.4 0 224c0 35.3-28.7 64-64 64l-192 0c-35.3 0-64-28.7-64-64l0-224-41.4 41.4c-12.5 12.5-32.8 12.5-45.3 0L22.9 214.6c-12.5-12.5-12.5-32.8 0-45.3L141.5 50.7c12-12 28.3-18.7 45.3-18.7l53.5 0c0 44.2 35.8 80 80 80z"></path></symbol></svg>`);
});

test("Opt-out of xlink:href attributes", async t => {
	let elev = new Eleventy("./test/virtual/", "./_site", {
		config: function(eleventyConfig) {
			eleventyConfig.addPlugin(fontAwesomePlugin, {
				useXlinkHref: false,
				// generateId: () => `demo-static-id`, // override for test
			});

			eleventyConfig.addTemplate("index.njk", `<i class="fa-regular fa-user"></i>
{% getBundle "fontawesome" %}`);
		}
	});

	let [result] = await elev.toJSON();
	t.is(result.content, `<svg aria-hidden="true"><use href="#far-fa-user"></use></svg>
<svg style="display: none;"><symbol data-prefix="far" data-icon="user" class="svg-inline--fa fa-user" role="img" viewBox="0 0 448 512" aria-hidden="true" id="far-fa-user"><path fill="currentColor" d="M144 128a80 80 0 1 1 160 0 80 80 0 1 1 -160 0zm208 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0zM48 480c0-70.7 57.3-128 128-128l96 0c70.7 0 128 57.3 128 128l0 8c0 13.3 10.7 24 24 24s24-10.7 24-24l0-8c0-97.2-78.8-176-176-176l-96 0C78.8 304 0 382.8 0 480l0 8c0 13.3 10.7 24 24 24s24-10.7 24-24l0-8z"></path></symbol></svg>`);
});