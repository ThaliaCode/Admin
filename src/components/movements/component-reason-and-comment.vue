<template>
	<v-layout mt-4 wrap px-3 align-end>
			<v-flex xs12 px-4>
				<label>Motivo</label>
				<v-text-field
				class="filter-select"
				name="new-product-description"
				v-model="model.reason"
				></v-text-field>
		</v-flex>
		<v-flex xs12 mt-4 px-4 >
		<label>Comentario</label>
		<v-text-field
		class="textarea-content filter-select"
		textarea
		no-resize
		multi-line
		type="text"
		v-model="model.commentary"
		>
		</v-text-field>
		</v-flex>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				@cancel-button-clicked="close"
				@accept-button-clicked="save"
			/>
		</section>
	</v-layout>
	
</template>

<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function created() {
	this.model.reason = this.component.reason;
	this.model.commentary = this.component.commentary;
}

function setComponent({ value }) {
	this.model.reason = value;
	this.model.commentary = value;
}

function data() {
	return {
		model: {
			reason: '',
			commentary: '',
		},
	};
}

function close() {
	this.$emit('close-modal');
	this.model.reason = '';
	this.model.commentary = '';
}


function save() {
	this.$emit('save', this.model);
	this.close();
}

export default {
	inheritAttrs: false,
	created,
	data,
	name: 'component-reason-and-comment',
	props: {
		component: {
			type: Object,
			default: () => {},
		},
	},
	components: {
		modalSidebarButton,
	},
	methods: {
		setComponent,
		close,
		save,
	},
};
</script>

<style lang="scss" scoped>
.component-reason {
	align-items: center;
	display: flex;
	flex-direction: column;
}

.input-group__input {
	font-family: map-get($fonts, open-semibold);
	font-size: 14px !important;
}
</style>