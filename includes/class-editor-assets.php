<?php
/**
 * Block editor assets.
 *
 * @package EditorWritingGoals
 */

namespace EditorWritingGoals;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Enqueues editor-only assets.
 */
class Editor_Assets {
	/**
	 * Register editor asset hook.
	 *
	 * @return void
	 */
	public function register() {
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_assets' ) );
	}

	/**
	 * Enqueue block editor script and style.
	 *
	 * @return void
	 */
	public function enqueue_assets() {
		$asset_path = EWG_PLUGIN_DIR . 'build/index.asset.php';
		$asset      = file_exists( $asset_path )
			? include $asset_path
			: array(
				'dependencies' => array( 'wp-components', 'wp-data', 'wp-edit-post', 'wp-element', 'wp-i18n', 'wp-plugins' ),
				'version'      => EWG_VERSION,
			);

		wp_enqueue_script(
			'editor-writing-goals-editor',
			EWG_PLUGIN_URL . 'build/index.js',
			isset( $asset['dependencies'] ) ? $asset['dependencies'] : array(),
			isset( $asset['version'] ) ? $asset['version'] : EWG_VERSION,
			true
		);

		wp_set_script_translations( 'editor-writing-goals-editor', 'editor-writing-goals', EWG_PLUGIN_DIR . 'languages' );

		wp_add_inline_script(
			'editor-writing-goals-editor',
			'window.editorWritingGoals = ' . wp_json_encode(
				array(
					'settings' => Settings::get_settings(),
					'metaKeys' => array(
						'wordTarget'      => Post_Meta::WORD_TARGET_META,
						'characterTarget' => Post_Meta::CHARACTER_TARGET_META,
					),
				)
			) . ';',
			'before'
		);

		$style_path = EWG_PLUGIN_DIR . 'build/index.css';

		if ( file_exists( $style_path ) ) {
			wp_enqueue_style(
				'editor-writing-goals-editor',
				EWG_PLUGIN_URL . 'build/index.css',
				array( 'wp-components' ),
				filemtime( $style_path )
			);
		}
	}
}
