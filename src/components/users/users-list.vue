<template>
	<div>
		<header-page
			to-show
			name="users"
			:columns="columns"
			:rows="data"
			:show-excel="false"
			:title="$route.meta.title"
			@clean-product-filter="cleanFilter"
		/>
		<app-actions
			:value-disabled="actionsDisabled"
			:resource-uri="$route.name"
			@run-action="runAction"
			@open-help="openHelp"
		/>
		<general-filter class="layout wrap py-3">
			<v-layout>
				<v-flex xs2>
					<autocomplete-component
						local-search
						item-text="name"
						item-value="id"
						:items="warehouses"
						:label-value="labelWarehouse()"
						return-object
						:item="warehouseIds"
						@return-data="filterByWarehouse"
					/>
				</v-flex>
			</v-layout>
		</general-filter>
		<div class="overflow-auto mt-1">
			<app-table
				name="users"
				:columns="columns"
				:rows="data"
				:current-page="currentPage"
				:last-page="lastPage"
				:items-quantity="data.length"
				:items-total-quantity="detailQuantity"
				@on-search-event="searchData"
				@on-page="changePage"
				:key-value="keyValue"
				local-storage
				class="is-not-selectable"
			>
				<template slot="rows" slot-scope="props">
					<td class="is-not-selectable" v-show="showRow(columns, 1)">
						{{ getWarehouse(props.row) }}
					</td>
					<td v-show="showRow(columns, 2)">{{ props.row.terminalName }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.email }}</td>
					<td v-show="showRow(columns, 4)">{{ props.row.code }}</td>
					<td v-show="showRow(columns, 5)">{{ props.row.name }}</td>
					<td v-show="showRow(columns, 6)">{{ props.row.lastname }}</td>
					<td v-show="showRow(columns, 7)">{{ props.row.phone }}</td>
					<td v-show="showRow(columns, 8)">{{ userRole(props.row) }}</td>
					<td v-show="showRow(columns, 9)">
						<v-btn
							flat
							small
							type="button"
							class="table-icon"
							:color="props.row.color"
							@click="inactiveAction(props.row)"
						>
							{{ props.row.flagActiveWord }}
						</v-btn>
					</td>
					<td class="w-123">
						<app-tooltip-button
							color="success"
							icon="edit"
							text="Editar"
							@click-icon="edit(props.row)"
						/>
						<app-tooltip-button
							color="info"
							icon="lock_open"
							text="Cambiar Contraseña"
							@click-icon="changePass(props.row)"
						/>
						<app-tooltip-button
							v-if="!!$userInfo.flagAdmin"
							color="primary"
							icon="settings"
							text="Configurar Permisos"
							@click-icon="openConfig(props.row)"
						/>
					</td>
				</template>
			</app-table>
		</div>
		<action-sidebar
			:title="action.title"
			:width="action.width"
			v-model="action.open"
			:code-action="action.code"
			:help-actions="actionsToHelp"
			@close-modal="closeModal"
		>
			<v-alert type="warning" v-model="noTerminalExist">
				La tienda seleccionada no tiene punto de ventas asociado. Cambie la tienda o cree
				punto de venta.
			</v-alert>
			<v-form v-if="isNewUser">
				<v-container class="grid-list-lg">
					<v-layout wrap>
						<v-flex xs12 v-if="isEditing ? isAllowChangeRoles : true">
							<label class="caption">Rol</label>
							<v-select
								bottom
								hide-details
								placeholder="Rol"
								class="filter-select shadow-inset"
								:items="roles"
								v-model="newUser.roleId"
								item-text="name"
								item-value="id"
								return-object
								content-class="filter-select-content"
								@input="changeRol"
							></v-select>
							<span class="form-group__message" v-if="!$v.newUser.roleId.required">
								Seleccione un rol.
							</span>
						</v-flex>
						<v-flex :class="isEditing ? 'xs12' : 'xs6'">
							<label class="caption">E-mail</label>
							<v-text-field
								:disabled="isEditing"
								type="email"
								class="filter-select shadow-inset"
								placeholder="E-mail"
								v-model="newUser.email"
							></v-text-field>
							<span
								class="form-group__message"
								v-if="!$v.newUser.email.required || !$v.newUser.email.email"
							>
								Ingrese un email válido
							</span>
						</v-flex>
						<v-flex xs6 v-if="!isEditing">
							<label class="caption">Contraseña</label>
							<v-text-field
								type="password"
								class="filter-select shadow-inset"
								placeholder="Contraseña"
								v-model="newUser.password"
								required
							></v-text-field>
							<span class="form-group__message" v-if="!$v.newUser.password.required">
								Ingrese una contraseña
							</span>
						</v-flex>
						<v-flex xs6>
							<label class="caption">Nombre</label>
							<v-text-field
								class="filter-select shadow-inset"
								placeholder="Nombre"
								v-model="newUser.name"
								required
							></v-text-field>
							<span class="form-group__message" v-if="!$v.newUser.name.required">
								Ingrese un nombre
							</span>
						</v-flex>
						<v-flex xs6>
							<label class="caption">Apellido</label>
							<v-text-field
								required
								class="filter-select shadow-inset"
								placeholder="Apellido"
								v-model="newUser.lastname"
							></v-text-field>
							<span class="form-group__message" v-if="!$v.newUser.lastname.required">
								Ingrese un apellido
							</span>
						</v-flex>
						<v-flex xs6 v-if="configRole.warehouse">
							<label class="caption">{{ labelWarehouse() }}</label>
							<v-select
								bottom
								hide-details
								:placeholder="labelWarehouse()"
								class="filter-select shadow-inset"
								:items="warehouses"
								v-model="newUser.warWarehousesId"
								item-text="name"
								item-value="id"
								content-class="filter-select-content"
								@input="updateAvaliableTerminals"
							></v-select>
							<span
								class="form-group__message"
								v-if="!$v.newUser.warWarehousesId.required"
							>
								Seleccione una {{ labelWarehouse() }}.
							</span>
						</v-flex>
						<v-flex xs6>
							<label class="caption">Teléfono</label>
							<v-text-field
								type="tel"
								class="filter-select shadow-inset"
								placeholder="Teléfono"
								v-model="newUser.phone"
							></v-text-field>
						</v-flex>
						<v-flex xs12 v-if="configRole.terminals">
							<label class="caption">Punto de Venta</label>
							<v-select
								bottom
								hide-details
								placeholder="Punto de Venta"
								class="filter-select shadow-inset"
								:items="terminals"
								v-model="newUser.salTerminalsId"
								item-text="name"
								item-value="id"
								content-class="filter-select-content"
								@input="changeTerminal"
							></v-select>
							<span
								class="form-group__message"
								v-if="!$v.newUser.salTerminalsId.required"
							>
								Seleccione un punto de venta.
							</span>
						</v-flex>
						<v-flex xs6 v-if="configRole.cashBox">
							<label class="caption">Asignar Caja</label>
							<v-select
								disabled
								bottom
								hide-details
								placeholder="Asignar Caja"
								class="filter-select shadow-inset"
								:items="cashs"
								v-model="newUser.cashId"
								item-text="name"
								item-value="id"
								:readonly="filterTerminalSetCash"
								content-class="filter-select-content"
							></v-select>
							<span class="form-group__message" v-if="!$v.newUser.cashId.required">
								La caja es requerida.
							</span>
						</v-flex>
						<v-flex xs6>
							<label class="caption">Código</label>
							<v-text-field
								type="text"
								class="filter-select shadow-inset"
								placeholder="Código"
								:readonly="
									!$userInfo.codeTypeRol === 'ADMIN' ||
									!$userInfo.codeTypeRol === 'SUPER_ADMIN'
								"
								v-model="newUser.code"
							></v-text-field>
							<span class="form-group__message" v-if="!$v.newUser.code.required">
								Ingrese un código de empleado
							</span>
							<span class="text-not-code-blank" v-if="checkBlankCode(newUser.code)">
								No se permite espacios en blanco
							</span>
						</v-flex>
						<v-flex xs6 v-if="!isEditing">
							<label class="caption">Tipo de documento</label>
							<v-select
								bottom
								hide-details
								placeholder="Tipo de documento"
								item-text="name"
								item-value="id"
								class="filter-select shadow-inset"
								:items="typeDocuments"
								v-model="newUser.flagTypePerson"
								content-class="filter-select-content"
								@input="changeDocument"
							></v-select>
							<span
								class="form-group__message"
								v-if="!$v.newUser.flagTypePerson.required"
							>
								Seleccione el tipo de documento.
							</span>
						</v-flex>
						<v-flex xs6 v-if="!isEditing">
							<label class="caption">Número de Documento</label>
							<v-text-field
								type="text"
								class="filter-select shadow-inset"
								placeholder="Número de Documento"
								v-model="newUser.documentNumber"
								:disabled="!newUser.flagTypePerson"
							></v-text-field>
							<span
								class="form-group__message"
								v-if="!$v.newUser.documentNumber.required"
							>
								El documento del empleado es requerido
							</span>
							<span
								class="form-group__message"
								v-if="
									!$v.newUser.documentNumber.minLength ||
									!$v.newUser.documentNumber.maxLength
								"
							>
								{{ documentMessage }}
							</span>
						</v-flex>
						<v-flex xs6>
							<label class="caption">Comision</label>
							<v-text-field
								type="tel"
								class="filter-select shadow-inset"
								placeholder="Comision"
								v-model="newUser.additionalInformation.percentageWin"
							></v-text-field>
						</v-flex>
						<v-flex xs8>
							<v-layout row wrap align-center>
								<v-flex xs10>
									<p class="company-text-regular ma-0">
										Permitir editar precio de venta:
									</p>
								</v-flex>
								<v-flex xs2 pl-2>
									<v-layout row align-center>
										<v-switch
											color="primary"
											hide-details
											v-model="newUser.additionalInformation.flagUpdatePrice"
										></v-switch>
									</v-layout>
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex xs8>
							<v-layout row wrap align-center>
								<v-flex xs10>
									<p class="company-text-regular ma-0">
										Visualizar pedidos de Ecommerce:
									</p>
								</v-flex>
								<v-flex xs2 pl-2>
									<v-layout row align-center>
										<v-switch
											color="primary"
											hide-details
											v-model="newUser.additionalInformation.flagShowOrderEcommerce"
										></v-switch>
									</v-layout>
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex xs8>
							<v-layout row wrap align-center>
								<v-flex xs10>
									<p class="company-text-regular ma-0">Ocultar Precio de Costo:</p>
								</v-flex>
								<v-flex xs2 pl-2>
									<v-layout row align-center>
										<v-switch
											color="primary"
											hide-details
											v-model="newUser.flagNotShowCostPrice"
										></v-switch>
									</v-layout>
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex
							xs8
							v-if="
								$userInfo.codeTypeRol === 'ADMIN' ||
								$userInfo.codeTypeRol === 'SUPER_ADMIN' ||
								$userInfo.roleCode === 'SUPPORT'
							"
						>
							<v-layout row wrap align-center>
								<v-flex xs10>
									<p class="company-text-regular ma-0">Convertir en Supervisor:</p>
								</v-flex>
								<v-flex xs2 pl-2>
									<v-layout row align-center>
										<v-switch
											color="primary"
											hide-details
											v-model="newUser.flagAdmin"
										></v-switch>
									</v-layout>
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex xs8>
							<v-layout row wrap align-center>
								<v-flex xs10>
									<p class="company-text-regular ma-0">
										No permitir venta de productos gratuitos:
									</p>
								</v-flex>
								<v-flex xs2 pl-2>
									<v-layout row align-center>
										<v-switch
											color="primary"
											hide-details
											v-model="newUser.additionalInformation.flagNotSaleProductFree"
										></v-switch>
									</v-layout>
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex
							xs8
							v-if="
								$userInfo.codeTypeRol === 'ADMIN' ||
								$userInfo.codeTypeRol === 'SUPER_ADMIN' ||
								$userInfo.roleCode === 'SUPPORT'
							"
						>
							<v-layout row wrap align-center>
								<v-flex xs10>
									<p class="company-text-regular ma-0">
										Permitir iniciar transferencias en otros almacenes:
									</p>
								</v-flex>
								<v-flex xs2 pl-2>
									<v-layout row align-center>
										<v-switch
											color="primary"
											hide-details
											v-model="newUser.additionalInformation.flagInitTransfers"
										></v-switch>
									</v-layout>
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex
							xs8
							v-if="
								$userInfo.codeTypeRol === 'ADMIN' ||
								$userInfo.codeTypeRol === 'SUPER_ADMIN' ||
								$userInfo.roleCode === 'SUPPORT'
							"
						>
							<v-layout row wrap align-center>
								<v-flex xs10>
									<p class="company-text-regular ma-0">Permitir anulación de pedidos:</p>
								</v-flex>
								<v-flex xs2 pl-2>
									<v-layout row align-center>
										<v-switch
											color="primary"
											hide-details
											v-model="newUser.additionalInformation.flagAllowSellerCancelOrder"
										></v-switch>
									</v-layout>
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex
							xs8
							v-if="
								$userInfo.codeTypeRol === 'ADMIN' ||
								$userInfo.codeTypeRol === 'SUPER_ADMIN' ||
								$userInfo.roleCode === 'SUPPORT'
							"
						>
							<v-layout row wrap align-center>
								<v-flex xs10>
									<p class="company-text-regular ma-0">
										Permitir ingresar ingresos o egresos:
									</p>
								</v-flex>
								<v-flex xs2 pl-2>
									<v-layout row align-center>
										<v-switch
											color="primary"
											hide-details
											v-model="newUser.additionalInformation.flagMovementsIncome"
										></v-switch>
									</v-layout>
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex
							xs8
							v-if="
								$userInfo.codeTypeRol === 'ADMIN' ||
								$userInfo.codeTypeRol === 'SUPER_ADMIN' ||
								$userInfo.roleCode === 'SUPPORT'
							"
						>
							<v-layout row wrap align-center>
								<v-flex xs10>
									<p class="company-text-regular ma-0">Mostrar Cierre de Caja:</p>
								</v-flex>
								<v-flex xs2 pl-2>
									<v-layout row align-center>
										<v-switch
											color="primary"
											hide-details
											v-model="newUser.additionalInformation.flagShowCashDeskClosing"
										></v-switch>
									</v-layout>
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex
							xs8
							v-if="
								$userInfo.codeTypeRol === 'ADMIN' ||
								$userInfo.codeTypeRol === 'SUPER_ADMIN' ||
								$userInfo.roleCode === 'SUPPORT'
							"
						>
							<v-layout row wrap align-center>
								<v-flex xs10>
									<p class="company-text-regular ma-0">Ocultar Nuevo Egreso:</p>
								</v-flex>
								<v-flex xs2 pl-2>
									<v-layout row align-center>
										<v-switch
											color="primary"
											hide-details
											v-model="newUser.additionalInformation.flagHideCashOutflow"
										></v-switch>
									</v-layout>
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex
							xs8
							v-if="
								$userInfo.codeTypeRol === 'ADMIN' ||
								$userInfo.codeTypeRol === 'SUPER_ADMIN' ||
								$userInfo.roleCode === 'SUPPORT'
							"
						>
							<v-layout row wrap align-center>
								<v-flex xs10>
									<p class="company-text-regular ma-0">Permitir Editar Compras:</p>
								</v-flex>
								<v-flex xs2 pl-2>
									<v-layout row align-center>
										<v-switch
											color="primary"
											hide-details
											v-model="newUser.additionalInformation.flagAllowEditingPurchases"
										></v-switch>
									</v-layout>
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex
							xs8
							v-if="
								$userInfo.codeTypeRol === 'ADMIN' ||
								$userInfo.codeTypeRol === 'SUPER_ADMIN' ||
								$userInfo.roleCode === 'SUPPORT'
							"
						>
							<v-layout row wrap align-center>
								<v-flex xs10>
									<p class="company-text-regular ma-0">
										Mostrar opción para cambiar de lista precio:
									</p>
								</v-flex>
								<v-flex xs2 pl-2>
									<v-layout row align-center>
										<v-switch
											color="primary"
											hide-details
											v-model="newUser.additionalInformation.editPriceByPriceList"
										></v-switch>
									</v-layout>
								</v-flex>
							</v-layout>
						</v-flex>
					</v-layout>
				</v-container>
			</v-form>
			<v-form v-if="action.code === 'new-employee-multiple'">
				<v-layout column px-3 pt-2>
					<v-flex xs12 mt-2>
						<app-select
							:item="modelAssign.comSubsidiariesId"
							item-text="sucursalName"
							item-value="id"
							:items="subsidiaries"
							:label="labelSucursal()"
							model="comSubsidiariesId"
							@input="setData"
						/>
						<span class="error--text caption" v-if="!modelAssign.comSubsidiariesId">
							La sucursal es requerido
						</span>
					</v-flex>
					<v-layout row>
						<v-flex xs6>
							<app-input-text
								label="Dominio"
								model="domain"
								:max-length="15"
								:text="modelAssign.domain"
								@input="setData"
							/>
							<span class="error--text caption" v-if="!$v.modelAssign.domain.minLength">
								Maximo 15 caracteres alfanuméricos.
							</span>
						</v-flex>
						<v-flex xs6 ml-1>
							<app-select
								:item="modelAssign.warWarehousesId"
								item-text="name"
								item-value="id"
								:items="warehouses"
								label="Almacén"
								model="warWarehousesId"
								@input="setData"
							/>
							<span
								class="error--text caption"
								v-if="!$v.modelAssign.warWarehousesId.required"
							>
								El almacén es requerido
							</span>
						</v-flex>
					</v-layout>
					<h4 class="primary--text mt-1 mb-2">Agregar Rol</h4>
					<v-layout row>
						<v-flex xs6>
							<app-select
								:item="modelMultiple.roleId"
								item-text="name"
								item-value="id"
								:items="roles"
								label="Rol"
								model="roleId"
								@input="setMultipleModal"
							/>
							<span class="error--text caption" v-if="!$v.modelMultiple.roleId.required">
								El rol es requerido
							</span>
						</v-flex>
						<v-flex xs6 ml-1>
							<app-input-text
								label="Nombre"
								model="name"
								:text="modelMultiple.name"
								:max-length="15"
								@input="setMultipleModal"
							/>
							<span class="error--text caption" v-if="!$v.modelMultiple.name.minLength">
								Mínimo 4 caracteres.
							</span>
						</v-flex>
						<v-flex xs4 ml-1>
							<app-input-text
								type="number"
								label="Numero inical"
								model="employeeInit"
								:text="modelMultiple.employeeInit"
								@input="setMultipleModal"
							/>
						</v-flex>
					</v-layout>
					<v-layout row>
						<v-flex xs5 mt-2>
							<app-input-text
								type="number"
								label="Cantidad"
								model="quantity"
								:text="modelMultiple.quantity"
								@input="setMultipleModal"
							/>
							<span
								class="error--text caption"
								v-if="!$v.modelMultiple.quantity.required"
							>
								La cantidad es requerido
							</span>
						</v-flex>
						<v-flex xs7 ml-1 mt-2>
							<app-input-text
								label="Contraseña"
								model="password"
								:text="modelMultiple.password"
								@input="setMultipleModal"
							/>
						</v-flex>
					</v-layout>
					<v-layout>
						<v-flex xs6 mt-2>
							<app-select
								chips
								multiple
								:item="modelMultiple.typeDocuments"
								item-text="documentType.name"
								item-value="comTypeDocumentId"
								:items="documentPayments"
								label="Tipo de documento"
								model="typeDocuments"
								@input="setMultipleModal"
							/>
						</v-flex>
						<v-flex xs4 ml-2>
							<app-input-text
								label="Serie"
								model="serieInit"
								:text="modelMultiple.serieInit"
								@input="setMultipleModal"
							/>
						</v-flex>
					</v-layout>
					<v-layout row align-center>
						<v-flex xs4 mt-1 mb-1>
							<v-checkbox
								class="checkbox-customers"
								color="primary"
								hide-details
								label="Tipo Supervisor"
								v-model="modelMultiple.flagAdmin"
							></v-checkbox>
						</v-flex>
						<v-flex xs2 text-xs-center>
							<v-btn
								type="button"
								color="primary"
								class="btn-action white--text mt-1"
								:disabled="!modelMultiple.roleId && !modelMultiple.quantity"
								@click="addRoleMu"
								>Agregar</v-btn
							>
						</v-flex>
					</v-layout>
				</v-layout>
				<div class="mt-3">
					<app-table
						:include-filter="false"
						:input-search="false"
						:columns="columnsEmployee"
						:rows="rowsEmployee"
						:current-page="currentPageEmployee"
					>
						<template slot="rows" slot-scope="props">
							<td v-show="showRow(columns, 1)" class="is-not-selectable">
								{{ props.row.quantity }}
							</td>
							<td v-show="showRow(columns, 2)">{{ props.row.rolName }}</td>
							<td v-show="showRow(columns, 3)">{{ props.row.codeTypeRol }}</td>
							<td v-show="showRow(columns, 4)">{{ props.row.name }}</td>
							<td v-show="showRow(columns, 5)">{{ props.row.password }}</td>
							<td v-show="showRow(columns, 6)">
								<app-tooltip-button
									color="error"
									icon="delete"
									text="Eliminar"
									@click-icon="deleteRole(props.row)"
								></app-tooltip-button>
							</td>
						</template>
					</app-table>
				</div>
				<section class="modal-filter-footer">
					<modal-sidebar-button
						:is-loading="!rowsEmployee.length"
						@accept-button-clicked="createUserMultiple"
						@cancel-button-clicked="closeModal"
					/>
				</section>
			</v-form>
			<v-container v-if="isChangePassword">
				<v-layout wrap justify-center>
					<v-flex xs10 mb-4>
						<v-text-field
							class="filter-select shadow-inset"
							name="new-pass"
							label="Nueva Contraseña"
							v-model="newPass"
						></v-text-field>
						<span class="form-group__message" v-if="!$v.newPass.required">
							Este campo es requerido.
						</span>
						<span class="form-group__message" v-if="!$v.newPass.minLength">
							Mínimo 6 caracteres alfanuméricos.
						</span>
					</v-flex>
					<v-flex xs10>
						<v-text-field
							class="filter-select shadow-inset"
							name="consfirm-new-pass"
							label="Confirme contraseña"
							v-model="confirmNewPass"
						></v-text-field>
						<span class="form-group__message" v-if="!$v.confirmNewPass.sameAs">
							Las contraseñas no coinciden.
						</span>
					</v-flex>
				</v-layout>
			</v-container>
			<users-form-config
				v-if="isConfig"
				:cashs="cashs"
				:groups="groups"
				:sal-price-list="salPriceList"
				:groups-direction="groupsDirection"
				:order-subsidiaries="
					configFilters.orders && configFilters.orders.subsidiaries
						? configFilters.orders.subsidiaries.values
						: []
				"
				:order-warehouses="
					configFilters.orders && configFilters.orders.warehouses
						? configFilters.orders.warehouses.values
						: []
				"
				:products-warehouses="configFilters.products.warehouses.values"
				:sales-subsidiaries="configFilters.sales.subsidiaries.values"
				:sales-warehouses="configFilters.sales.warehouses.values"
				:subsidiaries-selected="configFilters.subsidiaries.subsidiaries.values"
				:cash-selected="
					configFilters.subsidiaries && configFilters.subsidiaries.cash
						? configFilters.subsidiaries.cash.values
						: []
				"
				:transfers-warehouses="configFilters.transfers.warehouses.values"
				:warehouses-selected="configFilters.warehouses.warehouses.values"
				:warehouses-subsidiaries="configFilters.warehouses.subsidiaries.values"
				:commerces="commerces"
				:commerces-groups="configFilters.customers.assignedGroup.values"
				:customers-direction="configFilters.customers.addressGroup.values"
				:commerces-commerces="configFilters.commerces.commerces.values"
				:commerces-subsidiaries="configFilters.commerces.subsidiaries.values"
				:price-lists="configFilters.employee.listPrice.values"
				:price-lists-default="configFilters.employee.listPrice.defaultId"
				@set-data="getData"
			/>
			<section class="modal--footer" v-if="action.code !== 'new-employee-multiple'">
				<modal-sidebar-button
					:is-loading="
						isLoading ||
						$v.$invalid ||
						checkBlankCode(newUser.code) ||
						validatePriceList(configFilters.employee.listPrice)
					"
					@accept-button-clicked="save"
					@cancel-button-clicked="closeModal"
				/>
			</section>
		</action-sidebar>
		<v-dialog v-model="inactive" max-width="500px" @keydown.enter.prevent="applyAction">
			<v-card>
				<v-card-title>
					<v-layout d-flex justify-center>
						<p class="text-xs-center">
							¿Esta seguro que desea <b>{{ userStatusWord }}</b> a este usuario?:
						</p>
					</v-layout>
				</v-card-title>
				<v-card-text>
					<v-layout d-flex justify-center>
						<h2 class="text-xs-center">
							{{ currentUser.name }} {{ currentUser.lastname }}
						</h2>
					</v-layout>
				</v-card-text>
				<v-card-actions>
					<v-layout d-flex justify-space-between>
						<v-btn
							type="button"
							@click="cancelInactive"
							color="pink"
							class="btn-action mr-1"
						>
							Cancelar
							<v-icon color="white" size="16"> highlight_off </v-icon>
						</v-btn>
						<v-btn
							type="button"
							color="success"
							@click="applyAction"
							class="btn-action ml-1"
						>
							Aceptar
							<v-icon color="white" size="16"> check_circle_outline </v-icon>
						</v-btn>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
