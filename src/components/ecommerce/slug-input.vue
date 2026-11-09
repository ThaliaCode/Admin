<template>
	<div class="slug-input-container">
		<label class="caption-gray" :class="{ 'c-error': validation }">{{
			inputLabel
		}}</label>
		<app-input-text
			:append-icon="validated ? 'check' : 'close'"
			class="slug-input"
			model="slug"
			:text="slug"
			:class="{ 'border-error': validation }"
			@input="$emit('on-input', $event.value)"
		></app-input-text>
		<div class="slug-loading" v-if="loading">
			<v-progress-circular size="22" indeterminate color="white"></v-progress-circular>
		</div>
		<span
			v-if="slug"
			class="form-group__message"
			:class="validated ? 'success--text' : 'error--text'"
		>
			{{ validateMessage }}
		</span>
	</div>
</template>

<script>
function validateMessage() {
	const messageInvalid =
		this.inputLabel === 'Slug'
			? `El ${this.inputLabel.toLowerCase()} ya está siendo usado o contiene caracteres inválidos (Solo letras y guiones)`
			: `El ${this.inputLabel.toLowerCase()} ya está siendo usado.`;
	return this.validated ? `${this.inputLabel} válido` : messageInvalid;
}

export default {
	name: 'slug-input',
	computed: {
		validateMessage,
	},
	props: {
		inputLabel: {
			default: 'Slug',
			type: String,
		},
		loading: {
			default: false,
			type: Boolean,
		},
		slug: [String, Number],
		validated: {
			default: false,
			type: Boolean,
		},
		validation: {
			default: false,
			type: true,
		},
	},
};
</script>

<style lang="scss" scoped>
.slug-input-container {
	position: relative;
}

.slug-loading {
	background-color: color(blue-card);
	border-radius: 2px;
	height: 30px;
	line-height: 42px;
	position: absolute;
	right: 0px;
	text-align: center;
	top: 24px;
	width: 30px;
}

.border-error {
	border: 0.5px solid color(error);
}

.caption-gray {
	color: color(brown-grey);
	font-size: 12px;

	&.c-error {
		color: color(error);
	}
}
</style>
