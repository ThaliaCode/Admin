<template>
	<div>
		<dynamic-form
			v-if="true"
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
import helper from '@/shared/helper';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function created() {
	const isData = Object.keys(this.additionalInformation);
	this.dataForm = isData.length ?
		{ ...this.additionalInformation } :
		{ ...this.showAdditionalInfomationFac };
	const response = helper.getLocalData('type-document-global') || [];
	this.dataForm.typeDocument.items = [...response];
}

function setData({ model, value }) {
	if (value) {
		this.dataForm[model].value = value;
	}
}

function data() {
	return {
		dataForm: {},
		loadData: false,
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
		setData,
	},
	props: {
		additionalInformation: {
			type: Object,
			default: () => {},
		},
		id: [Number, String],
	},
};
</script>