import {
	required,
	email,
	sameAs,
	minLength,
	requiredIf,
	maxLength,
} from 'vuelidate/lib/validators';
import actionSidebar from '@/components/shared/action-sidebar';
import appActions from '@/components/shared/app-actions';
import appSelect from '@/components/shared/app-select';
import appTable from '@/components/shared/table/app-table';
import appTooltipButton from '@/components/shared/app-tooltip-button';
import headerPage from '@/components/shared/header-page';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import usersFormConfig from '@/components/users/users-form-config';
import generalFilter from '@/components/shared/general-filter';
import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
import lib from '@/shared/lib';
import typeRol from '@/shared/type-rol';
import typeEntityId from '@/shared/type-entity';

const { getDeeper, equality, find } = lib;

async function created() {
	const warehouseIndex = this.columns.findIndex((e) => e.value === 'warehouseName');
	this.columns[warehouseIndex].name = this.labelWarehouse();
	this.loadData();
	this.loadWarehouses();
	const requests = [
		this.$httpAcl.get(`company/${this.$userInfo.company.aclCode}/role`),
		this.$httpSales.get('cash'),
		this.$httpSales.get('type-person'),
		this.$httpSales.get('com-ecommerce-companies'),
		this.$httpSales.get('group', {
			params: { typeEntityId: typeEntityId.Customer },
		}),
		this.$httpSales.get('group', {
			params: { typeEntityId: typeEntityId.Customer, typeGeneralId: 2 },
		}),
		this.$httpSales.get('type-documents?flagType=1'),
		this.$httpSales.get('sal-price-lists'),
	];
	try {
		const [
			roles,
			cashs,
			documents,
			commerces,
			groups,
			groupsDirection,
			docs,
			salPriceList,
		] = await Promise.all(requests);
		this.roles = roles.data.data;
		this.cashs = cashs.data;
		this.typeDocuments = documents.data.filter(
			(d) => d.code !== 'ruc' && d.code !== 'otros'
		);
		this.commerces = commerces.data;
		this.groups = groups.data;
		this.groupsDirection = groupsDirection.data;
		this.documentPayments = docs.data;
		this.documentPayments = this.filterTypeDocuments(
			1,
			'BOL',
			'FAC',
			'NTV',
			'COT',
			'PED'
		);
		this.salPriceList = salPriceList.data;
	} catch (error) {
		this.showGenericError();
	}
}

