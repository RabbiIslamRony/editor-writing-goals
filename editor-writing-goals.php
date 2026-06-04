<?php
/**
 * Plugin Name: Editor Writing Goals
 * Plugin URI: https://wordpress.org/plugins/editor-writing-goals/
 * Description: Track writing goals, content metrics, length checks, and readability directly in the block editor sidebar.
 * Version: 1.0.0
 * Requires at least: 6.5
 * Requires PHP: 7.4
 * Author: Editor Writing Goals
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: editor-writing-goals
 * Domain Path: /languages
 *
 * @package EditorWritingGoals
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'EWG_VERSION', '1.0.0' );
define( 'EWG_PLUGIN_FILE', __FILE__ );
define( 'EWG_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'EWG_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

require_once EWG_PLUGIN_DIR . 'includes/class-settings.php';
require_once EWG_PLUGIN_DIR . 'includes/class-post-meta.php';
require_once EWG_PLUGIN_DIR . 'includes/class-editor-assets.php';
require_once EWG_PLUGIN_DIR . 'includes/class-plugin.php';

/**
 * Store default settings on activation.
 *
 * @return void
 */
function ewg_activate() {
	if ( false === get_option( \EditorWritingGoals\Settings::OPTION_NAME ) ) {
		add_option( \EditorWritingGoals\Settings::OPTION_NAME, \EditorWritingGoals\Settings::get_defaults() );
	}
}
register_activation_hook( __FILE__, 'ewg_activate' );

add_action( 'plugins_loaded', array( \EditorWritingGoals\Plugin::class, 'init' ) );
