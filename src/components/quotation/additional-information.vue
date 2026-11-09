<template>
	<div>
		<app-loading
			:show-loading="showNotificationK"
			label="La carga terminará en un momento y podrás ver
			toda la información para Datos de Guía"
		/>
		<dynamic-form
			v-if="id ? loadData : true"
			:form-fields="dataForm"
			@set-data="setData"
		/>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				@cancel-button-clicked="$emit('close')"
				@accept-button-clicked="$emit('save-data-form', dataForm)"
			/>
		</section>
	</div>
</template>
<script>
import dynamicForm from '@/components/shared/utils/dynamic-form';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import helper from '@/shared/helper';

function getAddInfoTypePaymentPurchase() {
	// DOCUMENTOS DEL LOCAL STORAGE
	const documents = helper.getLocalData('documents') || [];
	const orderPurchase = documents.find((d) => d.comTypeDocumentId === 10);
	const aditionalInfo =
		orderPurchase &&
		orderPurchase.additionalInformation &&
		orderPurchase.additionalInformation.aditionalInfo;
	if (aditionalInfo) {
		const template = aditionalInfo.guideData;
		const arrayTemplate = Object.entries(template).sort(
			([, a], [, b]) => b.order - a.order
		);
		const arrayTemplateReverse = arrayTemplate.reverse();
		const objectOrder = Object.fromEntries(arrayTemplateReverse);
		return objectOrder;
	}
	return {};
}

function created() {
	this.showNotificationK = true;
	const isData = Object.keys(this.additionalInformation);
	const dynamicFormData = this.isPurchase
		? getAddInfoTypePaymentPurchase()
		: this.showAdditionalInfomatioQuotation;
	if (this.$route.name === 'new-sale') {
		this.dataForm = isData.length
			? { ...this.additionalInformation }
			: { ...this.showAdditionalInfomatioSales };
	} else {
		this.dataForm = isData.length
			? { ...this.additionalInformation }
			: { ...dynamicFormData };
	}
	if (this.id) {
		if (this.dataForm.plan) {
			this.dataForm.plan.items = dynamicFormData.plan.items;
		}
		if (this.dataForm.rubro) {
			this.dataForm.rubro.items = dynamicFormData.rubro.items;
		}
	}
	if (!this.isPurchase) {
		this.loadAgencyTransports();
		this.loadDepartament();
	} else {
		this.loadData = true;
		this.showNotificationK = false;
	}
}

async function loadAgencyTransports() {
	try {
		const response = await this.$httpSales.get('transport-agency');
		if (this.dataForm.companyName) {
			this.dataForm.companyName.items = [...response.data];
		}
	} catch (error) {
		this.showGenericError();
	}
}

async function loadDepartament() {
	try {
		const response = await this.$httpSales('province');
		if (this.dataForm.departament) {
			this.dataForm.departament.items = [...response.data];
		}
		if (
			this.dataForm.departament &&
			this.dataForm.departament.value &&
			this.dataForm.departament.value.id
		) {
			this.loadProvince(this.dataForm.departament.value.id);
			// this.loadData = true;
		} else {
			this.loadData = true;
		}
	} catch (error) {
		this.showGenericError();
	} finally {
		this.showNotificationK = false;
	}
}

async function loadProvince(id) {
	try {
		const response = await this.$httpSales(`cities/${id}`);
		if (this.dataForm.province) {
			this.dataForm.province.items = [...response.data];
		}
		if (this.dataForm.province.value && this.dataForm.province.value.id) {
			this.loadDistrict(this.dataForm.province.value.id);
		} else {
			this.loadData = true;
		}
	} catch (error) {
		this.showGenericError();
	} finally {
		this.showNotificationK = false;
	}
}

async function loadDistrict(id) {
	try {
		const response = await this.$httpSales(`parish/${id}`);
		if (this.dataForm.district) {
			this.dataForm.district.items = [...response.data];
		}
		this.loadData = true;
	} catch (error) {
		this.showGenericError();
	} finally {
		this.showNotificationK = false;
	}
}

function setData({ model, value }) {
	if (value) {
		if (model === 'departament' && value.id) {
			this.dataForm.departament.value = value;
			this.dataForm.province.items = [];
			this.dataForm.province.value = '';
			this.dataForm.district.items = [];
			this.dataForm.district.value = '';
			this.loadProvince(value.id);
		} else if (model === 'province' && value.id) {
			this.dataForm.district.items = [];
			this.dataForm.district.value = '';
			this.dataForm.province.value = value;
			this.loadDistrict(value.id);
		} else if (model === 'district') {
			this.dataForm.district.value = value;
		} else if (model === 'companyName' && value.id) {
			this.dataForm.companyName.value = value.id;
			this.dataForm.companyName.valueName = value.name;
			this.dataForm.companyAddress.value = value.mainAddress || null;
		} else {
			this.dataForm[model].value = value;
		}
	}
}

function data() {
	return {
		dataForm: {
			province: {
				items: [],
				value: null,
			},
			district: {
				items: [],
				value: null,
			},
			departament: {
				items: [],
				value: null,
			},
		},
		loadData: false,
		showNotificationK: false,
	};
}

export default {
	name: 'additional-information',
	data,
	created,
	components: {
		dynamicForm,
		modalSidebarButton,
	},
	methods: {
		loadDepartament,
		loadProvince,
		loadAgencyTransports,
		loadDistrict,
		setData,
	},
	props: {
		isPurchase: {
			type: Boolean,
			default: false,
		},
		additionalInformation: {
			type: Object,
			default: () => {},
		},
		id: [Number, String],
	},
};
</script>
