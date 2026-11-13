<?php
/**
 * Форма заявки: шорткод [biart_form variant="ask|lead" lang="kk"].
 *
 * Нативные блоки форму не дают, а Custom HTML проект не использует (правило 1 CLAUDE.md),
 * поэтому форма выводится шорткодом из блока «Шорткод». Данные нигде не сохраняются и
 * на сервер не отправляются: assets/js/form.js проверяет поля и открывает WhatsApp
 * менеджера с готовым текстом. Весь вывод экранируется.
 */

defined( 'ABSPATH' ) || exit;

const BIART_WA_NUMBER = '77007103300';

/**
 * Адрес веб-приложения Google Apps Script (CRM в Google Таблице, см. crm/README.md).
 * Пусто — заявка только открывает WhatsApp. Задаётся в wp-config.php: define( 'BIART_CRM_URL', 'https://script.google.com/macros/s/…/exec' );
 */
if ( ! defined( 'BIART_CRM_URL' ) ) {
	define( 'BIART_CRM_URL', '' );
}
// Тот же токен — в свойствах Apps Script (TOKEN). Он виден в коде страницы, поэтому это фильтр от случайных
// ботов, бьющих по адресам скриптов, а не секрет; настоящая защита — лимиты в самом скрипте.
if ( ! defined( 'BIART_CRM_TOKEN' ) ) {
	define( 'BIART_CRM_TOKEN', '' );
}

