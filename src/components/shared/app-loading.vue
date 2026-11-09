<template>
	<div class="loading" v-if="showLoading">
		<div class="loading-message">
			{{ label }}
			<!-- La carga terminará en un momento y podrás ver
            toda la información del {{ label }}. -->
		</div>
	</div>
	<div class="loading-container" v-else-if="showIconLoading">
		<div class="loader"></div>
	</div>
</template>

<script>
export default {
	name: 'app-loading',
	props: {
		label: {
			type: String,
			default: '',
		},
		showLoading: {
			type: Boolean,
			default: false,
		},
		showIconLoading: {
			type: Boolean,
			default: false,
		},
	},
};
</script>

<style lang="scss" scoped>
.loading {
	background-color: rgba(0, 0, 0, 0.5);
	height: 100vh;
	left: 0px;
	position: fixed;
	top: 0px;
	width: 100%;
	z-index: 10;

	&-message {
		background-color: color(white);
		border: 2px solid color(primary);
		border-radius: 6px;
		bottom: 0px;
		font-family: font(open-semibold);
		height: fit-content;
		height: -moz-fit-content;
		left: 0px;
		margin: auto;
		max-width: 520px;
		padding: 15px 20px;
		position: absolute;
		right: 0px;
		text-align: center;
		top: 0px;
		width: fit-content;
		width: -moz-fit-content;
	}
}

.loading-container {
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: rgba(0, 0, 0, 0.319);
	z-index: 9999;
}

.loader {
	border: 10px solid #f3f3f3;
	border-top: 10px solid #3498db;
	border-radius: 50%;
	width: 50px;
	height: 50px;
	animation: spin 1s linear infinite;
}

@keyframes spin {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}
</style>
