<template>
	<div>
		<router-view :key="archiveKey"></router-view>
	</div>
</template>

<script>
export default {
	name: 'reference-guides',
	data() {
		return {
			archiveKey: 0,
		};
	},
	watch: {
		$route() {
			this.archiveKey += 1;
		},
	},
};
</script>
