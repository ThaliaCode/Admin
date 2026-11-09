<template>
	<v-layout row wrap class="sale-retention">
		<v-flex xs12 py-3 px-3>
			<v-layout row wrap>
				<v-flex xs2 pl-1 pr-2>
					<app-input-text
						autocomplete="off"
						:disabled="!!retentionId"
						:readonly="!!retentionId"
						label="Número"
						model="number"
						:text="retention.number"
						type="number"
						@input="$emit('on-input', $event)"
					></app-input-text>
					<span class="caption error--text" v-if="!retention.number">
						Campo requerido
					</span>
				</v-flex>
				<v-flex xs2 pr-1 pl-2>
					<app-input-text
						autocomplete="off"
						:disabled="!!retentionId"
						:readonly="!!retentionId"
						label="Serie"
						model="serie"
						:text="retention.serie"
						type="number"
						@input="$emit('on-input', $event)"
					></app-input-text>
					<span class="caption error--text" v-if="!retention.serie">
						Campo requerido
					</span>
				</v-flex>
			</v-layout>
		</v-flex>
		<v-flex xs12 py-3 class="section-background">
			<v-layout row wrap px-3>
				<v-flex xs3 pl-1 pr-2>
					<app-input-text
						autocomplete="off"
						:disabled="!!retentionId"
						:readonly="!!retentionId"
						label="Nro de Autoriz. SRI"
						model="authorizationNumber"
						:text="retention.authorizationNumber"
						type="number"
						@input="$emit('on-input', $event)"
					></app-input-text>
					<span class="caption error--text" v-if="!retention.authorizationNumber">
						Campo requerido
					</span>
				</v-flex>
				<v-flex xs3 px-2>
					<label class="caption">Fecha Emisión de Fac.</label>
					<date-component
						:disabled="!!retentionId"
						:date="retention.dateDocument"
						icon="/static/img/icon-calendar.png"
						@on-input="$emit('on-input', { model: 'dateDocument', value: $event })"
					></date-component>
					<span class="caption error--text" v-if="!retention.dateDocument">
						Campo requerido
					</span>
				</v-flex>
				<v-flex xs3 px-2>
					<label class="caption">Fecha Contable</label>
					<date-component
						:disabled="!!retentionId"
						:date="retention.dateAccouting"
						icon="/static/img/icon-calendar.png"
						@on-input="$emit('on-input', { model: 'dateAccouting', value: $event })"
					></date-component>
					<span class="caption error--text" v-if="!retention.dateAccouting">
						Campo requerido
					</span>
				</v-flex>
				<v-flex xs3 pr-1 pl-2>
					<label class="caption">Fecha de Caducidad</label>
					<date-component
						:disabled="!!retentionId"
						:date="retention.dateExpiration"
						icon="/static/img/icon-calendar.png"
						@on-input="$emit('on-input', { model: 'dateExpiration', value: $event })"
					></date-component>
					<span class="caption error--text" v-if="!retention.dateExpiration">
						Campo requerido
					</span>
				</v-flex>
			</v-layout>
		</v-flex>
		<v-flex xs12>
			<v-layout row wrap align-center>
				<v-flex xs12 class="title-background" pa-3>
					<span>IVA</span>
				</v-flex>
				<template v-for="detail in details">
					<v-flex xs12 :key="detail.numberOrder" v-if="itemVisible(detail, 'BIENES', 'SERVICIOS')">
						<v-layout row wrap px-5 py-3>
							<v-flex xs8>
								<v-layout row wrap>
									<v-flex xs3 d-flex align-center>
										<p class="ma-0">{{ detail.description }}:</p>
									</v-flex>
									<v-flex xs3 pr-3>
										<app-input-text
											autocomplete="off"
											:disabled="!!retentionId"
											:readonly="!!retentionId"
											label="Monto base"
											model="baseIva"
											:text="detail.baseIva"
											type="number"
											@input="$emit('detail-input', detail, $event)"
										></app-input-text>
									</v-flex>
									<v-flex xs6 pr-2>
										<autocomplete-component
											:disabled="!!retentionId"
											:readonly="!!retentionId"
											label-value="Código Retención SRI"
											item-text="autocomplete"
											item-value="code"
											:items="ivaRetentionCodes"
											local-search
											:resource-url="`/catalog-sunat-details-list/${tableCodeRetentions}`"
											return-object
											:http-code="'$httpSales'"
											:item="detail.codePercentageTax"
											@return-data="$emit('detail-input', detail, { model: 'codePercentageTax', value: $event })"
										></autocomplete-component>
										<span class="caption error--text" v-if="detail.baseIva && !detail.codePercentageTax">
											El código de retención es requerido
										</span>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs4>
								<v-layout row wrap>
									<v-flex xs6 px-2>
										<app-input-text
											autocomplete="off"
											disabled
											label="% Retención"
											model="percentageTax"
											readonly
											:text="detail.percentageTax"
											type="number"
										></app-input-text>
									</v-flex>
									<v-flex xs6 pl-2 pr-1>
										<app-input-text
											autocomplete="off"
											disabled
											label="Valor Retenido"
											model="amountTax"
											readonly
											:text="detail.amountTax | round"
											type="number"
										></app-input-text>
									</v-flex>
								</v-layout>
							</v-flex>
						</v-layout>
					</v-flex>
				</template>
			</v-layout>
		</v-flex>
		<v-flex xs12>
			<v-layout row wrap align-center>
				<v-flex xs12 class="title-background" pa-3>
					<v-layout row wrap align-center pr-1>
						<v-flex xs10>
							<span>RENTA</span>
						</v-flex>
						<v-flex xs2 text-xs-right>
							<v-tooltip top>
								<v-btn
									class="pl-add-container size mr-adjust"
									icon
									:disabled="!!retentionId"
									color="primary"
									slot="activator"
									@click="$emit('add-item')"
								>
									<v-icon color="white">add</v-icon>
								</v-btn>
								<span>Agregar</span>
							</v-tooltip>
						</v-flex>
					</v-layout>
				</v-flex>
				<template v-for="(detail, indexDetail) in details">
					<v-flex xs12 :key="detail.numberOrder" v-if="itemVisible(detail, 'RENTA')">
						<v-layout row wrap pa-3>
							<v-flex
								:class="rentItemsValidate ? 'xs5' : 'xs6'"
							>
								<v-layout row wrap>
									<v-flex xs4 pr-3>
										<app-input-text
											autocomplete="off"
											:disabled="!!retentionId"
											:readonly="!!retentionId"
											label="Monto base"
											model="baseZero"
											:text="detail.baseZero"
											type="number"
											@input="$emit('detail-input', detail, $event)"
										></app-input-text>
										<span class="caption error--text" v-if="!detail.baseZero">
											Campo requerido
										</span>
									</v-flex>
									<v-flex xs4 pr-3>
										<app-input-text
											autocomplete="off"
											:disabled="!!retentionId"
											:readonly="!!retentionId"
											label="Base Grabada"
											model="baseRecorded"
											:text="detail.baseRecorded"
											type="number"
											@input="$emit('detail-input', detail, $event)"
										></app-input-text>
										<span class="caption error--text" v-if="!detail.baseRecorded">
											Campo requerido
										</span>
									</v-flex>
									<v-flex xs4 pr-3>
										<app-input-text
											autocomplete="off"
											:disabled="!!retentionId"
											:readonly="!!retentionId"
											label="No Imponible"
											model="baseExempt"
											:text="detail.baseExempt"
											type="number"
											@input="$emit('detail-input', detail, $event)"
										></app-input-text>
										<span class="caption error--text" v-if="!detail.baseExempt">
											Campo requerido
										</span>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs6>
								<v-layout row wrap>
									<v-flex xs6 pr-2>
										<autocomplete-component
											label-value="Código Retención SRI"
											:disabled="!!retentionId"
											:readonly="!!retentionId"
											item-text="autocomplete"
											item-value="code"
											:items="retentionCodes"
											local-search
											:resource-url="`/catalog-sunat-details-list/${tableCodeRetentions}`"
											return-object
											:http-code="'$httpSales'"
											:item="detail.codePercentageTax"
											@return-data="$emit('detail-input', detail, { model: 'codePercentageTax', value: $event })"
										></autocomplete-component>
										<span class="caption error--text" v-if="!detail.codePercentageTax">
											El código de retención es requerido
										</span>
									</v-flex>
									<v-flex xs6>
										<v-layout row wrap>
											<v-flex xs6 px-2>
												<app-input-text
													autocomplete="off"
													disabled
													label="% Retención"
													model="percentageTax"
													readonly
													:text="detail.percentageTax"
													type="number"
												></app-input-text>
											</v-flex>
											<v-flex xs6 pl-2 pr-1>
												<app-input-text
													autocomplete="off"
													disabled
													label="Valor Retenido"
													model="amountTax"
													readonly
													:text="detail.amountTax"
													type="number"
												></app-input-text>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs1 pt-3 v-if="rentItemsValidate">
								<v-tooltip top>
									<v-btn
										class="pl-add-container size mr-adjust mb-0 mt-1"
										:disabled="!!retentionId"
										icon
										color="error"
										slot="activator"
										@click="$emit('delete-item', indexDetail)"
									>
										<v-icon class="delete-item-btn" color="white">minimize</v-icon>
									</v-btn>
									<span>Eliminar</span>
								</v-tooltip>
							</v-flex>
						</v-layout>
					</v-flex>
				</template>
			</v-layout>
		</v-flex>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="isLoading || disabled"
				@cancel-button-clicked="$emit('close')"
				@accept-button-clicked="$emit('save')"
			/>
		</section>
	</v-layout>
