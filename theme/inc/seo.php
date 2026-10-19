<?php
/**
 * BIART — SEO и шеринг: описание, hreflang, Open Graph, favicon, JSON-LD.
 * Без плагинов; данные школы — в одном месте ниже.
 */

defined( 'ABSPATH' ) || exit;

/** Факты о школе (используются в meta и JSON-LD). */
function biart_org(): array {
	return array(
		'name'      => 'BIART',
		'phone'     => '+7 700 710 33 00',
		'tel'       => '+77007103300',
		'street'    => 'ул. Сыганак 17/41',
		'city'      => 'Астана',
		'country'   => 'KZ',
		'zip'       => '010000',
		'lat'       => 51.130066,   // те же координаты, что у метки в блоке карты
		'lng'       => 71.386104,
		'instagram' => 'https://instagram.com/biart.kz',
		'whatsapp'  => 'https://wa.me/77007103300',
		'hours'     => array( 'Mo-Fr 09:00-21:00', 'Sa 10:00-17:00' ),
		'desc_ru'   => 'Школа креативных индустрий BIART в Астане: музыка, хореография, актёрское мастерство, digital art. Более 500 семей доверили нам творческое развитие детей. Пробный урок бесплатно.',
		'desc_kk'   => '6–18 жас аралығындағы балаларға арналған Астанадағы шығармашылық индустриялар мектебі: музыка, хореография, актёрлік шеберлік, digital art. Күшті педагогтар, өз сахнамыз, 5000 м². Сынақ сабағы тегін.',
	);
}

/**
 * Казахская версия опознаётся по ШАБЛОНУ, а не по слагу: слаг Редактор может
 * поменять в боковой панели (и WordPress сам меняет его на kz-2, если слаг занят),
 * а шаблон в обычном редакторе не трогают. Фолбэк на слаг — для старых установок.
 */
function biart_is_kz(): bool {
	return is_page_template( 'page-landing-kz' ) || is_page( 'kz' );
}

/**
 * Любая страница на казахском, а не только лендинг: внутренние страницы
 * (расписание) идут по шаблону page-kz. Отсюда берётся только атрибут lang —
 * заголовок, описание и hreflang у внутренних страниц свои.
 */
function biart_is_kz_lang(): bool {
	return biart_is_kz() || is_page_template( 'page-kz' );
}

/** Адрес казахской версии: ищем страницу по шаблону, а не склеиваем /kz/ руками. */
function biart_kz_url(): string {
	static $url = null;
	if ( null !== $url ) {
		return $url;
	}
	$found = get_posts(
		array(
			'post_type'      => 'page',
			'post_status'    => 'publish',
			'posts_per_page' => 1,
			'meta_key'       => '_wp_page_template',
			'meta_value'     => 'page-landing-kz',
			'fields'         => 'ids',
			'no_found_rows'  => true,
		)
	);
	$url = $found ? get_permalink( $found[0] ) : home_url( '/kz/' );
	return $url;
}


/** Описание для страницы расписания; у остальных внутренних страниц его нет. */
function biart_schedule_desc(): string {
	if ( is_page( 'raspisanie' ) ) {
		return 'Дни и время занятий для детей 6–10, 11–13 и 14–17 лет и для взрослых: музыка, хореография, актёрское мастерство и digital art в школе BIART, Астана.';
	}
	if ( is_page( 'raspisanie-kz' ) ) {
		return '6–10, 11–13, 14–17 жастағы балалар мен ересектердің сабақ күндері мен уақыты: музыка, хореография, актёрлік шеберлік және digital art — BIART, Астана.';
	}
	return '';
}

