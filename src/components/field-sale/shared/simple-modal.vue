<template>
	<v-dialog persistent max-width="550" v-model="open">
		<v-card class="modal">
			<v-card-title class="pa-0 ma-0 py-2 justify-end">
				<div
					class="flex w-100 justify-end"
					style="height: 2.5rem; position: relative; display: flex"
				>
					<v-btn flat icon class="btn-close" @click="$emit('close')">
						<v-icon>close</v-icon>
					</v-btn>
				</div>
			</v-card-title>
			<v-card-text class="card-head">
				<div class="title px-1">
					<slot name="title"></slot>
				</div>
			</v-card-text>

			<v-card-text class="card-body my-3 pb-2">
				<div class="subtitle">
					<slot name="subtitle"></slot>
				</div>
				<div class="message">
					<slot name="message"></slot>
				</div>
				<div class="body">
					<slot name="body"></slot>
				</div>
			</v-card-text>

			<v-card-actions class="justify-center px-2" v-if="enableActions">
				<v-btn class="btn-option pink" @click="$emit('cancel')">{{
					textCancel
				}}</v-btn>
				<v-btn class="btn-option success" @click="$emit('confirm')">{{
					textConfirm
				}}</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
export default {
	name: 'simple-modal',

	props: {
		open: {
			default: false,
			type: Boolean,
		},
		textConfirm: {
			default: 'Aceptar',
			type: String,
		},
		textCancel: {
			default: 'Cancelar',
			type: String,
		},
		enableActions: {
			default: true,
			type: Boolean,
		},
	},
};
</script>

<style lang="scss" scoped>
.modal {
	padding: 0 2.3rem 2rem;
	border-radius: 8px;
}

.container--btn-close {
	position: absolute;
	// border: 1px solid red;
	display: flex;
	// width: 100%;
}
.btn-close {
	// border: 1px solid red;
	position: absolute;
	right: -1.5rem;
	top: 5px;
}

.card-head {
	padding: 0;
}

.text-small {
	font-size: 11px;
}

.title {
	font-weight: bold;
	font-size: 1.2rem;
	text-align: center;
}

.subtitle {
	font-weight: bold;
	font-size: 1rem;
	text-align: center;
	margin-bottom: 14px;
}
.message {
	text-align: center;
	font-size: 1rem;
}
.body {
	font-size: 0.8rem;
	display: block;
	padding: 0;
}
.warning_text {
	color: red;
}

.footer-dialog {
	background-color: white;
	padding: 16px 0 !important;
}

.modal-active {
	cursor: pointer;
	text-decoration: underline;
}

.btn-option {
	color: white;
	border-radius: 5px;
	font-weight: 600;
	padding: 4px 1.2rem;
	margin: 0 0.5rem;
	width: 200px;
	text-transform: capitalize;
}
</style>
