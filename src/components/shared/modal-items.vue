<template>
	<v-layout wrap class="modal-items">
		<v-flex xs12 class="modal-items-title">
			<v-layout justify-space-between align-center>
				<v-flex xs11 class="pr-2">
					<span>{{ title }}</span>
				</v-flex>
				<v-flex xs1 v-if="showClose">
					<button @click="$emit('close-modal')" text-xs-right>
						<v-icon color="primary">clear</v-icon>
					</button>
				</v-flex>
				<v-flex xs1 v-if="showExcel">
					<v-tooltip left>
						<v-btn
							@click="$emit('download-excel')"
							slot="activator"
							class="header-page-download-document primary btn-auto py-1 px-1 mr-3"
						>
							<img src="/static/img/excel.svg" alt="download" height="17" />
						</v-btn>
						<span>Descargar Detalle</span>
					</v-tooltip>
				</v-flex>
			</v-layout>
		</v-flex>
		<v-flex xs12 v-if="showSlot">
			<slot></slot>
		</v-flex>
		<v-flex xs12 v-else>
			<p v-if="showSelect" class="text-dialog py-3 px-3 mb-0">
				{{ labelValidated(items) }}
			</p>
			<v-layout wrap pb-2 class="max-h-container">
				<v-flex xs12 class="modal-items-all px-24">
					<v-checkbox
						v-if="items.length > 0"
						color="success"
						hide-details
						label="Seleccionar todo"
						v-model="selectAll"
						@change="changeAll"
					></v-checkbox>
				</v-flex>
				<v-flex v-for="item in items" :key="item.id" xs12 class="px-24">
					<v-checkbox
						color="success"
						hide-details
						:label="item[labelCheck]"
						:value="item[labelValue]"
						v-model="selectChecks"
					></v-checkbox>
				</v-flex>
				<v-flex> </v-flex>
			</v-layout>
		</v-flex>
		<v-flex xs12 v-if="showButtons" text-xs-center class="modal-items-action">
			<button
				@click="$emit('close-modal')"
				class="modal-items-btn--cancel"
				v-if="showBtnCancel"
			>
				{{ nameCancel }}
			</button>
			<button
				v-if="showUtility"
				@click="$emit('action-modal', selectChecks)"
				class="modal-items-btn"
				:disabled="!selectChecks.length >= 1"
			>
				{{ nameAction }}
			</button>
			<button
				v-if="showRegular"
				@click="$emit('action-modal', selectChecks)"
				class="modal-items-btn"
				:disabled="disabled"
			>
				{{ nameAction }}
			</button>
		</v-flex>
	</v-layout>
</template>
<script>
// function selectItems(values) {
// 	if (values.length) {
// 		if (this.returnObject) {
// 			this.selectChecks = values.map(s => s[this.labelValue]);
// 		} else {
// 			this.selectChecks = [...values];
// 		}
// 	} else {
// 		this.selectChecks = [];
// 	}
// }

function selectChecks(values) {
	const total = this.items.every((i) =>
		values.find((v) => v === i[this.labelValue])
	);
	this.selectAll = total;
}

function changeAll(value) {
	this.selectChecks = value ? this.items.map((i) => i[this.labelValue]) : [];
}

function created() {
	if (this.selectItems.length) {
		if (this.returnObject) {
			this.selectChecks = this.selectItems.map((s) => s[this.labelValue]);
		} else {
			this.selectChecks = [...this.selectItems];
		}
	} else {
		this.selectChecks = [];
	}
}

function labelValidated(rows) {
	if (rows.length > 0) {
		return 'Selecciona la tienda donde se realizará el cambio de precio.';
	}
	return 'La empresa seleccionada no cuenta con tiendas relacionadas.';
}

function data() {
	return {
		selectAll: false,
		selectChecks: [],
	};
}

export default {
	name: 'modal-items',
	data,
	created,
	methods: {
		changeAll,
		labelValidated,
	},
	watch: {
		// selectItems,
		selectChecks,
	},
	props: {
		title: String,
		showSelectAll: {
			type: Boolean,
			default: false,
		},
		items: {
			type: Array,
			default: () => [],
		},
		nameAction: {
			type: String,
			default: 'Agregar',
		},
		labelCheck: {
			type: String,
			default: 'name',
		},
		labelValue: {
			type: String,
			default: 'code',
		},
		returnObject: {
			type: Boolean,
			default: true,
		},
		selectItems: {
			type: Array,
			default: () => [],
		},
		deleteRepet: {
			type: Boolean,
			default: false,
		},
		showSlot: {
			type: Boolean,
			default: false,
		},
		disabled: {
			type: Boolean,
			default: false,
		},
		showBtnCancel: {
			type: Boolean,
			default: true,
		},
		showClose: {
			type: Boolean,
			default: true,
		},
		showButtons: {
			type: Boolean,
			default: true,
		},
		nameCancel: {
			type: String,
			default: 'Cancelar',
		},
		showSelect: {
			type: Boolean,
			default: false,
		},
		labelNotExist: {
			type: String,
			default: '',
		},
		showUtility: {
			type: Boolean,
			default: false,
		},
		showRegular: {
			type: Boolean,
			default: true,
		},
		showExcel: {
			type: Boolean,
			default: false,
		},
	},
};
</script>
<style lang="scss" scoped>
.modal-items {
	background: color(white);
	box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.5);
	color: color(paginationText);
	font-size: 14px;

	&-title {
		background-color: rgba(195, 231, 232, 0.21);
		color: color(primary);
		font-weight: 600;
		padding: 13px 29px;
		text-transform: uppercase;
	}

	&-all {
		background-color: rgba(195, 231, 232, 0.5);
		padding: 9px 0;
	}

	&-btn {
		border: 1px solid color(primary);
		border-radius: 5px;
		color: color(primary);
		font-weight: 600;
		padding: 4px 15px;

		&--cancel {
			border: 1px solid color(error);
			border-radius: 5px;
			color: color(error);
			font-weight: 600;
			margin-right: 20px;
			padding: 4px 15px;
		}

		&--success {
			border: 1px solid color(primary);
			border-radius: 5px;
			color: color(primary);
			font-weight: 600;
			margin-right: 20px;
			padding: 4px 15px;
		}
	}

	&-action {
		background-color: rgba(195, 231, 232, 0.21);
		padding: 15px 0;
	}
}

.px-24 {
	padding: 0 24px;
}

.max-h-container {
	max-height: 329px;
	overflow-y: scroll;
}

.text-dialog {
	background-color: #c3e7e8;
	color: color(primary);
	font-family: map-get($fonts, lato-regular);
	font-size: 12px;
}
</style>
