import './editor.css';

import { PluginDocumentSettingPanel } from '@wordpress/edit-post';
import { registerPlugin } from '@wordpress/plugins';
import { useDispatch, useSelect } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import {
	BaseControl,
	PanelRow,
	TextControl,
	__experimentalText as Text,
} from '@wordpress/components';

const config = window.editorWritingGoals || {};
const settings = config.settings || {};
const metaKeys = config.metaKeys || {};

const DEFAULT_SETTINGS = {
	default_word_goal: 1000,
	default_character_goal: 0,
	reading_speed: 200,
	enable_title_check: 1,
	enable_excerpt_check: 1,
	enable_readability_check: 1,
};

const resolvedSettings = {
	...DEFAULT_SETTINGS,
	...settings,
};

const WORD_TARGET_META =
	metaKeys.wordTarget || '_editor_writing_goals_word_target';
const CHARACTER_TARGET_META =
	metaKeys.characterTarget || '_editor_writing_goals_character_target';

const toPositiveInteger = ( value ) => {
	const parsed = Number.parseInt( value, 10 );
	return Number.isFinite( parsed ) && parsed > 0 ? parsed : 0;
};

const getTextFromHtml = ( html = '' ) => {
	if ( ! html ) {
		return '';
	}

	const withoutComments = html.replace( /<!--[\s\S]*?-->/g, ' ' );
	const doc = new window.DOMParser().parseFromString(
		withoutComments,
		'text/html'
	);

	doc.querySelectorAll( 'script, style' ).forEach( ( node ) => node.remove() );

	return ( doc.body.textContent || '' ).replace( /\s+/g, ' ' ).trim();
};

const countWords = ( text ) => {
	if ( ! text ) {
		return 0;
	}

	const words = text.match( /\S+/g );
	return words ? words.length : 0;
};

const getParagraphTexts = ( html = '' ) => {
	if ( ! html ) {
		return [];
	}

	const withoutComments = html.replace( /<!--[\s\S]*?-->/g, ' ' );
	const doc = new window.DOMParser().parseFromString(
		withoutComments,
		'text/html'
	);

	return Array.from( doc.querySelectorAll( 'p' ) )
		.map( ( node ) => ( node.textContent || '' ).replace( /\s+/g, ' ' ).trim() )
		.filter( Boolean );
};

const calculateMetrics = ( content ) => {
	const text = getTextFromHtml( content );
	const paragraphTexts = getParagraphTexts( content );
	const words = countWords( text );
	const readingSpeed = toPositiveInteger( resolvedSettings.reading_speed ) || 200;
	const sentences = text
		.split( /[.!?]+/ )
		.map( ( sentence ) => sentence.trim() )
		.filter( Boolean );
	const sentenceWords = sentences.map( countWords ).filter( Boolean );
	const sentenceWordTotal = sentenceWords.reduce( ( total, count ) => total + count, 0 );
	const averageSentenceLength = sentenceWords.length
		? Math.round( sentenceWordTotal / sentenceWords.length )
		: 0;
	const longParagraphs = paragraphTexts.filter(
		( paragraph ) => countWords( paragraph ) >= 120
	).length;

	return {
		text,
		words,
		characters: text.length,
		readingTime: words ? Math.max( 1, Math.round( words / readingSpeed ) ) : 0,
		paragraphs: paragraphTexts.length || ( text ? 1 : 0 ),
		headings: ( content.match( /<h[1-6]\b/gi ) || [] ).length,
		averageSentenceLength,
		longParagraphs,
	};
};

const getLengthStatus = ( count, min, max ) => {
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
};

const MetricRow = ( { label, value } ) => (
	<PanelRow className="ewg-metric-row">
		<span>{ label }</span>
		<strong>{ value }</strong>
	</PanelRow>
);

const StatusRow = ( { label, count, min, max } ) => {
	const status = getLengthStatus( count, min, max );

	return (
		<PanelRow className="ewg-metric-row">
			<span>{ label }</span>
			<span className={ `ewg-status ${ status.className }` }>
				{ sprintf(
					/* translators: 1: status label, 2: character count. */
					__( '%1$s (%2$d)', 'editor-writing-goals' ),
					status.label,
					count
				) }
			</span>
		</PanelRow>
	);
};

const GoalProgress = ( { label, current, target } ) => {
	if ( ! target ) {
		return null;
	}

	const percent = Math.min( 100, Math.round( ( current / target ) * 100 ) );

	return (
		<div className="ewg-progress">
			<div className="ewg-progress__header">
				<span>{ label }</span>
				<strong>{ percent }%</strong>
			</div>
			<progress value={ Math.min( current, target ) } max={ target } />
			<Text variant="muted" size="12">
				{ sprintf(
					/* translators: 1: current count, 2: target count. */
					__( '%1$d of %2$d', 'editor-writing-goals' ),
					current,
					target
				) }
			</Text>
		</div>
	);
};

