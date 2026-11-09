<template>
	<v-layout row wrap py-2 px-4>
		<v-flex xs12 v-if="vendor.settings">
			<v-layout row wrap px-4 py-2 align-center class="border-primary" v-if="$route.name === 'new-vendor'">
				<v-flex xs10>
					<label class="title-settings">
						Supervisor
					</label>
				</v-flex>
				<v-flex xs2 text-xs-right>
					<v-switch
						hide-details
						class="body-1 ml-auto"
						color="success"
						:true-value="supervisor"
						:false-value="regularVendor"
						v-model="vendor.typeSeller"
					></v-switch>
				</v-flex>
			</v-layout>
			<v-layout row wrap px-4 py-2 align-center class="border-primary">
				<v-flex xs10>
					<label class="title-settings">
						Tiempo de Trazabilidad
						<app-tooltip-button
							color="primary"
							icon="help_outline"
							text="Ayuda"
							@click-icon="$emit('click-icon', 'traceabilityTime')"
						></app-tooltip-button>
					</label>
				</v-flex>
					<v-flex xs2>
                            <v-switch
                                hide-details
                                class="body-1 ml-auto"
                                color="success"
                                v-model="vendor.settings.showTraceabilityTime"
                            ></v-switch>
                        </v-flex>
				<v-flex xs4 v-if="vendor.settings.showTraceabilityTime">
					<v-layout>
						<v-flex xs7>
							<app-select
								:item="vendor.settings.traceabilityTime"
								:items="time"
								model="traceabilityTime"
								@input="$emit('set-value', { moduleData: $event })"
							></app-select>
						</v-flex>
						<v-flex xs2 text-xs-right>
							Min
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
			<v-layout row wrap px-4 py-2 align-center class="border-primary">
				<v-flex xs10>
					<label class="title-settings">
						Trabajar con rutas libres
					</label>
				</v-flex>
					<v-flex xs2>
						<v-switch
               hide-details
               class="body-1 ml-auto"
               color="success"
               v-model="vendor.settings.flagWorkWithFreeRoute"
						/>
          </v-flex>
			</v-layout>
			<v-layout row wrap px-4 py-2 align-center class="border-primary" v-if="$route.name === 'new-vendor'">
				<v-flex xs10>
					<label class="title-settings">
						Cerco perimétrico
						<app-tooltip-button
							color="primary"
							icon="help_outline"
							text="Ayuda"
							@click-icon="$emit('click-icon', 'perimeterSiege')"
						></app-tooltip-button>
					</label>
				</v-flex>
				<v-flex xs2>
					<v-switch
						hide-details
						class="body-1 ml-auto"
						color="success"
						v-model="vendor.settings.perimeterSiege"
					></v-switch>
				</v-flex>
			</v-layout>
			<v-layout row wrap pb-1 mb-1 align-center>
				<v-flex xs12 px-4 py-2 class="border-primary">
					<v-layout wrap align-center>
						<v-flex xs10>
							<label class="title-settings">
								Comisiones por Transacciones
								<app-tooltip-button
									color="primary"
									icon="help_outline"
									text="Ayuda"
									@click-icon="$emit('click-icon', 'transactionTraceability')"
								></app-tooltip-button>
							</label>
						</v-flex>
						<v-flex xs2>
							<v-switch
								hide-details
								class="body-1 ml-auto"
								color="success"
								v-model="vendor.settings.transactionsTraceability"
							></v-switch>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs12 v-if="vendor.settings.transactionsTraceability">
					<v-layout
						class="border-primary"
						row wrap align-center py-1
						v-for="(module, index) in modules"
						:key="index"
					>
						<v-flex xs12 px-4>
							<v-checkbox
								color="success"
								hide-details
								:label="module.name"
								v-model="module.value"
								@change="$emit('on-change', { module, model: 'value', value: $event, index })"
							></v-checkbox>
						</v-flex>
						<v-flex
							xs12 px-5
							v-if="module.value"
							class="background-grey"
						>
							<v-layout row wrap py-1 px-2>
								<v-flex xs5 pr-2>
									<app-select
										:item="module.period"
										:items="periods"
										label="Período"
										model="period"
										@input="$emit('set-value', { moduleData: $event, index })"
									></app-select>
									<span v-if="module.value && !module.period" class="error--text caption">
										El período es requerido
									</span>
								</v-flex>
								<v-flex xs5 pl-2>
									<app-input-text
										label="Cuota"
										model="amount"
										:text="module.amount"
										type="number"
										@input="$emit('set-value', { moduleData: $event, index })"
									></app-input-text>
									<span v-if="module.value && !module.amount" class="error--text caption">
										La cuota es requerida
									</span>
								</v-flex>
							</v-layout>
							<v-flex xs12 py-1 px-2>
								<v-checkbox
									class="checkbox-vendor"
									color="success"
									hide-details
									label="Comisión por cuota"
									v-model="module.flagCommission"
									@change="$emit('on-change', { module, model: 'flagCommission', value: $event, index })"
								></v-checkbox>
							</v-flex>
						</v-flex>
						<v-flex
							xs12 pb-2 px-5
							v-if="module.value && module.flagCommission"
							class="background-grey"
						>
							<v-layout row wrap px-2>
								<v-flex xs5 pl-1 pr-2>
									<app-input-text
										:text="module.amountCommission"
										type="number"
										model="amountCommission"
										@input="$emit('set-value', { moduleData: $event, index })"
									></app-input-text>
									<span
										v-if="module.value && module.flagCommission && !module.amountCommission"
										class="error--text caption"
									>
										El monto es requerido
									</span>
								</v-flex>
								<v-flex xs7 pl-2>
									<v-layout row wrap>
										<v-flex xs6>
											<span class="switch-text">Modo de comisión</span>
										</v-flex>
										<v-flex xs6>
											<switch-vendor
												model="typeCommission"
												:false-value="1"
												:model-value="module.typeCommission"
												:true-value="2"
												@on-switch-change="$emit('on-switch-change', { moduleData: $event, index })"
											></switch-vendor>
										</v-flex>
									</v-layout>
								</v-flex>
							</v-layout>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
			<v-layout row wrap v-if="$route.name === 'new-distributor'">
				<v-flex xs12 px-4 mt-2>
				<app-select
					:item="vendor.subsidiaryId"
					item-text="sucursalName"
					item-value="id"
					:items="subsidiaries"
					label="Sucursales"
					model="subsidiaryId"
					:return-object="false"
					@input="$emit('on-input', $event)"
				></app-select>
				<span class="error--text caption" v-if="!vendor.subsidiaryId">
					Se requiere seleccionar una sucursal
				</span>
				</v-flex>
			</v-layout>
			<v-layout row wrap v-if="$route.name === 'new-distributor'">
				<v-flex xs12 px-4 mt-2>
					<app-select
						chips
						multiple
						:disabled="!vendor.subsidiaryId"
						:item="vendor.warehousesMultiple"
						item-text="name"
						item-value="id"
						:items="warehouses"
						label="Almacen"
						model="warehousesMultiple"
						@input="$emit('on-input', $event)"
					></app-select>
				</v-flex>
			</v-layout>
			<v-layout row wrap py-2 align-center
				v-if="$route.name === 'new-vendor' || ($route.name === 'new-distributor' && this.vendor.flagLimitUsers)">
				<v-flex xs12 px-4>
					<label class="title-settings">
						Seleccionar Puntos de Venta
					</label>
				</v-flex>
				<v-flex xs12>
					<multiple-select
						heading
						item-text="name"
						item-value="id"
						:item-default="vendor.terminals.find(t => t.flagDefault)"
						:items="salePoints"
						max-height="211"
						placeholder="Puntos de Venta"
						:value="vendor.terminals"
						return-object
						:items-selected="salePointsSelected"
						@click.native="$emit('on-select-click')"
						@input="$emit('on-input', { value: $event, model: 'terminals' })"
						@delete-item="$emit('delete-sale-point', $event)"
						@on-click="$emit('on-click', $event)"
					></multiple-select>
					<span
						class="error--text caption ml-4"
						v-if="vendor.terminals.length === 0"
					>
						Seleccione uno o más puntos de venta
					</span>
				</v-flex>
			</v-layout>
			<v-layout mt-3 row wrap align-center v-if="$route.name === 'new-distributor'">
				<v-flex xs12 px-4>
					<app-select
					:items="listTransport"
					item-text="autocomplete"
					item-value="id"
					place-holder="Seleccionar Transporte"
					:item="vendor.vehicleId"
					model="vehicleId"
					label="Transportista"
					@input="$emit('on-vehicle', $event)"
					></app-select>
				</v-flex>
			</v-layout>
		</v-flex>
	</v-layout>
