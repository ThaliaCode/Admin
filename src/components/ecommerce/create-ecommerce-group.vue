<template>
	<div class="create-ecommerce-group">
		<v-layout wrap px-4 py-3>
			<v-flex sm12 md12 pr-2 mb-2 class="wrapper-user">
				<v-checkbox
					color="success"
					label="¿Deseas escoger una empresa?"
					class="primary--text"
					hide-details
					v-model="showSucursal"
				></v-checkbox>
			</v-flex>
			<v-flex xs12 mb-3 v-if="showSucursal">
				<v-layout column>
					<v-flex>
						<label
							class="caption-gray">
							Seleccione una empresa
						</label>
					</v-flex>
					<v-flex>
						<v-select
							class="filter-select"
							item-text="sucursalName"
							item-value="id"
							placeholder="Empresa"
							:items="listSubsidiaries"
							v-model="model.subsidiaryId"
							return-object
							@input="selectedSubsidiary"
						></v-select>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12 md12 pr-2 mb-3 v-if="!showSucursal">
				<label
					:class="{'c-error': !$v.model.subsidiaryName.required && isLoading}" 
					class="caption-gray">
					Nombre de la Empresa (*)
				</label>
				<v-text-field
					class="filter-select"
					placeholder="Nombre de la Empresa"
					:class="{'border-error': !$v.model.subsidiaryName.required && isLoading}"
					v-model="model.subsidiaryName"
				></v-text-field>
			</v-flex>
			<v-flex xs12 md12 pr-2 mb-3>
				<label
					:class="{'c-error': !$v.model.documentNumber.required && isLoading}" 
					class="caption-gray">
					RUC de la Empresa (*)
				</label>
				<v-text-field
					v-model="model.documentNumber"
					class="filter-select"
					:disabled="showSucursal"
					:class="{'border-error': !$v.model.documentNumber.required && isLoading}"
					placeholder="RUC de la Empresa"
					type="number"
				></v-text-field>
			</v-flex>
			<template v-if="showSucursal">
				<v-flex sm12 md12 pr-2 mb-2 class="wrapper-user">
					<v-checkbox
						color="success"
						label="¿Deseas escoger un almacén?"
						class="primary--text"
						hide-details
						v-model="showWarehouse"
						@change="changeWarehouse"
						:disabled="disabledCkeck"
					></v-checkbox>
				</v-flex>
				<v-flex xs12 mb-3 v-if="showWarehouse">
					<v-layout column>
						<v-flex>
						</v-flex>
						<v-flex>
							<v-select
								class="filter-select"
								item-text="name"
								item-value="id"
								placeholder="Almacén"
								:items="listWarehouses"
								v-model="model.warehouseId"
								return-object
								:disabled="!model.subsidiaryId"
								@input="selectedWarehouse"
							></v-select>
						</v-flex>
					</v-layout>
				</v-flex>
			</template>
			<v-flex xs12 md12 pr-2 mb-3 v-if="!showWarehouse">
				<label
					:class="{'c-error': !$v.model.warehouseName.required && isLoading}" 
					class="caption-gray">
					Nombre del Almacén (*)
				</label>
				<v-text-field
					class="filter-select"
					placeholder="Nombre del Almacén"
					:class="{'border-error': !$v.model.warehouseName.required && isLoading}"
					v-model="model.warehouseName"
				></v-text-field>
				<span 
					class="text-info" 
					v-if="disabledCkeck">
					La empresa no tiene almacenes puede crear uno o cambiar de empresa
				</span>
			</v-flex>
			<v-flex xs12 md12 pr-2 mb-2 v-if="false">
				<label class="caption-gray">Dirección de la Empresa</label>
				<v-text-field
					class="filter-select"
					placeholder="Dirección de la Empresa"
					v-model="model.address"
				></v-text-field>
			</v-flex>
			<v-flex xs12 md12 pr-2 mb-2>
				<label
					:class="{'c-error': !$v.model.commerceName.required && isLoading}"
					class="caption-gray">
					Nombre del Comercio (*)
				</label>
				<v-text-field
				class="filter-select"
				placeholder="Nombre del Comercio"
				:class="{'border-error': !$v.model.commerceName.required && isLoading}"
				v-model="model.commerceName"
				></v-text-field>
			</v-flex>
			<v-flex xs12 md12 pr-2 mb-2>
				<slug-input
					input-label="Slug del Comercio (*)"
					:validation="!$v.model.slug.required && isLoading"
					:loading="slugLoading"
					:slug="model.slug"
					:validated="slugValidated"
					@on-input="setSlug"
				></slug-input>
			</v-flex>
			<v-flex xs12 md12 mb-2>
				<label
					:class="{'c-error': !$v.model.itemId.required && isLoading}" 
					class="caption-gray">
					Rubro del Comercio (*)
				</label>
				<v-select
					class="filter-select"
					:class="{'border-error': !$v.model.itemId.required && isLoading}"
					placeholder="Rubro del Comercio" 
					item-text="name"
					item-value="id"
					v-model="model.itemId"
					:items="items"
				></v-select>
			</v-flex>
			<v-flex xs12 md12 mb-2 v-if="showSucursal">
				<label
					class="caption-gray">
					Lista de Precio
				</label>
				<v-select
					class="filter-select"
					placeholder="Lista de Precio" 
					item-text="name"
					item-value="id"
					v-model="model.priceListId"
					:items="itemsList"
				></v-select>
			</v-flex>
			<v-flex xs12 md12 pr-2 mb-3>
				<label class="caption-gray">Telefono</label>
				<v-text-field
					class="filter-select"
					type="number"
					placeholder="Telefono"
					v-model="model.phone"
				></v-text-field>
			</v-flex>
			<v-flex xs12 mb-3 class="wrapper-user">
				<v-checkbox
					color="success"
					label="CREAR CON USUARIO"
					class="primary--text"
					hide-details
					v-model="flagUser"
				></v-checkbox>
			</v-flex>
				<v-flex xs12 v-if="flagUser">
					<v-layout wrap>
						<v-flex xs12 md12 mb-2>
					<label
						:class="{'c-error': !$v.model.roleId.required && isLoading}" 
						class="caption-gray">
						Rol del Usuario(*)
					</label>
					<v-select
						class="filter-select"
						:class="{'border-error': !$v.model.roleId.required  && isLoading}" 
						item-text="name"
						item-value="id"
						placeholder="Rol del Usuario"
						v-model="model.roleId"
						:items="roles"
						@change="changeRolId"
					></v-select>
				</v-flex>
					<v-flex xs12 mb-2>
						<label
							:class="{'c-error': !$v.model.name.required && isLoading}" 
							class="caption-gray">
							Nombres (*)
						</label>
						<v-text-field
							class="filter-select"
							:class="{'border-error': !$v.model.name.required && isLoading}"
							type="Nombres"
							placeholder="Nombres"
							v-model="model.name"
						></v-text-field>
					</v-flex>
					<v-flex xs12 mb-2>
						<label
							:class="{'c-error': !$v.model.surName.required && isLoading}"  
							class="caption-gray">
							Apellidos (*)
						</label>
						<v-text-field
							class="filter-select"
							:class="{'border-error': !$v.model.surName.required && isLoading}"
							type="Apellidos"
							placeholder="Apellidos"
							v-model="model.surName"
						></v-text-field>
					</v-flex>
					<v-flex xs12 mb-2>
						<label
							:class="{'c-error': (!$v.model.email.required || !$v.model.email.email) && isLoading}"
							class="caption-gray">
							Correo (*)
						</label>
						<v-text-field
							class="filter-select"
							:class="{'border-error': (!$v.model.email.required || !$v.model.email.email) && isLoading}"
							type="email"
							placeholder="Correo"
							v-model="model.email"
						></v-text-field>
					</v-flex>
					<v-flex xs12 mb-2>
						<label
							:class="{'c-error': !$v.model.password.required && isLoading}"   
							class="caption-gray">Contraseña (*)</label>
						<v-text-field
							class="filter-select"
							:class="{'border-error': !$v.model.password.required && isLoading}"
							v-model="model.password"
							placeholder="Contraseña"
						></v-text-field>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<section class="fast-register-footer">
			<modal-sidebar-button
				:is-loading="!slugValidated || slugLoading"
				@cancel-button-clicked="$emit('close')"
				@accept-button-clicked="createCommerce">
			</modal-sidebar-button>
		</section>
	</div>
