<template>
	<div class="collapse">
		<div class="collapse-header">
			<v-checkbox
				class="chk-all"
				hideDetails
				dark
				color="white"
				v-bind:label="title"
				v-model="isActive"
				v-on:change="selectAll(index)"
			>
			</v-checkbox>
			<div 
				class="collapse-header-btn"
				v-on:click="collapse"
			>
			<app-tooltip-button
			icon="keyboard_arrow_down"
			color="white"
			@click-icon="collapse"
		/>
			</div>
		</div>
		<div 
			class="collapse-content"
			v-bind:class="{ 'hide-content': hideContent }">
			<slot></slot>
		</div>
	</div>
</template>

<script>

function selectAll(index) {
	this.$emit('select-all-features', index, this.isActive);
}
function collapse() {
	this.rotateArrow = !this.rotateArrow;
	this.hideContent = !this.hideContent;
}
function data() {
	return {
		isActive: false,
		rotateArrow: false,
		hideContent: false,
	};
}
export default {
	name: 'collapse',
	data,
	methods: {
		collapse,
		selectAll,
	},
	props: {
		title: {
			type: String,
			required: false,
		},
		index: {
			type: Number,
			required: false,
		},
	},
};
</script>

<style lang="scss" scoped>
.collapse {
	height: 100%;
	.collapse-header {
		@include flex-around;
		background-color: map-get($colors, primary);
		height: 30px;
		padding-left: 15px;
		.chk-all[data-fontsize='16'] {
			font-size: 16px !important;
		}
		.collapse-header-btn {
			border-left: 1px solid white;
			cursor: pointer;
			height: 30px;
			width: 30px;
			// transform: rotateZ(180deg);
			transition-duration: 2s;
			transition-property: rotateZ;
			transition-timing-function: cubic-bezier(0.165, 0.84, 0.44, 1);
		}
		.rotate-arrow {
			transform: rotateZ(180deg);
		}
	}
	.collapse-content {
		max-height: 84%;
		overflow: auto;
		padding-left: 15px;
		transition-duration: 200ms;
		transition-property: height;
		transition-timing-function: cubic-bezier(0.075, 0.82, 0.165, 1);
	}
	.hide-content {
		height: 0px;
		display: none;
	}

}
</style>
