<template>
	<v-container pt-3>
		<app-input-text
			textarea
			label="Observaciones"
			model="comments"
			:text="comments"
			@input="$emit('set-comments', $event)"
		/>
	</v-container>
</template>

<script>
function data() {
	return {
		comments: this.data,
	};
}

export default {
	name: 'app-coments',
	data,
	props: {
		data: {
			type: String,
			default: '',
			required: false,
		},
		newComments: {
			type: Boolean,
			required: false,
		},
	},
};
</script>

