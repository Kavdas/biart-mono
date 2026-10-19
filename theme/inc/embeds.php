<?php
/**
 * Встраивание Яндекс Карт через нативный блок «Embed» (core/embed).
 *
 * В блок вставляется ссылка вида https://yandex.kz/map-widget/v1/?oid=…&ll=…&z=16
 * (её даёт Яндекс в «Поделиться → Виджет карты»). WordPress не знает такого oEmbed-провайдера,
 * поэтому регистрируем свой обработчик: он превращает ссылку в <iframe> и на фронте,
 * и в превью редактора (через /oembed/1.0/proxy). Параметры запроса пропускаем по белому списку.
 */

defined( 'ABSPATH' ) || exit;

function biart_yandex_map_embed( $matches, $attr, $url ) {
	$url   = html_entity_decode( $url, ENT_QUOTES, 'UTF-8' );
	$parts = wp_parse_url( $url );
	if ( empty( $parts['host'] ) || ! preg_match( '/^yandex\.(ru|kz|com)$/i', $parts['host'] ) ) {
		return false;
	}
	parse_str( $parts['query'] ?? '', $query );
	$allowed = array( 'oid', 'ol', 'll', 'z', 'mode', 'text', 'um', 'lang', 'pt' );
	$query   = array_intersect_key( $query, array_flip( $allowed ) );
	if ( empty( $query ) ) {
		return false;
	}
	$src   = 'https://' . strtolower( $parts['host'] ) . '/map-widget/v1/?' . http_build_query( $query, '', '&', PHP_QUERY_RFC3986 );
	$title = ( 'kk' === substr( get_locale(), 0, 2 ) || ( isset( $query['lang'] ) && 0 === strpos( $query['lang'], 'kk' ) ) )
		? 'BIART картада' : 'BIART на карте';

	$kk    = 'kk' === substr( get_locale(), 0, 2 ) || ( isset( $query['lang'] ) && 0 === strpos( $query['lang'], 'kk' ) );
	$label = $kk ? 'Картаны көрсету' : 'Показать карту';
	$note  = $kk ? 'Яндекс Карталар жүктеледі' : 'Загрузится виджет Яндекс Карт';

	// Виджет карты тянет больше мегабайта скриптов Яндекса. Поэтому вместо самого
	// виджета отдаём заглушку: iframe подставляется по клику (map.js).
	return sprintf(
		'<div class="map-embed is-stub" data-map="%s" data-title="%s">'
		. '<button type="button" class="map-open">%s</button>'
		. '<span class="map-note">%s</span>'
		. '<noscript><iframe src="%s" title="%s" width="100%%" height="600" loading="lazy" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></noscript>'
		. '</div>',
		esc_url( $src ),
		esc_attr( $title ),
		esc_html( $label ),
		esc_html( $note ),
		esc_url( $src ),
		esc_attr( $title )
	);
}
wp_embed_register_handler( 'biart-yandex-map', '#^https?://yandex\.(ru|kz|com)/map-widget/v1/\?#i', 'biart_yandex_map_embed' );
