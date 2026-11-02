<?php
/**
 * srcset и sizes для картинок темы.
 *
 * Фото в контенте — блоки core/image с путём к файлу темы, а не вложения медиатеки,
 * поэтому WordPress сам srcset не ставит. Рядом с оригиналом лежат копии name-480w.webp …
 * name-1600w.webp (tools/build-images.py); здесь они дописываются в srcset при выводе блока.
 *
 * sizes задаётся по роли картинки, а не «на глаз»: у вертикальных кадров афиши CSS режет
 * ширину из горизонтального фото, поэтому им нужна ширина, равная ВЫСОТЕ карточки × пропорция
 * кадра. Иначе браузер брал копию по ширине карточки и растягивал её — фото выглядели мыльными.
 * Разметку блоков не трогаем: в редакторе блок остаётся валидным.
 */

defined( 'ABSPATH' ) || exit;

/** sizes по классу <figure>: ширина, которую картинка реально занимает на экране. */
function biart_img_sizes( string $figure_class ): string {
	$map = array(
		'hero-art'    => '(max-width: 781px) 360px, 600px',
		'dir-let'     => '230px',
		'faq-illu'    => '230px',
		'about-photo' => '(max-width: 781px) 420px, 700px',
		'portrait'    => '(max-width: 520px) 90vw, (max-width: 1180px) 34vw, 270px',
		'm-wide'      => '(max-width: 781px) 330px, 600px',
		'm-tall'      => '(max-width: 781px) 570px, 870px',
		'staff-photo' => '(max-width: 781px) 44vw, 330px',
		'dir-photo'   => '600px',
		'ev-ph'       => '600px',
	);
	foreach ( $map as $class => $sizes ) {
		if ( preg_match( '~(?:^|\s)' . preg_quote( $class, '~' ) . '(?:\s|$)~', $figure_class ) ) {
			return $sizes;
		}
	}
	return '(max-width: 781px) 100vw, 50vw';
}

function biart_theme_img_srcset( string $html, array $block ): string {
	if ( str_contains( $html, ' srcset=' )
		|| ! preg_match( '~ src="([^"]*/themes/[^/"]+/assets/img/)([^"/]+)\.webp"~', $html, $m ) ) {
		return $html;
	}
	static $cache = array();
	$dir = get_template_directory() . '/assets/img/';
	$key = $m[2];
	if ( ! isset( $cache[ $key ] ) ) {
		$set  = array();
		$size = wp_getimagesize( $dir . $key . '.webp' );
		if ( $size ) {
			foreach ( glob( $dir . $key . '-*w.webp' ) ?: array() as $file ) {
				if ( preg_match( '~-(\d+)w\.webp$~', $file, $w ) ) {
					$set[ (int) $w[1] ] = $m[1] . basename( $file );
				}
			}
			$set[ (int) $size[0] ] = $m[1] . $key . '.webp';
			ksort( $set );
		}
		$cache[ $key ] = $set;
	}
	$set = $cache[ $key ];
	if ( count( $set ) < 2 ) {
		return $html;
	}
	$parts = array();
	foreach ( $set as $w => $url ) {
		$parts[] = esc_attr( $url ) . ' ' . $w . 'w';
	}
	$class = preg_match( '~<figure[^>]*class="([^"]*)"~', $html, $c ) ? $c[1] : '';
	$html  = preg_replace( '~ sizes="[^"]*"~', '', $html );
	return str_replace(
		$m[0],
		$m[0] . ' srcset="' . implode( ', ', $parts ) . '" sizes="' . esc_attr( biart_img_sizes( $class ) ) . '"',
		$html
	);
}
add_filter( 'render_block_core/image', 'biart_theme_img_srcset', 10, 2 );

// WordPress 6.7+ дописывает к sizes «auto,» — браузер тогда берёт копию по ширине блока и игнорирует нашу
// поправку на обрезку CSS (вертикальные кадры афиши). Свои sizes точнее.
add_filter( 'wp_img_tag_add_auto_sizes', '__return_false' );

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
