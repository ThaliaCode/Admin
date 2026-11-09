<!-- IFRAME DEL POS PARA Nuevo listado de zonas-->
<template>
	<div class="" style="height: 90vh">
		<iframe
			:src="URL_IFRAME"
			width="100%"
			height="100%"
			style="border: none"
			title="Zonas"
			loading="lazy"
		>
		</iframe>
	</div>
</template>

<script>
import helper from '@/shared/helper';

export default {
	name: 'distributors-tracking',
	data() {
		const user = helper.getLocalUser();
		const serialized = encodeURIComponent(JSON.stringify(user));

		return {
			URL_IFRAME: `${process.env.URL_POS}frame/zonas?user=${serialized}`,
		};
	},
};
</script>
