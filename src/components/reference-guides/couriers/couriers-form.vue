<template>
	<div>
		<v-layout wrap px-4 pt-3>
			<v-flex xs12>
				<app-input-text
					label="Nombre"
					model="name"
					:text="courier.name"
					@input="setData"
				/>
				<span class="form-group__message"
					v-if="$v.courier.name.$invalid">
					El nombre es requerido
				</span>
			</v-flex>
			<v-flex xs12 md6 pr-2>
				<app-select
					:item="courier.typePersonId"
					item-text="name"
					item-value="id"
					:items="personTypes"
					label="T. de Documento"
					model="typePersonId"
					:return-object="false"
					@input="setData"
				/>
				<span class="form-group__message"
					v-if="$v.courier.typePersonId.$invalid">
					El tipo de documento es requerido
				</span>
			</v-flex>
			<v-flex xs12 md6 pl-2>
				<app-input-text
					label="Documento"
					type="number"
					model="documentNumber"
					:text="courier.documentNumber"
					@input="setData"
				/>
				<span v-if="$v.courier.documentNumber.$invalid">
					<span class="form-group__message"
						v-if="!$v.courier.documentNumber.required">
						El documento es requerido
					</span>
					<span class="form-group__message"
						v-if="!$v.courier.documentNumber.minLength
						|| !$v.courier.documentNumber.maxLength">
						{{ documentMessage }}
					</span>
				</span>
			</v-flex>
			<v-flex xs12 md6 pr-2>
				<app-input-text
					label="Teléfono"
					type="number"
					model="phone"
					:text="courier.phone"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs12 md6 pl-2>
				<app-input-text
					label="Licencia"
					model="license"
					:text="courier.license"
					@input="setData"
				/>
				<span v-if="$v.courier.license.$invalid">
					<span class="form-group__message"
						v-if="!$v.courier.license.required">
						La licencia es requerido
					</span>
				</span>
			</v-flex>
			<v-flex xs12>
				<app-input-text
					label="Código de Establecimiento"
					model="establishmentCode"
					:text="courier.establishmentCode"
					@input="setData"
				/>
				<span
					class="text-not-code-blank"
					v-if="checkBlankCode(courier.establishmentCode)">
					No se permite espacios en blanco
				</span>
			</v-flex>
			<v-flex xs12 v-if="!hidePlates">
				<label class="caption">Placas</label>
				<v-select
					chips
					tags
					clearable
					single-line
					label="Placas"
					class="filter-select shadow-inset tag-select"
					v-model="courier.plates">
					<template slot="selection" slot-scope="data">
						<v-chip
							class="tag-chip"
							close
							@input="removePlate(data.item)">
							{{ data.item }}
						</v-chip>
					</template>
				</v-select>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="$v.$invalid || checkBlankCode(courier.establishmentCode)"
				@cancel-button-clicked="close"
				@accept-button-clicked="$emit('save', courier)"
			/>
		</section>
	</div>
</template>

<script>
	import { maxLength, minLength, minValue, required } from 'vuelidate/lib/validators';
	import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

	function created() {
		this.loadTypePerson();
		if (this.id) {
			this.loadData();
		}
	}

	function cleanForm() {
		this.courier = {
			documentNumber: '',
			establishmentCode: '',
			license: '',
			name: '',
			phone: '',
			plates: [],
			typePersonId: 0,
		};
	}

	function close() {
		this.cleanForm();
		this.$emit('close');
	}

	async function loadData() {
		try {
			const { data: response } = await this.$httpSales.get(`courier/${this.id}`);
			this.courier = {
				documentNumber: response.documentNumber,
				establishmentCode: response.establishmentCode,
				license: response.license,
				name: response.name,
				phone: response.phone,
				plates: response.plates || [],
				typePersonId: response.typePersonId || 0,
			};
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		}
	}

	function removePlate(item) {
		const index = this.courier.plates.findIndex(plate => plate === item);
		if (index > -1) {
			this.courier.plates.splice(index, 1);
		}
	}

	function setData({ model, value }) {
		this.courier[model] = value;
		if (model === 'typePersonId') {
			this.personType = this.personTypes.find(person => person.id === value) || {};
		}
	}

	function validations() {
		const documentValidate = { required };
		if (this.personValidations) {
			if (this.personValidations.maxLength) {
				documentValidate.maxLength = maxLength(this.maxDocument);
			}
			if (this.personValidations.minLength) {
				documentValidate.minLength = minLength(this.minDocument);
			}
		}
		return {
			courier: {
				name: {
					required,
				},
				documentNumber: documentValidate,
				typePersonId: {
					minValue: minValue(1),
					required,
				},
				license: {
					required,
				},
			},
		};
	}

	function data() {
		return {
			courier: {
				documentNumber: '',
				establishmentCode: '',
				license: '',
				name: '',
				phone: '',
				plates: [],
				typePersonId: 0,
			},
		};
	}

	export default {
		name: 'couriers-form',
		components: {
			modalSidebarButton,
		},
		created,
		data,
		methods: {
			cleanForm,
			close,
			loadData,
			removePlate,
			setData,
		},
		props: {
			id: [Number, String],
			hidePlates: {
				type: Boolean,
				default: false,
			},
		},
		validations,
	};
</script>

<style lang="scss" scoped>
	.tag-chip {
		background: map-get($colors, tagBackground);
		border: 1px solid map-get($colors, tagBorder);
		border-radius: 4px;
		color: map-get($colors, tagBorder);
	}

	.tag-select {
		height: auto !important;
		min-height: 30px;
	}
</style>
