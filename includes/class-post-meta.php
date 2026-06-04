<?php
/**
 * Per-post goal meta registration.
 *
 * @package EditorWritingGoals
 */

namespace EditorWritingGoals;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers protected post meta exposed to the block editor.
 */
class Post_Meta {
	const WORD_TARGET_META      = '_editor_writing_goals_word_target';
	const CHARACTER_TARGET_META = '_editor_writing_goals_character_target';

	/**
	 * Register hooks.
	 *
	 * @return void
	 */
	public function register() {
		add_action( 'init', array( $this, 'register_meta' ), 99 );
	}

	/**
	 * Register meta for REST-enabled post types.
	 *
	 * @return void
	 */
	public function register_meta() {
		$post_types = get_post_types(
			array(
				'show_in_rest' => true,
			),
			'names'
		);

		foreach ( $post_types as $post_type ) {
			$this->register_meta_key( $post_type, self::WORD_TARGET_META );
			$this->register_meta_key( $post_type, self::CHARACTER_TARGET_META );
		}
	}

	/**
	 * Register one meta key for one post type.
	 *
	 * @param string $post_type Post type name.
	 * @param string $meta_key Meta key.
	 * @return void
	 */
	private function register_meta_key( $post_type, $meta_key ) {
		register_post_meta(
			$post_type,
			$meta_key,
			array(
				'type'              => 'integer',
				'single'            => true,
				'default'           => 0,
				'sanitize_callback' => 'absint',
				'auth_callback'     => array( $this, 'can_edit_post_meta' ),
				'show_in_rest'      => true,
			)
		);
	}

	/**
	 * Check whether the current user can edit the post meta.
	 *
	 * @param bool   $allowed  Existing allowed value.
	 * @param string $meta_key Meta key.
	 * @param int    $post_id  Post ID.
	 * @param int    $user_id  User ID.
	 * @return bool
	 */
	public function can_edit_post_meta( $allowed, $meta_key, $post_id, $user_id ) {
		unset( $allowed, $meta_key );

		if ( $post_id ) {
			return user_can( $user_id, 'edit_post', $post_id );
		}

		return user_can( $user_id, 'edit_posts' );
	}
}
