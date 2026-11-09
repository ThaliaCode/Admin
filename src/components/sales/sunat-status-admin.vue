<template>
	<div>
		<v-layout wrap pa-5>
			<v-flex xs12 v-if="!taxDetail.code">
				No se encontró información de {{ labelsByCountry.taxAgency }}
				para este documento de venta.
			</v-flex>
			<v-flex xs12 v-else>
				<v-icon :color="stateColor">radio_button_checked</v-icon>
				<label class="body-2">Mensaje:</label>
				<span class="body-1">{{ taxDetail.message }}</span>
				<v-layout wrap pt-2 v-if="notesExist">
					<v-flex xs12>
						<label class="body-2">Notas:</label>
					</v-flex>
					<v-flex xs12 class="body-1"
						v-for="(note, index) in taxDetail.note" :key="index">
						{{ note }}
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				hidden
				success-color="pink"
				success-text="Cerrar"
				@accept-button-clicked="$emit('close')"
			/>
		</section>
	</div>
</template>

<script>
	import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

	function created() {
		this.loadData();
	}

	async function loadData() {
		try {
			({ data: this.taxDetail } = await this.$httpSales.get(
				`facturacion-sunat/${this.id}/document`));
			if (this.notesExist) {
				this.taxDetail.note = this.taxDetail.note.map((taxNote) => {
					const newTaxNote = taxNote.split('-');
					return `${newTaxNote[0]} - ${newTaxNote[1]}`;
				});
			}
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		}
	}

	function notesExist() {
		return this.taxDetail.note && this.taxDetail.note.length > 0;
	}

	function stateColor() {
		if (this.taxDetail.code) {
			return this.taxDetail.code === '0' ? 'success' : 'error';
		}
		return 'black';
	}

	function data() {
		return {
			taxDetail: {},
		};
	}

	export default {
		name: 'sunat-status-admin',
		components: {
			modalSidebarButton,
		},
		computed: {
			notesExist,
			stateColor,
		},
		created,
		data,
		methods: {
			loadData,
		},
		props: {
			id: [Number, String],
		},
	};
</script>
