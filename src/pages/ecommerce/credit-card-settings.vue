<template>
	<div class="pb-5 px-4 pt-4">
		<h3 class="mb-4">Tarjeta de crédito o débito</h3>
		<div v-for="(card, index) in cardsEdit" :key="index">
			<h4 class="mb-2">{{ card.name }}</h4>
			<v-text-field
				v-for="(field, indexF) in card.fields"
				:key="indexF"
				type="text"
				class="filter-select mb-4"
				:label="field.placeholder"
				required
				v-model="field.value">
			</v-text-field>
			<v-flex xs12 mt-3>
				<v-layout row wrap>
					<v-flex xs6>
						<v-checkbox
							color="primary"
							hide-details
							label="Mostrar en web"
							v-model="card.flagWeb"
						></v-checkbox>
					</v-flex>
					<v-flex xs6>
						<v-checkbox
							color="primary"
							hide-details
							label="Mostrar en móvil"
							v-model="card.flagMobile"
						></v-checkbox>
					</v-flex>
				</v-layout>
			</v-flex>
		</div>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				button-type="button"
				@cancel-button-clicked="$emit('close-modal')"
				@accept-button-clicked="saveConfiguration"
			/>
		</section>
	</div>
</template>
<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function created() {
	this.cardsEdit = [...this.cards];
}

function saveConfiguration() {
	const validation = [];
	this.cardsEdit.forEach((c) => {
		validation.push(c.fields.every(f => f.value));
	});
	if (validation.every(v => v)) {
		this.$emit('save', this.cardsEdit);
	} else {
		this.showNotification(
			'Debe llenar todos los campos para cada pasarela',
			'info',
		);
	}
}

function data() {
	return {
		cardsEdit: [],
	};
}
export default {
	name: 'credit-card-setting',
	data,
	created,
	components: {
		modalSidebarButton,
	},
	methods: {
		saveConfiguration,
	},
	props: {
		cards: {
			type: Array,
			required: true,
		},
	},
};
</script>
<style lang="scss" scoped>
h3 {
	border-bottom: 1px solid color(primary);
	color: color(primary);
	margin-bottom: 15px;
	padding-bottom: 5px;
}
</style>