/** <head>: description, hreflang, OG/Twitter, theme-color, favicon. */
function biart_seo_head(): void {
	if ( ! is_front_page() && ! biart_is_kz() && ! is_page() ) {
		return;
	}
	$o     = biart_org();
	$kz    = biart_is_kz();
	// Юридические страницы — это тоже is_page(), и раньше им доставались описание,
	// заголовок и og:url главной. Теперь у каждой свои.
	$inner = ! is_front_page() && ! $kz;
	$desc  = $kz ? $o['desc_kk'] : $o['desc_ru'];
	$title = $kz ? 'BIART — Астанадағы шығармашылық индустриялар мектебі' : 'BIART — школа творческих индустрий в Астане';
	$url   = $kz ? biart_kz_url() : home_url( '/' );
	if ( $inner ) {
		$title = get_the_title() . ' — BIART';
		$url   = get_permalink();
		// У юридических страниц описание не нужно, а расписание ищут отдельно.
		$desc  = biart_schedule_desc();
	}
	$img   = get_template_directory_uri() . '/assets/img/og.jpg';
	$icons = get_template_directory_uri() . '/assets/img/';

	if ( '' !== $desc ) {
		echo '<meta name="description" content="' . esc_attr( $desc ) . '">' . PHP_EOL;
	}
	echo '<meta name="theme-color" content="#0a0a0a">' . PHP_EOL;

	if ( is_front_page() || $kz ) {
		echo '<link rel="alternate" hreflang="ru" href="' . esc_url( home_url( '/' ) ) . '">' . PHP_EOL;
		echo '<link rel="alternate" hreflang="kk" href="' . esc_url( biart_kz_url() ) . '">' . PHP_EOL;
		echo '<link rel="alternate" hreflang="x-default" href="' . esc_url( home_url( '/' ) ) . '">' . PHP_EOL;
	} elseif ( is_page( array( 'raspisanie', 'raspisanie-kz' ) ) ) {
		// Расписание существует на двух языках — без этой пары поиск считает
		// их разными страницами, а не переводами одной.
		echo '<link rel="alternate" hreflang="ru" href="' . esc_url( home_url( '/raspisanie/' ) ) . '">' . PHP_EOL;
		echo '<link rel="alternate" hreflang="kk" href="' . esc_url( home_url( '/raspisanie-kz/' ) ) . '">' . PHP_EOL;
		echo '<link rel="alternate" hreflang="x-default" href="' . esc_url( home_url( '/raspisanie/' ) ) . '">' . PHP_EOL;
	}

	echo '<meta property="og:type" content="website">' . PHP_EOL;
	echo '<meta property="og:site_name" content="BIART">' . PHP_EOL;
	echo '<meta property="og:locale" content="' . ( $kz ? 'kk_KZ' : 'ru_RU' ) . '">' . PHP_EOL;
	echo '<meta property="og:title" content="' . esc_attr( $title ) . '">' . PHP_EOL;
	if ( '' !== $desc ) {
		echo '<meta property="og:description" content="' . esc_attr( $desc ) . '">' . PHP_EOL;
	}
	echo '<meta property="og:url" content="' . esc_url( $url ) . '">' . PHP_EOL;
	echo '<meta property="og:image" content="' . esc_url( $img ) . '">' . PHP_EOL;
	echo '<meta property="og:image:width" content="1200">' . PHP_EOL;
	echo '<meta property="og:image:height" content="630">' . PHP_EOL;
	echo '<meta property="og:image:alt" content="' . esc_attr( $kz ? 'Астанадағы BIART мектебі' : 'Школа BIART в Астане' ) . '">' . PHP_EOL;
	echo '<meta name="twitter:card" content="summary_large_image">' . PHP_EOL;

	echo '<link rel="icon" href="' . esc_url( $icons . 'favicon.ico' ) . '" sizes="any">' . PHP_EOL;
	echo '<link rel="icon" type="image/png" sizes="32x32" href="' . esc_url( $icons . 'favicon-32.png' ) . '">' . PHP_EOL;
	echo '<link rel="apple-touch-icon" sizes="180x180" href="' . esc_url( $icons . 'apple-touch-icon.png' ) . '">' . PHP_EOL;
	echo '<link rel="manifest" href="' . esc_url( get_template_directory_uri() . '/assets/site.webmanifest' ) . '">' . PHP_EOL;
}
add_action( 'wp_head', 'biart_seo_head', 2 );

