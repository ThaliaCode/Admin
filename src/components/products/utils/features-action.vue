<template>
	<div>
		<v-layout row wrap px-3 pa-3 align-center>
			<v-flex xs12 mb-3>
				<app-select
					:item="model.subsidiaryId"
					:items="subsidiaries"
					item-text="sucursalName"
					item-value="id"
					label="Sucursal"
					model="subsidiaryId"
					:return-object="false"
					@input="setData"
				></app-select>
			</v-flex>
			<v-flex xs12 mb-3>
				<v-text-field
					class="filter-select shadow-inset"
					label="Nombre"
					single-line
					v-model="model.name"
				></v-text-field>
			</v-flex>
			<v-flex xs6 pr-2 pb-4>
				<v-text-field
					class="filter-select shadow-inset"
					label="Nombre del identificador"
					single-line
					v-model="identifier.name"
				></v-text-field>
			</v-flex>
			<v-flex xs5>
				<v-text-field
					class="filter-select shadow-inset"
					label="Código identificador"
					single-line
					v-model="identifier.id"
					@keyup.enter="addIdentifier"
				></v-text-field>
				<span class="text-small">Máximo 3 caracteres</span>
				<span
					class="text-small"
					v-if="checkBlankCode(identifier.id)">
					No se permite espacios en blanco
				</span>
			</v-flex>
			<v-flex xs1 pl-2 pb-4>
				<v-btn
					color="primary"
					class="btn-action width-auto white--text"
					:disabled="$v.identifier.$invalid || $v.model.name.$invalid || checkBlankCode(identifier.id)"
					@click="addIdentifier">
					<v-icon>add</v-icon>
				</v-btn>
			</v-flex>
		</v-layout>
		<app-table
			name="features-action"
			:filter-columns="false"
			:input-search="false"
			:columns="columns"
			:rows="model.features"
			:key-value="keyValue"
			:main-list="false"
			local-storage
			class="is-not-selectable no-main-list mb-5">
			<template slot="rows" slot-scope="props">
				<td class="is-not-selectable">
					<v-text-field
						class="filter-select shadow-inset"
						v-model="props.row.name"
						@input="validFeatures($event, 'name', props.index)"
					></v-text-field>
				</td>
				<td>
					<v-text-field
						class="filter-select shadow-inset"
						v-model="props.row.id"
						@input="validFeatures($event, 'id', props.index)"
					></v-text-field>
				</td>
				<td>
					<v-btn
						icon
						class="table-icon red--text"
						@click="deleteFeature(props.row)">
						<v-icon>cancel</v-icon>
					</v-btn>
				</td>
			</template>
		</app-table>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="featuresEmpty || isLoading"
				@accept-button-clicked="callToAction"
				@cancel-button-clicked="cancelToAction"
			/>
		</section>
	</div>
</template>

<script>
	import { minValue, required } from 'vuelidate/lib/validators';
	import AppTable from './../../shared/table/app-table';
	import ModalSidebarButton from './../../shared/utils/modal-sidebar-button';

	function created() {
		this.loadSubsidiaries();
		this.model.name = this.feature.name || '';
		this.model.features = this.feature.features ? this.feature.features.map(f => ({ ...f }))
			|| [] : [];
	}

	function addIdentifier() {
		const invalid = this.model.features.some(mf =>
			mf.id.toLowerCase() === this.identifier.id.toLowerCase() ||
			mf.name.toLowerCase() === this.identifier.name.toLowerCase());
		if (this.identifier.id.length > 3) {
			this.showGenericError('El código debe tener máximo 3 caracteres.');
		}	else if (!invalid) {
			if (this.identifier.name && this.identifier.id) {
				this.model.features.push(this.identifier);
				this.identifier = {
					name: '',
					id: '',
				};
			} else {
				this.showGenericError('El nombre y el código son requeridos para crear el identificador.');
			}
		} else {
			this.showGenericError('Ya existe un identificador con este código o nombre.');
		}
	}

	function callToAction() {
		this.model.features = this.model.features.map((feat) => {
			const newFeat = { ...feat };
			newFeat.detail = {
				id: feat.id,
				name: feat.name,
				subsidiaryId: feat.subsidiaryId,
			};
			return newFeat.detail;
		});
		this.$emit('call-to-action', this.model);
	}

	function cancelToAction() {
		this.$emit('cancel-to-action');
	}

	function deleteFeature({ id }) {
		const index = this.model.features.findIndex(f => f.id === id);
		if (index > -1) {
			this.model.features.splice(index, 1);
		}
	}

	function featuresEmpty() {
		const featuresInvalid = this.model.features.some(f => !f.name || !f.id);
		return this.model.features.length === 0 || featuresInvalid || this.invalidFeatures;
	}

	async function loadSubsidiaries() {
		({ data: this.subsidiaries } = await this.subsidiariesList());
		if (this.subsidiaries.length === 1) {
			this.model.subsidiaryId = this.subsidiaries[0].id;
		}
	}

	function setData({ model, value }) {
		this.model[model] = value;
	}

	function validFeatures() {
		const names = this.model.features.map(mf => mf.name.toLowerCase());
		const ids = this.model.features.map(mf => mf.id.toLowerCase());
		const invalidName = [...new Set(names)].length < names.length;
		const invalidId = [...new Set(ids)].length < ids.length;
		this.invalidFeatures = invalidName || invalidId;
		if (this.invalidFeatures) {
			this.showGenericError('Existen códigos o nombres repetidos; es necesario editarlos para poder continuar.');
		}
	}

	function validations() {
		return {
			identifier: {
				id: {
					required,
				},
				name: {
					required,
				},
			},
			model: {
				name: {
					required,
				},
				subsidiaryId: {
					minValue: minValue(1),
					required,
				},
			},
		};
	}

	function data() {
		return {
			columns: [
				{ id: 1, name: 'Nombre', visible: true },
				{ id: 2, name: 'Código', visible: true },
				{ id: 3, name: 'Acciones', visible: true },
			],
			identifier: {
				name: '',
				id: '',
			},
			invalidFeatures: false,
			keyValue: 'index',
			model: {
				features: [],
				name: '',
				subsidiaryId: null,
			},
			subsidiaries: [],
		};
	}

	export default {
		name: 'features-action',
		components: {
			AppTable,
			ModalSidebarButton,
		},
		computed: {
			featuresEmpty,
		},
		created,
		data,
		methods: {
			addIdentifier,
			callToAction,
			cancelToAction,
			deleteFeature,
			loadSubsidiaries,
			setData,
			validFeatures,
		},
		props: {
			code: {
				default: '',
				type: String,
			},
			feature: {
				default: () => {},
				type: Object,
			},
			isLoading: {
				default: false,
				type: Boolean,
			},
		},
		validations,
	};
</script>

<style lang="scss" scoped>
	.width-auto {
		min-width: auto;
		width: 100% !important;
	}

	.text-small {
		font-size: 11px;
	}
</style>