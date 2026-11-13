<?php
/**
 * Plugin Name: AAS Landing Assets
 * Description: Styles, scripts, fonts and animations for the AAS Group "Outdoor" landing page built in Elementor. Loads only on pages made from the AAS Outdoor Landing template, never site-wide. Adds Settings → AAS Landing.
 * Version: 1.0.0
 * Requires at least: 6.2
 * Requires PHP: 7.4
 * Author: Clientgateway
 * License: GPLv2 or later
 * Text Domain: aas-landing
 */

if (!defined('ABSPATH')) exit;

define('AAS_LP_VER', '1.0.0');
define('AAS_LP_FILE', __FILE__);
define('AAS_LP_URL', plugin_dir_url(__FILE__));
define('AAS_LP_DIR', plugin_dir_path(__FILE__));

/* ------------------------------------------------------------------ settings */

function aas_lp_defaults() {
	return array(
		'wa'        => '447777792227',
		'tel'       => '07777 792227',
		'email_on'  => 0,
		'email_to'  => get_option('admin_email'),
		'seo_title' => 'Landscaping, Patios & Driveways in Northampton | AAS Group',
		'seo_desc'  => 'Patios, driveways and full garden transformations across Northamptonshire and Milton Keynes, built by a groundworks team that gets the base, levels and drainage right first. Book a free site visit and written quote.',
		'trim'      => 1,
	);
}

function aas_lp_opts() {
	return wp_parse_args((array) get_option('aas_landing', array()), aas_lp_defaults());
}

/* ------------------------------------------------- is this the landing page? */

// A page counts as the landing page when its Elementor data contains the template's marker
// (the locked loader widget carries data-aas-landing). Nothing loads anywhere else.
function aas_lp_is_landing($post_id = null) {
	static $cache = array();
	if ($post_id === null) {
		if (is_admin() || !is_singular()) return false;
		$post_id = get_queried_object_id();
	}
	$post_id = (int) $post_id;
	if (!$post_id) return false;
	if (isset($cache[$post_id])) return $cache[$post_id];
	$data = get_post_meta($post_id, '_elementor_data', true);
	if (is_array($data)) $data = wp_json_encode($data);
	return $cache[$post_id] = (is_string($data) && strpos($data, 'data-aas-landing') !== false);
}

function aas_lp_in_preview() {
	return isset($_GET['elementor-preview']) && class_exists('\Elementor\Plugin') && \Elementor\Plugin::$instance->preview && \Elementor\Plugin::$instance->preview->is_preview_mode();
}

/* ------------------------------------------------------------- front end */

// every photo in the page content sits below the hero: lazy-load them all and keep "high priority" for the hero poster
add_filter('wp_get_loading_optimization_attributes', function ($attrs, $tag) {
	if ('img' === $tag && aas_lp_is_landing()) { unset($attrs['fetchpriority']); $attrs['loading'] = 'lazy'; }
	return $attrs;
}, 20, 2);

add_filter('body_class', function ($c) {
	if (aas_lp_is_landing()) $c[] = 'aas-landing';
	return $c;
});

add_action('wp_head', function () {
	$preview = aas_lp_in_preview();
	$landing = aas_lp_is_landing();
	if (!$landing && !$preview) return;
	$o = aas_lp_opts();
	$base = untrailingslashit(AAS_LP_URL . 'assets');
	$cfg = array(
		'base'   => $base,
		'wa'     => preg_replace('/\D/', '', $o['wa']),
		'tel'    => $o['tel'],
		'editor' => $preview,
	);
	if (!empty($o['email_on'])) $cfg['endpoint'] = esc_url_raw(rest_url('aas-landing/v1/lead'));
	echo "\n<script id=\"aas-cfg\">window.AAS_CFG=" . wp_json_encode($cfg) . ";document.documentElement.classList.add('js');try{if(sessionStorage.getItem('aas-seen')||matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('seen');sessionStorage.setItem('aas-seen','1')}catch(e){}</script>\n";
	if ($preview && !$landing) {
		// editor preview of a page that has only just had the template inserted: scope the styles as soon as the marker appears
		echo "<script>new MutationObserver(function(m,o){if(document.querySelector('[data-aas-landing]')){document.body.classList.add('aas-landing');o.disconnect()}}).observe(document.documentElement,{childList:true,subtree:true});</script>\n";
	}
	if (!$landing) return;
	foreach (array('aas-fraunces.woff2', 'aas-geist.woff2', 'aas-instrument-serif-italic.woff2') as $f) {
		echo '<link rel="preload" href="' . esc_url($base . '/fonts/' . $f) . '" as="font" type="font/woff2" crossorigin>' . "\n";
	}
	echo '<link rel="preload" as="image" href="' . esc_url($base . '/poster/hero-d.avif') . '" type="image/avif" media="(min-width: 701px)" fetchpriority="high">' . "\n";
	echo '<link rel="preload" as="image" href="' . esc_url($base . '/poster/hero-m.avif') . '" type="image/avif" media="(max-width: 700px)" fetchpriority="high">' . "\n";
	if ($preview) {
		$crit = @file_get_contents(AAS_LP_DIR . 'assets/critical.css');
		if ($crit) echo '<style id="aas-critical">' . str_replace('{{BASE}}', esc_url($base), $crit) . "</style>\n";
	}
	if (!aas_lp_seo_plugin() && $o['seo_desc'] !== '') {
		echo '<meta name="description" content="' . esc_attr($o['seo_desc']) . '">' . "\n";
	}
}, 1);

