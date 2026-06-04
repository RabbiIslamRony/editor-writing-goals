<?php
/**
 * Plugin loader.
 *
 * @package EditorWritingGoals
 */

namespace EditorWritingGoals;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers plugin services.
 */
class Plugin {
	/**
	 * Register hooks for the plugin.
	 *
	 * @return void
	 */
	public static function init() {
		load_plugin_textdomain( 'editor-writing-goals', false, dirname( plugin_basename( EWG_PLUGIN_FILE ) ) . '/languages' );

		$settings = new Settings();
		$settings->register();

		$post_meta = new Post_Meta();
		$post_meta->register();

		if ( is_admin() ) {
			$editor_assets = new Editor_Assets();
			$editor_assets->register();
		}
	}
}