function filterTypeDocuments(...args) {
	const [flag, ...rest] = args;
	return this.documentPayments.reduce((list, item) => {
		const { documentType } = item;
		const { code, flagType } = documentType;
		const documentExist = find(equality(code), rest);
		if (flagType === flag && documentExist) {
			return list.concat(item);
		}
		return list;
	}, []);
}

function actionsDisabled() {
	const disabled = this.$userInfo.roleCode !== 'SUPPORT';
	return [{ code: 'new-employee-multiple', disabled }];
}

async function createUserMultiple() {
	const body = {
		comSubsidiariesId: this.modelAssign.comSubsidiariesId,
		warWarehousesId: this.modelAssign.warWarehousesId,
		suffixDomain: this.modelAssign.domain
			? this.modelAssign.domain.split(' ').join('')
			: '',
		employees: this.rowsEmployee.map((row) => {
			const newRow = {};
			newRow.quantity = Number(row.quantity);
			newRow.name = row.name;
			newRow.typeDocuments = row.typeDocuments.map((p) => p.documentType.code);
			newRow.serieInit = row.serieInit;
			newRow.employeeInit = Number(row.employeeInit);
			newRow.flagTypePerson = 1;
			newRow.flagTerminal = false;
			newRow.flagAdmin = row.flagAdmin ? 1 : 0;
			newRow.codeTypeRol = row.codeTypeRol;
			newRow.roleId = row.roleId;
			newRow.password = row.password;
			return newRow;
		}),
	};
	try {
		await this.$httpSales.post('employees/multiple', body);
		this.showNotification('Se crearon los nuevos empleados correctamente');
		this.rowsEmployee = [];
		this.closeModal();
		this.loadData();
	} catch (error) {
		this.showGenericError();
	}
}

