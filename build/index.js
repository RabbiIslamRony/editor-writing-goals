( function ( wp ) {
	if (
		! wp ||
		! wp.plugins ||
		! wp.editPost ||
		! wp.data ||
		! wp.element ||
		! wp.components ||
		! wp.i18n
	) {
		return;
	}

	var el = wp.element.createElement;
	var Fragment = wp.element.Fragment;
	var PluginDocumentSettingPanel = wp.editPost.PluginDocumentSettingPanel;
	var registerPlugin = wp.plugins.registerPlugin;
	var useSelect = wp.data.useSelect;
	var useDispatch = wp.data.useDispatch;
	var __ = wp.i18n.__;
	var sprintf = wp.i18n.sprintf;
	var BaseControl = wp.components.BaseControl;
	var PanelRow = wp.components.PanelRow;
	var TextControl = wp.components.TextControl;
	var Text =
		wp.components.__experimentalText ||
		function ( props ) {
			return el(
				'p',
				{ className: 'components-base-control__help' },
				props.children
			);
		};
	var SectionLabel =
		BaseControl && BaseControl.VisualLabel
			? BaseControl.VisualLabel
			: function ( props ) {
					return el( 'strong', null, props.children );
			  };

	var config = window.editorWritingGoals || {};
	var providedSettings = config.settings || {};
	var metaKeys = config.metaKeys || {};
	var defaultSettings = {
		default_word_goal: 1000,
		default_character_goal: 0,
		reading_speed: 200,
		enable_title_check: 1,
		enable_excerpt_check: 1,
		enable_readability_check: 1,
	};
	var settings = Object.assign( {}, defaultSettings, providedSettings );
	var wordTargetMeta =
		metaKeys.wordTarget || '_editor_writing_goals_word_target';
	var characterTargetMeta =
		metaKeys.characterTarget || '_editor_writing_goals_character_target';

	function toPositiveInteger( value ) {
		var parsed = parseInt( value, 10 );
		return Number.isFinite( parsed ) && parsed > 0 ? parsed : 0;
	}

	function getTextFromHtml( html ) {
		if ( ! html ) {
			return '';
		}

		var withoutComments = String( html ).replace( /<!--[\s\S]*?-->/g, ' ' );
		var doc = new window.DOMParser().parseFromString(
			withoutComments,
			'text/html'
		);

		Array.prototype.forEach.call(
			doc.querySelectorAll( 'script, style' ),
			function ( node ) {
				node.remove();
			}
		);

		return ( doc.body.textContent || '' ).replace( /\s+/g, ' ' ).trim();
	}

	function countWords( text ) {
		var words = text ? text.match( /\S+/g ) : null;
		return words ? words.length : 0;
	}

	function getParagraphTexts( html ) {
		if ( ! html ) {
			return [];
		}

		var withoutComments = String( html ).replace( /<!--[\s\S]*?-->/g, ' ' );
		var doc = new window.DOMParser().parseFromString(
			withoutComments,
			'text/html'
		);

		return Array.prototype.map
			.call( doc.querySelectorAll( 'p' ), function ( node ) {
				return ( node.textContent || '' ).replace( /\s+/g, ' ' ).trim();
			} )
			.filter( Boolean );
	}

	function calculateMetrics( content ) {
		var text = getTextFromHtml( content );
		var paragraphTexts = getParagraphTexts( content );
		var words = countWords( text );
		var sentences = text
			.split( /[.!?]+/ )
			.map( function ( sentence ) {
				return sentence.trim();
			} )
			.filter( Boolean );
		var sentenceWords = sentences.map( countWords ).filter( Boolean );
		var sentenceWordTotal = sentenceWords.reduce( function ( total, count ) {
			return total + count;
		}, 0 );
		var readingSpeed = toPositiveInteger( settings.reading_speed ) || 200;

		return {
			words: words,
			characters: text.length,
			readingTime: words
				? Math.max( 1, Math.round( words / readingSpeed ) )
				: 0,
			paragraphs: paragraphTexts.length || ( text ? 1 : 0 ),
			headings: ( String( content || '' ).match( /<h[1-6]\b/gi ) || [] )
				.length,
			averageSentenceLength: sentenceWords.length
				? Math.round( sentenceWordTotal / sentenceWords.length )
				: 0,
			longParagraphs: paragraphTexts.filter( function ( paragraph ) {
				return countWords( paragraph ) >= 120;
			} ).length,
		};
	}

	function getLengthStatus( count, min, max ) {
		if ( count < min ) {
			return {
				label: __( 'Too short', 'editor-writing-goals' ),
				className: 'is-warning',
			};
		}

		if ( count > max ) {
			return {
				label: __( 'Too long', 'editor-writing-goals' ),
				className: 'is-bad',
			};
		}

		return {
			label: __( 'Good', 'editor-writing-goals' ),
			className: 'is-good',
		};
	}

	function MetricRow( props ) {
		return el(
			PanelRow,
			{ className: 'ewg-metric-row' },
			el( 'span', null, props.label ),
			el( 'strong', null, props.value )
		);
	}

	function StatusRow( props ) {
		var status = getLengthStatus( props.count, props.min, props.max );

		return el(
			PanelRow,
			{ className: 'ewg-metric-row' },
			el( 'span', null, props.label ),
			el(
				'span',
				{ className: 'ewg-status ' + status.className },
				sprintf(
					__( '%1$s (%2$d)', 'editor-writing-goals' ),
					status.label,
					props.count
				)
			)
		);
	}

	function GoalProgress( props ) {
		if ( ! props.target ) {
			return null;
		}

		var percent = Math.min(
			100,
			Math.round( ( props.current / props.target ) * 100 )
		);

		return el(
			'div',
			{ className: 'ewg-progress' },
			el(
				'div',
				{ className: 'ewg-progress__header' },
				el( 'span', null, props.label ),
				el( 'strong', null, percent + '%' )
			),
			el( 'progress', {
				value: Math.min( props.current, props.target ),
				max: props.target,
			} ),
			el(
				Text,
				{ variant: 'muted', size: '12' },
				sprintf(
					__( '%1$d of %2$d', 'editor-writing-goals' ),
					props.current,
					props.target
				)
			)
		);
	}

	function WritingGoalsPanel() {
		var selected = useSelect( function ( select ) {
			var editor = select( 'core/editor' );

			return {
				content: editor.getEditedPostContent() || '',
				title: editor.getEditedPostAttribute( 'title' ) || '',
				excerpt: editor.getEditedPostAttribute( 'excerpt' ) || '',
				meta: editor.getEditedPostAttribute( 'meta' ) || {},
			};
		}, [] );
		var editPost = useDispatch( 'core/editor' ).editPost;
		var metrics = calculateMetrics( selected.content );
		var wordTarget = toPositiveInteger( selected.meta[ wordTargetMeta ] );
		var characterTarget = toPositiveInteger(
			selected.meta[ characterTargetMeta ]
		);
		var defaultWordTarget = toPositiveInteger( settings.default_word_goal );
		var defaultCharacterTarget = toPositiveInteger(
			settings.default_character_goal
		);
		var effectiveWordTarget = wordTarget || defaultWordTarget;
		var effectiveCharacterTarget = characterTarget || defaultCharacterTarget;
		var titleText =
			typeof selected.title === 'string'
				? selected.title
				: selected.title && selected.title.raw
				? selected.title.raw
				: '';
		var excerptText = getTextFromHtml( selected.excerpt );
		var showTitleCheck = Boolean( Number( settings.enable_title_check ) );
		var showExcerptCheck = Boolean( Number( settings.enable_excerpt_check ) );
		var showLengthChecks = showTitleCheck || showExcerptCheck;

		function updateMeta( key, value ) {
			var nextMeta = Object.assign( {}, selected.meta );
			nextMeta[ key ] = toPositiveInteger( value );

			editPost( {
				meta: nextMeta,
			} );
		}

		return el(
			PluginDocumentSettingPanel,
			{
				name: 'editor-writing-goals',
				title: __( 'Writing Goals', 'editor-writing-goals' ),
				className: 'editor-writing-goals-panel',
			},
			el(
				'div',
				{ className: 'ewg-panel' },
				el(
					'div',
					{ className: 'ewg-section' },
					el( MetricRow, {
						label: __( 'Words', 'editor-writing-goals' ),
						value: metrics.words,
					} ),
					el( MetricRow, {
						label: __( 'Characters', 'editor-writing-goals' ),
						value: metrics.characters,
					} ),
					el( MetricRow, {
						label: __( 'Reading time', 'editor-writing-goals' ),
						value: metrics.readingTime
							? sprintf(
									__( '%d min', 'editor-writing-goals' ),
									metrics.readingTime
							  )
							: __( '0 min', 'editor-writing-goals' ),
					} ),
					el( MetricRow, {
						label: __( 'Paragraphs', 'editor-writing-goals' ),
						value: metrics.paragraphs,
					} ),
					el( MetricRow, {
						label: __( 'Headings', 'editor-writing-goals' ),
						value: metrics.headings,
					} )
				),
				el(
					'div',
					{ className: 'ewg-section' },
					el( TextControl, {
						label: __( 'Target words', 'editor-writing-goals' ),
						type: 'number',
						min: '0',
						value: wordTarget || '',
						placeholder: defaultWordTarget
							? sprintf(
									__( 'Default: %d', 'editor-writing-goals' ),
									defaultWordTarget
							  )
							: '',
						onChange: function ( value ) {
							updateMeta( wordTargetMeta, value );
						},
					} ),
					el( GoalProgress, {
						label: __( 'Word goal', 'editor-writing-goals' ),
						current: metrics.words,
						target: effectiveWordTarget,
					} ),
					el( TextControl, {
						label: __( 'Target characters', 'editor-writing-goals' ),
						type: 'number',
						min: '0',
						value: characterTarget || '',
						placeholder: defaultCharacterTarget
							? sprintf(
									__( 'Default: %d', 'editor-writing-goals' ),
									defaultCharacterTarget
							  )
							: '',
						onChange: function ( value ) {
							updateMeta( characterTargetMeta, value );
						},
					} ),
					el( GoalProgress, {
						label: __( 'Character goal', 'editor-writing-goals' ),
						current: metrics.characters,
						target: effectiveCharacterTarget,
					} )
				),
				showLengthChecks &&
					el(
						'div',
						{ className: 'ewg-section' },
						el(
							SectionLabel,
							null,
							__( 'Length checks', 'editor-writing-goals' )
						),
						showTitleCheck &&
							el( StatusRow, {
								label: __( 'Title', 'editor-writing-goals' ),
								count: getTextFromHtml( titleText ).length,
								min: 50,
								max: 60,
							} ),
						showExcerptCheck &&
							el( StatusRow, {
								label: __( 'Excerpt', 'editor-writing-goals' ),
								count: excerptText.length,
								min: 120,
								max: 160,
							} )
					),
				Boolean( Number( settings.enable_readability_check ) ) &&
					el(
						'div',
						{ className: 'ewg-section' },
						el(
							SectionLabel,
							null,
							__( 'Readability', 'editor-writing-goals' )
						),
						el( MetricRow, {
							label: __( 'Avg sentence', 'editor-writing-goals' ),
							value: metrics.averageSentenceLength
								? sprintf(
										__( '%d words', 'editor-writing-goals' ),
										metrics.averageSentenceLength
								  )
								: __( '0 words', 'editor-writing-goals' ),
						} ),
						el( MetricRow, {
							label: __( 'Long paragraphs', 'editor-writing-goals' ),
							value: metrics.longParagraphs,
						} )
					)
			)
		);
	}

	registerPlugin( 'editor-writing-goals', {
		render: WritingGoalsPanel,
	} );
} )( window.wp );