</template>
<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import slugInput from '@/components/ecommerce/slug-input';
import helper from '@/shared/helper';
import { required, requiredIf, email } from 'vuelidate/lib/validators';

const { debounce } = helper;

function changeOptionSucursal() {
	this.searchSucursal = !this.searchSucursal;
}

function changeOptionWarehouse() {
	this.searchWarehouse = !this.searchWarehouse;
}

function validations() {
	return {
		model: {
			subsidiaryName: { required },
			commerceName: { required },
			documentNumber: { required },
			name: { required: requiredIf(() => this.flagUser) },
			surName: { required: requiredIf(() => this.flagUser) },
			email: { email, required: requiredIf(() => this.flagUser) },
			password: {
				required: requiredIf(() => this.flagUser),
			},
			itemId: { required },
			roleId: { required: requiredIf(() => this.flagUser) },
			slug: { required },
			warehouseName: { required },
			warehouseId: { required: requiredIf(() => this.showWarehouse) },
		},
	};
}

async function loadItems() {
	const params = { flagActive: 1, type: 2, notShowEcommerces: true };
	const paramsList = { flagActive: 1 };
	const request = [
		this.$httpSales.get('items', { params }),
		this.$httpAcl.get(`company/${this.$userInfo.company.aclCode}/role`),
		this.$httpSales.get('sal-price-lists', { params: paramsList }),
		this.$httpSales.get('subsidiaries'),
	];
	try {
		const response = await Promise.all(request);
		this.items = response[0].data;
		this.roles = response[1].data.data;
		this.itemsList = response[2].data;
		this.itemsList.unshift({ id: null, name: 'Seleccione Lista de Precio' });
		this.listSubsidiaries = response[3].data;
		if (this.listSubsidiaries.length === 1) {
			this.model.subsidiaryId = this.listSubsidiaries[0].id;
		}
	} catch (error) {
		this.showGenericError();
	}
}