async function loadWarehouses() {
	({ data: this.warehouses } = await this.$httpProducts.get('warehouses'));
}

async function applyAction() {
	const url = `employees/${this.currentUser.id}/flag-active`;
	const body = {
		flagActive: !(this.currentUser.flagActive === 1),
	};
	try {
		await this.$httpSales.patch(url, body);
		this.showNotification('Usuario actualizado de forma exitosa');
		this.inactive = false;
		this.currentUser = {};
		this.userStatusWord = '';
		this.loadData();
	} catch (error) {
		if (error.status === 400) {
			if (error.data.message === 'ACL_REGISTER_USER_ERROR') {
				this.showGenericError('No se pudo crear usuario correctamente.');
			}
		} else {
			this.showGenericError();
		}
	}
}

function cancelInactive() {
	this.inactive = false;
	this.currentUser = {};
	this.userStatusWord = '';
}

function changePage(page) {
	this.currentPage = page;
	this.loadData();
}

function changePass(user) {
	this.currentUser = { ...user };
	this.runAction({ code: 'change-password' });
}

function cleanSlide() {
	this.configFilters = {
		products: {
			warehouses: {
				fieldName: 'warehouse_id',
				values: [],
			},
		},
		sales: {
			subsidiaries: {
				fieldName: 'com_subsidiary_id',
				tableName: 'sal_documents',
				values: [],
			},
			warehouses: {
				fieldName: 'warehouse_id',
				tableName: 'sal_documents',
				values: [],
			},
		},
		subsidiaries: {
			subsidiaries: {
				fieldName: 'id',
				values: [],
			},
			cash: {
				fieldName: 'id',
				values: [],
			},
		},
		transfers: {
			warehouses: {
				fieldName: 'id',
				tableName: 'war_warehouses',
				values: [],
			},
		},
		warehouses: {
			subsidiaries: {
				fieldName: 'subsidiary_id',
				values: [],
			},
			warehouses: {
				fieldName: 'id',
				values: [],
			},
		},
		commerces: {
			commerces: {
				fieldName: 'id',
				values: [],
			},
			subsidiaries: {
				fieldName: 'subsidiary_id',
				values: [],
			},
		},
		customers: {
			assignedGroup: {
				fieldName: 'group_id',
				values: [],
			},
			addressGroup: {
				tableName: 'com_customers_address',
				fieldName: 'group_ids',
				values: [],
			},
		},
		orders: {
			warehouses: {
				fieldName: 'warehouse_id',
				tableName: 'sal_orders',
				values: [],
			},
			subsidiaries: {
				fieldName: 'subsidiary_id',
				values: [],
				tableName: 'sal_orders',
			},
		},
		employee: {
			listPrice: {
				values: [],
				defaultId: null,
				fieldName: 'com_employee_id',
				tableName: 'sal_price_lists',
			},
		},
	};
	this.configFiltersDefault = {
		products: {
			warehouses: {
				fieldName: 'warehouse_id',
				values: [],
			},
		},
		sales: {
			subsidiaries: {
				fieldName: 'com_subsidiary_id',
				tableName: 'sal_documents',
				values: [],
			},
			warehouses: {
				fieldName: 'warehouse_id',
				tableName: 'sal_documents',
				values: [],
			},
		},
		subsidiaries: {
			subsidiaries: {
				fieldName: 'id',
				values: [],
			},
			cash: {
				fieldName: 'id',
				values: [],
			},
		},
		transfers: {
			warehouses: {
				fieldName: 'id',
				tableName: 'war_warehouses',
				values: [],
			},
		},
		warehouses: {
			subsidiaries: {
				fieldName: 'subsidiary_id',
				values: [],
			},
			warehouses: {
				fieldName: 'id',
				values: [],
			},
		},
		commerces: {
			commerces: {
				fieldName: 'id',
				values: [],
			},
			subsidiaries: {
				fieldName: 'subsidiary_id',
				values: [],
			},
		},
		customers: {
			assignedGroup: {
				fieldName: 'group_id',
				values: [],
			},
			addressGroup: {
				tableName: 'com_customers_address',
				fieldName: 'group_ids',
				values: [],
			},
		},
		orders: {
			warehouses: {
				fieldName: 'warehouse_id',
				tableName: 'sal_orders',
				values: [],
			},
			subsidiaries: {
				fieldName: 'subsidiary_id',
				values: [],
				tableName: 'sal_orders',
			},
		},
		employee: {
			listPrice: {
				values: [],
				defaultId: null,
				fieldName: 'com_employee_id',
				tableName: 'sal_price_lists',
			},
		},
	};
}

