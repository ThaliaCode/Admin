<template>
	<div>
		<header-page
			caption-navigation="Notificaciones > Lista de procesos"
			:title="title"
		></header-page>
		<v-layout pa-5 mb-5>
			<v-flex xs5 pr-4>
				<group-notification
					:notifications="process"
					@assign-template="assignTemplate"
					@on-change="onChange"
				></group-notification>
			</v-flex>
			<v-flex xs7 pl-5>
				<image-notification />
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				@accept-button-clicked="openConfirmation('accept')"
				@cancel-button-clicked="openConfirmation('cancel')"
			/>
		</section>
		<v-dialog
			v-model="dialog"
			persistent
			max-width="425"
		>
			<v-card>
				<v-card-title class="headline justify-center">
					{{ text }}
				</v-card-title>
				<v-card-text class="subtext">
					{{ subtext }}
				</v-card-text>
				<v-card-actions class="btn-block">
					<v-layout row wrap justify-center>
						<v-flex xs6 pr-1 text-xs-right>
							<v-btn
								color="error"
								class="btn-action white--text"
								@click.native="closeDialog"
							>
								{{ leftBtnText }}
							</v-btn>
						</v-flex>
						<v-flex xs6 pl-1 text-xs-left>
							<v-btn
								color="success"
								class="btn-action white--text"
								@click.native="rightAction">
								{{ rightBtnText }}
							</v-btn>
						</v-flex>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>
<script>
import headerPage from '@/components/shared/header-page';
import groupNotification from '@/components/notification/group-notification';
import imageNotification from '@/components/notification/image-notification';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function created() {
	this.loadProcessDetail();
}

function assignTemplate({ indexNotification, indexTemplate, value }) {
	this.process = this.process.map((type, index) => {
		const newType = { ...type };
		if (index === indexNotification) {
			newType.templates = type.templates.map((template, indexT) => {
				const newTemplate = { ...template };
				newTemplate.flagActive = indexT === indexTemplate ? value : false;
				return newTemplate;
			});
		}
		return newType;
	});
}

function closeDialog() {
	this.dialog = false;
	this.leftBtnText = '';
	this.rightBtnText = '';
	this.subtext = '';
	this.text = '';
}

async function loadProcessDetail() {
	const params = { subsidiaryId: this.$route.query.subsidiaryId };
	({ data: this.process } = await this.$httpSales.get(`process/${this.id}`, { params }));
}

function onChange() {
	this.process = this.process.map((type) => {
		const newType = { ...type };
		if (!type.flagActive) {
			newType.templates = type.templates.map((template) => {
				const newTemplate = { ...template };
				newTemplate.flagActive = type.flagActive;
				return newTemplate;
			});
		}
		return newType;
	});
}

function openConfirmation(action) {
	this.action = action;
	this.text = action === 'cancel' ? 'Cancelar Asignación' : 'Guardar Asignación';
	this.subtext = action === 'cancel' ?
		'Al cancelar la asignación se perderá la selección realizada y se mostrará la configuración actual.' :
		'Si estás seguro de la selección y asignación realizada, puedes completar el proceso al aceptar. En caso contrario cierra el modal y modifica la configuración.';
	this.leftBtnText = 'Cerrar';
	this.rightBtnText = 'Aceptar';
	this.dialog = true;
}

function rightAction() {
	this.closeDialog();
	if (this.action === 'cancel') {
		this.goTo('list-of-process');
	} else {
		this.saveProcess();
	}
}

async function saveProcess() {
	const { ambit, name, moduleId, subsidiaryId } = this.$route.query;
	const body = {
		ambit,
		moduleId: Number(moduleId),
		name,
		typeNot: this.process.map(p => ({
			code: p.code,
			flagActive: p.flagActive,
			name: p.name,
			templates: p.templates.map(t => ({
				code: t.code,
				flagActive: t.flagActive,
				name: t.name,
			})),
		})),
	};
	const params = { subsidiaryId };
	try {
		await this.$httpSales.patch(`process/${this.id}`, body, { params });
		this.showNotification('La asignación de tipos de notificación y templates ha sido realizada correctamente.');
		this.goTo('list-of-process');
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function title() {
	const { subsidiaryName, name } = this.$route.query;
	const newSubsidiaryName = subsidiaryName.length > 20 ? `${subsidiaryName.substring(0, 20)}...`
		: subsidiaryName;
	return `Empresa ${newSubsidiaryName} - Proceso ${name} - ${this.$route.meta.title}`;
}

function data() {
	return {
		action: '',
		dialog: false,
		leftBtnText: '',
		process: [],
		rightBtnText: '',
		subtext: '',
		text: '',
	};
}

export default {
	name: 'page-assign-notification-type',
	components: {
		headerPage,
		groupNotification,
		imageNotification,
		modalSidebarButton,
	},
	computed: {
		title,
	},
	created,
	data,
	methods: {
		assignTemplate,
		closeDialog,
		loadProcessDetail,
		onChange,
		openConfirmation,
		rightAction,
		saveProcess,
	},
	props: {
		id: [Number, String],
	},
};
</script>
<style lang="scss" scoped>
	.headline {
		color: color(paginationText);
		font-family: font(open-semibold);
		font-size: size(medium) !important;
		letter-spacing: normal !important;
		line-height: 1 !important;
		margin: auto;
		max-width: 340px;
		padding-top: 37px !important;
		text-align: center;
	}

	.subtext {
		color: color(grey-border);
		font-family: font(open-regular);
		font-size: size(small) !important;
		letter-spacing: normal !important;
		line-height: 1 !important;
		margin: auto;
		max-width: 340px;
		padding: 0px !important;
		text-align: center;
	}
	
	.btn-block {
		padding-bottom: 24px !important;
		padding-top: 28px !important;
	}
</style>