
<?php  
	if(!defined('ABSPATH'))
		exit();
	if (!current_user_can('manage_options')): 
		wp_die( __('You do not have sufficient permissions to access this page.') );
	else:
?>
<pre>
</pre>
<?php if(!$authorized): ?>
	<?php if($result['appid'] && $result['appsecret']): ?>
		<script>
		  window.fbAsyncInit = function() {
		    FB.init({
		      appId            : '<?= $result['appid'] ?>',
		      autoLogAppEvents : true,
		      xfbml            : true,
		      version          : 'v2.11'
		    });
		    readyFB();
		  };
		  (function(d, s, id){
		     var js, fjs = d.getElementsByTagName(s)[0];
		     if (d.getElementById(id)) {return;}
		     js = d.createElement(s); js.id = id;
		     js.src = "//connect.facebook.net/en_US/sdk.js";
		     fjs.parentNode.insertBefore(js, fjs);
		   }(document, 'script', 'facebook-jssdk'));
		</script>
	<?php endif; ?>
<?php endif; ?>


<div class="wrap">
	<h1>NuevaPrensa - Share2Page</h1>
	<div class="content">
		
		<h2>Facebook App Settings</h2>
		<form action="options.php" method="post" class="npfbform">
			<hr>
			<p>Add App ID and Secret and hit Save Changes to be able to Authorize.</p>
			<?php 
				settings_fields('npwpfbs2p-options'); 
				do_settings_sections('npwpfbs2p-options');
			?>
			<input id="npwpltpat" type="hidden" name="npwpltpat" value="<?= esc_attr(get_option("npwpltpat")); ?>">
			<input id="npwppage_id" type="hidden" name="npwppage_id" value="<?= esc_attr(get_option("npwppage_id")); ?>">
			<table class="form-fields">
				<tbody>
					<tr>
						<td><label for="appid"><strong>1) App ID</strong></label></td>
						<td><input type="text" name="npwpapp_id" id="appid" placeholder="2932801821982918210" value="<?= $result['appid'] ?>"></td>
					</tr>
					<tr>
						<td><label for="appsecret"><strong>2) App Secret</strong></label></td>
						<td><input type="text" name="npwpapp_secret" id="appsecret" placeholder="EAAEKuC2MsAsBAK6LBt3W1ZCE..." value="<?= $result['appsecret'] ?>"></td>
					</tr>
					<tr>
						<td><strong>3) Status</strong></td>
						<td>
							<?php if(!$authorized): ?>
								<p class="status-tag bad">Not Authorized</p>
								<a href="#" tabindex="0" id="authorizebtn" class="button button-secondary disabled btn-authorize">Authorize</a>
							<?php else: ?>
								<p class="status-tag good">Authorized</p>
							<?php endif; ?>
						</td>
					</tr>
					<tr id="choosepagerow">
						<td><strong>4) Choose a page</strong></td>
						<td>
							<h3 style="margin-bottom:0;">Pages you manage</h3>
							<p style="font-size: 12px;">We found the following pages that you manage. Please select one for automatic posting to Facebook.</p>
							<hr>
							<div class="pages-choices">
								<ul class="page-list"> </ul>
							</div>
						</td>
					</tr>
				</tbody>
			</table>
			<?php submit_button(); ?>
		</form>
	</div>
	<p><em>&copy; H&eacute;ctor Rinc&oacute;n 2017 </em></p>
</div>

<?php endif; ?>
