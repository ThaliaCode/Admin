<template>
	<v-layout
		wrap
		align-center
		class="heading-card"
		pa-3
		:style="`background-color: ${background}; color: ${color}`"
	>
		<v-flex xs12 d-flex align-center>
			<span v-if="icon" class="img-entity">
				<img
					:src="icon"
					alt=""
					:height="salePoint ? 33 : 25"
					:width="salePoint ? 33 : 25"
				/>
			</span>
			<span
				class="pl-2 text-xs-left sale-point-main-title"
				:class="{
					'sale-point-title': salePoint,
					'sale-point-title-without-icon': salePoint, 
				}"
			>
				{{ title }}
			</span>
			<span class="img-entity" v-if="showBtnOff">
				<img
					:src="btnOff ? onLine : offLine"
					alt=""
					:height="salePoint ? 33 : 25"
					:width="salePoint ? 33 : 25"
				/>
			</span>
		</v-flex>
		<v-flex xs12 mt-2 px-4>
			<slot></slot>
		</v-flex>
	</v-layout>
</template>

<script>

	function data() {
		return {
			onLine: '/static/icon/on-line.svg',
			offLine: '/static/icon/off-line.svg',
		};
	}

	export default {
		name: 'heading-card',
		data,
		props: {
			background: {
				default: '#4a90e2',
				type: String,
			},
			btnOff: {
				default: false,
				type: Boolean,
			},
			color: {
				default: '#ffffff',
				type: String,
			},
			icon: String,
			salePoint: {
				default: false,
				type: Boolean,
			},
			showBtnOff: {
				default: false,
				type: Boolean,
			},
			title: String,
		},
	};
</script>

<style lang="scss" scoped>
	.heading-card {
		border-top-left-radius: 8px;
		border-top-right-radius: 8px;
		font-family: font(open-bold);
		font-size: size(medium15);
		position: relative;
		white-space: nowrap;
	}

	.img-entity {
		border-radius: 100%;
		height: auto;
		max-width: 33px;
		overflow: hidden;
		width: auto;
	}

	.sale-point-title {
		max-width: 45%;
	}

	.sale-point-title-without-icon {
		max-width: 70%;
	}

	.btn-off {
		position: absolute;
		right: 5px;
		top: 5px;
	}

	.sale-point-main-title {
		overflow: hidden;
		text-overflow: ellipsis;
		width: 180px;
	}
</style>