const WritingGoalsPanel = () => {
	const { content, excerpt, meta, title } = useSelect( ( select ) => {
		const editor = select( 'core/editor' );

		return {
			content: editor.getEditedPostContent() || '',
			title: editor.getEditedPostAttribute( 'title' ) || '',
			excerpt: editor.getEditedPostAttribute( 'excerpt' ) || '',
			meta: editor.getEditedPostAttribute( 'meta' ) || {},
		};
	}, [] );
	const { editPost } = useDispatch( 'core/editor' );
	const metrics = calculateMetrics( content );
	const wordTarget = toPositiveInteger( meta[ WORD_TARGET_META ] );
	const characterTarget = toPositiveInteger( meta[ CHARACTER_TARGET_META ] );
	const defaultWordTarget = toPositiveInteger( resolvedSettings.default_word_goal );
	const defaultCharacterTarget = toPositiveInteger(
		resolvedSettings.default_character_goal
	);
	const effectiveWordTarget = wordTarget || defaultWordTarget;
	const effectiveCharacterTarget = characterTarget || defaultCharacterTarget;
	const titleText = typeof title === 'string' ? title : title?.raw || '';
	const excerptText = getTextFromHtml( excerpt );
	const showTitleCheck = Boolean( Number( resolvedSettings.enable_title_check ) );
	const showExcerptCheck = Boolean(
		Number( resolvedSettings.enable_excerpt_check )
	);
	const showLengthChecks = showTitleCheck || showExcerptCheck;

	const updateMeta = ( key, value ) => {
		editPost( {
			meta: {
				...meta,
				[ key ]: toPositiveInteger( value ),
			},
		} );
	};

	return (
		<PluginDocumentSettingPanel
			name="editor-writing-goals"
			title={ __( 'Writing Goals', 'editor-writing-goals' ) }
			className="editor-writing-goals-panel"
		>
			<div className="ewg-panel">
				<div className="ewg-section">
					<MetricRow label={ __( 'Words', 'editor-writing-goals' ) } value={ metrics.words } />
					<MetricRow
						label={ __( 'Characters', 'editor-writing-goals' ) }
						value={ metrics.characters }
					/>
					<MetricRow
						label={ __( 'Reading time', 'editor-writing-goals' ) }
						value={
							metrics.readingTime
								? sprintf(
										/* translators: %d: minutes. */
										__( '%d min', 'editor-writing-goals' ),
										metrics.readingTime
								  )
								: __( '0 min', 'editor-writing-goals' )
						}
					/>
					<MetricRow
						label={ __( 'Paragraphs', 'editor-writing-goals' ) }
						value={ metrics.paragraphs }
					/>
					<MetricRow
						label={ __( 'Headings', 'editor-writing-goals' ) }
						value={ metrics.headings }
					/>
				</div>

				<div className="ewg-section">
					<TextControl
						label={ __( 'Target words', 'editor-writing-goals' ) }
						type="number"
						min="0"
						value={ wordTarget || '' }
						placeholder={
							defaultWordTarget
								? sprintf(
										/* translators: %d: default word target. */
										__( 'Default: %d', 'editor-writing-goals' ),
										defaultWordTarget
								  )
								: ''
						}
						onChange={ ( value ) => updateMeta( WORD_TARGET_META, value ) }
					/>
					<GoalProgress
						label={ __( 'Word goal', 'editor-writing-goals' ) }
						current={ metrics.words }
						target={ effectiveWordTarget }
					/>

					<TextControl
						label={ __( 'Target characters', 'editor-writing-goals' ) }
						type="number"
						min="0"
						value={ characterTarget || '' }
						placeholder={
							defaultCharacterTarget
								? sprintf(
										/* translators: %d: default character target. */
										__( 'Default: %d', 'editor-writing-goals' ),
										defaultCharacterTarget
								  )
								: ''
						}
						onChange={ ( value ) => updateMeta( CHARACTER_TARGET_META, value ) }
					/>
					<GoalProgress
						label={ __( 'Character goal', 'editor-writing-goals' ) }
						current={ metrics.characters }
						target={ effectiveCharacterTarget }
					/>
				</div>

				{ showLengthChecks && (
					<div className="ewg-section">
						<BaseControl.VisualLabel>
							{ __( 'Length checks', 'editor-writing-goals' ) }
						</BaseControl.VisualLabel>
						{ showTitleCheck && (
							<StatusRow
								label={ __( 'Title', 'editor-writing-goals' ) }
								count={ getTextFromHtml( titleText ).length }
								min={ 50 }
								max={ 60 }
							/>
						) }
						{ showExcerptCheck && (
							<StatusRow
								label={ __( 'Excerpt', 'editor-writing-goals' ) }
								count={ excerptText.length }
								min={ 120 }
								max={ 160 }
							/>
						) }
					</div>
				) }

				{ Boolean( Number( resolvedSettings.enable_readability_check ) ) && (
					<div className="ewg-section">
						<BaseControl.VisualLabel>
							{ __( 'Readability', 'editor-writing-goals' ) }
						</BaseControl.VisualLabel>
						<MetricRow
							label={ __( 'Avg sentence', 'editor-writing-goals' ) }
							value={
								metrics.averageSentenceLength
									? sprintf(
											/* translators: %d: word count. */
											__( '%d words', 'editor-writing-goals' ),
											metrics.averageSentenceLength
									  )
									: __( '0 words', 'editor-writing-goals' )
							}
						/>
						<MetricRow
							label={ __( 'Long paragraphs', 'editor-writing-goals' ) }
							value={ metrics.longParagraphs }
						/>
					</div>
				) }
			</div>
		</PluginDocumentSettingPanel>
	);
};

registerPlugin( 'editor-writing-goals', {
	render: WritingGoalsPanel,
} );