function closeModal() {
	this.action = { ...this.actionDefault };
	this.newUser = {
		flagNotShowCostPrice: false,
		additionalInformation: {
			percentageWin: 0,
			flagUpdatePrice: false,
			flagShowOrderEcommerce: false,
			flagInitTransfers: false,
			flagAllowSellerCancelOrder: false,
			flagMovementsIncome: false,
			flagNotSaleProductFree: true,
			flagShowCashDeskClosing: true,
			flagHideCashOutflow: false,
			flagAllowEditingPurchases: true,
			editPriceByPriceList: false,
		},
	};
	this.newPass = '';
	this.confirmNewPass = '';
	this.isEditing = false;
	this.isCreating = false;
	this.terminals = [];
	this.configRole = {
		warehouse: false,
		cashBox: true,
		terminals: false,
	};
	this.modelAssign = {};
	this.modelMultiple = {
		employeeInit: 1,
	};
	this.cleanSlide();
}

async function createNewUser() {
	try {
		const message = this.isEditing ? 'actualizado' : 'creado';
		const method = this.isEditing ? 'patch' : 'post';
		const url = this.isEditing ? `employees/${this.newUser.id}` : 'employees';
		this.isLoading = true;
		const warehouse = this.warehouses.find((w) => w.id === this.newUser.warWarehousesId);
		this.newUser.urlImage = `${this.$imageUrl}/place-holder.svg`;
		if (warehouse) {
			this.newUser.comSubsidiariesId = warehouse.subsidiaryId;
		}
		let model = this.newUser;
		model.flagNotShowCostPrice = this.newUser.flagNotShowCostPrice;
		model.flagAdmin = this.newUser.flagAdmin ? 1 : 0;
		if (this.isEditing) {
			const updateEmployee = {
				code:
					this.$userInfo.codeTypeRol === 'ADMIN' ||
					this.$userInfo.codeTypeRol === 'SUPER_ADMIN'
						? this.newUser.code
						: undefined,
				flagNotShowCostPrice: Boolean(this.newUser.flagNotShowCostPrice),
				comSubsidiariesId: this.newUser.comSubsidiariesId || undefined,
				warWarehousesId: this.newUser.warWarehousesId || undefined,
				salTerminalsId: this.newUser.salTerminalsId || undefined,
				name: this.newUser.name,
				lastname: this.newUser.lastname,
				email: this.newUser.email,
				phone: this.newUser.phone,
				flagAdmin: this.newUser.flagAdmin ? 1 : 0,
				urlImage: this.newUser.urlImage,
				specialty: this.newUser.specialty || undefined,
				level: this.newUser.level || '',
				cashId: this.newUser.cashId || undefined,
				flagTypePerson: this.newUser.flagTypePerson,
			};
			if (!this.newUser.additionalInformation) {
				this.newUser.additionalInformation = {};
			}
			updateEmployee.additionalInformation = {
				flagInitTransfers: Boolean(this.newUser.additionalInformation.flagInitTransfers),
				flagAllowSellerCancelOrder: Boolean(
					this.newUser.additionalInformation.flagAllowSellerCancelOrder
				),
				flagMovementsIncome: Boolean(
					this.newUser.additionalInformation.flagMovementsIncome
				),
				flagNotSaleProductFree: Boolean(
					this.newUser.additionalInformation.flagNotSaleProductFree
				),
				flagShowCashDeskClosing: !(
					this.newUser.additionalInformation.flagShowCashDeskClosing === false
				),
				flagAllowEditingPurchases: !(
					this.newUser.additionalInformation.flagAllowEditingPurchases === false
				),
				editPriceByPriceList: Boolean(
					this.newUser.additionalInformation.editPriceByPriceList
				),
				flagHideCashOutflow: Boolean(
					this.newUser.additionalInformation.flagHideCashOutflow
				),
				flagShowOrderEcommerce: Boolean(
					this.newUser.additionalInformation.flagShowOrderEcommerce
				),
				flagUpdatePrice:
					this.newUser.additionalInformation &&
					this.newUser.additionalInformation.flagUpdatePrice
						? this.newUser.additionalInformation.flagUpdatePrice
						: false,
			};
			if (this.action.code === 'users-config') {
				updateEmployee.configFilters = this.configFilters;
			}
			if (this.isAllowChangeRoles) {
				updateEmployee.roleId = this.newUser.roleId;
			}
			if (
				this.newUser.additionalInformation &&
				this.newUser.additionalInformation.percentageWin
			) {
				updateEmployee.additionalInformation = this.newUser.additionalInformation;
			}
			model = updateEmployee;
		}
		await this.$httpSales[method](url, model);
		this.showNotification(`Empleado ${message}`);
		this.closeModal();
		this.cleanSlide();
		this.loadData();
		this.loadWarehouses();
	} catch (error) {
		if (error.status === 400) {
			if (error.data.message === 'EMPLOYEE_EMAIL_EXIST') {
				this.showNotification('El correo ingresado ya existe en esta empresa', 'error');
			} else if (error.data.message === 'EMPLOYEE_ACL_EMAIL_REPEATED') {
				this.showNotification('El correo ingresado no está disponible', 'error');
			} else if (error.data.message === 'EMPLOYEE_ACL_CODE_REPEATED') {
				this.showNotification(
					'El código de usuario ingresado no está disponible',
					'error'
				);
			} else if (error.data.message === 'EMPLOYEE_CODE_EXIST') {
				this.showGenericError(
					'No se pudo crear el empleado porque el código ingresado ya existe. Modifcar el código y volver a intentar.'
				);
			} else if (error.data.message === 'CHANGE_ROLE_NOT_ALLOWE') {
				this.showGenericError('No tienes permiso para realizar esta acción');
			} else if (error.data.message === 'ACL_REGISTER_USER_ERROR') {
				if (error.data.messageError) {
					const errorKeys = Object.keys(error.data.messageError);
					if (errorKeys.length > 0) {
						this.showGenericError(error.data.messageError[errorKeys[0]]);
					}
				} else {
					this.showGenericError('Error de usuario en el acl');
				}
			}
		} else if (error.status === 500) {
			this.showGenericError();
		}
	} finally {
		this.isLoading = false;
	}
}

function edit(user) {
	this.action.open = true;
	this.action.active = true;
	this.action.code = 'new-user';
	this.action.title = `${user.name} ${user.lastname}`;
	this.isEditing = true;
	this.newUser = Object.assign(
		{ ...user },
		{
			additionalInformation: user.additionalInformation ? user.additionalInformation : {},
		}
	);
	const index = this.roles.findIndex((r) => r.id === user.roleId);
	if (index > -1) {
		this.configRole = getDeeper(
			'typeRole',
			'data',
			'settings',
			'data',
			'configFields'
		)(this.roles[index]);
	}
	this.filteredTerminals();
}