// live page: the whole stylesheet is inlined in <head> (like the demo), so the first screen paints in one go with no
// extra request and nothing shifts when a late file arrives. It prints after Elementor's own CSS.
add_action('wp_head', function () {
	if (!aas_lp_is_landing() || aas_lp_in_preview()) return;
	$css = @file_get_contents(AAS_LP_DIR . 'assets/aas-inline.css');
	if ($css) echo '<style id="aas-landing-inline">' . str_replace('{{BASE}}', esc_url(untrailingslashit(AAS_LP_URL . 'assets')), $css) . "</style>\n";
}, 100);

// Elementor editor preview: the same styles as a normal file
add_action('wp_enqueue_scripts', function () {
	if (!aas_lp_in_preview()) return;
	$deps = wp_style_is('elementor-frontend', 'registered') ? array('elementor-frontend') : array();
	wp_enqueue_style('aas-landing', AAS_LP_URL . 'assets/aas.css', $deps, AAS_LP_VER);
}, 99999);

// the page script is an ES module (it lazy-loads the 3D and film code only when needed)
add_action('wp_footer', function () {
	if (!aas_lp_is_landing()) return;
	// file name carries a content hash (see entry.php); no ?ver= so lazy chunks share the same module instance
	$entry = include AAS_LP_DIR . 'entry.php';
	echo '<script type="module" id="aas-landing-js" src="' . esc_url(AAS_LP_URL . 'assets/js/' . $entry) . '"></script>' . "\n";
}, 99);

// Elementor Canvas still prints the theme's and other plugins' CSS/JS in <head>. On this page only,
// drop the theme, Slider Revolution, ElementsKit and block-editor files: the page uses none of them.
function aas_lp_trim_assets() {
	if (!aas_lp_is_landing() || aas_lp_in_preview()) return;
	if (empty(aas_lp_opts()['trim'])) return;
	global $wp_styles, $wp_scripts;
	$needles = array_filter(array(
		get_template_directory_uri() . '/', get_stylesheet_directory_uri() . '/',
		'/plugins/revslider/', '/plugins/elementskit/', '/plugins/elementskit-lite/',
	));
	foreach (array('style' => $wp_styles, 'script' => $wp_scripts) as $type => $reg) {
		if (!$reg) continue;
		foreach ((array) $reg->queue as $h) {
			$src = isset($reg->registered[$h]) ? (string) $reg->registered[$h]->src : '';
			foreach ($needles as $n) {
				if ($src !== '' && strpos($src, $n) !== false) {
					$type === 'style' ? wp_dequeue_style($h) : wp_dequeue_script($h);
					break;
				}
			}
		}
	}
	foreach (array('wp-block-library', 'wp-block-library-theme', 'global-styles', 'classic-theme-styles') as $h) wp_dequeue_style($h);
}
add_action('wp_enqueue_scripts', 'aas_lp_trim_assets', 100000);

