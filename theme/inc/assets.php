<?php
/**
 * srcset для фото темы и сжатый style.css.
 *
 * Фото в контенте — блоки core/image с путём к файлу темы, а не вложения медиатеки,
 * поэтому WordPress сам srcset не ставит, и телефон качал снимок в 1000 px ради карточки
 * в 315. Рядом с оригиналом лежат копии name-480w.webp и name-800w.webp
 * (tools/make-responsive.py) — здесь они дописываются в srcset при выводе.
 * Разметку блоков не трогаем: в редакторе блок остаётся валидным.
 */

defined( 'ABSPATH' ) || exit;

function biart_theme_img_srcset( string $html ): string {
	if ( str_contains( $html, ' srcset=' )
		|| ! preg_match( '~ src="([^"]*/themes/biart-mono/assets/img/)([^"/]+)\.webp"~', $html, $m ) ) {
		return $html;
	}
	$dir  = get_template_directory() . '/assets/img/';
	$size = wp_getimagesize( $dir . $m[2] . '.webp' );
	if ( ! $size ) {
		return $html;
	}
	$set = array();
	foreach ( array( 480, 800 ) as $w ) {
		if ( file_exists( "{$dir}{$m[2]}-{$w}w.webp" ) ) {
			$set[] = "{$m[1]}{$m[2]}-{$w}w.webp {$w}w";
		}
	}
	if ( ! $set ) {
		return $html;
	}
	$set[] = "{$m[1]}{$m[2]}.webp {$size[0]}w";

	// auto — браузер берёт реальную ширину из вёрстки (только у ленивых картинок);
	// список после него — для браузеров, которые auto не знают.
	$sizes = str_contains( $html, 'loading="lazy"' )
		? 'auto, (max-width: 781px) 85vw, 40vw'
		: '100vw';

	return str_replace(
		$m[0],
		$m[0] . ' srcset="' . esc_attr( implode( ', ', $set ) ) . '" sizes="' . $sizes . '"',
		$html
	);
}
add_filter( 'wp_content_img_tag', 'biart_theme_img_srcset' );

/**
 * Сжатая копия style.css в uploads/biart/style.<хеш>.css.
 *
 * Пересобирается сама, как только меняется style.css (хеш в имени файла), так что
 * отдельного шага сборки нет и устаревшей копии не бывает. Строки в кавычках
 * (SVG-фигуры в data:, сетки grid-template-areas) не трогаются. Если записать
 * файл нельзя, отдаётся обычный style.css.
 *
 * @return string|null URL сжатой копии.
 */
function biart_minified_css_url(): ?string {
	$src     = get_stylesheet_directory() . '/style.css';
	$hash    = substr( (string) md5_file( $src ), 0, 10 );
	$uploads = wp_upload_dir( null, false );
	if ( ! empty( $uploads['error'] ) ) {
		return null;
	}
	$dir  = $uploads['basedir'] . '/biart';
	$file = "{$dir}/style.{$hash}.css";

	if ( ! file_exists( $file ) ) {
		if ( ! wp_mkdir_p( $dir ) ) {
			return null;
		}
		$css = biart_minify_css( (string) file_get_contents( $src ), wp_make_link_relative( get_stylesheet_directory_uri() ) . '/' );
		if ( false === file_put_contents( $file, $css, LOCK_EX ) ) {
			return null;
		}
		foreach ( glob( "{$dir}/style.*.css" ) ?: array() as $old ) {
			if ( $old !== $file ) {
				wp_delete_file( $old );
			}
		}
	}
	return $uploads['baseurl'] . "/biart/style.{$hash}.css";
}

/** $base — путь к папке темы: относительные url() в style.css указывают от неё. */
function biart_minify_css( string $css, string $base ): string {
	$css = preg_replace( '~url\(\s*([\'"]?)(?![\'"]?(?:data:|[a-z]+:|/|#))~i', 'url($1' . $base, $css );

	// Комментарии убираем, строки прячем: регулярка идёт слева направо, поэтому
	// «/*» внутри строки и кавычка внутри комментария друг другу не мешают.
	$strings = array();
	$css     = preg_replace_callback(
		'~/\*.*?\*/|"(?:\\\\.|[^"\\\\])*"|\'(?:\\\\.|[^\'\\\\])*\'~s',
		static function ( array $m ) use ( &$strings ): string {
			if ( '/' === $m[0][0] ) {
				return '';
			}
			$strings[] = $m[0];
			return "\x01" . ( count( $strings ) - 1 ) . "\x01";
		},
		$css
	);

	$css = preg_replace( '~\s+~', ' ', $css );
	// Пробел убираем только вокруг знаков, где он ничего не значит. «+», «-» и «(»
	// не трогаем: в calc() пробел обязателен, а «:root :where()» — это два селектора.
	$css = preg_replace( '~\s*([{};,>])\s*~', '$1', $css );
	$css = preg_replace( '~:\s+~', ':', $css );
	$css = str_replace( ';}', '}', trim( $css ) );

	return preg_replace_callback( "~\x01(\d+)\x01~", static fn( array $m ): string => $strings[ (int) $m[1] ], $css );
}