</template>

<script>
	import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
	import dateComponent from '@/components/shared/date-component';
	import lib from '@/shared/lib';
	import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
	import tableCode from '@/shared/table-code';

	const { map, setNewPropertyByFunction } = lib;

	function created() {
		this.loadBases();
		this.loadRetentionCodes();
	}

	function addProperties({ code, description }) {
		return `${code} - ${description}`;
	}

	function disabled() {
		const retentionKeys = Object.keys(this.retention);
		const retentionDetailsValid = this.retention.details.some(d =>
			(d.description === 'RENTA' && !d.amountTax) || (d.baseIva && !d.codePercentageTax));
		const retentionKeysValid = retentionKeys.some(key =>
			key !== 'code' && !this.retention[key]);
		return retentionDetailsValid || retentionKeysValid;
	}

	function itemVisible({ description }, firstParam, twoParam) {
		if (twoParam) {
			return description === firstParam || description === twoParam;
		}
		return description === firstParam;
	}

	async function loadBases() {
		try {
			({ data: this.bases } = await this.$httpSales.get(
				`catalog-sunat-details-list/${tableCode.IvaRate}`));
			this.bases = this.bases.map((base) => {
				const newBase = {
					id: base.id,
					code: base.code,
					description: base.description,
					percentage: base.percentage,
					value: 0,
				};
				return newBase;
			});
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			} else {
				this.showGenericError(err.data.message);
			}
		}
	}

	async function loadRetentionCodes() {
		const request = [
			this.$httpSales.get(`catalog-sunat-details-list/${tableCode.IvaRetention}`),
			this.$httpSales.get(`catalog-sunat-details-list/${tableCode.Retentions}`),
		];
		[{ data: this.ivaRetentionCodes }, { data: this.retentionCodes }] =
			await Promise.all(request);
		this.setAutoCompleteFieldOn('ivaRetentionCodes', this.ivaRetentionCodes);
		this.setAutoCompleteFieldOn('retentionCodes', this.retentionCodes);
	}

	function setAutoCompleteFieldOn(flag, retentionCodes) {
		this[flag] = map(
			setNewPropertyByFunction('autocomplete', this.addProperties, false),
			retentionCodes,
		);
	}

	function data() {
		return {
			bases: [],
			ivaRetentionCodes: [],
			retentionCodes: [],
			summary: [
				{
					id: 1,
					assets: 0,
					description: 'Imponible 0%',
					good: 0,
					service: 0,
					total: 0,
				},
				{
					id: 2,
					assets: 0,
					description: 'Imponible Grabada 0%',
					good: 0,
					service: 0,
					total: 0,
				},
				{
					id: 3,
					assets: 0,
					description: 'Imponible No Grabada 0%',
					good: 0,
					service: 0,
					total: 0,
				},
			],
			tableCodeRetentions: tableCode.IvaRetention,
		};
	}

	export default {
		name: 'sale-retention',
		components: {
			autocompleteComponent,
			dateComponent,
			modalSidebarButton,
		},
		computed: {
			disabled,
		},
		created,
		data,
		methods: {
			addProperties,
			itemVisible,
			loadBases,
			loadRetentionCodes,
			setAutoCompleteFieldOn,
		},
		props: {
			details: {
				default: () => [],
				type: Array,
			},
			isLoading: {
				default: false,
				type: Boolean,
			},
			retention: {
				default: () => {},
				type: Object,
			},
			retentionId: [Number, String],
			rentItemsValidate: {
				default: false,
				type: Boolean,
			},
		},
	};
</script>

<style lang="scss" scoped>
	.section-background {
		background-color: color(title-table);
	}

	.title-background {
		background-color: color(blue-grey);
	}

	.summary {
		background-color: map-get($colors, summary);
		border-bottom: 1px solid map-get($colors, blue-grey);
		border-right: 1px solid map-get($colors, blue-grey);

		.caption {
			font-weight: bold;
		}

		&-header {
			background-color: map-get($colors, summaryHeader);
			border-bottom: 1px solid map-get($colors, blue-grey);
		}

		&:last-of-type {
			border-right: 0px;
		}
	}

	.summary-block {
		bottom: 11vh;
		position: fixed;
		width: 100%;
	}

	.sale-retention {
		overflow: auto;
		padding-bottom: 230px;
	}

	.delete-item-btn {
		height: 37px !important;
	}
</style>