// speed, on this page only: jQuery and Elementor's scripts move to the footer and are deferred, no emoji script
add_action('wp_enqueue_scripts', function () {
	if (!aas_lp_is_landing() || aas_lp_in_preview()) return;
	foreach (array('jquery', 'jquery-core', 'jquery-migrate') as $h) wp_script_add_data($h, 'group', 1);
	// Elementor's own front-end scripts (accordion etc.) don't need to hold up the first paint
	global $wp_scripts;
	foreach ((array) $wp_scripts->queue as $h) {
		$src = isset($wp_scripts->registered[$h]) ? (string) $wp_scripts->registered[$h]->src : '';
		if (strpos($src, '/plugins/elementor/') !== false || strpos($src, '/wp-includes/js/jquery/') !== false) wp_script_add_data($h, 'strategy', 'defer');
	}
	foreach (array('jquery-core', 'jquery-migrate', 'jquery-ui-core', 'elementor-webpack-runtime', 'elementor-frontend-modules', 'elementor-frontend') as $h) wp_script_add_data($h, 'strategy', 'defer');
	// jQuery UI's one-line "back-compat" switch would run before the deferred jQuery exists; nothing here needs it
	if (isset($wp_scripts->registered['jquery-ui-core'])) unset($wp_scripts->registered['jquery-ui-core']->extra['before']);
}, 100001);
add_action('wp', function () {
	if (!aas_lp_is_landing() || aas_lp_in_preview()) return;
	remove_action('wp_head', 'print_emoji_detection_script', 7);
	remove_action('wp_print_styles', 'print_emoji_styles');
	remove_action('wp_enqueue_scripts', 'wp_enqueue_emoji_styles');
});
add_action('wp_print_styles', 'aas_lp_trim_assets', 1);
add_action('wp_print_scripts', 'aas_lp_trim_assets', 1);

// the page brings its own fonts: never pull Google Fonts on it
add_filter('elementor/frontend/print_google_fonts', function ($v) { return aas_lp_is_landing() ? false : $v; });
// make the bundled fonts selectable in Elementor (as local fonts, so Elementor never fetches them from Google)
add_filter('elementor/fonts/additional_fonts', function ($f) {
	$f['AAS Fraunces'] = 'system';
	$f['AAS Geist'] = 'system';
	$f['AAS Instrument Serif'] = 'system';
	return $f;
});

/* ------------------------------------------------------------------- SEO */

function aas_lp_seo_plugin() {
	return defined('WPSEO_VERSION') || class_exists('RankMath') || defined('SEOPRESS_VERSION') || defined('AIOSEO_VERSION');
}
add_filter('pre_get_document_title', function ($t) {
	if (!aas_lp_is_landing()) return $t;
	$o = aas_lp_opts();
	return $o['seo_title'] !== '' ? $o['seo_title'] : $t;
}, 99);
foreach (array('wpseo_title', 'rank_math/frontend/title') as $hook) {
	add_filter($hook, function ($t) {
		if (!aas_lp_is_landing()) return $t;
		$o = aas_lp_opts();
		return $o['seo_title'] !== '' ? $o['seo_title'] : $t;
	}, 99);
}
foreach (array('wpseo_metadesc', 'rank_math/frontend/description') as $hook) {
	add_filter($hook, function ($d) {
		if (!aas_lp_is_landing() || !empty($d)) return $d;
		return aas_lp_opts()['seo_desc'];
	}, 99);
}

/* ------------------------------------------- alt text for imported photos */

// Elementor imports the template's photos into the Media Library but not their alt text; restore it.
add_action('add_attachment', function ($id) {
	$alts = array(
		'southam-after'   => 'Light porcelain patio with a charcoal border at a new-build home in Southam',
		'windbrush-after' => 'Charcoal block paving driveway with a light border on Windbrush Way, Northampton',
		'holm-after'      => 'Garden in Great Holm with grey porcelain patio, artificial lawn and dark fencing',
		'abington-after'  => 'New featheredge fence on concrete posts and gravel boards at Abington Park',
		'rootlok-done'    => 'Finished green Rootlok vegetated retaining wall running along a boundary in Wellingborough',
		'rootlok-run'     => 'The 50 metre Rootlok wall of green geotextile bags along a wooded boundary',
		'shelley-after'   => 'Finished garden on Shelley Road, Wellingborough',
	);
	$file = basename((string) get_attached_file($id));
	foreach ($alts as $k => $alt) {
		if (strpos($file, $k . '-1600') === 0 &&!get_post_meta($id, '_wp_attachment_image_alt', true)) {
			update_post_meta($id, '_wp_attachment_image_alt', $alt);
			break;
		}
	}
});

/* --------------------------------------------------- lead email (optional) */

add_action('rest_api_init', function () {
	register_rest_route('aas-landing/v1', '/lead', array(
		'methods'             => 'POST',
		'permission_callback' => '__return_true',
		'callback'            => 'aas_lp_lead',
	));
});

