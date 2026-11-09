<template>
	<div class="white">
		<v-layout wrap align-center px-4 primary white--text class="header-details">
			<v-flex xs6 text-xs-left>
				{{ module.name }} {{ details.documentNumber }}
			</v-flex>
			<v-flex xs4 text-xs-right class="amount-text">
				<v-layout column align-center>
					<v-flex> Importe: </v-flex>
					<v-flex> {{ details.currencySymbol }}{{ details.amount }} </v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs2 text-xs-right>
				<button class="btn-close pl-1" @click="$emit('close-detail', details)">
					<v-icon color="white">clear</v-icon>
				</button>
			</v-flex>
		</v-layout>
		<v-layout wrap align-center mx-4 px-2 pt-3 class="title-details">
			<v-flex xs6>
				<p class="primary--text">{{ entityExternalData.fullName || '---' }}</p>
			</v-flex>
			<v-flex xs6 text-xs-right>
				<p class="primary--text">
					Asiento:
					<span v-if="details.accountingSeatCode">{{
						details.accountingSeatCode
					}}</span>
					<span v-else>---</span>
				</p>
			</v-flex>
		</v-layout>
		<v-layout wrap px-4>
			<v-flex xs12>
				<edit-details-document
					:id="id"
					:mounted="mounted"
					:hide-buttons="hideButtons"
					:detail="details"
					@close="close"
					@save="save"
					@show-detail="showDetail"
					@update="updateDocument"
				/>
			</v-flex>
		</v-layout>
	</div>
</template>
<script>
import { format } from 'date-fns';
import editDetailsDocument from './edit-details-document';

function close() {
	this.$emit('close');
}

async function loadDetails() {
	if (this.id) {
		({ data: this.details } = await this.$httpSales.get(
			`transactions-detail/${this.id}`
		));
	} else {
		this.details = this.transaction;
	}
	this.details.paymentDate = format(this.details.paymentDate, 'YYYY-MM-DD');
	if (!this.details.entityExternalData) {
		this.details.entityExternalData = this.entityExternal;
	}
	this.entityExternalData = this.details.entityExternalData || {};
	this.module = this.details.module || {};
}

function save(model) {
	this.$emit('save', model);
}

function id(value) {
	if (value) {
		this.loadDetails();
	}
}

function showDetail(seat) {
	this.$emit('show-detail', seat);
}

function data() {
	return {
		entityExternalData: {},
		details: {},
		module: {},
		entityExternal: {
			documentName: '',
			documentNumber: '',
			fullName: null,
			documentTitle: '',
		},
	};
}

export default {
	name: 'documents-details',
	components: {
		editDetailsDocument,
	},
	data,
	methods: {
		close,
		loadDetails,
		save,
		showDetail,
		async updateDocument(body) {
			try {
				await this.$httpSales.patch(`transactions/${this.id}/simple`, body);
				this.showNotification(
					'La imagen del documento ha sido actualizado correctamente.'
				);
			} catch (error) {
				this.showGenericError();
			}
		},
	},
	props: {
		hideButtons: {
			default: false,
			type: Boolean,
		},
		id: {
			type: [Number, String],
		},
		mounted: {
			default: false,
			type: [Boolean, Number],
		},
		transaction: {
			type: Object,
		},
	},
	watch: {
		id,
		transaction: {
			handler() {
				this.loadDetails();
			},
		},
	},
};
</script>

<style lang="scss" scoped>
.header-details {
	font-family: font(open-semibold);
	font-size: size(medium);
	height: 71px;
}

.amount-text {
	font-family: font(open-bold);
	font-size: size(medium20);
}

.title-details {
	border-bottom: 1px solid color(blue-grey);
	font-family: font(open-bold);
	font-size: size(medium);
}

.btn-close {
	border-left: 1px solid color(white);
}
</style>
