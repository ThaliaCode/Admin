<template>
	<div class="pt-3">
		<additional-data
			:data-added="dataAdded"
			:disabled="$v.$invalid"
			:info="info"
			@add-data="addData"
			@remove-data="removeData"
			@set-data="setData"
		/>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="!!id"
				@cancel-button-clicked="close"
				@accept-button-clicked="save"
			/>
		</section>
	</div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import additionalData from './additional-data';
import modalSidebarButton from './../../shared/utils/modal-sidebar-button';

function created() {
	this.dataAdded = [...this.additionalInformation];
}

function addData() {
	if (this.info) {
		if (this.dataAdded.length < 15) {
			this.dataAdded.push(this.info);
			this.info = '';
		} else {
			this.showGenericError('Solo se pueden agregar 15 datos adicionales.');
		}
	}
}

function cleanForm() {
	this.dataAdded = [];
	this.info = '';
}

function close() {
	this.$emit('close');
	this.cleanForm();
}

function removeData(dataIndex) {
	this.dataAdded.splice(dataIndex, 1);
}

function save() {
	this.$emit('save', this.dataAdded);
	this.close();
}

function setData({ model, value }) {
	this[model] = value;
}

function validations() {
	return { info: { required } };
}

function data() {
	return {
		dataAdded: [],
		info: '',
	};
}

export default {
	name: 'additional-data-form',
	components: {
		additionalData,
		modalSidebarButton,
	},
	created,
	data,
	methods: {
		addData,
		cleanForm,
		close,
		removeData,
		save,
		setData,
	},
	props: {
		additionalInformation: {
			default: () => [],
			type: Array,
		},
		id: [Number, String],
	},
	validations,
};
</script>

<style lang="scss" scoped>
.btn-total {
	height: 30px;
}
</style>