function aas_lp_lead(WP_REST_Request $r) {
	$o = aas_lp_opts();
	if (empty($o['email_on'])) return new WP_REST_Response(array('ok' => false, 'reason' => 'email off'), 200);
	$ip = isset($_SERVER['REMOTE_ADDR']) ? (string) $_SERVER['REMOTE_ADDR'] : '';
	$key = 'aas_lp_rl_' . md5($ip);
	$n = (int) get_transient($key);
	if ($n >= 5) return new WP_REST_Response(array('ok' => false, 'reason' => 'too many'), 429);
	set_transient($key, $n + 1, HOUR_IN_SECONDS);
	$p = $r->get_json_params();
	if (!is_array($p) || !empty($p['website'])) return new WP_REST_Response(array('ok' => false), 400);
	$msg = sanitize_textarea_field(substr((string) ($p['message'] ?? ''), 0, 4000));
	if ($msg === '') return new WP_REST_Response(array('ok' => false), 400);
	$to = sanitize_email($o['email_to']);
	if (!$to) $to = get_option('admin_email');
	$sent = wp_mail($to, 'New free site visit request from the website', $msg . "\n\n— Sent from " . home_url('/'));
	return new WP_REST_Response(array('ok' => (bool) $sent), 200);
}

/* ------------------------------------------- Elementor global colours/fonts */

function aas_lp_globals() {
	return array(
		'colors' => array(
			'aasmoss'  => array('AAS Moss', '#2E3A2C'),
			'aaslime'  => array('AAS Limestone', '#F3EFE7'),
			'aaspaper' => array('AAS Paper', '#FBFAF7'),
			'aasstone' => array('AAS Stone', '#8C8A82'),
			'aasink'   => array('AAS Ink', '#1C1D1B'),
			'aassage'  => array('AAS Sage', '#A9B59A'),
			'aasclay'  => array('AAS Clay', '#B9784A'),
			'aasred'   => array('AAS Red', '#F33333'),
		),
		'fonts' => array(
			'aasdisp' => array('AAS Display', 'AAS Fraunces', '400'),
			'aasital' => array('AAS Accent italic', 'AAS Instrument Serif', '400'),
			'aasbody' => array('AAS Body', 'AAS Geist', '400'),
		),
	);
}

// Adds (never replaces) the AAS colours and fonts to Site Settings → Global Colors / Global Fonts.
// The page's CSS reads them, so changing "AAS Moss" there recolours the page.
function aas_lp_install_globals() {
	if (!did_action('elementor/loaded')) return false;
	$kit_id = (int) get_option('elementor_active_kit');
	if (!$kit_id) return false;
	$s = get_post_meta($kit_id, '_elementor_page_settings', true);
	if (!is_array($s)) $s = array();
	$g = aas_lp_globals();
	$have_c = wp_list_pluck(isset($s['custom_colors']) ? (array) $s['custom_colors'] : array(), '_id');
	foreach ($g['colors'] as $id => $c) {
		if (!in_array($id, $have_c, true)) $s['custom_colors'][] = array('_id' => $id, 'title' => $c[0], 'color' => $c[1]);
	}
	$have_t = wp_list_pluck(isset($s['custom_typography']) ? (array) $s['custom_typography'] : array(), '_id');
	foreach ($g['fonts'] as $id => $t) {
		if (!in_array($id, $have_t, true)) {
			$s['custom_typography'][] = array('_id' => $id, 'title' => $t[0], 'typography_typography' => 'custom', 'typography_font_family' => $t[1], 'typography_font_weight' => $t[2]);
		}
	}
	update_post_meta($kit_id, '_elementor_page_settings', $s);
	if (class_exists('\Elementor\Plugin') && isset(\Elementor\Plugin::$instance->files_manager)) \Elementor\Plugin::$instance->files_manager->clear_cache();
	update_option('aas_lp_globals', AAS_LP_VER, false);
	return true;
}
register_activation_hook(__FILE__, function () { update_option('aas_lp_globals', '', false); });
add_action('admin_init', function () {
	if (get_option('aas_lp_globals') !== AAS_LP_VER) aas_lp_install_globals();
});

/* ------------------------------------------------------- Settings screen */

add_action('admin_menu', function () {
	add_options_page('AAS Landing', 'AAS Landing', 'manage_options', 'aas-landing', 'aas_lp_settings_page');
});