function biart_form_shortcode( $atts ): string {
	$a    = shortcode_atts( array( 'variant' => 'ask', 'lang' => '' ), $atts, 'biart_form' );
	$kk   = 'kk' === $a['lang'];
	$lead = 'lead' === $a['variant'];
	$rent = 'rent' === $a['variant'];
	$kind = $rent ? 'rent' : ( $lead ? 'lead' : 'ask' );
	$t    = static fn( string $ru, string $kz ): string => $kk ? $kz : $ru;

	$ages = $kk
		? array( '6–10 жас', '11–13 жас', '14–17 жас', 'Ересек 18+' )
		: array( '6–10 лет', '11–13 лет', '14–17 лет', 'Взрослый 18+' );
	$dirs = $kk
		? array( 'Музыка өнері', 'Хореография', 'Актёрлік шеберлік', 'Digital & Visual Arts', 'Әзірге білмеймін' )
		: array( 'Музыкальное искусство', 'Хореография', 'Актёрское мастерство', 'Digital & Visual Arts', 'Пока не знаю' );

	$events = $kk
		? array( 'Конференция / QBR', 'Концерт', 'Спектакль', 'Корпоратив', 'Басқа' )
		: array( 'Конференция / QBR', 'Концерт', 'Спектакль', 'Корпоратив', 'Другое' );
	$id = 'bf-' . $kind;
	ob_start();
	?>
	<form class="biart-form is-<?php echo esc_attr( $kind ); ?>" novalidate
		data-wa="<?php echo esc_attr( BIART_WA_NUMBER ); ?>" data-lang="<?php echo esc_attr( $kk ? 'kk' : 'ru' ); ?>" data-variant="<?php echo esc_attr( $kind ); ?>" data-crm="<?php echo esc_url( BIART_CRM_URL ); ?>" data-crm-token="<?php echo esc_attr( BIART_CRM_TOKEN ); ?>">
		<input type="text" name="website" class="bf-hp" tabindex="-1" autocomplete="off" aria-hidden="true">
		<div class="bf-grid">
			<div class="bf-field">
				<label for="<?php echo esc_attr( $id ); ?>-name"><?php echo esc_html( $t( 'Имя', 'Аты' ) ); ?></label>
				<input id="<?php echo esc_attr( $id ); ?>-name" type="text" name="name" autocomplete="name" maxlength="60" required
					placeholder="<?php echo esc_attr( $t( 'Как к вам обращаться', 'Сізге қалай жүгінуге болады' ) ); ?>" aria-describedby="<?php echo esc_attr( $id ); ?>-name-e">
				<span class="bf-error" id="<?php echo esc_attr( $id ); ?>-name-e" role="alert"></span>
			</div>
			<div class="bf-field">
				<label for="<?php echo esc_attr( $id ); ?>-phone"><?php echo esc_html( $t( 'Телефон', 'Телефон' ) ); ?></label>
				<input id="<?php echo esc_attr( $id ); ?>-phone" type="tel" name="phone" inputmode="tel" autocomplete="tel" maxlength="22" required
					placeholder="+7 (700) 000-00-00" aria-describedby="<?php echo esc_attr( $id ); ?>-phone-e">
				<span class="bf-error" id="<?php echo esc_attr( $id ); ?>-phone-e" role="alert"></span>
			</div>
			<?php if ( $rent ) : ?>
			<div class="bf-field">
				<label for="<?php echo esc_attr( $id ); ?>-event"><?php echo esc_html( $t( 'Тип события', 'Іс-шара түрі' ) ); ?></label>
				<select id="<?php echo esc_attr( $id ); ?>-event" name="event">
					<option value=""><?php echo esc_html( $t( 'Выберите', 'Таңдаңыз' ) ); ?></option>
					<?php foreach ( $events as $v ) : ?>
						<option value="<?php echo esc_attr( $v ); ?>"><?php echo esc_html( $v ); ?></option>
					<?php endforeach; ?>
				</select>
			</div>
			<div class="bf-field">
				<label for="<?php echo esc_attr( $id ); ?>-date"><?php echo esc_html( $t( 'Желаемая дата', 'Қалаған күні' ) ); ?></label>
				<input id="<?php echo esc_attr( $id ); ?>-date" type="date" name="date">
			</div>
			<div class="bf-field">
				<label for="<?php echo esc_attr( $id ); ?>-guests"><?php echo esc_html( $t( 'Число гостей', 'Қонақтар саны' ) ); ?></label>
				<input id="<?php echo esc_attr( $id ); ?>-guests" type="number" name="guests" min="1" max="5000" inputmode="numeric" placeholder="<?php echo esc_attr( $t( 'Примерно', 'Шамамен' ) ); ?>">
			</div>
			<?php endif; ?>
			<?php if ( $lead ) : ?>
			<div class="bf-field">
				<label for="<?php echo esc_attr( $id ); ?>-age"><?php echo esc_html( $t( 'Возраст', 'Жасы' ) ); ?></label>
				<select id="<?php echo esc_attr( $id ); ?>-age" name="age">
					<option value=""><?php echo esc_html( $t( 'Выберите', 'Таңдаңыз' ) ); ?></option>
					<?php foreach ( $ages as $v ) : ?>
						<option value="<?php echo esc_attr( $v ); ?>"><?php echo esc_html( $v ); ?></option>
					<?php endforeach; ?>
				</select>
			</div>
			<div class="bf-field">
				<label for="<?php echo esc_attr( $id ); ?>-dir"><?php echo esc_html( $t( 'Направление', 'Бағыт' ) ); ?></label>
				<select id="<?php echo esc_attr( $id ); ?>-dir" name="direction">
					<option value=""><?php echo esc_html( $t( 'Выберите', 'Таңдаңыз' ) ); ?></option>
					<?php foreach ( $dirs as $v ) : ?>
						<option value="<?php echo esc_attr( $v ); ?>"><?php echo esc_html( $v ); ?></option>
					<?php endforeach; ?>
				</select>
			</div>
			<?php endif; ?>
			<div class="bf-field bf-wide">
				<label for="<?php echo esc_attr( $id ); ?>-msg"><?php echo esc_html( ( $lead || $rent ) ? $t( 'Комментарий', 'Түсініктеме' ) : $t( 'Ваш вопрос', 'Сұрағыңыз' ) ); ?> <small><?php echo esc_html( $t( '(необязательно)', '(міндетті емес)' ) ); ?></small></label>
				<textarea id="<?php echo esc_attr( $id ); ?>-msg" name="message" rows="3" maxlength="500"></textarea>
			</div>
		</div>
		<div class="bf-consent-wrap">
			<label class="bf-consent">
				<input type="checkbox" name="consent" required aria-describedby="<?php echo esc_attr( $id ); ?>-consent-e">
				<span>
					<?php
					$btn = ( $lead || $rent ) ? $t( 'Отправить заявку', 'Өтінім жіберу' ) : $t( 'Далее', 'Әрі қарай' );
					if ( $kk ) {
						echo '«' . esc_html( $btn ) . '» түймесін басу арқылы сіз жеке деректерді жинауға және өңдеуге келісім бересіз, ';
						echo '<a href="/privacy-policy/">Құпиялылық саясатын</a> қабылдайсыз және <a href="/dogovor-publichnoj-oferty/">пайдаланушы келісімінің шарттарымен</a> келісесіз.';
					} else {
						echo 'Нажимая кнопку «' . esc_html( $btn ) . '», вы даёте согласие на сбор и обработку персональных данных, принимаете ';
						echo '<a href="/privacy-policy/">Политику конфиденциальности</a> и соглашаетесь с <a href="/dogovor-publichnoj-oferty/">Условиями пользовательского соглашения</a>.';
					}
					?>
				</span>
			</label>
			<span class="bf-error" id="<?php echo esc_attr( $id ); ?>-consent-e" role="alert"></span>
		</div>
		<div class="bf-actions">
			<button type="submit" class="bf-submit"><?php echo esc_html( ( $lead || $rent ) ? $t( 'Отправить заявку', 'Өтінім жіберу' ) : $t( 'Далее', 'Әрі қарай' ) ); ?></button>
			<p class="bf-status" role="status" aria-live="polite"></p>
		</div>
		<noscript>
			<p class="bf-nojs"><a href="https://wa.me/<?php echo esc_attr( BIART_WA_NUMBER ); ?>"><?php echo esc_html( $t( 'Включите JavaScript или напишите нам в WhatsApp', 'JavaScript қосыңыз немесе WhatsApp-қа жазыңыз' ) ); ?></a></p>
		</noscript>
	</form>
	<?php
	return (string) ob_get_clean();
}
add_shortcode( 'biart_form', 'biart_form_shortcode' );
