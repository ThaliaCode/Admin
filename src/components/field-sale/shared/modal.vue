<template>
	<v-dialog
		v-bind="$attrs"
		:value="dialog"
		class="modal-round"
	>
		<v-layout wrap align-center :class="error ? 'error' : 'primary'">
			<v-flex xs10 py-2 pl-4 text-xs-left caption white--text>
				<span class="modal-title">{{ title }}</span>
			</v-flex>
			<v-flex xs2 py-2 text-xs-right>
				<!-- <v-btn
					depressed
					flat
					icon
					class="btn-auto white--text caption my-0 mr-4"
					@click="$emit('close-modal')"
				>
					<img src="/static/img/close.svg" alt="" height="7">
				</v-btn> -->
				<v-btn
					flat
					icon
					class="btn-close white--text"
					@click="$emit('close-modal')"
				>
					<v-icon>close</v-icon>
				</v-btn>
			</v-flex>
		</v-layout>
		<v-layout wrap>
			<v-flex xs12 px-4 py-3 white>
				<slot></slot>
			</v-flex>
		</v-layout>
	</v-dialog>
</template>

<script>
	export default {
		name: 'modal',
		inheritAttrs: false,
		props: {
			dialog: {
				default: false,
				type: Boolean,
			},
			error: {
				default: false,
				type: Boolean,
			},
			title: String,
		},
	};
</script>

<style lang="scss" scoped>
	.modal-round {
		border-radius: 6px;
	}

	.modal-title {
		font-family: font(open-bold);
		font-size: 0.8rem;
	}
</style>