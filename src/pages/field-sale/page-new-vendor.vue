<template>
	<div>
		<app-loading
			:show-loading="loadingGeneral"
			label="Se esta buscando al cliente, la carga terminará en un momento."
		/>
		<header-page
			:caption-navigation="captionNavigation"
			:title="this.id ? 'Editar Vendedor' : $route.meta.title"
		></header-page>
		<vendors-form
			:allowed-warehouses="vendor.warehouses"
			:create-password="createPassword"
			:currency="currency"
			:disabled-email="disabledEmail"
			:document-types="personTypes"
			:groups="groups"
			:is-valid="isValid"
			:modules="vendor.settings.modules"
			:modules-disabled="modulesDisabled"
			:periods="periods"
			:sale-points="salePoints"
			:sale-points-selected="salePointsSelected"
			:validations="$v.vendor"
			:vendor="vendor"
			:warehouses="warehouses"
			:warehouses-selected="warehousesSelected"
			:list-transport="listTransport"
			:subsidiaries="subsidiaries"
			:valid-licence="showValidNumber"
			:id-vendor="Number(id)"
			:type-transport-code="typeTransportCode"
			:disabled-btn="disabledBtn"
			@cancel-form="cancelForm"
			@click-icon="onClickIcon"
			@delete-sale-point="deleteSalePoint"
			@delete-warehouse="deleteWarehouse"
			@on-change="onChange"
			@on-select-click="onSelectClick"
			@on-click="onClick"
			@on-input="onInput"
			@on-switch-change="setValue"
			@set-value="setValue"
			@save-form="saveForm"
			@on-vehicle="setValueVehicle"
		></vendors-form>
		<v-dialog v-model="modalTerminalExist" persistent max-width="625">
			<v-card class="modal">
				<v-card-title class="title-card justify-center text-center">
					<span class="title-text">Terminales usadas por otros usuarios</span>
				</v-card-title>
				<span class="mesage-error ml-4"
					>Las siguientes terminales ya estan en uso por otros usuarios.</span
				>
				<app-table
					class="pa-0 mb-4 mt-2"
					name="terminal-exist"
					:inputSearch="false"
					:filterColumns="false"
					:rows="detailsErrorTerminal"
					:selectable="false"
					:show-pagination="true"
					:columns="columns"
				>
					<template slot="rows" slot-scope="props">
						<td class="is-not-selectable" v-show="showRow(columns, 1)">
							{{ props.row.code }}
						</td>
						<td v-show="showRow(columns, 2)">{{ props.row.name }}</td>
						<td v-show="showRow(columns, 3)">{{ props.row.lastname }}</td>
						<td v-show="showRow(columns, 4)">
							{{ props.row.documentNumber || '-' }}
						</td>
						<td v-show="showRow(columns, 5)">{{ props.row.nameTerminal }}</td>
					</template>
				</app-table>
				<v-card-actions class="justify-center pb-3">
					<v-btn
						class="btn-action"
						color="pink"
						type="button"
						@click="closeModal"
						small
					>
						Atras
						<v-icon color="white" size="16" class="ml-1">
							highlight_off
						</v-icon>
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-dialog v-model="dialog" persistent max-width="525">
			<v-card>
				<v-card-title
					class="headline"
					:class="successAction ? 'justify-start' : 'justify-center'"
				>
					{{ message }}
				</v-card-title>
				<v-card-text class="subtext" v-if="subtext">
					{{ subtext }}
				</v-card-text>
				<v-card-actions class="btn-block">
					<v-layout row wrap justify-center>
						<v-flex
							xs6
							pr-1
							:class="successAction ? 'text-xs-right' : 'text-xs-center'"
						>
							<v-btn
								:color="btnLeftColor"
								class="btn-action white--text"
								@click.native="btnLeftEvent"
							>
								{{ btnLeftText }}
							</v-btn>
						</v-flex>
						<v-flex xs6 pl-1 text-xs-left v-if="successAction">
							<v-btn
								:color="btnRightColor"
								class="btn-action white--text"
								@click.native="btnRightEvent"
							>
								{{ btnRightText }}
							</v-btn>
						</v-flex>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
import {
	email,
	maxLength,
	minLength,
	minValue,
	required,
	requiredIf,
} from 'vuelidate/lib/validators';
import headerPage from '@/components/shared/header-page';
import helper from '@/shared/helper';
import vendorsForm from '@/components/field-sale/vendors/vendors-form';
import typeEntityId from '@/shared/type-entity';
import TypeSeller from '@/shared/type-seller';
import appTable from '@/components/shared/table/app-table';