add_action('admin_init', function () {
	register_setting('aas_landing', 'aas_landing', array('sanitize_callback' => function ($in) {
		$in = (array) $in;
		$d = aas_lp_defaults();
		return array(
			'wa'        => preg_replace('/\D/', '', (string) ($in['wa'] ?? $d['wa'])),
			'tel'       => sanitize_text_field((string) ($in['tel'] ?? $d['tel'])),
			'email_on'  => empty($in['email_on']) ? 0 : 1,
			'email_to'  => sanitize_email((string) ($in['email_to'] ?? '')),
			'seo_title' => sanitize_text_field((string) ($in['seo_title'] ?? '')),
			'seo_desc'  => sanitize_textarea_field((string) ($in['seo_desc'] ?? '')),
			'trim'      => empty($in['trim']) ? 0 : 1,
		);
	}));
});

add_filter('plugin_action_links_' . plugin_basename(__FILE__), function ($l) {
	array_unshift($l, '<a href="' . esc_url(admin_url('options-general.php?page=aas-landing')) . '">Settings</a>');
	return $l;
});

function aas_lp_settings_page() {
	if (!current_user_can('manage_options')) return;
	$o = aas_lp_opts();
	$el = defined('ELEMENTOR_VERSION') ? ELEMENTOR_VERSION : '';
	$flex = $el && class_exists('\Elementor\Plugin') && \Elementor\Plugin::$instance->experiments->is_feature_active('container');
	?>
	<div class="wrap">
		<h1>AAS Landing</h1>
		<p>Settings for the AAS Group outdoor landing page. The page's own text, photos and buttons are edited in Elementor; these settings feed the parts that are built in code.</p>
		<form method="post" action="options.php">
			<?php settings_fields('aas_landing'); ?>
			<table class="form-table" role="presentation">
				<tr><th scope="row"><label for="aas-wa">WhatsApp number</label></th>
					<td><input id="aas-wa" class="regular-text" name="aas_landing[wa]" value="<?php echo esc_attr($o['wa']); ?>">
					<p class="description">International format, digits only, e.g. 447777792227. Used by the booking form, the configurator and every WhatsApp button on the page.</p></td></tr>
				<tr><th scope="row"><label for="aas-tel">Phone number</label></th>
					<td><input id="aas-tel" class="regular-text" name="aas_landing[tel]" value="<?php echo esc_attr($o['tel']); ?>">
					<p class="description">Used by the call buttons (the visible number text is edited in Elementor).</p></td></tr>
				<tr><th scope="row">Email leads</th>
					<td><label><input type="checkbox" name="aas_landing[email_on]" value="1" <?php checked($o['email_on'], 1); ?>> Also email each booking-form brief</label><br>
					<input class="regular-text" type="email" name="aas_landing[email_to]" value="<?php echo esc_attr($o['email_to']); ?>" placeholder="<?php echo esc_attr(get_option('admin_email')); ?>">
					<p class="description">WhatsApp still opens as normal. Uses your site's normal email sending (wp_mail).</p></td></tr>
				<tr><th scope="row"><label for="aas-title">SEO title</label></th>
					<td><input id="aas-title" class="large-text" name="aas_landing[seo_title]" value="<?php echo esc_attr($o['seo_title']); ?>"></td></tr>
				<tr><th scope="row"><label for="aas-desc">Meta description</label></th>
					<td><textarea id="aas-desc" class="large-text" rows="3" name="aas_landing[seo_desc]"><?php echo esc_textarea($o['seo_desc']); ?></textarea>
					<?php if (aas_lp_seo_plugin()) echo '<p class="description">An SEO plugin is active: the description is only used when the page has none set in that plugin.</p>'; ?></td></tr>
				<tr><th scope="row">Speed</th>
					<td><label><input type="checkbox" name="aas_landing[trim]" value="1" <?php checked($o['trim'], 1); ?>> On this page only, don't load the theme, Slider Revolution and ElementsKit files (recommended)</label></td></tr>
			</table>
			<?php submit_button(); ?>
		</form>
		<h2>Status</h2>
		<ul style="list-style:disc;padding-left:20px">
			<li>Elementor: <?php echo $el ? esc_html($el) : '<strong>not active</strong>'; ?></li>
			<li>Flexbox Container: <?php echo $flex ? 'active' : '<strong>not active – turn it on in Elementor → Settings → Features</strong>'; ?></li>
			<li>AAS global colours &amp; fonts: <?php echo get_option('aas_lp_globals') === AAS_LP_VER ? 'added to Site Settings' : 'not added yet (needs Elementor active)'; ?></li>
		</ul>
	</div>
	<?php
}
