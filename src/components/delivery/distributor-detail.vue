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
					<span class="value-slide">{{ detailVendor.address }}</span>
				</v-flex>
			</v-layout>
		</v-flex>
		<v-flex xs12 px-4>
			<div class="title-slide primary--text lighten-2">
				Configuración
			</div>
		</v-flex>
		<v-flex xs12 class="pd-block">
			<v-layout wrap class="grey-column" px-4 py-2>
				<v-flex xs4>
					<label class="label-slide">Tiempo de Trazabilidad:</label>
				</v-flex>
				<v-flex xs8>
					<span class="value-slide">{{ detailVendor.timeTracking }} min</span>
				</v-flex>
			</v-layout>
			<v-layout wrap px-4 py-2>
				<v-flex xs4>
					<label class="label-slide">Traza Transacciones:</label>
				</v-flex>
				<v-flex xs8>
					<v-layout row wrap align-center>
						<v-flex xs12>
							<span class="value-slide">{{ traceabilityTimeDetail }}</span>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
			<v-layout wrap class="grey-column" px-4 py-2>
				<v-flex xs4>
					<label class="label-slide">Cuota de Pedidos:</label>
				</v-flex>
				<v-flex xs8>
					<span class="value-slide">{{ getShare }}</span>
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

	function created() {
		this.getDetailDistributor();
	}

	async function getDetailDistributor() {
		try {
			const { data: vendor } = await this.$httpSales.get(`delivery/${this.vendorId}`);
			this.detailVendor = { ...vendor };
			const tracebility =
				this.detailVendor.settings ? this.detailVendor.settings.traceabilityTransaction : null;
			this.traceabilityTimeDetail = tracebility ? 'Sí' : 'No';
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		}
	}

	function getShare() {
		if (this.detailVendor.settings && this.detailVendor.settings.modules) {
			return this.detailVendor.settings.modules.length === 1 ?
				this.detailVendor.settings.modules[0].amountCommission : null;
		}
		return null;
	}

	function data() {
		return {
			detailVendor: {
				settings: {},
			},
			traceabilityTimeDetail: '',
		};
	}

	export default {
		name: 'vendors-detail',
		components: {
			modalSidebarButton,
		},
		computed: {
			getShare,
		},
		created,
		data,
		methods: {
			getDetailDistributor,
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