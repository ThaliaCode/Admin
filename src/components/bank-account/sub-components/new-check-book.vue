<template>
	<div>
		<v-container>
			<v-layout row wrap align-center justify-space-between mt-3>
				<v-flex xs5 mb-3>
					<label class="caption">Secuencia inicio</label>
					<v-text-field
						hide-details
						placeholder="Secuencia inicio"
						class="filter-select"
						v-model="checkBook.numberStart"
					></v-text-field>
				</v-flex>
				<v-flex xs5 mb-3>
					<label class="caption">Secuencia fin</label>
					<v-text-field
						hide-details
						placeholder="Secuencia fin"
						class="filter-select"
						v-model="checkBook.numberEnd"
					></v-text-field>
				</v-flex>
				<v-flex xs12>
					<label class="caption">Descripción</label>
					<v-text-field
						hide-details
						textarea
						placeholder="Descripción"
						class="filter-select"
						v-model="checkBook.description"
					></v-text-field>
				</v-flex>
			</v-layout>
		</v-container>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="$v.$invalid"
				success-text="Aceptar"
				@cancel-button-clicked="closeModal"
				@accept-button-clicked="save"
			/>
		</section>
	</div>
</template>
<script>
import { required } from 'vuelidate/lib/validators';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function closeModal() {
	this.$emit('close-modal');
}

function currentCheckBookHandler(newVal) {
	this.checkBook = newVal;
}

function buildBody() {
	return {
		serieStart: this.checkBook.serieStart,
		serieEnd: this.checkBook.serieEnd,
		numberStart: this.checkBook.numberStart || 0,
		numberEnd: this.checkBook.numberEnd || 0,
		description: this.checkBook.description,
		bankAccountId: this.$route.params.bankAccountId,
	};
}

async function save() {
	const id = this.checkBook.id;
	const url = id ? `check-series/${id}` : 'check-series';
	const method = id ? 'patch' : 'post';
	const msg = id ? 'actualizada' : 'creada';
	const body = this.buildBody();
	await this.$httpSales[method](url, body);
	this.showNotification(`Chequera ${msg} exitosamente`);
	this.closeModal();
}

function validations() {
	return {
		checkBook: {
			description: { required },
			numberEnd: { required },
			numberStart: { required },
		},
	};
}

function data() {
	return {
		checkBook: {
			description: '',
			numberEnd: '',
			numberStart: '',
			serieStart: '',
			serieEnd: '',
		},
	};
}

export default {
	name: 'new-check-book',
	components: {
		modalSidebarButton,
	},
	data,
	methods: {
		buildBody,
		closeModal,
		currentCheckBookHandler,
		save,
	},
	props: {
		currentCheckBook: {
			default: () => {},
			type: Object,
		},
	},
	validations,
	watch: {
		currentCheckBook: {
			deep: true,
			handler: currentCheckBookHandler,
		},
	},
};
</script>
