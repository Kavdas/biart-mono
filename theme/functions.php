<?php
/**
 * BIART — функции темы.
 */

defined( 'ABSPATH' ) || exit;

require_once get_template_directory() . '/inc/security.php';
require_once get_template_directory() . '/inc/seo.php';
require_once get_template_directory() . '/inc/embeds.php';
require_once get_template_directory() . '/inc/assets.php';

/** Настройка темы. */
function biart_setup(): void {
	load_theme_textdomain( 'biart', get_template_directory() . '/languages' );
	add_theme_support( 'wp-block-styles' );
	add_theme_support( 'editor-styles' );
	add_theme_support( 'responsive-embeds' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'title-tag' );
	add_theme_support( 'html5', array( 'script', 'style', 'search-form', 'gallery', 'caption' ) );

	// Правило 2: стили темы (вместе с @font-face фирменных шрифтов) грузим и в РЕДАКТОР.
	add_editor_style( array( 'style.css' ) );
}
add_action( 'after_setup_theme', 'biart_setup' );

/** Фронт: сжатый style.css, либо исходный с версией filemtime (правило 3 — сброс кэша). Шрифты — self-hosted, @font-face в style.css. */
function biart_enqueue(): void {
	// Сжатая копия (inc/assets.php); версия у неё в имени файла, ?ver не нужен.
	$min = biart_minified_css_url();
	wp_enqueue_style(
		'biart-style',
		$min ?? get_stylesheet_uri(),
		array(),
		$min ? null : (string) filemtime( get_stylesheet_directory() . '/style.css' )
	);
	// Фото-карусель: без JS остаётся обычной горизонтальной прокруткой.
	wp_enqueue_script(
		'biart-nav',
		get_template_directory_uri() . '/assets/js/nav.js',
		array(),
		(string) filemtime( get_stylesheet_directory() . '/assets/js/nav.js' ),
		array( 'strategy' => 'defer' )
	);
	wp_enqueue_script(
		'biart-carousel',
		get_template_directory_uri() . '/assets/js/carousel.js',
		array(),
		(string) filemtime( get_stylesheet_directory() . '/assets/js/carousel.js' ),
		array( 'strategy' => 'defer' )
	);
	// Фото-превью по наведению (пространство, направления): без JS остаются мелкие миниатюры.
	wp_enqueue_script(
		'biart-hover-preview',
		get_template_directory_uri() . '/assets/js/hover-preview.js',
		array(),
		(string) filemtime( get_stylesheet_directory() . '/assets/js/hover-preview.js' ),
		array( 'strategy' => 'defer' )
	);
	// Появление блоков и докрутка цифр; уважает prefers-reduced-motion.
	wp_enqueue_script(
		'biart-reveal',
		get_template_directory_uri() . '/assets/js/reveal.js',
		array(),
		(string) filemtime( get_stylesheet_directory() . '/assets/js/reveal.js' ),
		array( 'strategy' => 'defer' )
	);
	// Карта грузится по клику: виджет Яндекса весит больше мегабайта.
	wp_enqueue_script(
		'biart-map',
		get_template_directory_uri() . '/assets/js/map.js',
		array(),
		(string) filemtime( get_stylesheet_directory() . '/assets/js/map.js' ),
		array( 'strategy' => 'defer' )
	);
	// Биографии команды: без JS текст просто виден в карточке.
	wp_enqueue_script(
		'biart-team',
		get_template_directory_uri() . '/assets/js/team.js',
		array(),
		(string) filemtime( get_stylesheet_directory() . '/assets/js/team.js' ),
		array( 'strategy' => 'defer' )
	);
	// Расписание по возрастам: переключатель возрастов. Без JS видны все три.
	wp_enqueue_script(
		'biart-schedule',
		get_template_directory_uri() . '/assets/js/schedule.js',
		array(),
		(string) filemtime( get_stylesheet_directory() . '/assets/js/schedule.js' ),
		array( 'strategy' => 'defer' )
	);
	// Росчерк в углу секции меняет цвет по мере прокрутки; без JS остаётся статичным.
	wp_enqueue_script(
		'biart-deco',
		get_template_directory_uri() . '/assets/js/deco.js',
		array(),
		(string) filemtime( get_stylesheet_directory() . '/assets/js/deco.js' ),
		array( 'strategy' => 'defer' )
	);
	// Лайтбокс фото событий: без JS ссылка открывает файл.
	wp_enqueue_script(
		'biart-lightbox',
		get_template_directory_uri() . '/assets/js/lightbox.js',
		array(),
		(string) filemtime( get_stylesheet_directory() . '/assets/js/lightbox.js' ),
		array( 'strategy' => 'defer' )
	);
}
add_action( 'wp_enqueue_scripts', 'biart_enqueue' );

