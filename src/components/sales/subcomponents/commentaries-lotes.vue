<template>
	<div>
		<v-container>
			<v-layout row wrap>
				<v-flex xs12>
					<app-input-text
						textarea
						no-resize
						model="commentary"
						label="Comentario"
						v-bind="$attrs"
						:text="product.commentary"
						:disabled="disabledEditCommentary"
						@input="setData"
					/>
				</v-flex>
				<v-flex xs6 v-if="showAdditional" mt-2>
					<app-input-text
						label="Código del lote"
						:text="code"
						type="text"
						:disabled="disabledEdit"
						model="code"
						@input="setData"
					/>
				</v-flex>
				<v-flex xs6 v-if="showAdditional" mt-2 pl-1>
					<app-input-text
						label="Código EAN de producto"
						:disabled="disabledEdit"
						type="number"
						model="codeEan"
						:text="codeEan"
						@input="setData"
					/>
				</v-flex>
				<v-flex xs6 v-if="showAdditional" mt-2 pr-1>
					<app-date-select
						v-if="!disabledEdit"
						:date-formatted="date"
						label="Fecha de creacion"
						model="date"
						@input="setDate"
					/>
					<app-input-text
						v-if="disabledEdit"
						label="Fecha de creación"
						:disabled="disabledEdit"
						model="date"
						:text="date"
						@input="setData"
					/>
				</v-flex>
				<!-- todo: mantener formato ano,fecha,hora -->
				<v-flex xs6 v-if="showAdditional" mt-2 pr-1>
					<app-date-select
						v-if="!disabledEdit"
						:date-formatted="dateDue"
						label="Fecha de vencimiento"
						model="dateDue"
						@input="setDate"
					/>
					<app-input-text
						v-if="disabledEdit"
						label="Fecha de vencimiento"
						:disabled="disabledEdit"
						model="dateDue"
						:text="dateDue"
						@input="setData"
					/>
				</v-flex>
				<v-flex xs12 mt-2>
					<app-input-text
						textarea
						no-resize
						label="Ubicación"
						model="location"
						v-bind="$attrs"
						:text="location"
						:disabled="disabledEdit"
						@input="setData"
					/>
				</v-flex>
			</v-layout>
		</v-container>
		<section class="modal-filter-footer" v-if="!disabledEditCommentary">
			<modal-sidebar-button
				:isLoading="!invalidCode || inValid"
				@cancel-button-clicked="closeModal"
				@accept-button-clicked="save"
			/>
		</section>
	</div>
</template>
<script>
import dateComponent from '@/components/shared/date-component';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import { format } from 'date-fns';

function setData({ model, value }) {
	this[model] = value;
	if (model === 'code') {
		this.localCode = value;
	}
}

function setDate({ model, value }) {
	this[model] = format(value, 'YYYY-MM-DD');
}

function closeModal() {
	this.$emit('close-modal');
}

function save() {
	const newDataProduct = {
		code: this.code,
		location: this.location,
		dateDue: this.dateDue,
		date: this.date,
		codeEan: this.codeEan,
	};
	this.$emit('set-add', newDataProduct, this.commentary);
	this.closeModal();
}

function data() {
	const dateDue = this.product.productLots ?
		this.product.productLots.dateDue || this.product.productLots.expirationDate
		: null;
	const formattedDateDue = dateDue
		? new Date(dateDue).toISOString().split('T')[0]
		: '';

	const date = this.product.productLots ? this.product.productLots.date : '';
	const formattedDate = date ? new Date(date).toISOString().split('T')[0] : '';
	return {
		commentary: this.product.commentary,
		code: this.product.productLots ? this.product.productLots.code || this.product.productLots.lot : null,
		codeEan: this.product.productLots ? this.product.productLots.codeEan : null,
		location: this.product.productLots ? this.product.productLots.location : this.product.location,
		dateDue: formattedDateDue,
		date: formattedDate,
		localCode: null,
	};
}

export default {
	name: 'commentaries-lotes',
	components: {
		dateComponent,
		modalSidebarButton,
	},
	data,
	inheritAttrs: false,
	methods: {
		closeModal,
		save,
		setData,
		setDate,
	},
	computed: {
		invalidCode() {
			return /^[a-zA-Z0-9]*$/.test(this.localCode);
		},
		inValid() {
			return this.code === '' || this.codeEan === '';
		},
	},
	props: {
		product: {
			default: () => {},
			type: Object,
		},
		showAdditional: {
			default: false,
			type: Boolean,
		},
		onlyCommentary: {
			default: false,
			type: Boolean,
		},
		onlyDetailsLote: {
			default: false,
			type: Boolean,
		},
		disabledEdit: {
			default: false,
			type: Boolean,
		},
		disabledEditCommentary: {
			default: false,
			type: Boolean,
		},
	},
};
</script>
