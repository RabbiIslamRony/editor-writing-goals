<?php
/**
 * Settings API integration.
 *
 * @package EditorWritingGoals
 */

namespace EditorWritingGoals;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Manages plugin settings.
 */
class Settings {
	const OPTION_NAME  = 'editor_writing_goals_settings';
	const OPTION_GROUP = 'editor_writing_goals_settings_group';
	const PAGE_SLUG    = 'editor-writing-goals';

	/**
	 * Register admin hooks.
	 *
	 * @return void
	 */
	public function register() {
		add_action( 'admin_menu', array( $this, 'add_settings_page' ) );
		add_action( 'admin_init', array( $this, 'register_settings' ) );
	}

	/**
	 * Default option values.
	 *
	 * @return array<string,int>
	 */
	public static function get_defaults() {
		return array(
			'default_word_goal'       => 1000,
			'default_character_goal'  => 0,
			'reading_speed'           => 200,
			'enable_title_check'      => 1,
			'enable_excerpt_check'    => 1,
			'enable_readability_check' => 1,
		);
	}

	/**
	 * Current settings merged with defaults.
	 *
	 * @return array<string,int>
	 */
	public static function get_settings() {
		$settings = get_option( self::OPTION_NAME, array() );

		if ( ! is_array( $settings ) ) {
			$settings = array();
		}

		$settings = wp_parse_args( $settings, self::get_defaults() );

		return array(
			'default_word_goal'       => absint( $settings['default_word_goal'] ),
			'default_character_goal'  => absint( $settings['default_character_goal'] ),
			'reading_speed'           => max( 1, absint( $settings['reading_speed'] ) ),
			'enable_title_check'      => empty( $settings['enable_title_check'] ) ? 0 : 1,
			'enable_excerpt_check'    => empty( $settings['enable_excerpt_check'] ) ? 0 : 1,
			'enable_readability_check' => empty( $settings['enable_readability_check'] ) ? 0 : 1,
		);
	}

	/**
	 * Add settings page under Settings.
	 *
	 * @return void
	 */
	public function add_settings_page() {
		add_options_page(
			__( 'Editor Writing Goals', 'editor-writing-goals' ),
			__( 'Editor Writing Goals', 'editor-writing-goals' ),
			'manage_options',
			self::PAGE_SLUG,
			array( $this, 'render_settings_page' )
		);
	}

	/**
	 * Register settings, sections, and fields.
	 *
	 * @return void
	 */
	public function register_settings() {
		register_setting(
			self::OPTION_GROUP,
			self::OPTION_NAME,
			array(
				'type'              => 'array',
				'sanitize_callback' => array( $this, 'sanitize_settings' ),
				'default'           => self::get_defaults(),
			)
		);

		add_settings_section(
			'editor_writing_goals_general',
			__( 'General', 'editor-writing-goals' ),
			array( $this, 'render_general_section' ),
			self::PAGE_SLUG
		);

		add_settings_field(
			'default_word_goal',
			__( 'Default word goal', 'editor-writing-goals' ),
			array( $this, 'render_number_field' ),
			self::PAGE_SLUG,
			'editor_writing_goals_general',
			array(
				'key'         => 'default_word_goal',
				'min'         => 0,
				'description' => __( 'Used when a post does not have its own word target.', 'editor-writing-goals' ),
			)
		);

		add_settings_field(
			'default_character_goal',
			__( 'Default character goal', 'editor-writing-goals' ),
			array( $this, 'render_number_field' ),
			self::PAGE_SLUG,
			'editor_writing_goals_general',
			array(
				'key'         => 'default_character_goal',
				'min'         => 0,
				'description' => __( 'Leave as 0 to disable the default character goal.', 'editor-writing-goals' ),
			)
		);

		add_settings_field(
			'reading_speed',
			__( 'Reading speed', 'editor-writing-goals' ),
			array( $this, 'render_number_field' ),
			self::PAGE_SLUG,
			'editor_writing_goals_general',
			array(
				'key'         => 'reading_speed',
				'min'         => 1,
				'description' => __( 'Words per minute used for estimated reading time.', 'editor-writing-goals' ),
			)
		);

		add_settings_section(
			'editor_writing_goals_features',
			__( 'Editor checks', 'editor-writing-goals' ),
			array( $this, 'render_features_section' ),
			self::PAGE_SLUG
		);

		$feature_fields = array(
			'enable_title_check'       => __( 'Enable title length check', 'editor-writing-goals' ),
			'enable_excerpt_check'     => __( 'Enable excerpt length check', 'editor-writing-goals' ),
			'enable_readability_check' => __( 'Enable readability check', 'editor-writing-goals' ),
		);

		foreach ( $feature_fields as $key => $label ) {
			add_settings_field(
				$key,
				$label,
				array( $this, 'render_checkbox_field' ),
				self::PAGE_SLUG,
				'editor_writing_goals_features',
				array(
					'key'   => $key,
					'label' => $label,
				)
			);
		}
	}

