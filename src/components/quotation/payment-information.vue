<template>
	<div>
		<dynamic-form v-if="true" :form-fields="dataForm" @set-data="setData" />
		<v-flex px-3 v-if="dataForm.typePayment">
			<label ref="up" for="upload-image" px-3>
				<vue-six-four id="upload-image" hidden @vue-six-four="getFile" />
				<v-layout wrap>
					<v-flex xs10>
						<app-input-text
							label="Adjuntar Voucher"
							readonly
							:text="urlImage"
						/>
					</v-flex>
					<v-flex xs2 mt-4 text-xs-left>
						<v-btn
							@click="actionUploadImage"
							class="ma-0 pl-0 btn-auto"
							small
							color="pink"
						>
							<v-icon color="white">attach_file</v-icon>
						</v-btn>
					</v-flex>
				</v-layout>
			</label>
		</v-flex>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				@cancel-button-clicked="$emit('close')"
				@accept-button-clicked="$emit('save-data-form', dataForm, urlImage)"
			/>
		</section>
	</div>
</template>
<script>
import dynamicForm from '@/components/shared/utils/dynamic-form';
import helper from '@/shared/helper';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import VueSixFour from 'vue-six-four';
import upLoadImageMixin from '@/mixins/upLoadImage';

function created() {
	const isData = Object.keys(this.additionalInformation);
	const dynamicFormData = this.isPurchase
		? this.getAddInfoTypePaymentPurchase()
		: this.showAdditionalInfomatioTypePayment;

	this.dataForm = isData.length
		? { ...this.additionalInformation }
		: { ...dynamicFormData };

	const response = helper.getLocalData('type-payments-global') || [];
	this.urlImage = this.value;
	if (this.dataForm.typePayment) {
		this.dataForm.typePayment.items = [...response];
	}
	if (this.id) {
		// todo: esto deberia ser dinamico, si tiene propiedades tipo "select"
		if (this.dataForm.plan) {
			this.dataForm.plan.items = dynamicFormData.plan.items;
		}
		if (this.dataForm.estado) {
			this.dataForm.estado.items = dynamicFormData.estado.items;
		}
		if (this.dataForm.pago) {
			this.dataForm.pago.items = dynamicFormData.pago.items;
		}
	}
	if (this.id && this.dataForm.costShippingA) {
		this.dataForm.costShippingA.items = this.costShippings;
	}
}

function setData({ model, value }) {
	if (value) {
		this.dataForm[model].value = value;
	}
}

function captureLocation(value) {
	this.urlImage = value;
}

function data() {
	return {
		dataForm: {},
		loadData: false,
		costShippings: [
			{ id: 1, name: 'Origen' },
			{ id: 2, name: 'Destino' },
			{ id: 3, name: 'Otros' },
		],
		urlImage: null,
	};
}

export default {
	name: 'additional-information',
	data,
	created,
	components: {
		dynamicForm,
		modalSidebarButton,
		VueSixFour,
	},
	methods: {
		setData,
		getAddInfoTypePaymentPurchase() {
			// DOCUMENTOS DEL LOCAL STORAGE
			const documents = helper.getLocalData('documents') || [];
			const orderPurchase = documents.find((d) => d.comTypeDocumentId === 10);
			const aditionalInfo =
				orderPurchase &&
				orderPurchase.additionalInformation &&
				orderPurchase.additionalInformation.aditionalInfo;
			if (aditionalInfo) {
				const template = aditionalInfo.payment;
				const arrayTemplate = Object.entries(template).sort(
					([, a], [, b]) => b.order - a.order
				);
				const arrayTemplateReverse = arrayTemplate.reverse();
				const objectOrder = Object.fromEntries(arrayTemplateReverse);
				return objectOrder;
			}
			return {};
		},
	},
	props: {
		additionalInformation: {
			type: Object,
			default: () => {},
		},
		id: [Number, String],
		value: [String],
		isPurchase: {
			type: Boolean,
			default: false,
		},
	},
	watch: {
		captureLocation,
	},
	mixins: [upLoadImageMixin],
};
</script>
