<template>
	<div>
		<v-layout row wrap pt-3 px-4>
			<v-flex xs4>
				<label class="transfer-label">Destino:</label>
			</v-flex>
			<v-flex xs8>
				<p class="transfer-text">{{ warehouse }}</p>
			</v-flex>
		</v-layout>
		<v-layout row wrap px-3>
			<app-table
				name="finished-transfer"
				:columns="columns"
				:rows="products"
				local-storage
				:input-search="false"
				:filter-columns="false"
				:main-list="false"
				class="is-not-selectable no-main-list">
				<template slot="rows" slot-scope="props">
					<td
						class="is-not-selectable"
						v-show="showRow(columns, 1)">{{ props.row.name }}
						({{props.row.code}})</td>
					<td v-show="showRow(columns, 2)">{{ props.row.quantity }}</td>
					<td v-show="showRow(columns, 3)">
						<v-text-field
							hide-details
							single-line
							type="number"
							min="0"
							v-model.number="props.row.devolution"
							@keyup="validateData(props.row)"
							class="filter-select width-min"
						></v-text-field>
					</td>
					<td
						class="py-1"
						v-show="showRow(columns, 4)">
						<v-text-field
							label="Motivo de rechazo"
							v-model="props.row.reason"
							hide-details
							textarea
							no-resize
							single-line
							:disabled="props.row.readonly"
							class="filter-select textarea-content"
						></v-text-field>
					</td>
				</template>
			</app-table>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="disabledButton"
				@accept-button-clicked="callToAction"
				@cancel-button-clicked="cancelToAction" />
		</section>
	</div>
</template>

<script>
	import AppTable from './../table/app-table';
	import ModalSidebarButton from './../utils/modal-sidebar-button';

	function created() {
		const newDate = new Date();
		this.dateOnline = newDate.getTime().toString();
	}

	function callToAction() {
		const model = {
			details: this.products.map((product) => {
				const newProduct = { ...product };
				newProduct.detail = {
					dateOnline: this.dateOnline,
					brandId: product.brandId,
					code: product.code,
					devolution: product.devolution,
					productId: product.id,
					reason: product.reason,
					status: 3,
				};
				return newProduct.detail;
			}),
		};
		this.$emit('call-to-action', model);
	}

	function disabledButton() {
		return this.disabled || this.loading;
	}

	function cancelToAction() {
		this.$emit('cancel-to-action');
	}

	function validateData({ id }) {
		const productIndex = this.products.findIndex(prod => (prod.devolution > prod.quantity)
			|| (Number(prod.devolution) < 0));
		this.disabled = productIndex > -1;
		const toValidate = {
			id,
			products: this.products,
		};
		this.$emit('validate-data', toValidate);
	}

	function data() {
		return {
			columns: [
				{ id: 1, name: 'Nombre', value: 'name', visible: true },
				{ id: 2, name: 'Cantidad', value: 'quantity', visible: true },
				{ id: 3, name: 'Rechazo', value: 'devolution', visible: true },
				{ id: 4, name: 'Motivo Rechazo', value: 'reason', visible: true },
			],
			disabled: false,
		};
	}

	export default {
		name: 'finished-transfer',
		components: {
			AppTable,
			ModalSidebarButton,
		},
		computed: {
			disabledButton,
		},
		created,
		data,
		methods: {
			callToAction,
			cancelToAction,
			validateData,
		},
		props: {
			loading: {
				default: false,
				type: Boolean,
			},
			products: {
				default: () => [],
				required: true,
				type: Array,
			},
			warehouse: {
				default: '',
				required: true,
				type: String,
			},
		},
	};
</script>

<style lang="scss" scoped>
	.transfer {
		&-label {
			color: map-get($colors, paginationText);
			font-family: map-get($fonts, open-semibold);
			font-size: map-get($sizes, medium18);
		}

		&-text {
			color: map-get($colors, paginationText);
			font-family: map-get($fonts, open-regular);
			font-size: map-get($sizes, medium18);
			text-transform: uppercase;
		}
	}

	.width-min {
		margin: 0 auto;
		max-width: 70px;
	}
</style>