	/**
	 * Sanitize option array.
	 *
	 * @param mixed $input Raw settings input.
	 * @return array<string,int>
	 */
	public function sanitize_settings( $input ) {
		$input    = is_array( $input ) ? $input : array();
		$defaults = self::get_defaults();

		return array(
			'default_word_goal'       => isset( $input['default_word_goal'] ) ? absint( $input['default_word_goal'] ) : $defaults['default_word_goal'],
			'default_character_goal'  => isset( $input['default_character_goal'] ) ? absint( $input['default_character_goal'] ) : $defaults['default_character_goal'],
			'reading_speed'           => isset( $input['reading_speed'] ) ? max( 1, absint( $input['reading_speed'] ) ) : $defaults['reading_speed'],
			'enable_title_check'      => empty( $input['enable_title_check'] ) ? 0 : 1,
			'enable_excerpt_check'    => empty( $input['enable_excerpt_check'] ) ? 0 : 1,
			'enable_readability_check' => empty( $input['enable_readability_check'] ) ? 0 : 1,
		);
	}

	/**
	 * Render intro text for general settings.
	 *
	 * @return void
	 */
	public function render_general_section() {
		echo '<p>' . esc_html__( 'Set the defaults used by the editor sidebar. Per-post goals can override these defaults.', 'editor-writing-goals' ) . '</p>';
	}

	/**
	 * Render intro text for feature toggles.
	 *
	 * @return void
	 */
	public function render_features_section() {
		echo '<p>' . esc_html__( 'Choose which guidance sections appear in the block editor sidebar.', 'editor-writing-goals' ) . '</p>';
	}

	/**
	 * Render a numeric settings field.
	 *
	 * @param array<string,mixed> $args Field args.
	 * @return void
	 */
	public function render_number_field( $args ) {
		$settings    = self::get_settings();
		$key         = isset( $args['key'] ) ? sanitize_key( $args['key'] ) : '';
		$min         = isset( $args['min'] ) ? absint( $args['min'] ) : 0;
		$description = isset( $args['description'] ) ? $args['description'] : '';

		if ( ! $key || ! array_key_exists( $key, $settings ) ) {
			return;
		}

		printf(
			'<input type="number" class="small-text" min="%1$d" name="%2$s[%3$s]" value="%4$d" />',
			esc_attr( $min ),
			esc_attr( self::OPTION_NAME ),
			esc_attr( $key ),
			esc_attr( $settings[ $key ] )
		);

		if ( $description ) {
			printf( '<p class="description">%s</p>', esc_html( $description ) );
		}
	}

	/**
	 * Render a checkbox settings field.
	 *
	 * @param array<string,mixed> $args Field args.
	 * @return void
	 */
	public function render_checkbox_field( $args ) {
		$settings = self::get_settings();
		$key      = isset( $args['key'] ) ? sanitize_key( $args['key'] ) : '';
		$label    = isset( $args['label'] ) ? $args['label'] : '';

		if ( ! $key || ! array_key_exists( $key, $settings ) ) {
			return;
		}

		printf(
			'<label><input type="checkbox" name="%1$s[%2$s]" value="1" %3$s /> %4$s</label>',
			esc_attr( self::OPTION_NAME ),
			esc_attr( $key ),
			checked( 1, $settings[ $key ], false ),
			esc_html( $label )
		);
	}

	/**
	 * Render settings page.
	 *
	 * @return void
	 */
	public function render_settings_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have permission to access this page.', 'editor-writing-goals' ) );
		}
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'Editor Writing Goals', 'editor-writing-goals' ); ?></h1>
			<p><?php esc_html_e( 'Configure lightweight writing targets and editor-only checks. This plugin does not add frontend output or send data to external services.', 'editor-writing-goals' ); ?></p>
			<form method="post" action="options.php">
				<?php
				settings_fields( self::OPTION_GROUP );
				do_settings_sections( self::PAGE_SLUG );
				submit_button();
				?>
			</form>
		</div>
		<?php
	}
}
