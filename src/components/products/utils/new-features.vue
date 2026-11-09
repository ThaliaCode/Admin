<template>
	<div class="new-features">
		<div class="new-features-main">
			<section>
				<div class="new-features-name">
					<v-text-field
						required
						class="japi-input-text"
						name="new-features-name"
						label="Nombre de característica"
						v-model="name"
					></v-text-field>
				</div>
			</section>
			<section>
				<div class="new-features-content">
					<p>Identificadores</p>
					<v-data-table
						class="table-style"
						:headers="headers"
						:items="featuresValues"
						hide-actions
					>
						<template slot="items" slot-scope="props">
							<td class="text-xs-center">
								<v-text-field
									required
									class="japi-input-text"
									label="Nombre"
									v-model="props.item.name"
								></v-text-field>
							</td>
							<td class="text-xs-center">
								<v-text-field
									required
									class="japi-input-text"
									label="Código"
									v-model="props.item.id"
								></v-text-field>
								<span
									class="text-not-code-blank"
									v-if="checkBlankCode(props.item.id)">
									No se permite espacios en blanco
								</span>
						</td>
							<td>
								<v-icon
									class="trash-feature"
									color="error"
									@click="deleteValues(props.index)"
								>
									delete
								</v-icon>
							</td>
						</template>
					</v-data-table>
					<div class="new-features-add-btn">
						<v-btn color="primary"
							@click="addFeatureValue">Agregar
							<v-icon dark right>add</v-icon>
						</v-btn>
					</div>
				</div>
			</section>
		</div>
		<section class="feature-footer">
			<modal-sidebar-button
				:is-loading="!name"
				@cancel-button-clicked="closeModal"
				@accept-button-clicked="registerFeatures"
			/>
		</section>
	</div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import modalSidebarButton from './../../shared/utils/modal-sidebar-button';

function clearInfo() {
	this.name = '';
	this.featuresValues = [
		{ name: '', id: '' },
	];
}

function closeModal() {
	this.clearInfo();
	this.$emit('cancel-modal', false);
}

function deleteValues(index) {
	this.featuresValues.splice(index, 1);
}

async function registerFeatures() {
	if (this.$v.$invalid) {
		this.showNotification('Todos los campos son requeridos.', 'error');
	} else {
		const body = {
			name: this.name,
			features: this.featuresValues,
		};
		try {
			await this.$httpProducts.post('features', body);
			this.clearInfo();
			this.closeModal();
		} catch (e) {
			this.showNotification('Se produjo un error inesperado. Recargue la página', 'error');
		}
	}
}

function addFeatureValue() {
	const newValue = {
		name: '',
		id: '',
	};
	this.featuresValues.push(newValue);
}

function data() {
	return {
		name: '',
		headers: [
			{ text: 'Valor', sortable: false, align: 'center' },
			{ text: 'Código', sortable: false, align: 'center' },
			{ text: '', sortable: false, align: 'center' },
		],
		featuresValues: [
			{ name: '', id: '' },
		],
	};
}

function validations() {
	return {
		name: {
			type: required,
		},
	};
}

export default {
	name: 'new-features',
	components: {
		modalSidebarButton,
	},
	data,
	methods: {
		addFeatureValue,
		registerFeatures,
		closeModal,
		deleteValues,
		clearInfo,
	},
	validations,
};
</script>

<style lang="scss" scoped>
.new-features-main {
	padding: 20px;

	.new-features-name {
		padding-bottom: 20px;
	}

	.new-features-content {
		label {
			@include txt-config (open-bold, medium18);
		}
	}

	.new-features-table {
		margin: 15px 0 30px;
	}

	.new-features-add-btn {
		@include flex-center;
		margin-top: 30px;
		width: 100%;
	}
	
	.trash-feature {
		cursor: pointer;
	}
}

.feature-footer {
	background-color: white;
	bottom: 0;
	position: absolute;
	width: 100%,
}
</style>