async function filteredTerminals() {
	const warehouse = this.warehouses.find((w) => w.id === this.newUser.warWarehousesId);
	if (warehouse.subsidiary.id && warehouse.id) {
		const params = {
			comSubsidiariesId: warehouse.subsidiary.id,
			warWarehousesId: warehouse.id,
		};
		try {
			const response = await this.$httpSales.get('terminals', { params });
			this.terminalsAll = response.data;
			if (this.filterTerminalSetCash) {
				this.terminals = this.terminalsAll.filter((t) => t.cashId);
			} else {
				this.terminals = [...this.terminalsAll];
			}
			this.noTerminalExist = this.terminals.length === 0;
			if (this.terminals.length === 1) {
				this.newUser.salTerminalsId = this.terminals[0].id;
				this.changeTerminal(this.terminals[0].id);
			}
		} catch (error) {
			this.showGenericError();
		}
	}
}

function getCash({ value }) {
	this.newUser.cashId = value.id;
}

function getData({ model, value }) {
	if (model === 'productsWarehouses') {
		this.configFilters.products.warehouses.values = [...value];
	} else if (model === 'salesSubsidiaries') {
		this.configFilters.sales.subsidiaries.values = [...value];
	} else if (model === 'salesWarehouses') {
		this.configFilters.sales.warehouses.values = [...value];
	} else if (model === 'subsidiariesSelected') {
		this.configFilters.subsidiaries.subsidiaries.values = [...value];
	} else if (model === 'transfersWarehouses') {
		this.configFilters.transfers.warehouses.values = [...value];
	} else if (model === 'warehousesSelected') {
		this.configFilters.warehouses.warehouses.values = [...value];
	} else if (model === 'commercesCommerces') {
		this.configFilters.commerces.commerces.values = [...value];
	} else if (model === 'commercesSubsidiaries') {
		this.configFilters.commerces.subsidiaries.values = [...value];
	} else if (model === 'cashSelected') {
		this.configFilters.subsidiaries.cash.values = [...value];
	} else if (model === 'commercesGroups') {
		this.configFilters.customers.assignedGroup.values = [...value];
	} else if (model === 'customersDirection') {
		this.configFilters.customers.addressGroup.values = [...value];
	} else if (model === 'orderWarehouses') {
		this.configFilters.orders.warehouses.values = [...value];
	} else if (model === 'orderSubsidiaries') {
		this.configFilters.orders.subsidiaries.values = [...value];
	} else if (model === 'priceListsDefault' || model === 'priceLists') {
		if (model === 'priceListsDefault') {
			this.$set(this.configFilters.employee.listPrice, 'defaultId', value);
		} else {
			this.configFilters.employee.listPrice.values = [...value];
			this.$set(
				this.configFilters.employee.listPrice,
				'defaultId',
				value.length === 1 ? value[0] : null
			);
		}
	} else {
		this.configFilters.warehouses.subsidiaries.values = [...value];
	}
}

function getWarehouse(row) {
	return row.warehouse ? row.warehouse.name : '';
}

function inactiveAction(user) {
	this.currentUser = { ...user };
	this.userStatusWord = user.flagActive === 1 ? 'DESACTIVAR' : 'ACTIVAR';
	this.inactive = true;
}

function isChangePassword() {
	return this.action.code === 'change-password';
}

function isConfig() {
	return this.action.code === 'users-config';
}

async function loadData() {
	const params = {
		page: this.currentPage,
		search: this.search,
		warehouseId: this.warehouseIds,
		relationAdd: 'terminal',
	};
	try {
		const { data: users, headers } = await this.$httpSales.get('employees', {
			params,
		});
		this.data = users.map((u) => {
			const newU = { ...u };
			newU.terminalName = u.terminal ? u.terminal.name : null;
			newU.color = u.flagActive === 1 ? 'success' : 'error';
			newU.flagActiveWord = u.flagActive === 1 ? 'Activo' : 'Desactivado';
			if (!newU.additionalInformation) {
				newU.additionalInformation = {};
			}
			newU.additionalInformation.flagAllowEditingPurchases = !(
				newU.additionalInformation.flagAllowEditingPurchases === false
			);
			newU.additionalInformation.editPriceByPriceList = Boolean(
				newU.additionalInformation.editPriceByPriceList
			);
			newU.additionalInformation.flagShowCashDeskClosing = !(
				newU.additionalInformation.flagShowCashDeskClosing === false
			);
			return newU;
		});
		if (this.$userInfo.roleCode !== 'SUPPORT') {
			this.data = this.data.filter((row) => row.roleId !== 3731);
		}
		this.detailQuantity = Number(headers['x-quantity']);
		this.lastPage = Number(headers['x-last-page']);
	} catch (error) {
		this.showGenericError();
	}
}

function openConfig(row) {
	this.action.code = 'users-config';
	const { name, lastname, fullname } = row;
	this.newUser = { ...row };
	if (!(row.configFilters.subsidiaries && row.configFilters.subsidiaries.cash)) {
		const cash = {
			fieldName: 'id',
			values: [],
		};
		this.newUser.configFilters.subsidiaries.cash = cash;
	}
	this.configFilters = this.newUser.configFilters
		? this.setUserConfigFilters(this.newUser.configFilters)
		: { ...this.configFiltersDefault };
	this.isEditing = true;
	this.action.title = fullname || `${name} ${lastname}`;
	this.action.width = 500;
	this.action.active = true;
	this.action.open = true;
}

function runAction(action) {
	if (action.code === 'new-user') {
		const flagConf = this.roles.every((rol) =>
			getDeeper('typeRole', 'data', 'settings', 'data', 'configFields')(rol)
		);
		if (flagConf) {
			this.isCreating = true;
			this.isEditing = false;
			this.action.code = action.code;
			this.action.open = true;
			this.action.active = true;
			this.action.title = 'Nuevo Empleado';
			this.action.width = 500;
		} else {
			this.showGenericError('Configuración de roles no válidas');
		}
	} else if (action.code === 'new-employee-multiple') {
		this.loadSubsidiaries();
		if (this.warehouses.length === 1) {
			this.modelAssign.warWarehousesId = this.warehouses[0].id;
		}
		this.action.code = action.code;
		this.action.open = true;
		this.action.active = true;
		this.action.title = 'ASIGNAR EMPLEADO MULTIPLE';
		this.action.width = 550;
	} else {
		this.action = { ...this.actionChangePass };
		this.action.code = 'change-password';
	}
}

async function loadSubsidiaries() {
	try {
		const response = await this.$httpSales.get('subsidiaries');
		this.subsidiaries = response.data;
		if (this.subsidiaries.length === 1) {
			this.modelAssign.comSubsidiariesId = this.subsidiaries[0].id;
		}
	} catch (error) {
		this.showGenericError();
	}
}

function save() {
	if (this.action.code === 'new-user' || this.isConfig) {
		this.createNewUser();
	} else {
		this.updatePassword();
	}
}

function setMultipleModal({ model, value }) {
	if (model === 'roleId') {
		this.modelMultiple[model] = value.id;
		this.modelMultiple.rolName = value.name;
		this.modelMultiple.name = value.name;
		this.modelMultiple.codeTypeRol =
			value.typeRole && value.typeRole.data && value.typeRole.data.code;
	} else if (model === 'typeDocuments') {
		this.modelMultiple[model] = [...value];
	} else if (model === 'employeeInit') {
		this.modelMultiple[model] = Math.ceil(Math.abs(value));
	} else {
		this.modelMultiple[model] = value;
	}
}

function addRoleMu() {
	this.rowsEmployee.push({
		...this.modelMultiple,
		name: this.modelMultiple.name ? this.modelMultiple.name.split(' ').join('') : null,
		id: `${this.modelMultiple.quantity}${this.indexRow + 1}`,
	});
	this.showNotification('Se agregó el rol correctmente.');
	this.modelMultiple = {
		roleId: null,
		typeDocuments: [],
		rolName: null,
		name: '',
		serieInit: null,
		employeeInit: 1,
		codeTypeRol: null,
		quantity: null,
	};
}

function deleteRole({ id }) {
	const index = this.rowsEmployee.findIndex((row) => row.id === id);
	this.rowsEmployee.splice(index, 1);
}

function searchData(value) {
	this.currentPage = 1;
	this.search = value;
	this.loadData();
}

