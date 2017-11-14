<?php 
/*
Plugin Name: NuevaPrensa Share2Page FB
Plugin URI: http://hrincon.mx/
Description: Automatically share your posts to your Facebook page
Version: 1.0
Author: Hector Rincon
Copyright: Hector Rincon
Text Domain: npwpfbs2p
*/

if(!defined('ABSPATH'))
	exit();

require_once ABSPATH.'/vendor/autoload.php';

if(!class_exists('npwpfbs2p') && is_admin()):
/**
* 
*/
class npwpfbs2p {
	
	function __construct() {
		// empty constructor
	}

	function setup() {
		add_action('admin_menu', [$this, 'admin_menu']);
		add_action('admin_init', [$this, 'register_settings']);
		// TODO: check that the settings are configured else:
		add_action('admin_notices', [$this, 'admin_notices']);
		add_action('wp_ajax_npwpltat', [$this, 'get_tokens']);
		register_uninstall_hook(__FILE__, [$this, 'uninstall']);
	}

	function admin_menu() {
		$hook_suffix = add_options_page('NP Share2Page - Settings', 'NP Share2Page', 'manage_options', 'share2page_options', [$this, 'gen_page']);
		add_action('load-'.$hook_suffix, [$this, 'mypage_load']);
		add_action('admin_print_styles-'.$hook_suffix, [$this, 'enqueue_admin_styles']);
	}

	function enqueue_admin_styles() {
		wp_enqueue_style('npwpfbs2p_style', plugins_url('wpfb-share2page/style.css'));
		wp_enqueue_script('npwpfbs2p_js', plugins_url('wpfb-share2page/admin.js'), ['jquery'], null, true);
	}

	function mypage_load() {
		remove_action('admin_notices', [$this, 'admin_notices']);
	}

	function gen_page() {
		// Check for FB stuff!
		$result = $this->check_fb_conditions();
		$result['appid'] = isset($result['appid']) ? $result['appid'] : false;
		$result['appsecret'] = isset($result['app_secret']) ? $result['app_secret'] : false;
		$authorized = $result['authorized'];
		include_once('settings-view.php');
	}

	function admin_notices() {
		echo "<div id='np-configure-error' class='notice notice-warning fade'><p>NP Share2Page is not configured yet. Posts will not be automatically published to Facebook.</p></div>\n";
	}

	function register_settings() {
		register_setting('npwpfbs2p-options', 'npwpapp_id');
		register_setting('npwpfbs2p-options', 'npwpapp_secret');
		register_setting('npwpfbs2p-options', 'npwpltpat');
		register_setting('npwpfbs2p-options', 'npwpltuat');
		register_setting('npwpfbs2p-options', 'npwppage_id');
	}

	function check_fb_conditions() {
		$appid = esc_attr(get_option('npwpapp_id'));
		$appsecret = esc_attr(get_option('npwpapp_secret'));
		$appltuat = get_option('npwpltuat');
		$appltpat = get_option('npwpltpat');
		$app_page_id = get_option('npwppage_id');
		if($appid){
			// Check if is authorized
			if(!$appsecret)
				return ['authorized' => false, 'reason' => 'No app secret', 'appid' => $appid, 'app_secret' => $appsecret];

			if($appltpat){
				return ['authorized' => true, 'appid' => $appid, 'app_secret' => $appsecret];
			}
			else {
				if($appltuat){
					// get the ltpat
					$this->get_ltpat($appltuat);
					return ['authorized' => true, 'appid' => $appid, 'app_secret' => $appsecret];
				}
				else{
					return ['authorized' => false, 'reason' => 'Not yet logged in', 'appid' => $appid, 'app_secret' => $appsecret];
				}
			}
		}
		return ['authorized' => false, 'reason' => 'No app ID', 'hasAppId' => false];
	}
	function get_tokens(){
		// Get both tokens!
		global $wpdb;
		$appstuat = $_POST['slat'];
		$appltuat = $this->get_ltuat($appstuat);
		if(!$appltuat) {
			// return error
			echo json_encode(['error' => 'error', 'message' => 'Could not retrieve LTUAT']);
			wp_die();
		}
		// if not, keep going
		$appltpat = $this->get_ltpat($appltuat['access_token']);
		if(!$appltpat){
			// return error
			echo json_encode(['error' => 'error', 'message' => 'Could not retrieve LTPAT']);
			wp_die();
		}

		echo json_encode(['success' => 'success', 'ltuat' => $appltuat['access_token'], 'ltpat' => $appltpat['data']]);
		wp_die();
	}
	function get_ltuat($appstuat) {
		// Get the token and save it to options
		$appid = esc_attr(get_option('npwpapp_id'));
		$appsecret = esc_attr(get_option('npwpapp_secret'));
		$fb = new Facebook\Facebook([
			'app_id' => $appid,
			'app_secret' => $appsecret,
			'default_graph_version' => 'v2.11',
			'default_access_token' => $appstuat
		]);

		try {
			$response = $fb->get("/oauth/access_token?grant_type=fb_exchange_token&client_id=$appid&client_secret=$appsecret&fb_exchange_token=$appstuat");
		} catch(Facebook\Exceptions\FacebookResponseException $e) {
			// echo 'Facebook SDK returned a response error: ' . $e->getMessage();
			error_log($e->getMessage());
			return false;
		} catch (\Facebook\Exceptions\FacebookSDKException $e) {
			// echo 'Facebook SDK returned an error: ' . $e->getMessage();
			error_log($e->getMessage());
			return false;
		}
		$res = $response->getDecodedBody();
		update_option('npwpltuat', $res['access_token']);
		return $res;
	}
	function get_ltpat($appltuat){
		// Get the token and save it to options
		$appid = esc_attr(get_option('npwpapp_id'));
		$appsecret = esc_attr(get_option('npwpapp_secret'));

		$fb = new Facebook\Facebook([
			'app_id' => $appid,
			'app_secret' => $appsecret,
			'default_graph_version' => 'v2.11',
			'default_access_token' => $appltuat
		]);

		try {
			$response = $fb->get("/me/accounts");
		} catch(Facebook\Exceptions\FacebookResponseException $e) {
			// echo 'Facebook SDK returned a response error: ' . $e->getMessage();
			error_log($e->getMessage());
			return false;
		} catch (\Facebook\Exceptions\FacebookSDKException $e) {
			// echo 'Facebook SDK returned an error: ' . $e->getMessage();
			error_log($e->getMessage());
			return false;
		}
		$res = $response->getDecodedBody();
		// update_option('npwpltpat', $res['access_token']);
		return $res;
		
	}

	function uninstall() {
		unregister_setting('npwpfbs2p-options', 'npwpapp_id');
		unregister_setting('npwpfbs2p-options', 'npwpapp_secret');
		unregister_setting('npwpfbs2p-options', 'npwpltpat');
		unregister_setting('npwpfbs2p-options', 'npwpltuat');
		unregister_setting('npwpfbs2p-options', 'npwppage_id');
	}
}


// Initialise the singleton
$npfb_s2p = new npwpfbs2p();
$npfb_s2p->setup();

endif;

