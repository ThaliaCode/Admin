<!-- IFRAME DEL POS PARA Nuevo listado de zonas-->
<template>
	<div class="" style="height: 90vh">
		<iframe
			:src="URL_IFRAME"
			width="100%"
			height="100%"
			style="border: none"
			title="Carga Masiva de Productos - Nuevo"
			loading="lazy"
		>
		</iframe>
	</div>
</template>

<script>
import helper from '@/shared/helper';

export default {
	name: 'bulk-product-upload',
	data() {
		const user = helper.getLocalUser();
		const serialized = encodeURIComponent(JSON.stringify(user));
		const URL_BULK_PRODUCT_UPLOAD = process.env.URL_BULK_PRODUCT_UPLOAD;
		return {
			URL_IFRAME: `${URL_BULK_PRODUCT_UPLOAD}?user=${serialized}`,
		};
	},
};
</script>