async function updatePassword() {
	this.isLoading = true;
	const codeUser = this.currentUser.aclUserCode;
	const url = '/users/password';
	const body = {
		password: this.newPass,
		codeUser,
	};
	try {
		await this.$httpAcl.patch(url, body);
		this.currentUser = {};
		this.isLoading = false;
		this.newPass = '';
		this.confirmNewPass = '';
		this.action = { ...this.actionDefault };
		this.isCreating = false;
		this.isEditing = false;
		this.terminals = [];
		this.showNotification('Contraseña actualizada');
	} catch (error) {
		this.showGenericError();
	}
}

function userRole({ roleId, flagAdmin }) {
	const noRole = flagAdmin === 1 ? 'administrador' : 'Sin rol';
	if (roleId && this.roles.length > 0) {
		const roles = this.roles.find((el) => el.id === roleId);
		return roles ? roles.name : noRole;
	}
	return noRole;
}

function newTypeCodeRol(value) {
	this.newUser.roleId = value.id;
	this.newUser.codeTypeRol = value.typeRole.data.code;
}

function validations() {
	const newValidation = { required };
	if (this.personValidations) {
		newValidation.maxLength = maxLength(this.maxDocument);
		newValidation.minLength = minLength(this.minDocument);
	}
	const createNewUserRules = {
		newUser: {
			code: { required },
			documentNumber: newValidation,
			email: {
				email,
				required,
			},
			name: { required },
			lastname: { required },
			password: { required },
			cashId: {
				required: requiredIf(() => this.configRole.cashBox),
			},
			salTerminalsId: {
				required: requiredIf(() => this.configRole.terminals),
			},
			roleId: { required },
			warWarehousesId: {
				required: requiredIf(() => this.configRole.warehouse),
			},
			flagTypePerson: { required },
		},
	};

	const editUserRules = {
		newUser: {
			code: { required },
			email: {
				email,
				required,
			},
			name: { required },
			lastname: { required },
			cashId: {
				required: requiredIf(() => this.configRole.cashBox && this.isNewUser),
			},
			salTerminalsId: {
				required: requiredIf(() => this.configRole.terminals),
			},
			roleId: { required },
			warWarehousesId: {
				required: requiredIf(() => this.configRole.warehouse),
			},
			flagTypePerson: { required },
		},
	};

	const changePassWord = {
		newPass: {
			required,
			minLength: minLength(6),
		},
		confirmNewPass: {
			required,
			sameAs: sameAs('newPass'),
		},
	};

	const assignEmployee = {
		modelAssign: {
			warWarehousesId: {
				required,
			},
			comSubsidiariesId: {
				required,
			},
			domain: {
				minLength: minLength(10),
			},
		},
		modelMultiple: {
			roleId: {
				required,
			},
			quantity: {
				required,
			},
			name: {
				minLength: minLength(4),
			},
		},
	};

	if (this.isEditing) {
		return editUserRules;
	} else if (this.isCreating) {
		return createNewUserRules;
	} else if (this.isChangePassword) {
		return changePassWord;
	} else if (this.action.code === 'new-employee-multiple') {
		return assignEmployee;
	}
	return false;
}

function filterByWarehouse(warehouse) {
	if (warehouse) {
		({ id: this.warehouseIds } = warehouse);
		this.currentPage = 1;
		this.loadData();
	}
}

function cleanFilter() {
	this.warehouseIds = null;
	this.searchData('');
}

function setUserConfigFilters(userConfigFilters) {
	const { sales, transfers, commerces, customers, orders, subsidiaries, employee } =
		userConfigFilters;
	const salesWarehousesFilters = sales.warehouses;
	const newSalesWarehousesFilters = salesWarehousesFilters || {
		...this.configFiltersDefault.sales.warehouses,
	};
	const newTransfersFilters = transfers || {
		...this.configFiltersDefault.transfers,
	};
	const newUserConfigFilters = { ...userConfigFilters };
	const newCommerceFilters = commerces || {
		...this.configFiltersDefault.commerces,
	};
	const customersConv = customers
		? Object.fromEntries(
				Object.entries(customers).map(([key, value]) => {
					const newValue = { ...value };
					if (newValue.values === false) {
						newValue.values = [];
					}
					return [key, newValue];
				})
		  )
		: null;
	const newGroupFilters = customersConv || {
		...this.configFiltersDefault.customers,
	};
	const newGroupAddressFilters =
		customersConv && customersConv.addressGroup
			? customersConv.addressGroup
			: { ...this.configFiltersDefault.customers.addressGroup };
	const newOrdersFilters = orders || { ...this.configFiltersDefault.orders };
	const newSubsidiaryFilters = subsidiaries || {
		...this.configFiltersDefault.subsidiaries,
	};
	const employeeConv = employee
		? Object.fromEntries(
				Object.entries(employee).map(([key, value]) => {
					const newValue = { ...value };
					if (newValue.values === false) {
						newValue.values = [];
						newValue.defaultId = null;
					}
					return [key, newValue];
				})
		  )
		: null;
	const newEmployee = employeeConv || {
		...this.configFiltersDefault.employee,
	};
	newUserConfigFilters.sales.warehouses = newSalesWarehousesFilters;
	newUserConfigFilters.transfers = newTransfersFilters;
	newUserConfigFilters.commerces = newCommerceFilters;
	newUserConfigFilters.customers = newGroupFilters;
	newUserConfigFilters.customers.addressGroup = newGroupAddressFilters;
	newUserConfigFilters.orders = newOrdersFilters;
	newUserConfigFilters.subsidiaries = newSubsidiaryFilters;
	newUserConfigFilters.employee = newEmployee;
	return newUserConfigFilters;
}

function updateAvaliableTerminals() {
	this.newUser.salTerminalsId = null;
	this.newUser.cashId = null;
	this.filteredTerminals();
}

function changeRol(rol) {
	this.newUser.roleId = rol.id;
	this.newUser.codeTypeRol = rol.typeRole.data.code;
	const indexRol = this.roles.findIndex((r) => r.id === rol.id);
	const typeRolSelect = getDeeper('typeRole', 'data', 'code')(rol);
	if (indexRol > -1) {
		this.configRole = getDeeper(
			'typeRole',
			'data',
			'settings',
			'data',
			'configFields'
		)(this.roles[indexRol]);
	}
	this.filterTerminalSetCash =
		typeRolSelect === typeRol.Vendor || typeRolSelect === typeRol.Reseller;
	this.newUser.cashId = null;
	this.newUser.salTerminalsId = null;
	this.newUser.warWarehousesId = null;
}

function changeDocument(value) {
	this.personType = this.typeDocuments.find((p) => p.id === value) || {};
}

function isAllowChangeRoles() {
	return Boolean(
		getDeeper('roleConfig', 'validations', 'allowChangeRoles')(this.$userInfo)
	);
}

function isNewUser() {
	return this.action.code === 'new-user';
}

function changeTerminal(id) {
	const index = this.terminals.findIndex((t) => t.id === id);
	if (index > -1) {
		this.newUser.cashId = this.terminals[index].cashId;
	}
}

function setData({ model, value }) {
	if (model === 'warWarehousesId' || model === 'comSubsidiariesId') {
		this.modelAssign[model] = value.id;
	} else {
		this.modelAssign[model] = value;
	}
}

