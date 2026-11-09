<template>
	<v-layout wrap class="pt-40" pb-5>
		<v-flex xs12 px-4>
			<div class="title-slide primary--text lighten-2">
				Datos Generales
			</div>
		</v-flex>
		<v-flex xs12 class="pd-block">
			<v-layout wrap px-4 py-2>
				<v-flex xs4>
					<label class="label-slide">Documento:</label>
				</v-flex>
				<v-flex xs8>
					<span class="value-slide">{{ detailVendor.documentNumber }}</span>
				</v-flex>
			</v-layout>
			<v-layout wrap class="grey-column" px-4 py-2>
				<v-flex xs4>
					<label class="label-slide">Correo Electrónico:</label>
				</v-flex>
				<v-flex xs8>
					<span class="value-slide">{{ detailVendor.email }}</span>
				</v-flex>
			</v-layout>
			<v-layout wrap px-4 py-2>
				<v-flex xs4>
					<label class="label-slide">Teléfono:</label>
				</v-flex>
				<v-flex xs8>
					<span class="value-slide">{{ detailVendor.phone }}</span>
				</v-flex>
			</v-layout>
			<v-layout wrap class="grey-column" px-4 py-2>
				<v-flex xs4>
					<label class="label-slide">Dirección:</label>
				</v-flex>
				<v-flex xs8>
					<span class="value-slide">{{ detailVendor.addressSeller }}</span>
				</v-flex>
			</v-layout>
		</v-flex>
		<v-flex xs12 px-4>
			<div class="title-slide primary--text lighten-2">
				Permisos
			</div>
		</v-flex>
		<v-flex xs12 class="pd-block">
			<v-layout wrap px-4 py-2>
				<v-flex xs4>
					<label class="label-slide">Tiendas:</label>
				</v-flex>
				<v-flex xs8>
					<span class="value-slide">{{ detailVendor.warehousesText }}</span>
				</v-flex>
			</v-layout>
		</v-flex>
		<v-flex xs12 px-4>
			<div class="title-slide primary--text lighten-2">
				Configuración
			</div>
		</v-flex>
		<v-flex xs12 class="pd-block">
			<v-layout wrap px-4 py-2>
				<v-flex xs4>
					<label class="label-slide">Supervisor:</label>
				</v-flex>
				<v-flex xs8>
					<span class="value-slide">{{ detailVendor.typeSeller === supervisor ? 'Sí' : 'No' }}</span>
				</v-flex>
			</v-layout>
			<v-layout wrap class="grey-column" px-4 py-2>
				<v-flex xs4>
					<label class="label-slide">Tiempo de Trazabilidad:</label>
				</v-flex>
				<v-flex xs8>
					<span class="value-slide">{{ detailVendor.timeTracking }}</span>
				</v-flex>
			</v-layout>
			<v-layout wrap px-4 py-2>
				<v-flex xs4>
					<label class="label-slide">Cerco Perimétrico:</label>
				</v-flex>
				<v-flex xs8>
					<span class="value-slide">{{ getValue(detailVendor.settings, 'perimeterSiege') }}</span>
				</v-flex>
			</v-layout>
			<v-layout wrap class="grey-column" px-4 py-2>
				<v-flex xs4>
					<label class="label-slide">Traza Transacciones:</label>
				</v-flex>
				<v-flex xs8>
					<v-layout row wrap align-center>
						<v-flex xs12>
							<span class="value-slide">{{ traceabilityTimeDetail }}</span>
						</v-flex>
						<v-flex xs12>
							<span v-for="(item, index) in employeeActions" :key="index">
								<span
									class="value-slide mr-2"
									v-if="detailVendor.settings.traceabilityTime && item.value"
								>
									({{ item.name }})
								</span>
							</span>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
			<v-layout
				row wrap
				v-for="(item, index) in detailVendor.settings ? detailVendor.settings.modules : []"
				:key="index"
			>
				<v-flex xs12>
					<v-layout wrap px-4 py-2>
						<v-flex xs4>
							<label class="label-slide">Cuota de {{ item.name }}:</label>
						</v-flex>
						<v-flex xs8>
							<span>
								<template v-if="item.value">
									<span class="value-slide ml-2">{{ item.amount }}</span>
									<span class="value-slide">{{ item.period }}</span>
								</template>
							</span>
						</v-flex>
					</v-layout>
					<v-layout wrap px-4 py-2 class="grey-column">
						<v-flex xs4>
							<label class="label-slide">Comisión por Cuota:</label>
						</v-flex>
						<v-flex xs8>
							<span>
								<template v-if="item.value">
									<span class="value-slide ml-2">
										<template v-if="item.typeCommission === amountCommission">
											{{ currency }}
										</template>
										{{ item.amountCommission }}<template v-if="item.typeCommission === percentageCommission">%</template>
									</span>
								</template>
							</span>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
		</v-flex>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				hidden
				success-text="Cerrar"
				success-color="error"
				@accept-button-clicked="$emit('close-slide')"
			/>
		</section>
	</v-layout>
</template>

<script>
	import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
	import TypeCommission from '@/shared/type-commission';
	import TypeSeller from '@/shared/type-seller';

	function created() {
		this.getDetailVendor();
	}

	function commercialRatios() {
		return this.detailVendor.settings && this.detailVendor.settings.monthlyShare ?
			this.detailVendor.settings.monthlyShare.comercialRatios : [];
	}

	function employeeActions() {
		return this.detailVendor.employee && this.detailVendor.employee.configFilters ?
			this.detailVendor.employee.configFilters.actions : [];
	}

	async function getDetailVendor() {
		try {
			const { data: vendor } = await this.$httpSales.get(`sellers/${this.vendorId}`);
			vendor.warehousesText = vendor.warehousesText ||
				vendor.warehouses.map(w => w.name).join(', ');
			this.detailVendor = { ...vendor };
			const tracebility =
				this.detailVendor.settings ? this.detailVendor.settings.traceabilityTime : null;
			this.traceabilityTimeDetail = tracebility ? 'Sí' : 'No';
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		}
	}

	function getValue(settings, prop, value) {
		if (settings) {
			if (value) {
				return settings[prop] ? settings[prop][value] : 0;
			}
			return settings[prop] ? 'Sí' : 'No';
		}
		return '-';
	}

	function data() {
		return {
			amountCommission: TypeCommission.Amount,
			detailVendor: {
				settings: {},
			},
			percentageCommission: TypeCommission.Percentage,
			supervisor: TypeSeller.Supervisor,
			traceabilityTimeDetail: '',
		};
	}

	export default {
		name: 'vendors-detail',
		components: {
			modalSidebarButton,
		},
		computed: {
			employeeActions,
			commercialRatios,
		},
		created,
		data,
		methods: {
			getDetailVendor,
			getValue,
		},
		props: {
			currency: String,
			vendorId: Number,
		},
	};
</script>

<style lang="scss" scoped>
	.title-slide {
		border-bottom: 1px solid color(border-footer);
		font-family: font(open-bold);
		font-size: size(small13);
		text-transform: uppercase;
	}

	.grey-column {
		background-color: color(background-card);
	}

	.label-slide {
		color: color(paginationText);
		font-family: font(open-bold);
		font-size: size(small);
	}

	.value-slide {
		color: color(paginationText);
		font-family: font(open-regular);
		font-size: size(small);
	}

	.pt-40 {
		padding-top: 40px;
	}

	.pd-block {
		padding-bottom: 40px;
		padding-top: 17px;
	}
</style>