function created() {
	if (this.$route.params && this.$route.params.id) {
		this.createPassword = false;
	}
	this.loadTypePerson().then(() => {
		if (this.$route.name === 'new-distributor') {
			this.personTypes = this.personTypes.filter(
				(type) => type.name !== 'RUC' && type.name !== 'Cédula de Identidad'
			);
		}
	});
	this.loadResources();
	this.loadGroups();
	this.itemTransaccition();
	this.loadTransports();
	this.loadSubsidiaries();
	if (this.id) {
		this.disabledEmail = true;
		this.loadDetailVendor(true);
	}
	this.currency = this.coinValue;
}

function setValueVehicle(value) {
	this.typeTransportCode = value.value.typeTransport.code;
	this.vendor.numberLicence =
		value.value.typeTransport.code !== 'Moto' &&
		this.vendor.numberLicence.length === 11
			? null
			: this.vendor.numberLicence;
	this.vendor.vehicleId = value.value.id;
}

function itemTransaccition() {
	if (this.$route.name === 'new-distributor') {
		this.vendor.settings.modules.splice(0, 1);
	}
}

async function loadTransports() {
	try {
		const response = await this.$httpSales.get('vehicles');
		this.listTransport = response.data.map((l) => {
			const newData = { ...l };
			newData.autocomplete = l.typeTransport
				? `${l.typeTransport.name} - ${l.plate}`
				: l.plate;
			return newData;
		});
		if (this.listTransport.length === 1) {
			this.vendor.vehicleId = this.listTransport[0].id;
		}
	} catch (error) {
		this.showGenericError();
	}
}

function captionNavigation() {
	if (!this.id) {
		return this.$route.name === 'new-distributor'
			? 'Creando Nuevo Repartidor'
			: 'Creando Nuevo Vendedor';
	}
	return null;
}

async function loadGroups() {
	const params = {
		typeEntityId:
			this.$route.name === 'new-vendor'
				? typeEntityId.Sellers
				: typeEntityId.Distributor,
	};
	({ data: this.groups } = await this.$httpSalesRead.get('group', { params }));
	if (this.groups.length === 1) {
		this.vendor.group = this.groups[0].id;
	}
}

function btnLeftEvent() {
	if (this.actionCode === 'firstSelected') {
		this.vendor.terminals = [];
		this.salePointsSelected = [];
	} else if (this.actionCode === 'deleteWarehouse') {
		this.vendor.warehouses = this.vendor.warehouses.filter(
			(aw) => aw !== this.itemDeleteId
		);
		this.warehousesSelected = this.warehousesSelected.filter(
			(ws) => ws.id !== this.itemDeleteId && ws !== this.itemDeleteId
		);
		this.itemDeleteId = null;
		this.itemDeleteName = '';
		if (this.salePointsSelected.length > 0) {
			this.loadSalePoints(true);
		}
	} else if (this.actionCode === 'deleteSalePoint') {
		this.vendor.terminals = this.vendor.terminals.filter(
			(t) => t.id !== this.itemDeleteId
		);
		this.salePointsSelected = [...this.vendor.terminals];
		this.itemDeleteId = null;
		this.itemDeleteName = '';
		if (this.pvDefaultToDelete) {
			if (this.vendor.terminals.length > 0) {
				this.vendor.terminals[0].flagDefault = true;
			}
			this.salePointsSelected = [...this.vendor.terminals];
		}
	}
	this.closeDialog();
	this.actionCode = '';
}

function btnRightEvent() {
	if (this.actionCode === 'firstSelected') {
		this.$set(this.vendor.terminals[0], 'flagDefault', true);
	} else if (this.actionCode === 'onClick') {
		this.vendor.terminals = this.vendor.terminals.map((t) => {
			const newT = { ...t };
			newT.flagDefault = this.salePointClicked.id === t.id;
			return newT;
		});
	}
	this.salePointsSelected = [...this.vendor.terminals];
	this.closeDialog();
}

function closeDialog() {
	this.dialog = false;
	this.message = '';
	this.subtext = '';
	if (!this.messageInfo) {
		this.itemDeleteId = null;
		this.itemDeleteName = '';
		this.btnRightColor = 'success';
		this.btnRightText = 'Aceptar';
		this.btnLeftColor = 'error';
		this.btnLeftText = 'Cancelar';
		this.successAction = true;
	}
	this.messageInfo = false;
}

