<template>
	<div>
		<v-layout wrap pa-4>
			<v-flex xs12>
				<app-select
					:item="statusOrcId"
					item-text="name"
					item-value="id"
					:items="status"
					label="Estado"
					model="statusOrcId"
					:return-object="false"
					@input="onInput"
				/>
				<span class="form-group__message" v-if="$v.statusOrcId.$invalid">
					El estado es requerido
				</span>
			</v-flex>
			<v-flex xs12 v-if="statusAccept">
				<v-layout wrap mt-3 mb-2 align-center>
					<v-flex xs4 class="caption">Ingresar Mercadería:</v-flex>
					<v-flex xs8 pl-2>
						<v-switch
							color="success"
							:label="labelSwitch"
							hide-details
							v-model="flagTransferOrc"
						></v-switch>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12 v-if="flagTransferOrc">
				<app-select
					:item="typeTransferKardex"
					item-text="name"
					item-value="id"
					:items="types"
					label="Tipo de Ingreso"
					model="typeTransferKardex"
					:return-object="false"
					@input="onInput"
				/>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="$v.$invalid"
				@cancel-button-clicked="$emit('close')"
				@accept-button-clicked="$emit('save',
					{ flagTransferOrc, statusOrcId, typeTransferKardex })"
			/>
		</section>
	</div>
</template>

<script>
	import { minValue, required, requiredIf } from 'vuelidate/lib/validators';
	import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

	function created() {
		this.loadResources();
	}

	function flagTransferOrc(flag) {
		this.typeTransferKardex = Number(flag);
	}

	function labelSwitch() {
		return this.flagTransferOrc ? 'Sí' : 'No';
	}

	async function loadResources() {
		const request = [
			this.$httpSales.get('status-orc'),
			this.$httpSales.get('type-transfer-kardex'),
		];
		try {
			[{ data: this.status }, { data: this.types }] = await Promise.all(request);
			this.status = this.status.filter(s => s.name !== 'Pendiente');
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		}
	}

	function onInput({ model, value }) {
		this[model] = value;
	}

	function statusAccept() {
		return this.statusOrcId === 2;
	}

	function validations() {
		return {
			statusOrcId: {
				minValue: minValue(1),
				required,
			},
			typeTransferKardex: {
				minValue: minValue(Number(this.flagTransferOrc)),
				required: requiredIf(() => this.flagTransferOrc),
			},
		};
	}

	function data() {
		return {
			flagTransferOrc: false,
			statusOrcId: null,
			typeTransferKardex: 0,
			status: [],
			types: [],
		};
	}

	export default {
		name: 'purchases-update-state',
		components: {
			modalSidebarButton,
		},
		computed: {
			labelSwitch,
			statusAccept,
		},
		created,
		data,
		methods: {
			onInput,
			loadResources,
		},
		validations,
		watch: {
			flagTransferOrc,
		},
	};
</script>
