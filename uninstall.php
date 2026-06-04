<?php
/**
 * Uninstall cleanup for Editor Writing Goals.
 *
 * @package EditorWritingGoals
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

delete_option( 'editor_writing_goals_settings' );
delete_post_meta_by_key( '_editor_writing_goals_word_target' );
delete_post_meta_by_key( '_editor_writing_goals_character_target' );