function deleteSalePoint({ id, name }) {
	this.itemDeleteId = id;
	this.itemDeleteName = name;
	this.actionCode = 'deleteSalePoint';
	this.openConfirmationMessage();
}

function deleteWarehouse({ id, name }) {
	this.itemDeleteId = id;
	this.itemDeleteName = name;
	this.actionCode = 'deleteWarehouse';
	this.openConfirmationMessage();
}

async function loadResources() {
	const params = {
		subsidiaryId: this.vendor.subsidiaryId || undefined,
	};
	const request = [this.warehousesList(params)];
	try {
		[{ data: this.warehouses }] = await Promise.all(request);
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

async function loadSalePoints(validateDelete, setVendorData) {
	const params = {
		warWarehousesId: this.warehousesSelected.map((ws) => ws.id).join(','),
	};
	try {
		({ data: this.salePoints } = await this.$httpSales.get('terminals', {
			params,
		}));
		this.salePoints = this.salePoints.map((sp) => {
			const newSp = { ...sp };
			newSp.flagDefault = sp.flagDefault || false;
			return newSp;
		});
		if (this.id) {
			const newTerminalsData = this.salePoints.reduce((acum, terminal) => {
				const newAccum = [...acum];
				const index = this.listDetailVendors.employee
					? this.listDetailVendors.employee.terminalsUser.findIndex(
							(t) => t.terminalId === terminal.id
					  )
					: -1;
				if (
					this.listDetailVendors.employee &&
					this.listDetailVendors.employee.terminalsUser.length === 1
				) {
					if (index > -1) {
						const newTerminal = { ...terminal };
						newTerminal.flagDefault = true;
						newAccum.push(newTerminal);
					}
				} else if (index > -1) {
					const newTerminal = { ...terminal };
					newTerminal.flagDefault =
						!!this.listDetailVendors.employee.terminalsUser[index].flagDefault;
					newAccum.push(newTerminal);
				}
				return newAccum;
			}, []);
			if (setVendorData) {
				this.setTerminalsData(newTerminalsData);
			}
		}
		if (validateDelete) {
			this.validateDeleteSalePoints();
		}
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function onClick(salePoint) {
	this.salePointClicked = { ...salePoint };
	this.actionCode = 'onClick';
	this.openConfirmationMessage();
}

function onInput({ model, value }) {
	this.vendor[model] = model === 'documentTypeId' ? value.id : value;
	if (model === 'subsidiaryId') {
		this.vendor[model] = value;
		this.loadResources();
	}
	if (model === 'numberLicence') {
		const showValid = /^[0-9A-Z]+$/gi.test(value);
		this.showValidNumber = !showValid;
		if (this.showValidNumber) {
			this.showGenericError('Solamente se permite digitos alfanumericos');
		}
		this.vendor[model] = value;
	}
	if (model === 'email') {
		this.isValid = true;
	}
	if (model === 'warehouses' || model === 'warehousesMultiple') {
		const valuesNoNull = value.filter((va) => va !== null);
		const values = valuesNoNull.map((item) => {
			if (typeof item !== 'object' && item !== null) {
				const objetoCompleto = this.warehouses.find((obj) => obj.id === item);
				return objetoCompleto ? { ...objetoCompleto, ...item } : item;
			}
			return item;
		});
		this.setWarehousesSelected(values);
	}
	if (model === 'terminals') {
		this.setSalePointsSelected(value);
	}
	if (model === 'flagLimitUsers') {
		this.createPassword = Boolean(value);
	}
	if (model === 'documentNumber') {
		this.setDocument(value);
	}
}

function setDocument(value) {
	this.cleanVendor();
	if (value.length === 8) {
		this.peruDataRequest('dni', value);
	} else if (value.length === 11) {
		this.peruDataRequest('ruc', value);
	} else {
		this.vendor.documentNumber = value;
	}
}

async function peruDataRequest(personType, num) {
	this.loadingGeneral = true;
	try {
		const { data: response } = await this.$httpSunat.get(
			`${personType}/${num}`
		);
		const customer = response.data;
		if (num.length === 8) {
			this.vendor.documentTypeId = 1;
			this.vendor.name = customer.nombres;
			this.vendor.lastName = `${customer.ape_paterno} ${customer.ape_materno}`;
		} else {
			this.vendor.documentTypeId = 2;
			this.vendor.name = `${customer.nombre}`;
			this.vendor.lastName = ' ';
		}
		if (customer.domicilio) {
			this.vendor.address = customer.domicilio;
		}
	} catch (err) {
		this.showGenericError(
			'No se encontraron los datos. Verifique el numero de documento o complete el formulario manualmente'
		);
	} finally {
		this.loadingGeneral = false;
	}
}

function onSelectClick() {
	if (
		this.vendor.warehousesMultiple &&
		this.vendor.warehousesMultiple.length === 0
	) {
		this.showNotification(
			'Es necesario seleccionar una o mâs tiendas para poder realizar este paso.',
			'warning'
		);
	}
}

function openConfirmationMessage() {
	if (this.actionCode === 'firstSelected') {
		this.message =
			'El punto de venta seleccionado será asignado como punto de venta por defecto.';
		this.subtext =
			'Al seleccionar más puntos de venta podrá hacer clic sobre alguno de ellos para modificar la asignación del punto de venta por defecto.';
	} else if (this.actionCode === 'onClick') {
		this.message = `¿Desea asignar el punto de venta ${this.salePointClicked.name} como punto de venta por defecto?`;
		this.btnRightText = 'Asignar';
	} else if (this.actionCode === 'deleteWarehouse') {
		this.message = `¿Estás seguro que deseas eliminar la tienda ${this.itemDeleteName}?`;
		this.subtext =
			'Recuerda que al eliminar una tienda, también eliminas los puntos de venta asignados a esta.';
		this.btnLeftText = 'Sí';
		this.btnRightText = 'No';
	} else if (this.actionCode === 'deleteSalePoint') {
		const pvDefaultIndex = this.salePointsSelected.findIndex(
			(sps) => sps.id === this.itemDeleteId && sps.flagDefault
		);
		this.pvDefaultToDelete = pvDefaultIndex > -1;
		this.message = `¿Estás seguro que deseas eliminar el punto de venta ${this.itemDeleteName}?`;
		this.subtext = !this.pvDefaultToDelete
			? ''
			: 'Al eliminar el punto de venta por defecto, automáticamente se asigna el siguiente como punto de venta por defecto.';
		this.btnLeftText = 'Sí';
		this.btnRightText = 'No';
	}
	this.dialog = true;
}

function setValue({ moduleData, index }) {
	const { model, value } = moduleData;
	if (index >= 0) {
		this.vendor.settings.modules[index][model] =
			model === 'amount' ||
			model === 'amountCommission' ||
			model === 'typeCommission'
				? Number(value)
				: value;
		if (this.vendor.settings.modules[index].value) {
			if (
				!this.vendor.settings.modules[index].period ||
				!this.vendor.settings.modules[index].amount
			) {
				this.modulesDisabled = true;
			} else if (
				this.vendor.settings.modules[index].flagCommission &&
				!this.vendor.settings.modules[index].amountCommission
			) {
				this.modulesDisabled = true;
			} else {
				this.modulesDisabled = false;
			}
		}
	} else {
		this.vendor.settings[model] = value;
	}
}

function setSalePointsSelected(values) {
	if (values.length === 1) {
		this.actionCode = 'firstSelected';
		this.openConfirmationMessage();
	} else {
		this.salePointsSelected = [...values];
	}
}

function setWarehousesSelected(values) {
	this.warehousesSelected = values;
	if (
		this.$route.name === 'new-vendor' ||
		this.$route.name === 'new-distributor'
	) {
		this.loadSalePoints();
	}
}

function validateDeleteSalePoints() {
	this.vendor.terminals = this.vendor.terminals.filter((t) =>
		this.vendor.warehouses.find((w) => w === t.warWarehousesId)
	);
	this.salePointsSelected = [...this.vendor.terminals];
}

function validations() {
	return {
		vendor: {
			documentTypeId: { minValue: minValue(1), required },
			documentNumber: { required },
			email: { email, required },
			lastName: {
				required: requiredIf(() => !(this.vendor.documentTypeId === 2)),
			},
			name: { required },
			password: { maxLength: maxLength(12), minLength: minLength(6), required },
			phone: { required },
		},
	};
}

async function saveForm() {
	this.disabledBtn = true;
	let newArrayTerminals = [];
	let arrayWarehouses = [];
	if (this.$route.name === 'new-vendor') {
		arrayWarehouses = this.warehousesSelected.map((l) => {
			const newArrayWarehouse = {};
			newArrayWarehouse.id = l.id;
			newArrayWarehouse.name = l.name;
			return newArrayWarehouse;
		});
	}
	newArrayTerminals = this.vendor.terminals.map((p) => {
		const newArray = {};
		newArray.flagDefault = p.flagDefault;
		newArray.name = p.name;
		newArray.subsidiaryId = p.subsidiary.id;
		newArray.terminalId = p.id;
		newArray.warehouseId = p.warWarehousesId;
		return newArray;
	});
	arrayWarehouses = arrayWarehouses.length > 0 ? arrayWarehouses : undefined;
	const namekey =
		this.$route.name === 'new-vendor'
			? 'traceabilityTime'
			: 'traceabilityTransaction';
	const nameKeyAddress =
		this.$route.name === 'new-vendor' ? 'addressSeller' : 'address';
	const warehouseIds =
		this.vendor.warehousesMultiple && this.vendor.warehousesMultiple.length > 0
			? this.vendor.warehousesMultiple.map((p) => p.id)
			: undefined;
	const body = {
		name: this.vendor.name,
		lastname: this.vendor.lastName,
		code: !this.id ? this.defaultCode(Math.random() * 1000) : undefined,
		phone: this.vendor.phone,
		email: this.createPassword ? this.vendor.email : undefined,
		typeDocumentId: this.vendor.documentTypeId,
		documentNumber: this.vendor.documentNumber,
		licence:
			this.$route.name === 'new-vendor' ? undefined : this.vendor.numberLicence || undefined,
		[nameKeyAddress]: this.vendor ? this.vendor.address : null,
		warehouses:
			this.vendor.warehousesMultiple && this.vendor.warehousesMultiple.length
				? warehouseIds
				: arrayWarehouses,
		timeTracking: Number(this.vendor.settings.traceabilityTime),
		terminals: newArrayTerminals.length > 0 ? newArrayTerminals : undefined,
		flagLimitUsers: this.createPassword
			? this.vendor.flagLimitUsers
			: undefined,
		password: this.createPassword ? this.vendor.password : undefined,
		typeSeller: this.vendor.typeSeller,
		groupId: this.vendor.group,
		settings: {
			flagWorkWithFreeRoute: this.vendor.settings.flagWorkWithFreeRoute,
			license: this.vendor.numberLicence || undefined,
			warehouses:
				this.vendor.warehousesMultiple &&
				this.vendor.warehousesMultiple.map((l) => {
					const newArrayWarehouse = {};
					newArrayWarehouse.id = l.id;
					newArrayWarehouse.name = l.name;
					return newArrayWarehouse;
				}),
			[namekey]: Boolean(this.vendor.settings.transactionsTraceability),
			perimeterSiege: this.vendor.settings.perimeterSiege,
			modules: this.vendor.settings.modules.reduce((a, m) => {
				const newM = { ...m };
				if (m.value) {
					if (!m.flagCommission) {
						delete newM.typeCommission;
						delete newM.amountCommission;
					}
					a.push(newM);
				}
				return a;
			}, []),
		},
	};
	if (this.$route.name === 'new-vendor' || this.$route.query.isVendor) {
		delete body.license;
	}
	// if (this.$route.name === 'new-distributor' && !this.id) {
	// 	delete body.flagLimitUsers;
	// }
	if (this.$route.name === 'new-distributor') {
		// delete body.terminals;
		delete body.typeSeller;
		delete body.settings.license;
		delete body.settings.perimeterSiege;
		body.subsidiaryId = this.vendor.subsidiaryId;
		body.vehicleId = this.vendor.vehicleId;
		body.photo = this.vendor.photo;
	}
	const urlPost = this.$route.name === 'new-vendor' ? 'sellers' : 'delivery';
	const urlPatch =
		this.$route.name === 'new-vendor'
			? `sellers/${this.id}`
			: `delivery/${this.id}`;
	const url = this.id ? urlPatch : urlPost;
	const message = this.id ? 'actualizado' : 'creado';
	const method = this.id ? 'patch' : 'post';
	try {
		await this.$httpSales[method](url, body);
		this.showNotification(`Se ${message} correctamente`);
		const routeName =
			this.$route.name === 'new-vendor' ? 'vendors' : 'distributor';
		this.goTo(routeName);
	} catch (error) {
		if (error.status === 400) {
			if (error.data.message === 'EMPLOYEE_EMAIL_EXIST') {
				this.showNotification(
					'Ya esta regristado el correo, intente con otro.',
					'warning'
				);
			} else if (error.data.message === 'TERMINAL_ID_NEEDED') {
				this.showNotification(
					'Seleccione un Punto de Venta por defecto.',
					'error'
				);
			} else if (error.data.code === 'ACL_ERROR_DATA') {
				this.showGenericError('El rol no posee recursos asociados.');
			} else if (error.data.message === 'TYPE_ROLE_NOT_FOUND') {
				this.showNotification('No tiene el tipo de rol configurado.', 'error');
			} else if (error.data.message === 'ACL_REGISTER_USER_ERROR') {
				this.showNotification(
					'El correo ya se encuentra registrado en el proyecto.',
					'error'
				);
			} else if (error.data.message === 'TERMINAL_SESSION_EXIST') {
				this.detailsErrorTerminal = error.data.details;
				this.modalTerminalExist = !this.modalTerminalExist;
			}
		} else {
			this.showGenericError();
		}
	} finally {
		this.disabledBtn = false;
	}
}

function setTerminalsData(terminalsData) {
	this.vendor.vehicleId = this.listDetailVendors.vehicleId;
	this.vendor.name = this.listDetailVendors.name;
	this.vendor.numberLicence =
		this.$route.name === 'new-vendor'
			? this.listDetailVendors.settings.license
			: this.listDetailVendors.licence || '';
	this.vendor.warehousesMultiple =
		this.listDetailVendors.settings &&
		this.listDetailVendors.settings.warehouses;
	this.vendor.lastName = this.listDetailVendors.lastname;
	this.vendor.documentTypeId = this.listDetailVendors.typeDocumentId;
	this.vendor.idDelivery = this.listDetailVendors.id;
	this.vendor.documentNumber = this.listDetailVendors.documentNumber;
	this.vendor.flagLimitUsers = this.listDetailVendors.flagLimitUsers;
	this.vendor.flagLimit = this.listDetailVendors.flagLimitUsers;
	this.vendor.email = this.listDetailVendors.email;
	this.vendor.phone = this.listDetailVendors.phone;
	this.vendor.address =
		this.listDetailVendors.addressSeller || this.listDetailVendors.address;
	this.vendor.typeSeller = this.listDetailVendors.typeSeller;
	this.vendor.settings.traceabilityTime = this.listDetailVendors.timeTracking;
	this.vendor.settings.perimeterSiege =
		this.listDetailVendors.settings.perimeterSiege;
	this.vendor.settings.flagWorkWithFreeRoute =
		this.listDetailVendors.settings.flagWorkWithFreeRoute;
	this.vendor.settings.transactionsTraceability =
		this.listDetailVendors.settings.transactionsTraceability;
	this.vendor.settings.transactionsTraceability =
		this.listDetailVendors.settings.traceabilityTime ||
		Boolean(this.listDetailVendors.settings.traceabilityTransaction);
	this.vendor.warehouses = this.listDetailVendors.warehouseId;
	if (
		this.vendor.warehousesMultiple &&
		this.vendor.warehousesMultiple.length > 0 &&
		!this.id
	) {
		this.setWarehousesSelected(this.vendor.warehousesMultiple);
	}
	this.vendor.terminals = terminalsData ? [...terminalsData] : [];
	this.salePointsSelected = [...this.vendor.terminals];
	this.vendor.settings.modules = this.setModulesData();
	this.vendor.group = this.listDetailVendors.groupId;
	if (this.vendor.email) {
		this.isValid = true;
	}
	if (this.$route.name === 'new-distributor') {
		this.vendor.subsidiaryId = this.listDetailVendors.subsidiaryId;
		this.vendor.settings.modules.splice(1, 1);
		this.vendor.photo = this.listDetailVendors.photo || null;
	}
}

async function loadDetailVendor(setVendorData) {
	const url =
		this.$route.name === 'new-vendor'
			? `sellers/${this.id}`
			: `delivery/${this.id}`;
	const params = { addEmployee: true };
	try {
		({ data: this.listDetailVendors } = await this.$httpSales.get(url, {
			params,
		}));
		let validWarehouse = null;
		const settings = this.listDetailVendors.settings;
		if (settings) {
			if (settings.warehouses) {
				validWarehouse = settings.warehouses;
			}
			this.listDetailVendors.settings.flagWorkWithFreeRoute =
				!!settings.flagWorkWithFreeRoute;
		}
		this.listDetailVendors.warehouses =
			this.listDetailVendors.warehouses ||
			this.listDetailVendors.settings.warehouses ||
			[];
		const warehouses = this.listDetailVendors.warehouses.filter(
			(obj) => Object.keys(obj).length > 0
		);
		this.warehousesSelected = warehouses || validWarehouse;
		if (this.warehousesSelected && this.warehousesSelected.length > 0) {
			this.loadSalePoints(false, setVendorData);
		} else {
			this.setTerminalsData();
		}
		if (this.$route.name !== 'new-vendor') {
			this.createPassword = this.listDetailVendors.flagLimitUsers === 0;
		}
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function onChange({ module, model, value, index }) {
	if (!value) {
		const prop = model === 'flagCommission' ? 'amountCommission' : 'amount';
		this.$set(module, prop, 0);
	}
	if (this.vendor.settings.modules[index].value) {
		if (
			!this.vendor.settings.modules[index].period ||
			!this.vendor.settings.modules[index].amount
		) {
			this.modulesDisabled = true;
		} else if (
			this.vendor.settings.modules[index].flagCommission &&
			!this.vendor.settings.modules[index].amountCommission
		) {
			this.modulesDisabled = true;
		} else {
			this.modulesDisabled = false;
		}
	}
}

function onClickIcon(type) {
	if (type === 'transactionTraceability') {
		this.message =
			'La Comisiones por Transacciones se configura para el monitoreo de módulos';
		this.subtext =
			'Al activar esta opcíon puede escoger el módulo de venta o pedido que va a ser monitoreado aplicandose algunos criterios para el vendedor, como comisión por monto o porcentaje';
	} else {
		const isTime = type === 'traceabilityTime';
		const timeMessage =
			'El Tiempo de Trazabilidad se configura para rastrear la ubicación del vendedor';
		const siegeMessage =
			'El Cerco Perimétrico define si se va a limitar o no al vendedor, a realizar transacciones dentro de su zona.';
		const timeSubtext =
			'Los valores del selector referencian la cantidad de minutos que pasará para obtener el punto de ubicación del vendedor. Por ejemplo; si seleccionas 5, 	podrás visualizar el punto de ubicación del vendedor asignado a una ruta cada 5 minutos en el historial de rutas.';
		const siegeSubtext =
			'Al activar esta opción, cuando el vendedor intente realizar una transacción fuera de la ruta a la que fue asignado se le enviará una alerta avisándole 	que no puede realizar transacciones fuera de su cerco perimétrico. En caso contrario, el vendedor podrá realizar transacciones desde cualquier punto de ubicación.';
		this.message = isTime ? timeMessage : siegeMessage;
		this.subtext = isTime ? timeSubtext : siegeSubtext;
	}
	this.successAction = false;
	this.btnLeftColor = 'primary';
	this.btnLeftText = 'Entendido';
	this.dialog = true;
	this.messageInfo = true;
}

function setModulesData() {
	if (this.listDetailVendors.settings.modules.length === 0) {
		return [...this.modules];
	} else if (this.listDetailVendors.settings.modules.length === 1) {
		const moduleEmpty = this.modules.find(
			(m) => m.name !== this.listDetailVendors.settings.modules[0].name
		);
		if (!this.listDetailVendors.settings.modules[0].flagCommission) {
			this.listDetailVendors.settings.modules[0].amountCommission = 0;
			this.listDetailVendors.settings.modules[0].typeCommission = 2;
		}
		this.listDetailVendors.settings.modules.push({ ...moduleEmpty });
		return [...this.listDetailVendors.settings.modules];
	}
	return [...this.listDetailVendors.settings.modules];
}

async function loadSubsidiaries() {
	({ data: this.subsidiaries } = await this.$httpSales.get('subsidiaries'));
	if (this.subsidiaries.length === 1) {
		this.vendor.subsidiaryId = this.subsidiaries[0].id;
	}
}

function cancelForm() {
	if (this.$route.name === 'new-vendor') {
		this.goTo('vendors');
	} else {
		this.goTo('distributor');
	}
}

function data() {
	return {
		actionCode: '',
		createPassword: true,
		currency: 'USD',
		btnLeftColor: 'error',
		btnLeftText: 'Cancelar',
		btnRightColor: 'success',
		btnRightText: 'Aceptar',
		dialog: false,
		disabledEmail: false,
		idTerminals: null,
		isValid: false,
		itemDeleteId: null,
		itemDeleteName: null,
		groups: [],
		listTransport: [],
		listDetailVendors: {},
		columns: [
			{
				id: 1,
				name: 'Código',
				value: 'code',
				checked: true,
				visible: true,
			},
			{
				id: 2,
				name: 'Nombre',
				value: 'name',
				checked: true,
				visible: true,
			},
			{
				id: 3,
				name: 'Apellido',
				value: 'lastname',
				checked: true,
				visible: true,
			},
			{
				id: 4,
				name: 'Nro. Doc.',
				value: 'documentNumber',
				checked: true,
				visible: true,
			},
			{
				id: 5,
				name: 'Terminal en uso',
				value: 'nameTerminal',
				checked: true,
				visible: true,
			},
		],
		modalTerminalExist: false,
		detailsErrorTerminal: [],
		message: '',
		modules: [
			{
				amount: 0,
				name: 'Ventas',
				value: false,
				flagCommission: false,
				period: '',
				typeCommission: 2,
				amountCommission: 0,
			},
			{
				amount: 0,
				name: 'Pedidos',
				value: false,
				flagCommission: false,
				period: '',
				typeCommission: 2,
				amountCommission: 0,
			},
		],
		modulesDisabled: false,
		newTerminals: [],
		newTerminalUser: [],
		periods: ['Diario', 'Semanal', 'Quincenal', 'Mensual'],
		pvDefaultToDelete: false,
		salePointClicked: {},
		salePoints: [],
		salePointsSelected: [],
		subtext: '',
		successAction: true,
		vendor: {
			flagLimitUsers: 0,
			password: null,
			address: '',
			documentTypeId: null,
			documentNumber: '',
			email: '',
			lastName: '',
			name: '',
			phone: '',
			numberLicence: null,
			typeSeller: TypeSeller.Vendor,
			vehicleId: null,
			settings: {
				showTraceabilityTime: false,
				traceabilityTime: 5,
				perimeterSiege: false,
				transactionsTraceability: false,
				flagWorkWithFreeRoute: false,
				modules: [
					{
						amount: 0,
						name: 'Ventas',
						value: false,
						flagCommission: false,
						period: '',
						typeCommission: 2,
						amountCommission: 0,
					},
					{
						amount: 0,
						name: 'Pedidos',
						value: false,
						flagCommission: false,
						period: '',
						typeCommission: 2,
						amountCommission: 0,
					},
				],
			},
			terminals: [],
			warehouses: [],
			warehousesMultiple: [],
			subsidiaryId: null,
			photo: null,
		},
		warehouses: [],
		warehousesSelected: [],
		subsidiaries: [],
		messageInfo: false,
		showValidNumber: false,
		loadingGeneral: false,
		typeTransportCode: null,
		disabledBtn: false,
	};
}

export default {
	name: 'new-vendor',
	components: {
		headerPage,
		vendorsForm,
		appTable,
	},
	created,
	data,
	methods: {
		btnLeftEvent,
		btnRightEvent,
		closeDialog,
		deleteSalePoint,
		deleteWarehouse,
		loadGroups,
		loadDetailVendor,
		loadSalePoints,
		loadResources,
		loadTransports,
		onChange,
		onClick,
		onClickIcon,
		onInput,
		onSelectClick,
		openConfirmationMessage,
		saveForm,
		setModulesData,
		setTerminalsData,
		setValue,
		setSalePointsSelected,
		setWarehousesSelected,
		validateDeleteSalePoints,
		itemTransaccition,
		setValueVehicle,
		loadSubsidiaries,
		cancelForm,
		setDocument: helper.debounce(setDocument, 2000),
		peruDataRequest,
		closeModal() {
			this.detailsErrorTerminal = [];
			this.modalTerminalExist = !this.modalTerminalExist;
		},
		cleanVendor() {
			this.vendor.address = null;
			this.vendor.name = null;
			this.vendor.lastName = null;
			this.vendor.documentTypeId = null;
		},
		defaultCode(id) {
			const alfabet = '4agf2hkve3prq7stu9jmnyzwx5b6d8c';
			let q = 1000000012300000 + id;
			const l = alfabet.length;
			let result = '';

			while (q) {
				result = alfabet[q % l] + result;
				q = Math.floor(q / l);
			}

			return result.padEnd(7, '4').slice(0, 7);
		},
	},
	props: {
		id: [Number, String],
	},
	computed: {
		captionNavigation,
	},
	validations,
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

.title-card {
	background-color: #f8f8f8;
	border-bottom: 1px solid #e0e0e0;
	padding: 16px;
	font-weight: bold;
}

.title-text {
	font-size: 1rem;
	color: #333;
}

.modal {
	border-radius: 8px;
}

.mesage-error {
	color: red;
	font-size: 0.7rem;
}
</style>
