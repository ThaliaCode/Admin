<template>
	<div>
		<v-layout class="device-title">
			<v-flex xs11 d-flex align-center>
				<span>{{terminal.name}}</span>
			</v-flex>
			<v-flex 
				xs1 
				d-flex 
				align-center
				px-1
				class="border-btn">
				<button @click="$emit('close')">
					<v-icon color="white">clear</v-icon>
				</button>
			</v-flex>
		</v-layout>
		<div class="py-3 px-2 back-white">
			<v-layout row wrap class="device-columns">
				<v-flex xs4 class="center">Tipo Doc.</v-flex>
				<v-flex xs4 class="center">Serie</v-flex>
				<v-flex xs4 class="center">Numero</v-flex>
			</v-layout>
			<v-layout 
				row
				wrap 
				class="device-rows mt-2"
				v-for="serie in terminal.series"
				:key="serie.id">
				<v-flex xs4 pl-3 class="name-brand">{{serie.typeDocument ? serie.typeDocument.code : null}}</v-flex>
				<v-flex xs4 class="center border-right">{{serie.serie}}</v-flex>
				<v-flex xs4 class="center">{{serie.number}}</v-flex>
			</v-layout>
		</div>
	</div>
</template>
<script>
export default {
	name: 'device-details',
	props: {
		terminal: {
			type: Object,
			default: () => {},
		},
	},
};
</script>
<style lang="scss" scoped>
	.device-title {
		background: map-get($colors, expansion-panel-header);
		color: map-get($colors, white);
		font-size: map-get($sizes, medium18);
		height: 62px;
		padding: 10px;
	}

	.device-columns {
		background: map-get($colors, title-table);
		border-radius: 3px 3px 0  0;
		font-size: map-get($sizes, small10);
		padding: 3px;
	}

	.back-white {
		background: map-get($colors, white);
		border: 1px solid map-get($colors, blue-grey);
		border-radius: 0 0 19px 0;
	}

	.center {
		text-align: center;
	}

	.device-rows {
		border: 1px solid map-get($colors, stepper-content);
		border-radius: 3px;
		font-size: map-get($sizes, small11);
	}

	.name-brand {
		background: map-get($colors, stepper-content);
		color: map-get($colors, background-sidebar);
		font-family: map-get($fonts, lato-bold);
	}

	.border-btn {
		border-left: 1px solid map-get($colors, borderRowSelected);
	}

	.border-right {
		border-right: 1px solid map-get($colors, stepper-content);
	}
</style>