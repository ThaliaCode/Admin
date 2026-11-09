<template>
	<div>
		<v-tabs v-model="active" color="primary" right slider-color="blue darken-1">
			<v-tab href="#tab-sales" class="caption white--text"> Comentario </v-tab>
			<v-tab href="#tab-origin" class="caption white--text"> Orígenes </v-tab>
			<v-tab href="#tab-refund" class="caption white--text"> Tareas </v-tab>
			<v-tab href="#tab-products" class="caption white--text">
				Consideraciones
			</v-tab>
			<v-tab href="#tab-guide" class="caption white--text">
				Datos de Guía
			</v-tab>
			<v-tab-item id="tab-sales">
				<app-input-text
					class="px-3 pt-3"
					textarea
					no-resize
					label="Comentario"
					model="commentary"
					:text="data.commentary"
					@input="setData"
				/>
			</v-tab-item>
			<v-tab-item id="tab-origin">
				<app-select
					class="px-3 pt-3"
					:item="body.referenceExternalId"
					item-text="name"
					item-value="id"
					:items="origins"
					label="Origen"
					model="referenceExternalId"
					:return-object="false"
					@input="setData"
				/>
			</v-tab-item>
			<v-tab-item id="tab-refund">
				<app-issues :data="data.workToDo" edit @add-issues="addIssues" />
			</v-tab-item>
			<v-tab-item id="tab-products">
				<app-considerations
					:data="data.considerations"
					edit
					@add-considerations="addConsiderations"
				/>
			</v-tab-item>
			<v-tab-item id="tab-guide">
				<v-layout wrap column pt-3 px-3>
					<v-flex
						>Departamento:
						<span class="ml-2">{{ additionalSales.departament }}</span>
					</v-flex>
					<v-flex mt-2
						>Provincia:
						<span class="ml-2">{{ additionalSales.province }}</span></v-flex
					>
					<v-flex mt-2
						>Distrito:
						<span class="ml-2">{{ additionalSales.district }}</span></v-flex
					>
					<v-flex mt-2
						>Dirección de Entrega:
						<span class="ml-2">
							{{ additionalSales.destination }}
						</span></v-flex
					>
					<v-flex mt-2
						>Nombre de Empresa de Transporte:
						<span class="ml-2"> {{ additionalSales.nameAgency }}</span></v-flex
					>
					<v-flex mt-2
						>Dirección de Empresa de Transporte:
						<span class="ml-2">{{
							additionalSales.addressAgency
						}}</span></v-flex
					>
					<v-flex mt-2
						>DNI de Atención: <span class="ml-2"></span
						>{{ additionalSales.numberAtention }}</v-flex
					>
					<v-flex mt-2
						>Nombre de Atención: <span class="ml-2"></span
						>{{ additionalSales.nameAtention }}</v-flex
					>
					<v-flex mt-2
						>Teléfono de Atención: <span class="ml-2"></span
						>{{ additionalSales.phoneAtention }}</v-flex
					>
				</v-layout>
			</v-tab-item>
		</v-tabs>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="disabled"
				@accept-button-clicked="$emit('edit-comentary', body, false)"
				@cancel-button-clicked="$emit('cancel-button-clicked')"
			/>
		</section>
	</div>
</template>
<script>
import appConsiderations from '@/components/shared/sales/app-considerations';
import appIssues from '@/components/shared/sales/app-issues';
import appComents from '@/components/shared/sales/app-coments';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function data() {
	return {
		active: null,
		body: {
			commentary: '',
			considerations: [],
			workToDo: [],
			referenceExternalId: null,
		},
		newIssue: true,
		newConsideration: true,
	};
}

function setData({ model, value }) {
	if (value) {
		this.body[model] = value;
	}
}

function comments(value) {
	this.body.commentary = value;
}

function addIssues(issues) {
	this.body.workToDo = [...issues];
}

function addConsiderations(considerations) {
	this.body.considerations = [...considerations];
}

function created() {
	this.body.commentary = this.data.commentary;
	this.body.workToDo = [...this.data.workToDo];
	this.body.considerations = [...this.data.considerations];
	const referenceExternal = this.origins.find(
		(o) => o.code === this.data.referenceExternal
	);
	this.body.referenceExternalId = referenceExternal && referenceExternal.id;
}

export default {
	name: 'edit-comentary',
	data,
	components: {
		appConsiderations,
		appIssues,
		appComents,
		modalSidebarButton,
	},
	created,
	methods: {
		comments,
		addIssues,
		addConsiderations,
		setData,
	},
	props: {
		data: {
			type: [Array, Object],
			default: () => {},
		},
		disabled: {
			default: false,
			type: Boolean,
		},
		additionalSales: {
			type: Object,
			default: () => {},
		},
		origins: {
			type: Array,
			default: () => [],
		},
	},
};
</script>
