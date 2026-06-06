=== Editor Writing Goals ===
Contributors: ronya4927
Tags: writing, word count, character count, block editor, readability
Requires at least: 7.0
Tested up to: 7.0
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Track writing goals, content metrics, length checks, and readability directly inside the block editor sidebar.

== Description ==

Editor Writing Goals is a lightweight editor-only plugin for writers, bloggers, editors, and content teams who want simple writing feedback while drafting posts and pages.

The plugin adds one focused panel to the block editor sidebar. It does not add frontend output, shortcodes, tracking, AI features, or external service calls.

= Features =

* Live word count.
* Live character count.
* Estimated reading time.
* Paragraph count.
* Heading count.
* Per-post word and character goals.
* Global default goals.
* Title length check.
* Excerpt length check.
* Basic readability insights.

= Length Checks =

The title length check marks 50 to 60 characters as good.

The excerpt length check marks 120 to 160 characters as good.

These checks are simple writing aids. They do not replace a full SEO plugin and do not change your content.

= Readability =

The readability section shows average sentence length and counts paragraphs with 120 or more words.

= Privacy =

Editor Writing Goals does not collect analytics, does not track users, does not call external APIs, and does not send writing data outside your WordPress site.

Per-post goals are saved as protected post meta. Global defaults are saved in WordPress options.

== Installation ==

1. Upload the `editor-writing-goals` folder to `/wp-content/plugins/`.
2. Activate the plugin through the Plugins screen in WordPress.
3. Go to Settings > Editor Writing Goals to set default goals and feature toggles.
4. Open a post or page in the block editor and use the Writing Goals panel in the document sidebar.

== Frequently Asked Questions ==

= Does this plugin add anything to the frontend? =

No. Version 1.0 is editor-only.

= Does this plugin modify my post content? =

No. It reads the current editor content to calculate metrics, but it does not rewrite or insert content.

= Can each post have its own goal? =

Yes. Each post can store its own word and character targets. If a post target is empty, the global default is used.

= Does it work with the Classic Editor or Elementor? =

No. Version 1.0 is focused on the WordPress block editor.

= Does it use AI or an external API? =

No. All calculations run locally in the editor.

== Changelog ==

= 1.0.0 =
* Initial release.
* Added editor sidebar metrics, goals, length checks, and readability insights.
* Added Settings API page for defaults and feature toggles.

== Upgrade Notice ==

= 1.0.0 =
Initial release.
