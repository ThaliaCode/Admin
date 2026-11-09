<template>
	<div>
		<form class="pt-5 px-3">
			<v-layout row wrap mb-4>
				<v-flex xs12>
					<v-text-field
						required
						class="filter-select"
						label="Nombre"
						v-model="commerce.name"
					></v-text-field>
					<small class="error-text" v-if="!$v.commerce.name.required">El nombre del comercio es requerido</small>
				</v-flex>
			</v-layout>
			<v-layout row wrap mb-4>
				<v-flex xs12>
					<v-text-field
						required
						class="filter-select"
						label="Código"
						v-model="commerce.code"
					></v-text-field>
					<small class="error-text" v-if="!$v.commerce.code.required">El código del comercio es requerido</small>
					<span
						class="text-not-code-blank"
						v-if="checkBlankCode(commerce.code)">
						No se permite espacios en blanco
					</span>
				</v-flex>
			</v-layout>
			<v-layout row wrap v-if="subsidiaries.length > 1">
				<v-flex xs12>
					<v-select
						required
						class="filter-select mt-3"
						item-text="sucursalName"
						item-value="id"
						label="Empresa"
						v-model="commerce.subsidiaryId"
						:items="subsidiaries"
						@input="changeSubsidiary"
					></v-select>
					<small class="error-text" v-if="!$v.commerce.subsidiaryId.required">La empresa es requerida</small>
				</v-flex>
			</v-layout>
			<v-layout row wrap>
				<v-flex xs12>
					<v-select
					required
					class="filter-select mt-3"
					item-text="name"
					item-value="id"
					label="Rubros"
					v-model="commerce.itemId"
					:items="items"
					></v-select>
					<small class="error-text" v-if="!$v.commerce.itemId.required">El rubro es requerida</small>
				</v-flex>
			</v-layout>
		</form>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="$v.$invalid || checkBlankCode(commerce.code)"
				@cancel-button-clicked="$emit('cancel')"
				@accept-button-clicked="createNewCommerce"
			/>
		</section>
	</div>
</template>
<script>
import { required } from 'vuelidate/lib/validators';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

async function createNewCommerce() {
	const url = 'com-ecommerce-companies';
	const body = this.buildBody();
	try {
		await this.$httpSales.post(url, body);
		this.showNotification('Comercio creado exitosamente');
		this.$emit('saved');
	} catch (error) {
		const errors = {
			400: this.handlingBadRequests.bind(null, error.data.message),
		};
		if (error.status === 400) {
			if (error.data.message === 'COMMERCE_CODE_REPEATED') {
				this.showGenericError('Código ya existe, intente con otro.');
			}
		}
		if (errors[error.status]) {
			errors[error.status].call();
		}
	}
}

function handlingBadRequests(message) {
	this.showGenericError(message);
}

function buildBody() {
	const { code, name, ruc, rzSocial, subsidiaryId, itemId } = this.commerce;
	const settings = { salPriceListId: this.$userInfo.salPriceList.id };
	return { name, code, rzSocial, documentNumber: ruc, subsidiaryId, itemId, settings };
}

function validations() {
	return {
		commerce: {
			code: { required },
			name: { required },
			ruc: { required },
			rzSocial: { required },
			subsidiaryId: { required },
			itemId: { required },
		},
	};
}

function changeSubsidiary(id) {
	const index = this.subsidiaries.findIndex(s => s.id === id);
	if (index > -1) {
		this.commerce.ruc = this.subsidiaries[index].ruc;
		this.commerce.rzSocial = this.subsidiaries[index].rzSocial;
	}
}

function created() {
	if (this.subsidiaries.length === 1) {
		this.commerce.subsidiaryId = this.subsidiaries[0].id;
		this.commerce.ruc = this.subsidiaries[0].ruc;
		this.commerce.rzSocial = this.subsidiaries[0].rzSocial;
	}
}

function data() {
	return {
		commerce: {
			code: '',
			name: '',
			ruc: '',
			rzSocial: '',
			subsidiaryId: null,
			itemId: null,
		},
	};
}

export default {
	name: 'new-commerce',
	components: {
		modalSidebarButton,
	},
	created,
	data,
	props: {
		subsidiaries: {
			type: Array,
			default: () => [],
		},
		items: {
			type: Array,
			default: () => [],
		},
	},
	methods: {
		buildBody,
		createNewCommerce,
		handlingBadRequests,
		changeSubsidiary,
	},
	validations,
};
</script>
<style lang="scss" scoped>
	.error-text {
		color: color(error);
	}
</style>