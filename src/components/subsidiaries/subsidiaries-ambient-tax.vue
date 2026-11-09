<template>
	<div>
		<v-chip
			v-if="ambientInfo"
			small
			label
			:color="ambientInfo.color"
			text-color="white"
			class="ma-0"
		>
			<v-icon small left>{{ ambientInfo.icon }}</v-icon>
			{{ ambientInfo.text }}
		</v-chip>
		<span v-else>-</span>
	</div>
</template>

<script>

function ambientInfo() {
	if (this.flagTaxes !== 1) {
		return {
			color: 'grey',
			icon: 'remove_circle_outline',
			text: 'Sin configurar',
		};
	}
	if (this.typeAmbientTax === 1) {
		return {
			color: 'red',
			icon: 'science',
			text: 'Prueba',
		};
	}
	if (this.typeAmbientTax === 2) {
		return {
			color: 'blue',
			icon: 'cloud_done',
			text: 'Producción',
		};
	}
	return null;
}

export default {
	name: 'subsidiaries-ambient-tax',
	computed: {
		ambientInfo,
	},
	props: {
		flagTaxes: {
			type: Number,
			default: null,
		},
		typeAmbientTax: {
			type: Number,
			default: null,
		},
	},
};
</script>