function data() {
	return {
		action: {
			active: false,
			code: '',
			open: false,
			width: 500,
			title: 'Titulo desde data',
		},
		actionChangePass: {
			active: true,
			open: true,
			width: 350,
			title: 'Cambiar contraseña',
		},
		actionDefault: {
			active: false,
			open: false,
			code: null,
			width: 500,
			title: 'Titulo desde data',
		},
		cashs: [],
		columns: [
			{
				id: 0,
				name: 'Tienda',
				value: 'warehouseName',
				visible: true,
				checked: true,
			},
			{
				id: 1,
				name: 'Punto de Venta',
				value: 'warehouseName',
				visible: true,
				checked: true,
			},
			{ id: 2, name: 'Email', value: 'email', visible: true, checked: true },
			{ id: 3, name: 'Código', value: 'code', visible: true, checked: true },
			{ id: 4, name: 'Nombre', value: 'name', visible: true, checked: true },
			{
				id: 5,
				name: 'Apellido',
				value: 'lastname',
				visible: true,
				checked: true,
			},
			{ id: 6, name: 'Teléfono', value: 'phone', visible: true, checked: true },
			{ id: 7, name: 'Rol', value: 'role', visible: true, checked: true },
			{ id: 8, name: 'Estado', value: 'status', visible: true, checked: true },
			{
				id: 9,
				name: 'Acciones',
				visible: true,
				checked: true,
				flagVisible: true,
			},
		],
		currentPageEmployee: 1,
		configFilters: {
			products: {
				warehouses: {
					fieldName: 'warehouse_id',
					values: [],
				},
			},
			sales: {
				subsidiaries: {
					fieldName: 'com_subsidiary_id',
					tableName: 'sal_documents',
					values: [],
				},
				warehouses: {
					fieldName: 'warehouse_id',
					tableName: 'sal_documents',
					values: [],
				},
			},
			subsidiaries: {
				subsidiaries: {
					fieldName: 'id',
					values: [],
				},
				cash: {
					fieldName: 'id',
					values: [],
				},
			},
			transfers: {
				warehouses: {
					fieldName: 'id',
					tableName: 'war_warehouses',
					values: [],
				},
			},
			warehouses: {
				subsidiaries: {
					fieldName: 'subsidiary_id',
					values: [],
				},
				warehouses: {
					fieldName: 'id',
					values: [],
				},
			},
			commerces: {
				commerces: {
					fieldName: 'id',
					values: [],
				},
				subsidiaries: {
					fieldName: 'subsidiary_id',
					values: [],
				},
			},
			customers: {
				assignedGroup: {
					fieldName: 'group_id',
					values: [],
				},
				addressGroup: {
					tableName: 'com_customers_address',
					fieldName: 'group_ids',
					values: [],
				},
			},
			orders: {
				warehouses: {
					fieldName: 'warehouse_id',
					tableName: 'sal_orders',
					values: [],
				},
				subsidiaries: {
					fieldName: 'subsidiary_id',
					values: [],
					tableName: 'sal_orders',
				},
			},
			employee: {
				listPrice: {
					values: [],
					defaultId: null,
					fieldName: 'com_employee_id',
					tableName: 'sal_price_lists',
				},
			},
		},
		configFiltersDefault: {
			products: {
				warehouses: {
					fieldName: 'warehouse_id',
					values: [],
				},
			},
			sales: {
				subsidiaries: {
					fieldName: 'com_subsidiary_id',
					tableName: 'sal_documents',
					values: [],
				},
				warehouses: {
					fieldName: 'warehouse_id',
					tableName: 'sal_documents',
					values: [],
				},
			},
			subsidiaries: {
				subsidiaries: {
					fieldName: 'id',
					values: [],
				},
				cash: {
					fieldName: 'id',
					values: [],
				},
			},
			transfers: {
				warehouses: {
					fieldName: 'id',
					tableName: 'war_warehouses',
					values: [],
				},
			},
			warehouses: {
				subsidiaries: {
					fieldName: 'subsidiary_id',
					values: [],
				},
				warehouses: {
					fieldName: 'id',
					values: [],
				},
			},
			commerces: {
				commerces: {
					fieldName: 'id',
					values: [],
				},
				subsidiaries: {
					fieldName: 'subsidiary_id',
					values: [],
				},
			},
			customers: {
				assignedGroup: {
					fieldName: 'group_id',
					values: [],
				},
				addressGroup: {
					tableName: 'com_customers_address',
					fieldName: 'group_ids',
					values: [],
				},
			},
			orders: {
				warehouses: {
					fieldName: 'warehouse_id',
					tableName: 'sal_orders',
					values: [],
				},
				subsidiaries: {
					fieldName: 'subsidiary_id',
					values: [],
					tableName: 'sal_orders',
				},
			},
			employee: {
				listPrice: {
					values: [],
					defaultId: null,
					fieldName: 'com_employee_id',
					tableName: 'sal_price_lists',
				},
			},
		},
		confirmNewPass: '',
		currentPage: 1,
		currentUser: '',
		columnsEmployee: [
			{
				id: 1,
				name: 'Cantidad',
				value: 'rolName',
				visible: true,
				checked: true,
			},
			{ id: 2, name: 'Rol', value: 'quantity', visible: true, checked: true },
			{
				id: 3,
				name: 'Cod. Rol',
				tooltip: 'Código de Rol',
				value: 'quantity',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Nombre',
				value: 'quantity',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'Contraseña',
				value: 'quantity',
				visible: true,
				checked: true,
			},
			{ id: 6, name: 'Acción', value: 'actions', visible: true, checked: true },
		],
		data: [],
		detailQuantity: null,
		documentPayments: [],
		groups: [],
		groupsDirection: [],
		inactive: false,
		indexRow: 0,
		isCreating: false,
		isEditing: false,
		isLoading: false,
		keyValue: 'id',
		lastPage: 1,
		modelMultiple: {
			typeDocuments: null,
			serieInit: null,
			employeeInit: 1,
			name: '',
			roleId: null,
			quantity: null,
		},
		modelAssign: {
			comSubsidiariesId: null,
			password: null,
			flagAdmin: false,
			domain: null,
			warWarehousesId: null,
		},
		newPass: '',
		newUser: {
			cashId: null,
			code: '',
			codeTypeRol: null,
			comSubsidiariesId: null,
			email: '',
			lastname: '',
			level: '',
			flagAdmin: false,
			roleId: null,
			name: '',
			password: '',
			phone: '',
			salTerminalsId: null,
			specialty: '',
			warWarehousesId: null,
			documentNumber: '',
			flagTypePerson: null,
			flagNotShowCostPrice: false,
			additionalInformation: {
				percentageWin: 0,
				flagUpdatePrice: false,
				flagInitTransfers: false,
				flagAllowSellerCancelOrder: false,
				flagMovementsIncome: true,
				flagNotSaleProductFree: true,
				flagShowCashDeskClosing: true,
				flagHideCashOutflow: false,
				flagAllowEditingPurchases: true,
				flagShowOrderEcommerce: false,
				editPriceByPriceList: false,
			},
		},
		noTerminalExist: false,
		otherRight: false,
		salPriceList: [],
		right: false,
		roles: [],
		rowsEmployee: [],
		search: undefined,
		subsidiaries: [],
		params: {
			page: 1,
		},
		terminals: [],
		terminalsAll: [],
		userStatusWord: '',
		valid: true,
		warehouseIds: null,
		warehouses: [],
		configRole: {
			warehouse: false,
			cashBox: true,
			terminals: false,
		},
		typeDocuments: [],
		commerces: [],
		filterTerminalSetCash: false,
	};
}

export default {
	name: 'users-list',
	components: {
		actionSidebar,
		autocompleteComponent,
		appActions,
		appTable,
		appTooltipButton,
		appSelect,
		generalFilter,
		headerPage,
		modalSidebarButton,
		usersFormConfig,
	},
	computed: {
		actionsDisabled,
		isAllowChangeRoles,
		isChangePassword,
		isConfig,
		isNewUser,
	},
	created,
	data,
	methods: {
		addRoleMu,
		applyAction,
		cancelInactive,
		changePage,
		changePass,
		cleanFilter,
		cleanSlide,
		closeModal,
		createUserMultiple,
		deleteRole,
		createNewUser,
		edit,
		filterByWarehouse,
		filteredTerminals,
		filterTypeDocuments,
		getCash,
		getData,
		getWarehouse,
		inactiveAction,
		loadData,
		loadSubsidiaries,
		loadWarehouses,
		newTypeCodeRol,
		openConfig,
		runAction,
		save,
		searchData,
		setUserConfigFilters,
		updateAvaliableTerminals,
		updatePassword,
		userRole,
		changeRol,
		changeDocument,
		changeTerminal,
		setMultipleModal,
		setData,
		validatePriceList(listPrice) {
			return !!listPrice.values.length && !listPrice.defaultId;
		},
	},
	validations,
};
</script>
<style lang="scss" scoped>
.w-123 {
	min-width: 123px;
}

.btn-upload {
	background: map-get($colors, primary);
	border-radius: 5px;
	color: map-get($colors, white);
	font-size: 10px;
	height: 29px;
	width: 100%;
}

.modal--footer {
	background-color: white;
	bottom: 0%;
	left: 0px;
	position: fixed;
	width: 100%;
	z-index: 2;
}
</style>