function created() {
	this.loadItems();
}

function createCommerce() {
	if (this.$v.$invalid) {
		this.isLoading = true;
	} else {
		const body = { ...this.model };
		if (body.roleId === null) {
			delete body.roleId;
		}
		if (!body.slug) {
			delete body.slug;
		}
		if (body.roleCodeGlobal === null) {
			delete body.roleCodeGlobal;
		}
		if (!body.warehouseName) {
			body.warehouseName = body.commerceName;
		}
		body.phone = body.phone ? body.phone || null : null;
		this.$emit('create-commerce', body);
	}
}

function changeRolId(value) {
	const index = this.roles.findIndex(r => r.id === value);
	if (index > -1) {
		this.model.roleCodeGlobal = this.roles[index].typeRole.data ?
			this.roles[index].typeRole.data.code : null;
	}
}

/* eslint-disable prefer-template */
/* eslint-disable no-useless-escape */
function setSlug(value) {
	const valueNormalize = value.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[0-9]/g, '')
		.replace(/\s+/g, ' ')
		.replace(/^(\s*)([\W\w]*)(\b\s*$)/g, '$2');
	this.model.slug = valueNormalize.toLowerCase();
	this.validateSlug(this.model.slug);
}

async function validateSlug(value) {
	if (value) {
		this.slugLoading = true;
		this.model.slug = value || null;
		try {
			const { data: response } = await this.$httpSales.get(`ecommerce-companies/${this.model.slug}/slug`);
			this.slugValidated = !response;
		} catch (err) {
			this.slugValidated = false;
			if (err.status === 500) {
				this.showGenericError();
			}
		} finally {
			this.slugLoading = false;
		}
	}
}

function selectedSubsidiary(value) {
	this.disabledCkeck = false;
	this.model.subsidiaryId = value.id;
	this.model.subsidiaryName = value.sucursalName;
	this.model.documentNumber = value.ruc;
	this.loadWarehouses(value.id);
}

function changeWarehouse(value) {
	if (!this.model.subsidiaryId && value) {
		this.showNotification('Debe seleccionar una empresa', 'info');
	}
}

async function loadWarehouses(subsidiaryId) {
	try {
		const params = { subsidiaryId };
		({ data: this.listWarehouses } = await this.warehousesList(params));
		if (this.listWarehouses.length === 1) {
			this.model.warehouseId = this.listWarehouses[0].id;
		} else if (this.listWarehouses.length === 0) {
			this.disabledCkeck = true;
			this.showWarehouse = false;
		}
	} catch (error) {
		this.showGenericError();
	}
}

function selectedWarehouse(value) {
	this.model.warehouseId = value.id;
	this.model.warehouseName = value.name;
}

function showSucursal(value) {
	this.model.subsidiaryId = null;
	this.model.subsidiaryName = null;
	this.model.documentNumber = null;
	this.model.priceListId = null;
	if (!value && this.showWarehouse) {
		this.showWarehouse = false;
		this.model.warehouseName = null;
		this.model.warehouseId = null;
	}
}

function showWarehouse() {
	this.model.warehouseName = null;
	this.model.warehouseId = null;
}

function data() {
	return {
		model: {
			subsidiaryName: null,
			subsidiaryId: null,
			warehouseName: null,
			commerceName: null,
			address: null,
			phone: null,
			documentNumber: null,
			itemId: null,
			flowCreation: 'ADMIN',
			name: null,
			surName: null,
			email: null,
			password: null,
			flagTypePerson: 1,
			slug: null,
			roleId: null,
			roleCodeGlobal: null,
			warehouseId: null,
			priceListId: null,
		},
		searchSucursal: false,
		searchWarehouse: false,
		items: [],
		flagUser: false,
		showSucursal: false,
		isLoading: false,
		roles: [],
		slugLoading: false,
		slugValidated: true,
		listSubsidiaries: [],
		showWarehouse: false,
		listWarehouses: [],
		itemsList: [],
		disabledCkeck: false,
	};
}
export default {
	name: 'create-ecommerce-group',
	data,
	components: {
		modalSidebarButton,
		slugInput,
	},
	created,
	methods: {
		changeOptionSucursal,
		changeOptionWarehouse,
		loadItems,
		createCommerce,
		changeRolId,
		selectedSubsidiary,
		setSlug: debounce(setSlug),
		validateSlug: debounce(validateSlug),
		changeWarehouse,
		loadWarehouses,
		selectedWarehouse,
	},
	props: {
		subsidiaries: {
			type: Array,
			default: () => [],
		},
	},
	validations,
	watch: {
		showSucursal,
		showWarehouse,
	},
};
</script>
<style lang="scss" scoped>
	.caption-gray {
		color: color(brown-grey);
		font-size: 12px;

		&.c-error {
			color: color(error);
		}
	}
	.border-error {
		border: 1px solid color(error);
	}

	.wrapper-user {
		border-bottom: 1px solid color(border-green-light);
	}

	.text-info {
		color: map-get($colors, tableText);
		font-size: 10px;
	}
</style>