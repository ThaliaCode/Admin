<template>
	<div>
		<login-japi v-if="$isJapiSale"></login-japi>
		<login-mibodega v-else></login-mibodega>
	</div>
</template>

<script>
import loginMibodega from '@/components/login/login-mibodega';
import loginJapi from '@/components/login/login-japi';

export default {
	name: 'login',
	components: {
		loginMibodega,
		loginJapi,
	},
};
</script>
