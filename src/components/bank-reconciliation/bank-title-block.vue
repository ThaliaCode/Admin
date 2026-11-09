<template>
	<div class="primary white--text py-0 text-xs-center body-2">
		{{ title }}
	</div>
</template>

<script>
	export default {
		name: 'bank-title-block',
		props: {
			title: String,
		},
	};
</script>