/** Preload тех начертаний, которые реально запрашиваются.
 * Все 14 правил с антиквой просят 700; прелоад указывал на 500 — браузер
 * тянул 62 КБ, которые не использовались ни разу, а нужный файл находил поздно.
 */
function biart_preload_fonts(): void {
	$base = get_template_directory_uri() . '/assets/fonts/';
	foreach ( array( 'InterTight-800.woff2', 'InterTight-400.woff2' ) as $file ) {
		printf( '<link rel="preload" href="%s" as="font" type="font/woff2" crossorigin>' . PHP_EOL, esc_url( $base . $file ) );
	}
}
add_action( 'wp_head', 'biart_preload_fonts', 1 );

/** Категория паттернов BIART (правило 9). */
function biart_pattern_category(): void {
	register_block_pattern_category( 'biart', array( 'label' => 'BIART' ) );
}
add_action( 'init', 'biart_pattern_category' );

/** Сброс кэша тем/паттернов при смене версии темы (правило 9). */
function biart_clean_theme_cache(): void {
	$version = wp_get_theme()->get( 'Version' );
	if ( get_option( 'biart_theme_version' ) !== $version ) {
		wp_clean_themes_cache();
		update_option( 'biart_theme_version', $version );
	}
}
add_action( 'admin_init', 'biart_clean_theme_cache' );

/** Клиент (не-админ) не может снимать блокировку блоков. */
function biart_lock_for_editors( array $settings ): array {
	if ( ! current_user_can( 'manage_options' ) ) {
		$settings['canLockBlocks'] = false;
	}
	return $settings;
}
add_filter( 'block_editor_settings_all', 'biart_lock_for_editors' );

/** Убираем лишнее из меню админки для Редактора. */
function biart_trim_admin_menu(): void {
	if ( current_user_can( 'manage_options' ) ) {
		return;
	}
	remove_menu_page( 'edit.php' );          // Записи
	remove_menu_page( 'edit-comments.php' ); // Комментарии
	remove_menu_page( 'tools.php' );         // Инструменты
	remove_menu_page( 'themes.php' );        // Внешний вид: сохранение в Site Editor
	                                         // создаёт копию шаблона в базе, и она
	                                         // перекрывает файлы темы (см. CLAUDE.md)
}
add_action( 'admin_menu', 'biart_trim_admin_menu', 999 );

/** ...и закрываем сам Site Editor: убрать пункт меню мало, адрес остаётся рабочим. */
function biart_block_site_editor(): void {
	if ( current_user_can( 'manage_options' ) ) {
		return;
	}
	global $pagenow;
	if ( 'site-editor.php' === $pagenow || 'themes.php' === $pagenow ) {
		wp_safe_redirect( admin_url( 'edit.php?post_type=page' ) );
		exit;
	}
}
add_action( 'admin_init', 'biart_block_site_editor' );

/** Отключаем emoji-скрипты (лишний вес). */
remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
remove_action( 'wp_print_styles', 'print_emoji_styles' );

/** Казахская версия: атрибут lang. Условие одно на всю тему — biart_is_kz() в inc/seo.php. */
function biart_lang_attr( string $output ): string {
	if ( biart_is_kz_lang() ) {
		return 'lang="kk"';
	}
	return $output;
}
add_filter( 'language_attributes', 'biart_lang_attr' );

/** Казахская версия: описание сайта в <title>. */
function biart_kz_title( array $parts ): array {
	if ( biart_is_kz() ) {
		$parts['title']   = 'BIART';
		$parts['tagline'] = 'Астанадағы шығармашылық индустриялар мектебі';
		unset( $parts['site'] );
	}
	return $parts;
}
add_filter( 'document_title_parts', 'biart_kz_title' );
