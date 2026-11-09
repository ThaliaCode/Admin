<template>
	<div>
		<v-layout wrap px-4 mt-3>
			<v-flex xs12 mb-3>
				<h3 class="body-2">{{ name }}</h3>
			</v-flex>
			<v-flex xs12>
				<p class="body-1">{{ message }}</p>
			</v-flex>
		</v-layout>
	</div>
</template>

<script>
	export default {
		name: 'delete-confirm',
		props: {
			name: {
				type: String,
			},
			message: {
				default: '¿Desea eliminar el registro del listado?',
				type: String,
			},
		},
	};
</script>
