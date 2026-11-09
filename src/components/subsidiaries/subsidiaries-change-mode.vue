<template>
	<section>
		<v-layout wrap class="pa-3">
			<v-flex xs12 mb-3>
				<label class="caption">Sucursal</label>
				<p class="change-mode-value">{{ subsidiary.sucursalName }}</p>
			</v-flex>
			<v-flex xs6 mb-3 pr-2>
				<label class="caption">Facturador actual</label>
				<div>
					<v-chip small label :color="billingChip.color" text-color="white" class="ma-0">
						{{ billingChip.text }}
					</v-chip>
				</div>
			</v-flex>
			<v-flex xs6 mb-3 pl-2>
				<label class="caption">Ambiente actual</label>
				<div>
					<v-chip small label :color="currentAmbientChip.color" text-color="white" class="ma-0">
						{{ currentAmbientChip.text }}
					</v-chip>
				</div>
			</v-flex>
			<v-flex xs12 mb-3>
				<app-select
					:item="newTypeAmbientTax"
					item-text="name"
					item-value="value"
					:items="environments"
					label="Nuevo Ambiente"
					model="newTypeAmbientTax"
					:return-object="false"
					@input="getData"
				/>
			</v-flex>
		</v-layout>
		<section class="fast-register-footer">
			<modal-sidebar-button
				:is-loading="!hasChanges"
				@cancel-button-clicked="$emit('close')"
				@accept-button-clicked="save"
			/>
		</section>
	</section>
</template>

<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function environments() {
	return [
		{ name: 'Prueba', value: 1 },
		{ name: 'Producción', value: 2 },
	];
}

function billingChip() {
	const isNewBilling = this.subsidiary.typeBillingAgreed === 'sunatFactV4';
	return {
		color: isNewBilling ? 'green' : 'orange',
		text: isNewBilling ? 'V2' : 'V1',
	};
}

function currentAmbientChip() {
	if (this.subsidiary.typeAmbientTax === 1) {
		return { color: 'red', text: 'Prueba' };
	}
	if (this.subsidiary.typeAmbientTax === 2) {
		return { color: 'blue', text: 'Producción' };
	}
	return { color: 'black', text: 'No configurado' };
}

function hasChanges() {
	return this.newTypeAmbientTax !== this.subsidiary.typeAmbientTax;
}

function getData({ value }) {
	this.newTypeAmbientTax = value;
}

function save() {
	if (!this.hasChanges) {
		return;
	}
	// El motor (typeFact) no se elige a mano: se deriva del facturador ya asignado a la sucursal
	// (V1 -> GREENTER=1, V2 -> FACTURALO=2), igual que en subsidiaries-flag-taxes.
	const typeFact = this.subsidiary.typeBillingAgreed === 'sunatFactV4' ? 2 : 1;
	this.$emit('save', {
		aclId: this.subsidiary.companyId,
		subsidiaryId: this.subsidiary.id,
		flagProduction: this.newTypeAmbientTax === 2,
		typeFact,
	});
}

export default {
	name: 'subsidiaries-change-mode',
	components: {
		modalSidebarButton,
	},
	data() {
		return {
			newTypeAmbientTax: this.subsidiary.typeAmbientTax,
		};
	},
	computed: {
		environments,
		billingChip,
		currentAmbientChip,
		hasChanges,
	},
	methods: {
		getData,
		save,
	},
	props: {
		subsidiary: {
			type: Object,
			required: true,
		},
	},
};
</script>

<style scoped>
.change-mode-value {
	font-size: 15px;
	font-weight: 600;
	margin: 0;
}
</style>