</template>

<script>
	import multipleSelect from '@/components/shared/selectors/multiple-select';
	import switchVendor from '@/components/field-sale/vendors/switch-vendor';
	import TypeSeller from '@/shared/type-seller';

	function data() {
		return {
			regularVendor: TypeSeller.Vendor,
			supervisor: TypeSeller.Supervisor,
			time: [10, 15, 30, 60],
		};
	}

	export default {
		name: 'vendors-settings',
		components: {
			multipleSelect,
			switchVendor,
		},
		data,
		props: {
			actions: {
				default: () => {},
				type: Object,
			},
			currency: String,
			modules: {
				default: () => [],
				type: Array,
			},
			modulesDisabled: {
				default: false,
				type: Boolean,
			},
			salePoints: {
				default: () => [],
				type: Array,
			},
			warehouses: {
				default: () => [],
				type: Array,
			},
			subsidiaries: {
				default: () => [],
				type: Array,
			},
			salePointsSelected: {
				default: () => [],
				type: Array,
			},
			vendor: {
				default: () => {},
				type: Object,
			},
			periods: {
				default: () => [],
				type: Array,
			},
			listTransport: {
				default: () => [],
				type: Array,
			},
		},
	};
</script>

<style lang="scss" scoped>
	.title-settings {
		color: color(paginationText);
		font-family: font(open-bold);
		font-size: size(small13);
	}

	.border-primary {
		border-bottom: 1px solid color(primary);
	}

	.ml-auto {
		margin-left: auto;
		max-width: 36px !important;
	}

	.background-grey {
		background-color: color(background-vendor) !important;
	}

	.switch-text {
		color: color(paginationText);
		font-family: font(open-regular);
		font-size: size(small13);
	}
</style>
