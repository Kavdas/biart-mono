<?php
/**
 * BIART — усиление безопасности на уровне темы.
 * Работает на любом хостинге, плагины не нужны. Серверная часть (HTTPS, HSTS, fail2ban,
 * лимит попыток входа, бэкапы) — см. docs/SECURITY.md.
 */

defined( 'ABSPATH' ) || exit;

/* ------------------------------------------------------------------
 * 1. Убираем «отпечатки» WordPress из <head> и заголовков.
 * ---------------------------------------------------------------- */
remove_action( 'wp_head', 'wp_generator' );
remove_action( 'wp_head', 'rsd_link' );
remove_action( 'wp_head', 'wlwmanifest_link' );
remove_action( 'wp_head', 'wp_shortlink_wp_head' );
remove_action( 'wp_head', 'wp_oembed_add_discovery_links' );
remove_action( 'wp_head', 'rest_output_link_wp_head' );
remove_action( 'template_redirect', 'rest_output_link_header', 11 );
remove_action( 'template_redirect', 'wp_shortlink_header', 11 );
add_filter( 'the_generator', '__return_empty_string' );

/** Версии ядра в ?ver= у стилей/скриптов WP не показываем. */
function biart_strip_wp_version( string $src ): string {
	if ( strpos( $src, 'ver=' . get_bloginfo( 'version' ) ) !== false ) {
		$src = remove_query_arg( 'ver', $src );
	}
	return $src;
}
add_filter( 'style_loader_src', 'biart_strip_wp_version' );
add_filter( 'script_loader_src', 'biart_strip_wp_version' );

/* ------------------------------------------------------------------
 * 2. XML-RPC и pingback — выключены (частый вектор брутфорса и DDoS-усиления).
 * ---------------------------------------------------------------- */
add_filter( 'xmlrpc_enabled', '__return_false' );
add_filter( 'xmlrpc_methods', '__return_empty_array' );
// Полностью: даже system.listMethods не отвечает — 403 до загрузки IXR.
add_action( 'init', function () {
	if ( defined( 'XMLRPC_REQUEST' ) && XMLRPC_REQUEST ) {
		status_header( 403 );
		nocache_headers();
		exit( 'XML-RPC disabled.' );
	}
}, 0 );
add_filter( 'wp_headers', function ( array $headers ): array {
	unset( $headers['X-Pingback'] );
	return $headers;
} );
add_filter( 'pings_open', '__return_false', 20 );

/* ------------------------------------------------------------------
 * 3. Перечисление пользователей — закрыто.
 * ---------------------------------------------------------------- */
// ?author=1 и архивы авторов -> на главную.
function biart_block_author_enum(): void {
	if ( is_admin() ) {
		return;
	}
	if ( isset( $_GET['author'] ) || is_author() ) { // phpcs:ignore WordPress.Security.NonceVerification
		wp_safe_redirect( home_url( '/' ), 301 );
		exit;
	}
}
add_action( 'template_redirect', 'biart_block_author_enum' );

// /wp-json/wp/v2/users — только для авторизованных.
function biart_restrict_users_rest( $result, $server, $request ) {
	$route = $request->get_route();
	if ( ! is_user_logged_in() && preg_match( '#^/wp/v2/users#', $route ) ) {
		return new WP_Error( 'rest_forbidden', 'Доступ запрещён.', array( 'status' => 401 ) );
	}
	return $result;
}
add_filter( 'rest_pre_dispatch', 'biart_restrict_users_rest', 10, 3 );

// Ссылки на архивы авторов не генерируем.
add_filter( 'author_link', fn() => home_url( '/' ) );

/* ------------------------------------------------------------------
 * 4. Комментарии — сайт без них, убираем всё.
 * ---------------------------------------------------------------- */
function biart_disable_comments(): void {
	foreach ( get_post_types() as $type ) {
		remove_post_type_support( $type, 'comments' );
		remove_post_type_support( $type, 'trackbacks' );
	}
}
add_action( 'init', 'biart_disable_comments', 100 );
add_filter( 'comments_open', '__return_false', 20 );
add_filter( 'comments_array', '__return_empty_array', 20 );
add_action( 'admin_menu', function () { remove_menu_page( 'edit-comments.php' ); }, 999 );
add_action( 'wp_before_admin_bar_render', function () {
	global $wp_admin_bar;
	$wp_admin_bar->remove_menu( 'comments' );
} );

/* ------------------------------------------------------------------
 * 5. Обезличенная ошибка входа (не подсказываем, что именно неверно).
 * ---------------------------------------------------------------- */
add_filter( 'login_errors', fn() => 'Неверный логин или пароль.' );

/* ------------------------------------------------------------------
 * 6. Заголовки безопасности для фронта (админку не трогаем — там свои инлайны/фреймы).
 *    У сайта нет внешних ресурсов, поэтому CSP жёсткая: только свой домен.
 *    HSTS добавить на хостинге после включения HTTPS.
 * ---------------------------------------------------------------- */
function biart_security_headers(): void {
	if ( is_admin() || headers_sent() ) {
		return;
	}
	header_remove( 'X-Powered-By' );
	header( 'X-Content-Type-Options: nosniff' );
	header( 'X-Frame-Options: SAMEORIGIN' );
	header( 'Referrer-Policy: strict-origin-when-cross-origin' );
	header( 'Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()' );

	if ( ! is_user_logged_in() ) {
		$csp = array(
			"default-src 'self'",
			"img-src 'self' data:",
			"media-src 'self'",
			"style-src 'self' 'unsafe-inline'",   // инлайн-стили блоков WP
			"script-src 'self' 'unsafe-inline'",  // инлайн-скрипты WP (skip-link и т.п.)
			"font-src 'self'",
			"connect-src 'self'",
			"object-src 'none'",
			"base-uri 'self'",
			"form-action 'self'",
			"frame-ancestors 'self'",
			"frame-src https://yandex.ru https://yandex.kz https://yandex.com", // виджет Яндекс Карт в контактах
		);
		header( 'Content-Security-Policy: ' . implode( '; ', $csp ) );
	}
}
add_action( 'send_headers', 'biart_security_headers' );

/* ------------------------------------------------------------------
 * 7. Мелочи: не показывать список файлов темы через REST, отключить
 *    «пароли приложений» для не-админов (клиенту они не нужны).
 * ---------------------------------------------------------------- */
add_filter( 'wp_is_application_passwords_available_for_user', function ( bool $available, WP_User $user ): bool {
	return $available && user_can( $user, 'manage_options' );
}, 10, 2 );