/** JSON-LD: организация + адрес + часы (для Google/Яндекс). */
function biart_jsonld(): void {
	if ( ! is_front_page() && ! biart_is_kz() ) {
		return;
	}
	$o    = biart_org();
	$data = array(
		'@context'     => 'https://schema.org',
		'@type'        => array( 'EducationalOrganization', 'LocalBusiness' ),
		'name'         => $o['name'],
		'description'  => biart_is_kz() ? $o['desc_kk'] : $o['desc_ru'],
		'url'          => home_url( '/' ),
		'telephone'    => $o['tel'],
		'image'        => get_template_directory_uri() . '/assets/img/og.jpg',
		'logo'         => get_template_directory_uri() . '/assets/img/logo.png',
		'priceRange'   => '30 000 – 80 000 ₸ / мес',
		'sameAs'       => array( $o['instagram'] ),
		'address'      => array(
			'@type'           => 'PostalAddress',
			'streetAddress'   => $o['street'],
			'addressLocality' => $o['city'],
			'postalCode'      => $o['zip'],
			'addressCountry'  => $o['country'],
		),
		'geo'          => array(
			'@type'     => 'GeoCoordinates',
			'latitude'  => $o['lat'],
			'longitude' => $o['lng'],
		),
		'openingHours' => $o['hours'],
		'contactPoint' => array(
			'@type'             => 'ContactPoint',
			'telephone'         => $o['tel'],
			'contactType'       => 'customer service',
			'availableLanguage' => array( 'ru', 'kk' ),
			'url'               => $o['whatsapp'],
		),
	);
	echo '<script type="application/ld+json">' . wp_json_encode( $data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ) . '</script>' . PHP_EOL;
}
add_action( 'wp_head', 'biart_jsonld', 3 );

/** Preload hero-фото (LCP). */
function biart_preload_hero(): void {
	if ( is_front_page() || biart_is_kz() ) {
		echo '<link rel="preload" as="image" href="' . esc_url( get_template_directory_uri() . '/assets/img/hero-facade.webp' ) . '">' . PHP_EOL;
	}
}
add_action( 'wp_head', 'biart_preload_hero', 1 );

/**
 * robots.txt. Отдаём фильтром, а не файлом: файла в корне у темы быть не может,
 * а WordPress соберёт ответ сам. Карта сайта — встроенная, плагинов нет.
 */
function biart_robots_txt( string $output, $public ): string {
	if ( ! $public ) {
		return $output;   // «не индексировать» в Настройках → Чтение уважаем
	}
	$lines = array(
		'User-agent: *',
		'Disallow: /wp-admin/',
		'Allow: /wp-admin/admin-ajax.php',
		'Disallow: /wp-login.php',
		'Disallow: /?s=',
		'Disallow: /*?preview=',
		'',
		'Sitemap: ' . home_url( '/wp-sitemap.xml' ),
	);
	return implode( PHP_EOL, $lines ) . PHP_EOL;
}
add_filter( 'robots_txt', 'biart_robots_txt', 10, 2 );

/**
 * Переключатель языка в шапке — нативный блок со ссылкой /kz/ прямо в разметке.
 * Если слаг казахской страницы когда-нибудь съедет (WordPress сам делает kz-2,
 * когда слаг занят), ссылка упрётся в 404. Ловим этот случай и уводим на страницу,
 * найденную по шаблону.
 */
function biart_kz_fallback(): void {
	if ( ! is_404() ) {
		return;
	}
	$path = trim( wp_parse_url( $_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH ) ?? '', '/' );
	if ( 'kz' !== $path ) {
		return;
	}
	$url = biart_kz_url();
	if ( $url && home_url( '/kz/' ) !== $url ) {
		wp_safe_redirect( $url, 301 );
		exit;
	}
}
add_action( 'template_redirect', 'biart_kz_fallback' );
