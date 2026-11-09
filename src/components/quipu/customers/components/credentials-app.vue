<template>
	<v-container>
		<v-layout row wrap mb-5>
			<v-flex xs12>
				<v-subheader>Tipo de registro:</v-subheader>
				<v-chip
				color="primary"
				class="item-credential-item"
				v-for="(register, indexRegister) in registers"
				:key="indexRegister"
				close>{{register}}</v-chip>
			</v-flex>
		</v-layout>
		<v-layout row wrap>
			<v-flex xs12 mb-3>
				<v-text-field
					hide-details
					label="Correo"
					class="filter-select shadow-inset"
				></v-text-field>
			</v-flex>
			<v-flex xs12 mb-3>
				<v-text-field
					hide-details
					label="Usuario"
					class="filter-select shadow-inset"
				></v-text-field>
			</v-flex>
			<v-flex xs12>
				<v-text-field
					hide-details
					label="Contraseña"
					class="filter-select shadow-inset"
				></v-text-field>
			</v-flex>
		</v-layout>
	</v-container>
</template>

<script>
export default {
	name: 'credentials-app',
	props: {
		registers: {
			type: Array,
			default: () => [
				'Compras',
				'Retenciones',
				'Percepciones',
			],
		},
	},
};
</script>

<style lang="scss" scoped>
.item-credential-item {
	color: color(white) !important;
}
</style>

