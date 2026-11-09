<template>
	<section class="footer-modal" :style="{ height: height }">
		<div class="footer-container">
			<v-btn
				v-if="!hidden"
				type="button"
				@click="cancelModal"
				:color="cancelColor"
				:disabled="onRunService"
				class="btn-action btn-auto mr-1 py-1"
				:class="paddingCancel"
				:outline="outlineBtn"
			>
				{{ cancelText }}
				<v-icon color="white" v-if="img" class="ml-1">highlight_off</v-icon>
			</v-btn>
			<slot></slot>
			<transition name="fade" mode="out-in">
				<v-btn
					v-if="!hiddenSaveBtn"
					:type="buttonType"
					:color="successColor"
					@click="setInfo"
					class="btn-action btn-auto ml-1 py-1"
					:class="`${big ? 'big' : null}, ${paddingSuccess}`"
					:disabled="isLoading || onRunService"
					:outline="outlineBtn && hidden"
				>
					{{ successText }}
					<v-icon color="white" v-if="img">check_circle_outline</v-icon>
				</v-btn>
			</transition>
			<slot name="btn-end"></slot>
		</div>
	</section>
</template>

<script>
function cancelModal() {
	this.$emit('cancel-button-clicked');
}

function setInfo() {
	if (this.buttonType === 'button') {
		this.$emit('accept-button-clicked');
	}
}

export default {
	name: 'modal-sidebar-button',
	methods: {
		cancelModal,
		setInfo,
	},
	props: {
		buttonType: {
			default: 'button',
			type: String,
		},
		cancelColor: {
			default: 'pink',
			type: String,
		},
		cancelText: {
			default: 'Cancelar',
			type: String,
		},
		isLoading: {
			default: false,
			type: Boolean,
		},
		hidden: {
			type: Boolean,
			default: false,
		},
		hiddenSaveBtn: {
			type: Boolean,
			default: false,
		},
		img: {
			default: true,
			type: Boolean,
		},
		onRunService: {
			default: false,
			type: Boolean,
		},
		outlineBtn: {
			default: false,
			type: Boolean,
		},
		paddingCancel: {
			default: 'px-4',
			type: String,
		},
		paddingSuccess: {
			default: 'px-4',
			type: String,
		},
		successColor: {
			default: 'primary',
			type: String,
		},
		successImg: {
			default: 'icon-apply.svg',
			type: String,
		},
		successText: {
			default: 'Aceptar',
			type: String,
		},
		big: {
			default: false,
			type: Boolean,
		},
		height: {
			default: '90px',
			type: String,
		},
	},
};
</script>

<style lang="scss" scoped>
.footer-modal {
	border-top: 1px solid rgb(220, 220, 220);
	// height: 9vh;
	width: 100%;

	.footer-container {
		@include flex-center;
		height: 100%;

		.btn {
			border-radius: 5px;
			color: white;
			height: 30px;
			width: 97px;
		}

		.cancel {
			background-color: color(error);
		}

		.send {
			background-color: color(success);
		}
	}
}

.big {
	padding: 0 10px;
	width: auto !important;
}
</style>
