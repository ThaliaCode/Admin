<template>
	<div class="companies">
		<header-page caption-navigation="Configuración" :title="$route.meta.title" />
		<v-stepper v-model="step" non-linear>
			<v-stepper-header class="companies-stepper">
				<v-stepper-step step="1" editable :complete="step > 1"
					>Datos de la empresa</v-stepper-step
				>
				<!-- <v-divider></v-divider> -->
				<v-stepper-step step="2" editable :complete="step > 2"
					>Moneda y Bancos</v-stepper-step
				>
				<!-- <v-divider></v-divider> -->
				<v-stepper-step
					step="3"
					editable
					:complete="step > 3"
					v-if="$userInfo.roleId !== 4535"
					>Parámetros Globales</v-stepper-step
				>
				<!-- <v-divider></v-divider> -->
				<v-stepper-step step="4" editable :complete="step > 4"
					>Documentos y Series</v-stepper-step
				>
				<!-- <v-divider></v-divider> -->
				<v-stepper-step step="5" editable :complete="step > 5"
					>Documentos y Pagos</v-stepper-step
				>
				<!-- <v-divider></v-divider> -->
				<v-stepper-step step="6" editable>Reparto</v-stepper-step>
			</v-stepper-header>
			<v-stepper-items class="companies-content">
				<v-stepper-content step="1">
					<h2>Empresa</h2>
					<v-layout wrap class="companies-background">
						<v-flex xs12 sm6 pr-2>
							<v-text-field
								class="filter-select mt-4"
								hide-details
								label="Credencial"
								v-model="company.credential"
							></v-text-field>
						</v-flex>
						<v-flex xs12 sm6 pl-2>
							<v-text-field
								class="filter-select mt-4"
								hide-details
								label="Dirección"
								v-model="company.address"
							></v-text-field>
						</v-flex>
						<v-flex xs12 sm6 pr-2>
							<v-text-field
								class="filter-select mt-4"
								hide-details
								label="Razón Social"
								v-model="company.companyRzSocial"
							></v-text-field>
						</v-flex>
						<v-flex xs12 sm6 pl-2>
							<v-text-field
								class="filter-select mt-4 show-error"
								hide-details
								label="Correo"
								:rules="emailRules"
								v-model="company.email"
							></v-text-field>
						</v-flex>
						<v-flex xs12 sm6 pr-2>
							<v-text-field
								class="filter-select mt-4"
								hide-details
								label="Nombre"
								v-model="company.companyName"
							></v-text-field>
						</v-flex>
						<v-flex xs12 sm6 pl-2>
							<v-text-field
								class="filter-select mt-4 show-error"
								hide-details
								type="number"
								label="RUC"
								v-model="company.ruc"
							></v-text-field>
							<span class="form-group__message" v-if="$v.company.ruc.$invalid">
								{{ rucMessage }}
							</span>
						</v-flex>
						<v-flex xs12 sm6 pr-2>
							<v-text-field
								class="filter-select mt-4"
								hide-details
								label="Código de comercio"
								v-model="company.commerceCode"
							></v-text-field>
							<span
								class="text-not-code-blank"
								v-if="checkBlankCode(company.commerceCode)"
							>
								No se permite espacios en blanco
							</span>
						</v-flex>
						<v-flex xs12 sm6 pl-2>
							<v-text-field
								class="filter-select mt-4"
								hide-details
								label="Teléfono"
								v-model="company.phone"
							></v-text-field>
						</v-flex>
						<v-flex xs12 sm6 pr-2>
							<label ref="label" for="upload-create-section" class="w-100">
								<vue-six-four id="upload-create-section" hidden @vue-six-four="getFile" />
								<v-layout wrap>
									<v-flex xs11 mt-1>
										<app-input-text label="Logo" readonly :text="company.logo" />
									</v-flex>
									<v-flex xs1 mt-4 text-xs-center>
										<v-btn
											@click="showDialog"
											class="ma-0 pl-0 btn-auto"
											small
											color="info"
										>
											<v-icon color="white">image</v-icon>
										</v-btn>
									</v-flex>
								</v-layout>
							</label>
						</v-flex>
						<v-flex xs12 sm6 pl-2>
							<v-text-field
								class="filter-select mt-4"
								hide-details
								label="Dominio de Catálogo"
								v-model="company.settings.domainCatalog"
								@input="validDomainCatalog"
							></v-text-field>
							<span class="form-group__message" v-if="!!domainMessage">
								{{ domainMessage }}
							</span>
						</v-flex>
						<v-flex xs11 sm5 pr-2 v-if="isSupport">
							<v-text-field
								class="filter-select mt-4"
								hide-details
								label="ACL Code"
								readonly
								:value="$userInfo.company.aclCode"
							></v-text-field>
						</v-flex>
						<v-flex xs1 sm1 pr-2 pb-1 v-if="isSupport" style="align-self: end">
							<v-btn
								@click="copy($userInfo.company.aclCode)"
								class="ma-0 pl-0 btn-auto"
								small
								color="primary"
							>
								<v-icon color="white">content_copy</v-icon>
							</v-btn>
						</v-flex>
						<v-flex xs8 sm4 pl-2 v-if="isSupport">
							<v-text-field
								class="filter-select mt-4"
								hide-details
								label="Entorno"
								readonly
								:value="preDomain"
							></v-text-field>
						</v-flex>
						<v-flex xs4 sm2 pl-2 v-if="isSupport">
							<v-text-field
								class="filter-select mt-4"
								hide-details
								label="ID Compañía"
								readonly
								:value="$userInfo.company.id"
							></v-text-field>
						</v-flex>
					</v-layout>
					<div class="companies-btn">
						<v-btn
							type="button"
							color="primary"
							class="btn-action mt-3"
							:disabled="
								$v.$invalid || !!domainMessage || checkBlankCode(company.commerceCode)
							"
							@click.native="saveCompany(2)"
						>
							Guardar
							<v-icon color="white" size="16"> check_circle_outline </v-icon>
						</v-btn>
					</div>
				</v-stepper-content>
				<v-stepper-content step="2">
					<h2>Moneda</h2>
					<v-layout wrap mt-3>
						<v-flex xs6 pl-4 pr-2>
							<app-select
								chips
								:item="companyCurrencies"
								item-text="code"
								item-value="code"
								:items="currencies"
								label="Seleccione las monedas con las que trabajará"
								model="companyCurrencies"
								multiple
								:return-object="false"
								@input="setCurrencies"
							/>
						</v-flex>
						<v-flex xs6 pl-2 pr-4>
							<app-select
								:item="currency"
								:items="currenciesSelected"
								label="Moneda por defecto"
								model="currency"
								:return-object="false"
								@input="setCurrency"
							/>
						</v-flex>
						<!-- <v-flex xs12>
							<h3 class="py-3 px-4">Lista de Cuentas bancarias</h3>
							<v-layout wrap>
								<v-flex xs4 mb-3 px-4>
									<v-text-field
										class="filter-select"
										hide-details
										label="Nombre de la Cuenta"
										v-model="newBankInfo.name"
									></v-text-field>
								</v-flex>
							</v-layout>
							<div class="bank-list-form px-4">
								<v-select
									v-bind:items="banks"
									v-model="newBankInfo.bankId"
									label="Bancos"
									item-text="name"
									item-value="id"
									hide-details
									class="filter-select"
									content-class="filter-select-content"
								></v-select>
								<v-text-field
									class="filter-select"
									hide-details
									type="number"
									label="Nro. de Cuenta"
									v-model="newBankInfo.accountNumber"
								></v-text-field>
								<v-text-field
									class="filter-select"
									hide-details
									type="number"
									label="Nro. de Cuenta Interbancaria"
									v-model="newBankInfo.accountNumberCi"
								></v-text-field>
								<v-select
									:items="currenciesSelected"
									v-model="newBankInfo.currency"
									label="Tipo de Moneda"
									item-text="code"
									item-value="code"
									hide-details
									class="filter-select"
									content-class="filter-select-content"
								></v-select>
								<v-btn
									type="button"
									color="primary"
									class="btn-action ma-0"
									:disabled="!newBankInfo.name"
									v-on:click="addAccount">
									Agregar
								</v-btn>
							</div>
							<div class="overflow-auto mt-4">
								<app-table
									name="bankAccounts"
									:columns="columns"
									:rows="company.bankAccounts"
									local-storage
									:main-list="false"
									:input-search="false"
									:filter-columns="false"
									class="no-main-list is-not-selectable px-0">
									<template slot="rows" slot-scope="props">
										<td
											class="is-not-selectable"
											v-show="showRow(columns, 1)">{{ props.row.bank.name }}</td>
										<td v-show="showRow(columns, 2)">{{ props.row.accountNumber }}</td>
										<td v-show="showRow(columns, 3)">{{ props.row.accountNumberCi }}</td>
										<td v-show="showRow(columns, 4)">{{ props.row.currency }}</td>
										<td>
											<button
												class="table-icon"
												v-on:click="editRow(props.row)">
												<img :src="`${$imageUrl}/editar.svg`" alt="">
											</button>
											<button
												class="table-icon"
												v-on:click="deleteRow(props.row)">
												<v-icon
								color="pink"
								size="19">
								highlight_off
							</v-icon>
											</button>
										</td>
									</template>
								</app-table>
							</div>
						</v-flex> -->
					</v-layout>
					<div class="companies-btn pr-5 pt-4">
						<v-btn
							type="button"
							color="info"
							class="btn-action mr-1"
							@click.native="step = 1"
						>
							Atrás
							<img :src="`${$imageUrl}/back.svg`" alt="" />
						</v-btn>
						<v-btn
							type="button"
							class="btn-action mr-0 ml-1"
							color="primary"
							@click.native="saveCompany(3)"
						>
							Guardar
							<v-icon color="white" size="16"> check_circle_outline </v-icon>
						</v-btn>
					</div>
				</v-stepper-content>
				<v-stepper-content step="3" v-if="$userInfo.roleId !== 4535">
					<h2 class="mb-4 title-global">Parámetros Globales</h2>
					<v-layout row justify-space-between>
						<v-flex xs12 sm5 md6 xl6>
							<v-flex class="title-section" xs9 mb-3> Productos </v-flex>
							<v-flex xs12>
								<v-layout row wrap align-end>
									<v-flex xs12 md5>
										<app-select
											label="Agregar peso para productos:"
											:items="units"
											item-text="name"
											item-value="id"
											:item="company.weight"
											model="weight"
										/>
									</v-flex>
									<v-flex xs12 md4 pl-3>
										<app-select
											label="Convertir a:"
											:items="units"
											:item="company.convertWeightTo"
											item-text="name"
											item-value="id"
											model="convertWeightTo"
										/>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mt-3 mb-3>
								<v-layout row wrap align-center>
									<v-flex xs10>
										<span class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagCodeProductAuto - </span>
											Editar código de un producto:
										</span>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Al activar este switch, se podrá editar el código del producto."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagCodeProductAuto"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mt-3 mb-3>
								<v-layout row wrap align-center>
									<v-flex xs10>
										<span class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagCodeAutoGenerate - </span>
											Permitir generar código automático:
										</span>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Al activar este switch, se podrá generar un código automático al producto."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagCodeAutoGenerate"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout row wrap align-center>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport"
												>flagHideOutOfStockInPOS -
											</span>
											Mostrar solo productos con stock en el POS.
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Al activar esta opción, solo se mostrara los productos con stock en el POS."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagHideOutOfStockInPOS"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout row wrap align-center>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">stockNegative - </span>
											Permitir Stock Negativo:
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Cuando realiza ventas que no son inmediatas la empresa puede activar esta opción."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="company.settings.stockNegative"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout row wrap align-center>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">globalDiscount - </span>
											Descuento global:
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Si se activa se podrá hacer un descuento  a todos los productos al realizar una venta."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="company.settings.globalDiscount"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout row wrap align-center>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagCategoryPrice - </span>
											Activar precios por categoría (Android)
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Actívalo en caso quieras cambiar el precio del producto por el de categoría."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="company.settings.flagCategoryPrice"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagCodes - </span>
											Mostrar otros códigos
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Activar esta opción para tenerla opción de agregar varios códigos a tus productos."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="company.settings.flagCodes"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout row wrap align-center>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagConvers - </span>
											Mostrar conversiones al crear un producto
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Activar esta opción cuando se tiene varias presentaciones del producto."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagConvers"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex mb-3 xs12>
								<v-layout row wrap align-center>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagShowVariations - </span>
											Mostrar tipo de producto variaciones al crear un producto
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Activar esta opción cuando tienes un producto padre y  productos hijos ."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagShowVariations"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex mb-3 xs12>
								<v-layout row wrap align-center>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagTypeSearch - </span>
											Especificar busqueda lineal o generales el listado de productos
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Activar esta opción se realizara una busqueda general de lo contraria seria una busqueda especifica."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagTypeSearch"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex mb-3 xs12>
								<v-layout row wrap align-center>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagWorkWithBatches - </span>
											Trabajar con Control de Lotes y Fecha de Venc.
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Activar esta opción se realizara trabajar con lotes."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagWorkWithBatches"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex mb-3 xs12>
								<v-layout row wrap align-center>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagShowIot - </span>
											Desea trabajar con IOT
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Activar esta opción la compañia trabajara con IOT"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagShowIot"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex mb-3 xs12>
								<v-layout row wrap align-center>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagUseSimpleBrand - </span>
											Configurar tipo de marca simple
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Activar esta opción se trabajara con un tipo de marca simple"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagUseSimpleBrand"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex mb-3 xs12>
								<v-layout row wrap align-center>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="$userInfo.roleCode === 'SUPPORT'"
												>priceToQuantityCalculation -
											</span>
											Deshabilitar el boton calcular la cantidad en funcion al precio
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Activar esta opción deshabilitara el boton calcular la cantidad en funcion al precio en el POS"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="priceToQuantityCalculation"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex mb-3 xs12>
								<v-layout row wrap align-center>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagProductOnlyStock - </span>
											Sincronizar productos sin stock
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Activar esta opción permitira sincronizar sus productos sin stock"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagProductOnlyStock"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex mb-3 xs12>
								<v-layout row wrap align-center>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagInventoryFast - </span>
											Mostrar opción Inventario Rápido
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Activar esta opción permitira realizar un inventario rapido"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagInventoryFast"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mt-3 mb-3>
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport"
												>flagProductExpressFlow -
											</span>
											Trabajar con Producto Express
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Mostrar seleccion y crear un producto rapido(Parecido a un servicio de producto servicio)."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagProductExpressFlow"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex mb-3 xs12 v-if="isSupport">
								<v-layout row wrap align-center>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagStockByConversion - </span>
											Permitir Control de Conversiones
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Activar esta opción permitira tener referencia de stock por Conversiones"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagStockByConversion"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12>
								<v-flex xs12 mb-3>
									<p class="company-text-regular ma-0">Tipo de Producto:</p>
								</v-flex>
								<v-layout row>
									<!-- TODO: Estos elementos deben ser dinamicos, por servicio -->
									<v-flex xs11>
										<v-layout wrap>
											<v-flex xs5>
												<v-checkbox
													color="success"
													v-model="selectTypeProducts"
													label="Producto Terminado"
													:value="codeProduct"
												></v-checkbox>
											</v-flex>
											<v-flex xs4>
												<v-checkbox
													color="success"
													v-model="selectTypeProducts"
													label="Servicio"
													:value="codeServices"
												></v-checkbox>
											</v-flex>
											<v-flex xs3>
												<v-checkbox
													color="success"
													v-model="selectTypeProducts"
													label="Compuesto"
													:value="codeComposed"
												></v-checkbox>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex class="title-section" xs9 mb-3> Venta </v-flex>
							<v-flex xs12 mb-3>
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport"
												>flagGenericSalesCustomer -
											</span>
											Habilitar {{ labelGeneric }}
										</p>
									</v-flex>
									<v-flex xs2>
										<v-layout align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													:text="textGenericCustomer"
												></app-tooltip-button>
											</v-flex>
											<v-flex ml-2>
												<v-switch
													color="success"
													hide-details
													v-model="flagGenericSalesCustomer"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout row>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagUpdatePrice - </span>
											Editar precios durante la venta:
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Si tienes un punto de venta y desean que sus vendedores editen el precio activar la opción."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													:false-value="0"
													:true-value="1"
													v-model="company.flagUpdatePrice"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagBarcodeReader - </span>
											Usar Lector de barras en ventas:
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Solo activar esta opción siempre y cuando vendas con código de barra."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													:false-value="0"
													:true-value="1"
													v-model="company.flagBarcodeReader"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout row wrap align-center>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">downloadSale - </span>
											{{ labelDownload }}
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Activar para descargar las ventas en pdf o desactivar para visualizar el reporte y poder imprimirlo ."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="company.settings.downloadSale"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout row wrap align-center>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagTip - </span>
											Mostrar Opción Recargo al Consumo:
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Solo se usa para propinas."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="company.settings.flagTip"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout row>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagBasePriceDefault - </span>
											Precio base para cálculo al genera ventas:
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Siempre mantener activado."
													textRed="Advertencia: Si desde un inicio se trabaja con PV
													y quieren cambiarlo, perderían todos sus reportes."
													txt-red
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													:false-value="1"
													:true-value="2"
													v-model="company.settings.flagBasePriceDefault"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout row wrap align-center>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">assignEmployee - </span>
											Asignar empleado a la venta (Android)
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Cuando se tenga una sola caja y varios vendedores."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="company.settings.assignEmployee"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout row wrap align-center>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">showCash - </span>
											Total en efectivo por defecto al crear la venta
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Si tu cliente usualmente paga en efectivo te aparecerá por
														defecto seleccionada la opción de efectivo al momento de realizar una venta"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="company.settings.showCash"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout row wrap align-center>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">singleDiscount - </span>
											Descuento por producto al realizar una venta:
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Permitir realizar un descuento por producto, al realizar una venta."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="company.settings.singleDiscount"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout row>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagTransferDisplay - </span>
											Mostrar Opción Despachar Productos:
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Al hablitar este campo, se podra descontar stock al convertir un documento de venta."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													:false-value="0"
													:true-value="1"
													v-model="company.settings.flagTransferDisplay"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout row wrap align-center mt-3>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">autoDispatch - </span>
											Autodespacho:
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Al hablitar este parametro, se habilitara el autodespacho al realizar una venta"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="company.settings.autoDispatch"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<!-- <v-flex xs12 mb-3>
								<v-layout row>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											Descontar Stock:
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
						height="17"
						icon="help"
													text="Al hablitar este campo, podra seleccionar descontar stock al convertir un documento de venta."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													:false-value="0"
													:true-value="1"
													v-model="company.settings.flagTransferDefault"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex> -->
							<v-flex xs12 mb-3>
								<v-layout row>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagLoyalti - </span>
											Activar Loyalty
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Permitir al realizar un documento de venta, tus clientes cajeen sus puntos."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													:false-value="0"
													:true-value="1"
													v-model="flagLoyalti"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12>
								<v-layout row>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagTypeDiscount - </span>
											{{ textDiscount }}
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Al activar esta opción se realizara descuento en monto, de lo contrario se realizara por porcentaje."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													:false-value="0"
													:true-value="1"
													v-model="flagTypeDiscount"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12>
								<v-layout row wrap align-center mt-3>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">showNotifySale - </span>
											Notificar cuando el Precio Venta es menor al Precio Costo:
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Al activar esta opción se mostrar un mensaje de alerta cuando el precio de venta es mayor al precio de costo."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="showNotifySale"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12>
								<v-layout row wrap align-center mt-3>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">showImageSearch - </span>
											Mostrar imagen en buscar producto
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Al activar esta opción se visualizará las imagenes del producto en la opcion buscar producto."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="showImageSearch"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12>
								<v-layout row wrap align-center mt-3>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport"
												>flagDisablePrintMobile -
											</span>
											Deshabilitar impresión de ticket en el detalle de venta ( Movil )
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Al activar esta opción se deshabilitar impresion de ticket en el detalle de venta movil."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagDisablePrintMobile"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12>
								<v-layout row wrap align-center mt-3>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagElectronicGuide - </span>
											Habilitar Guia de Remisión Electronica
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Al activar esta opción se visualizará las imagenes del producto en la opcion buscar producto."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagElectronicGuide"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12>
								<v-layout row wrap align-center mt-3>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport"
												>flagEditPriceBySupervisor -
											</span>
											Activar cambio de precio en móvil con clave de supervisor
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Al activar esta opción se activará el cambio de precio en móvil con la clave del supervisor"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagEditPriceBySupervisor"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 v-if="isSupport">
								<v-layout row wrap align-center mt-3>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12">flagAdvanceOnSale - </span>
											Activar anticipos de venta
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Al activar esta opción se activará los anticipos en ventas."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagAdvanceOnSale"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 v-if="isSupport">
								<v-layout row wrap align-center mt-3>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12">flagSettlement - </span>
											Habilitar la configuracion de liquidacion por producto en ventas
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Al activar esta opción se activará la configuracion de liqudacion por producto en ventas."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagSettlement"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<!-- <v-layout row wrap align-center mb-3>
								<v-flex xs12>
									<v-layout row>
										<v-flex xs10>
											<p class="company-text-regular ma-0">
												Descontar stock al generar venta desde una transferencia
											</p>
										</v-flex>
										<v-flex xs2 pl-2>
											<v-switch
												color="success"
												:label="editFlagStockDiscountSaleTransfer"
												hide-details
												:false-value="0"
												:true-value="1"
												v-model="company.settings.flagStockDiscountSaleTransfer"
											></v-switch>
										</v-flex>
									</v-layout>
								</v-flex>
							</v-layout> -->
							<!-- <v-flex xs12 mb-3>
								<v-layout row wrap>
									<v-flex xs7>
										<p class="company-text-regular ma-0">
											Tipo de Listas de Precios:
										</p>
									</v-flex>
									<v-flex xs5 pl-2>
										<app-select
											:item="company.settings.typePriceShown"
											item-text="label"
											item-value="id"
											:items="typePricesLists"
											model="typePriceShown"
											@input="setTypePriceShown"
										></app-select>
									</v-flex>
								</v-layout>
							</v-flex> -->
						</v-flex>
						<v-flex class="ml-150" xs12 sm5 ml-5 md6 xl6>
							<v-flex xs9 class="title-section" mb-3> Cotización </v-flex>
							<v-flex xs12 mb-3>
								<v-layout row wrap align-center>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagIgv - </span>
											Incluye {{ labelsByCountry.taxName }} en cotizaciones
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="El precio de tu productos se va a reflejar si va incluir IGV o no en la cotización."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													:false-value="0"
													:true-value="1"
													v-model="company.flagIgv"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout row wrap align-center>
									<v-flex xs12 sm9 xl10 md10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagImport - </span>
											Mostrar Campos de Importación:
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Si en caso se trabaje con cotizaciones y  deseas que los días
														de demora en importar el producto aparezca en la cotización activar esta opción."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="company.settings.flagImport"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout row wrap align-center>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagQuotation - </span>
											Configuración para template
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Activar esta opción para personalizar tu cotización (Costo Adicional)."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagQuotation"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout row wrap align-center>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">COTMoveKardex - </span>
											Reservar Stock
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Activar esta opción si desea activar reservar stock del producto."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="COTMoveKardex"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout row wrap align-center>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport"
												>flagMultipleSalesConversionsQuote -
											</span>
											{{ labelSwitchQuantion }}
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Al activar esta opción solamente se podrá convertir a venta una vez y bloqueara el botón de convertir a venta"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagMultipleSalesConversionsQuote"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs9 class="title-section" mb-3> Cliente </v-flex>
							<v-flex xs12 mb-3>
								<v-layout row wrap align-center>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport"
												>emailCustomerMandatory -
											</span>
											Habilitar email obligatorio al crear cliente
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Al crear un cliente en configuración si en caso quieras registrar a todos tus clientes con correo activa esta opción."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="company.settings.emailCustomerMandatory"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout row wrap align-center>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagUseDocConsulting - </span>
											Usar el servicio de consulta de Numero de documento
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Si esta activo, usara el servicio de consulta de Documento(Cliente y Proveedor)."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagUseDocConsulting"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout row wrap align-center>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport"
												>flagShowCustomersAssignedToRoute -
											</span>
											Permitir que se muestren solo clientes asignados a una determinada
											ruta
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Si esta activo, solo se mostraran clientes asignados a una determinada ruta."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagShowCustomersAssignedToRoute"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs9 class="title-section" mb-3> Compras </v-flex>
							<v-flex xs12 mt-3 mb-3>
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagPerception - </span>
											Trabajar con Percepción
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Al activar esta opción, muestra configuración de proveedores con percepcion"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagPerception"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mt-3 mb-3>
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagNotLimitInORC - </span>
											Limitar conversion de ordenes de compra a cantidad relacionada
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Al activar esta opción, se limitara la conversion de ordenes de compra a cantidad relacionada"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagNotLimitInORC"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs9 class="title-section" mb-3> Pedidos </v-flex>
							<v-flex xs12 mb-3>
								<v-layout row wrap align-center>
									<v-flex xs12 sm9 md10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagTypeOriginOrder - </span>
											Verificar que se muestre el tipo de origen del pedido
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Este acción te permite la selección de tipo de origenes al pedido"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagTypeOriginOrder"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout row wrap>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagShowBaseUnit - </span>
											Ocultar Unidad funcional si esque existe conversión
										</p>
									</v-flex>
									<v-flex xs1 ml-1>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Este acción te permite ocutar la unidad de conversión"
												></app-tooltip-button>
											</v-flex>
										</v-layout>
									</v-flex>
									<v-flex xs11 mt-2 text-xs-right>
										<app-select
											:item="company.settings.flagShowBaseUnit"
											item-text="name"
											item-value="id"
											:items="typeShowBaseUnit"
											model="flagShowBaseUnit"
											@input="setTypePriceShown"
										></app-select>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout row wrap align-center>
									<v-flex xs12 sm9 md10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagCatEcomFather - </span>
											Usar categorías ecommerce recursivas (categorías padres)
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="En caso utilicen la tienda Virtual activar esta opción."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagCatEcomFather"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout row wrap align-center>
									<v-flex xs12 sm9 md10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagHideOutOfStock - </span>
											Mostrar solo los productos con stock en la tienda online.
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Al activar esta opcion se mostrara solo los productos con stock en la tienda online."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagHideOutOfStock"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout row wrap align-center>
									<v-flex xs12 sm9 md10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagShowTotalOrders - </span>
											Mostrar total de pedidos en el listado desde el Móvil
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Activar esta opción para mostrar el total de pedidos en el listado."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagShowTotalOrders"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout row wrap align-center>
									<v-flex xs12 sm9 md10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport"
												>flagPriceListChangeApproval -
											</span>
											Activar aprobación del administrador para que el vendedor cambie la
											lista de precio
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Este acción te permite usar la aprobación del administrador para que el vendedor cambie la lista de precio"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagPriceListChangeApproval"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout row wrap align-center>
									<v-flex xs12 sm9 md10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="$userInfo.roleCode === 'SUPPORT'"
												>checkSellerWritedCode -
											</span>
											Permitir ingresar el código del vendedor para verificar existencia
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Permitir ingresar el código del vendedor para verificar su existencia; de lo contrario, mostrar un selector de empleados"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="checkSellerWritedCode"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout row wrap align-center>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagShowSlugProduct - </span>
											Mostrar campo slug en producto ecommerce
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Si utilizan a tienda virtual activar esta opción."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagShowSlugProduct"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout row wrap align-center>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport"
												>flagAddressNotRequired -
											</span>
											Dirección no requerida para Vendor.
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Esta opción permite elegir si desea la dirección sea requerida o no."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagAddressNotRequired"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout row wrap align-center>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">restaurantFlow - </span>
											Compañia Fujo Restaurant
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Esta opcion solo usan las compañias que son restaurants"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="restaurantFlow"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout row wrap align-center>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagTypeConvertToSale - </span>
											Tipo de Conversión a venta
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Al habilitar esta opción los documentos convertidos a ventas seran automático separado por almacén, sino seria una conversión normal (servicio de venta)"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagTypeConvertToSale"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout row wrap align-center>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagEditOrderVendor - </span>
											Permitir crear pedido como borrador desde Vendor
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Esta opción permite elegir si desea la dirección sea requerida o no."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagEditOrderVendor"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout row wrap align-center>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport"
												>flagNotConvertToSaleFlow -
											</span>
											Generación de documentos no sea automática desde integraciones
											(SHOPIFY)
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Esta opción permite generar docoumentos no sean automaticas en shopify."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagNotConvertToSaleFlow"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout row wrap align-center>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport"
												>flagEnableRequestedRoutes -
											</span>
											Permitir Crear Rutas con pedidos solicitados
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Esta opción permite crear ruta con pedidos solicitados."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagEnableRequestedRoutes"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout row wrap align-center>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport"
												>allowOrderStockNegative -
											</span>
											Permitir stock Negativo en Pedidos
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Esta opción permitir stock negativo en pedidos"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="allowOrderStockNegative"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout row wrap align-center>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport"
												>allowEditCustomerWarehouse -
											</span>
											Permitir editar cliente por rol almacenero
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Esta opción permite editar cliente por rol almacenero"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="allowEditCustomerWarehouse"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout row wrap align-center>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagNotifyStorekeeper - </span>
											Activar notificaciones al almacenero al confirmar pedido.
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Esta opción permite notificar al almacenero al confirmar el pedido"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagNotifyStorekeeper"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout row wrap align-center>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport"
												>flagDoNotPrintRequestedOrder -
											</span>
											Esta opción permite no imprimir el pedido.
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Esta opción permite no imprimir el pedido"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagDoNotPrintRequestedOrder"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout row wrap align-center>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagTypeOriginOrder - </span>
											Agregar impuesto por defecto (IGV) - (MOVIL)
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Indica si se debe mostrar o no el selector de impuestos en pantallas de productos"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagTaxesDefault"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout row wrap align-center>
									<v-flex xs12 sm9 md10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport"
												>flagDispatchConvertedOrder -
											</span>
											Solo despachar si el pedido esta convertido a venta
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Permite despachar pedidos convertidos a venta"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagDispatchConvertedOrder"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout row wrap align-center>
									<v-flex xs12 sm9 md10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport"
												>flagAssignEmployeeOrder -
											</span>
											Permitir asignar empleado al crear pedido
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Esta opción permite asignar empleado al crear pedido"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagAssignEmployeeOrder"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3 v-if="isSupport">
								<v-layout row wrap align-center>
									<v-flex xs12 sm9 md10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport"
												>flagDeliveryAsConfirmed -
											</span>
											Marcar pedido como confirmado al crear un pedido
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Esta opción permite marcar como confirmado automáticamente un pedido luego de crearlo"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagDeliveryAsConfirmed"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs9 class="title-section" mb-3> Distribuidor </v-flex>
							<v-flex xs12 mb-3>
								<v-layout>
									<v-flex xs12 sm9 xl10 md10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagGrouper - </span>
											Compañía tipo distribuidor
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Se podrá activar esta opción solo cuando son compañías tipo distribuidor y se encuentran dentro del plan Mega."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagGrouper"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout>
									<v-flex xs12 sm9 xl10 md10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport"
												>disableRouteFollowUp -
											</span>
											Deshabilitar la opción de ingresar sin seguimiento en ruta
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Al activar esta opción se deshabilita la opción de ingresar sin seguimiento en ruta."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="disableRouteFollowUp"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout wrap>
									<v-flex xs12 sm9 xl10 md10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport"
												>flagAutomaticRoutesClose -
											</span>
											Cierre automatico de rutas
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Finalizar las rutas de forma masiva."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													:true-value="1"
													:false-value="0"
													hide-details
													v-model="company.flagAutomaticRoutesClose"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
									<v-flex xs12 md4 v-show="company.flagAutomaticRoutesClose">
										<app-input-text
											label="Hora de cierre"
											model="hourOfClose"
											:text="company.hourOfClose"
											type="time"
											@input="setData($event)"
										/>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout row wrap>
									<v-flex xs5>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">distanceMode - </span>
											Forma de calcular distancia:
										</p>
									</v-flex>
									<v-flex xs1 ml-1>
										<v-tooltip top>
											<img
												src="/static/img/new-icons/icon-help-fill.svg"
												alt="signo de interrogación"
												slot="activator"
												height="18"
											/>
											<span
												>Forma en la que se calculará la distancia entre el comercio y la
												dirección del cliente en el pedido.</span
											>
										</v-tooltip>
									</v-flex>
									<v-flex xs5 text-xs-right>
										<app-select
											:item="company.settings.distanceMode"
											item-text="name"
											item-value="id"
											:items="typeDistanceMode"
											model="distanceMode"
											@input="setTypePriceShown"
										></app-select>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs9 class="title-section" mb-3> Contabilidad </v-flex>
							<v-flex xs12 mb-3>
								<v-layout row wrap align-center>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport"
												>flagShowAccountingEngine -
											</span>
											Contabilidad
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Activar en caso se quiera participar en el plan Beta del Modo de contabilidad que se esta lanzando en modo prueba."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="company.settings.flagShowAccountingEngine"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout row wrap align-center>
									<v-flex xs12 sm9 xl10 md10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport"
												>flagTypeIntegrationGrouper -
											</span>
											Tipo de Integración General
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Activar en caso se quiera participar en el plan Beta del Modo de contabilidad que se esta lanzando en modo prueba."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="company.settings.flagTypeIntegrationGrouper"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout row wrap align-center>
									<v-flex xs12 sm9 xl10 md10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">notAttachedDocument - </span>
											No permitir aplicar un gasto sin sustento
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="No permite aplicar un gasto sin sustento"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="expenseConfig.notAttachedDocument"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3>
								<v-layout row wrap align-center>
									<v-flex xs12 sm9 xl10 md10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">relateExpense - </span>
											Relacionar gasto con caja, banco o compra.
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Permite poder relacionar gastos con caja, banco o compra."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="expenseConfig.relateExpense"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs9 class="title-section" mb-3> Agencia de Transporte </v-flex>
							<v-flex xs12 mt-2>
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport"
												>flagUseTransportAgency -
											</span>
											Trabajar con Agencia de transportes
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Permitir enviar tu pedido mediante un agencia de transporte"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagUseTransportAgency"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mt-2>
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport"
												>flagRequestLocationOrderApp -
											</span>
											Pedir Ubigeo en nueva dirección (App de Pedidos)
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Permitir una dirección exacta al realizar un pedido"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagRequestLocationOrderApp"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mt-2>
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport"
												>flagAskLocationSellerApp -
											</span>
											Pedir Ubigeo en nueva dirección (App de Vendedor de Campo)
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Permitir una dirección exacta al realizar un pedido"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagAskLocationSellerApp"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>

							<v-flex xs12 mt-2>
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport"
												>flagRelateVehicleFloat -
											</span>
											Registrar vehiculos y conductores del transportista
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Indicador para registrar vehículos y conductores del transportista"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagRelateVehicleFloat"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>

							<v-flex xs9 class="title-section" mb-3 mt-2> Punto de Venta </v-flex>
							<v-flex xs12 mt-2>
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagAlertConversions - </span>
											Alertar en el punto de venta móvil que un producto posee
											conversiones
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Permitir una dirección exacta al realizar un pedido"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagAlertConversions"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs9 class="title-section" mt-2 mb-3 v-if="isSupport">
								Soporte
							</v-flex>
							<v-flex xs12 mt-3 mb-3 v-if="isSupport">
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagTest - </span>
											Esta compañía sera de prueba
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="si esta actvo, significa que la cuenta es de prueba"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													:false-value="0"
													:true-value="1"
													v-model="company.flagTest"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mt-3 mb-3 v-if="isSupport">
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport"
												>flagUseIntegrationWhatsApp -
											</span>
											Habilitar la integracion de WhatsApp en el POS.
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Si está activo, se habilitará la integración de WhatsApp en el POS"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagUseIntegrationWhatsApp"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mt-3 mb-3>
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagWorkingWithAI - </span>
											Habilitar el flujo de trabajo con IA.
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													:img="'/static/img/new-icons/icon-help-fill.svg'"
													text="Si está activo, se habilitará el flujo de trabajo con IA."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagWorkingWithAI"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<!-- <v-flex xs12 mt-3 mb-3 v-if="isSupport">
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagOutbox - </span>
											Usar el flujo de Outbox para transacciones
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Si está activo, se usará el flujo de Outbox para transacciones"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagOutbox"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex> -->
							<v-flex xs12 mt-3 mb-3 v-if="isSupport">
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagCompanyEliminated - </span>
											Habilitar el flujo de eliminación de compañía
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Se usaran compañías que pasarán por un flujo de eliminación"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagCompanyEliminated"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mt-3 mb-3 v-if="isSupport">
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport"
												>flagAttendanceRegistration -
											</span>
											Habilita el registro de asistencia desde móvil
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Habilitar registro de asistencia desde móvil y controlar consumo de servicios asociados"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagAttendanceRegistration"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mt-3 mb-3 v-if="isSupport">
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagEditBlockedAcl - </span>
											Activar cuenta del acl
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Al habilitar esta opcion, permite activar la cuenta del ACL"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagEditBlockedAcl"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mt-3 mb-3 v-if="isSupport">
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">balanceCustomerAll - </span>
											Ejecuta cron de actualizacion de Deudas de Clientes
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Al habilitar esta opcion, se ejecutara cron de actualizacion de Deudas de Clientes"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="balanceCustomerAll"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mt-3 mb-3 v-if="isSupport">
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport"
												>flagNotUseGlobalUbigeo -
											</span>
											Ocultar campos del ubigeo de las tiendas
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Ocultar campos del ubigeo de las tiendas, menos el campo direccion"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagNotUseGlobalUbigeo"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mt-3 mb-3 v-if="isSupport">
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagSalDocAsCash - </span>
											Generar documentos de venta al contado
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Al activar esta opción, los documentos de venta se crearan con metodo de pago al contado"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagSalDocAsCash"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mt-3 mb-3 v-if="isSupport">
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagDisabledSignature - </span>
											Limitaciones en la Firma Móvil para Cobros y Pagos
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Al activar esta opción, no permitira agregar firma en movil al momento de hacer cobros/pagos"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagDisabledSignature"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mt-3 mb-3 v-if="isSupport">
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagDownloadOrder - </span>
											Generar y Guardar Ticket en PDF
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Permite generar y guardar el pdf un ticket de pdf	"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagDownloadOrder"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mt-3 mb-3 v-if="isSupport">
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagExternalData - </span>
											Permitir editar el código externo de una venta en el listado
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Permitir editar el código externo de una venta en el listado"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagExternalData"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mt-3 mb-3 v-if="isSupport">
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagUseTori - </span>
											Trabajar con dispositivo Tori
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Al activar esta opción, se trabajará con dispositivo Tori"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagUseTori"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mt-3 mb-3 v-if="isSupport">
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagStockProductGroup - </span>
											Indica que se verifica stock negativo de productos agrupados en
											backend
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Al activar esta opción verifica stock negativo de productos agrupados en backend"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagStockProductGroup"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mt-3 mb-3 v-if="isSupport">
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport"
												>flagExchangePointsByProduct -
											</span>
											Permite realizar intercambio de puntos por producto
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Al activar esta opción se podra intercambiar puntos por producto"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagExchangePointsByProduct"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mt-3 mb-3 v-if="isSupport">
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">wholesaler - </span>
											Permitir muestra lista de sincronizacion de productos maestros
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Al activar esta opción permitir mostrar lista de sincronización de productos maestros"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="wholesaler"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mt-3 mb-3 v-if="isSupport">
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport"
												>flagFlowManufacturedProduct -
											</span>
											Trabajar con Producto Fabricado
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Permitir Mostrar tipo de producto Insumo y crer tipo manufacturado como terminado."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagFlowManufacturedProduct"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mt-3 mb-3 v-if="isSupport">
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport"
												>flagSyncMoveTypeFirebase -
											</span>
											Permitir registros para sincronización de stock de productos
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Permitir intercambiar numeracion al convertir notas de venta(relacionadas a pedidos) a boleta/factura."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagSyncMoveTypeFirebase"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mt-3 mb-3 v-if="isSupport">
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagChangeNtvFlow - </span>
											Indicar si la empresa trabajara con conversion (intercambio de
											documento NTV -> BOL)
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Permitir intercambiar numeracion al convertir notas de venta(relacionadas a pedidos) a boleta/factura."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagChangeNtvFlow"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mt-3 mb-3>
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagNewKardexV3 - </span>
											Configuracion temporal para trabajar con la nueva estructura de
											kardex
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Configuracion temporal para pruebas que trabjan con la nueva estructura de kardex"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagNewKardexV3"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mt-3 mb-3 v-if="isSupport">
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagTotalKardex - </span>
											Indica que se mostrará la columna de total en el kardex
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Indica que se mostrará la columna de total en el kardex."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagTotalKardex"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mt-3 mb-3 v-if="isSupport">
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagNotMoveKardex - </span>
											Indica ingreso directo a tablas de productos maestro/almacen
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Indica ingreso directo a tablas de productos maestro/almacen. En caso este desactivado se manejará el registro de stock en Kardex"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													@change="showNotMoveKardex"
													v-model="flagNotMoveKardex"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 v-if="isSupport">
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagKardexValued - </span>
											{{ labelShowKardex }}
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Si activo esta opción se usará el calculo de costo promedio si en caso lo desactivo
														el costo que se va a mostrar en tu producto maestro va hacer el último costo de tu compra."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													:disabled="flagNotMoveKardex"
													color="success"
													hide-details
													v-model="flagKardexValued"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mt-3 v-if="isSupport">
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagKardexFast - </span>
											Calculo de saldo de stock y costo inmediato
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Indica si el inmediatamente despues de registrar en el kardex estos registros se les calculará el stock y/o costo')"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													:disabled="flagNotMoveKardex"
													color="success"
													hide-details
													v-model="flagKardexFast"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mt-3 v-if="isSupport">
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">typeRegisterKardex - </span>
											{{ labelShowRegisterKardex }}
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Al habilitar este campo se genera un registro inmediato por DB, de lo contrario se registra por SQS"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													:disabled="true"
													:false-value="1"
													:true-value="2"
													color="success"
													hide-details
													v-model="typeRegisterKardex"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mt-3 v-if="isSupport">
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagKardexOptimized - </span>
											Kardex optimizado
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Habilitar para registros de movimientos de productos y elimina configuraciones previas por compañia de tipo kardex"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagKardexOptimized"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mt-3 v-if="isSupport">
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagImmediateTransfer - </span>
											Permitir realizar solicitudes aprobadas por defecto y recepcionar
											transferencias
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Permitir realizar solicitudes aprobadas por defecto y recepcionar transferencias no aceptados por el un administrador"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagImmediateTransfer"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex s12 mt-3 v-if="isSupport">
								<!-- Selector de impeusto por defecto -->
								<v-layout row wrap>
									<v-flex xs5>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">codeDefaultTaxes - </span>
											<span>Incluir código de impuesto por defecto</span>
										</p>
									</v-flex>
									<v-flex xs1 ml-1>
										<v-tooltip top>
											<img
												src="/static/img/new-icons/icon-help-fill.svg"
												alt="signo de interrogación"
												slot="activator"
												height="18"
											/>
											<span>Incluir código de impuesto por defecto</span>
										</v-tooltip>
									</v-flex>
									<v-flex xs5 text-xs-right>
										<app-select
											model="codeTaxesDefault"
											:item="defaultTax"
											:items="arrayTaxesGeneral"
											item-text="description"
											item-value="idCodeReference"
											@input="setDefaultTaxCode"
										/>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mt-3 v-if="isSupport">
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagAuditService - </span>
											Permite visualizar el historial de cambios del precio los productos
											en el punto de venta
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Permite visualizar el historial de cambios del precio los productos en el punto de venta"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagAuditService"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mt-3 v-if="isSupport">
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagRoundSales - </span>
											Habilitar redondeo de ventas
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Habilitar redondeo de ventas."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagRoundSales"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mt-3 v-if="isSupport">
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport"
												>flagPurCashDeskClosing -
											</span>
											Indicar si las compras tendran ingreso a caja
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Indicar si las compras tendran ingreso a caja"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagPurCashDeskClosing"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mt-3 v-if="isSupport">
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport"
												>flagPurAutoGenerateSerie: -
											</span>
											Autogenerar Series de Compras
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Indicar que los tipos de documentos de compra con flagGenerateSerie crearan serie por defecto."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagPurAutoGenerateSerie"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mt-3 v-if="isSupport">
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport"
												>flagNotifySalesConversion: -
											</span>
											Notificacion por topic a movil al convertir pedido a venta
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Envia notificacion por topic a movil al convertir pedido a venta."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagNotifySalesConversion"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mt-3 v-if="isSupport">
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport"
												>flagAnnexTransactions: -
											</span>
											Habilitar recurso de anexo de caja (POS).
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Habilitar recurso de anexo de caja (POS)."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagAnnexTransactions"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mt-3 v-if="isSupport">
								<v-layout>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport"
												>flagTransferRequestFromPendingOrders: -
											</span>
											Habilitar solicitud de tranferencia desde pedidos pendientes.
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Habilitar solicitud de tranferencia desde pedidos pendientes."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagTransferRequestFromPendingOrders"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mb-3 v-if="isSupport">
								<v-layout row wrap align-center>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagCalculateEarnings - </span>
											Usar cálculo automático del precio de venta en base al costo:
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Si se activa usará el cálculo automático del precio de venta en base al costo mas su ganancia."
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													v-model="flagCalculateEarnings"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex mb-3 xs12 v-if="isSupport">
								<v-layout row wrap align-center>
									<v-flex xs10>
										<p class="company-text-regular ma-0">
											<span class="ft-12" v-if="isSupport">flagTaxesIgvTemporary - </span>
											Utilizar el impuesto general del 10.5%
										</p>
									</v-flex>
									<v-flex xs2 pl-2>
										<v-layout row align-center>
											<v-flex>
												<app-tooltip-button
													color="success"
													height="17"
													icon="help"
													text="Activar esta opción se trabajara con impuesto de 10.5%"
												></app-tooltip-button>
											</v-flex>
											<v-flex>
												<v-switch
													color="success"
													hide-details
													:input-value="flagTaxesIgvTemporary"
													@change="handleIgvToggle"
												></v-switch>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-dialog v-model="showIgvModal" max-width="500">
								<modal-items
									v-if="showIgvModal"
									title="CONFIRMACIÓN"
									nameAction="Aceptar"
									nameCancel="Cancelar"
									:showSlot="true"
									@close-modal="handleCancelIgv"
									@action-modal="handleConfirmIgv"
								>
									<v-layout px-4 pb-2 text-xs-center pt-4>
										<label style="font-weight: bold; font-size: 14px;">
											Esta función esta solo disponible para usuarios que tengan configurado el nuevo facturador.
										</label>
									</v-layout>
								</modal-items>
							</v-dialog>
						</v-flex>
					</v-layout>
					<!-- <v-layout row wrap align-center>
						<v-flex xs5>
							<p class="company-text-regular ma-0">
							Usar Pedi-créditos
							</p>
						</v-flex>
						<v-flex xs2 pl-5>
							<v-switch
								color="success"
								:label="showUseOrderCredits"
								hide-details
								v-model="company.settings.useOrderCredits"
							></v-switch>
						</v-flex>
					</v-layout> -->
					<div class="companies-btn pr-5">
						<v-btn
							type="button"
							color="info"
							class="btn-action mr-1"
							@click.native="step = 2"
						>
							Atrás
							<img :src="`${$imageUrl}/back.svg`" alt="" />
						</v-btn>
						<v-btn
							type="button"
							class="btn-action ml-1"
							color="primary"
							@click.native="saveCompany(4)"
						>
							Guardar
							<v-icon color="white" size="16"> check_circle_outline </v-icon>
						</v-btn>
					</div>
				</v-stepper-content>
				<v-stepper-content step="4">
					<h2 class="mb-3">Documentación y serie</h2>
					<div class="bank-list">
						<div class="bank-list-form">
							<v-select
								clearable
								v-bind:items="subsidiaries"
								v-model="newData.subsidiary"
								:label="labelTerminal(true)"
								item-text="sucursalName"
								hide-details
								class="filter-select"
								content-class="filter-select-content"
								@input="filteredTerminals"
							></v-select>
							<v-select
								clearable
								v-bind:items="warehouses"
								v-model="newData.warehouseId"
								label="Almacenes"
								item-text="name"
								item-value="id"
								hide-details
								class="filter-select"
								content-class="filter-select-content"
								@input="filteredTerminals"
							></v-select>
							<transition name="fade" mode="out-in">
								<v-select
									clearable
									v-if="showUpTerminals"
									v-bind:items="terminals"
									v-model="newData.terminal"
									:label="labelTerminal(true)"
									item-text="name"
									hide-details
									class="filter-select"
									content-class="filter-select-content"
								></v-select>
							</transition>
							<transition name="fade" mode="out-in">
								<v-text-field
									v-if="showUpSeries"
									class="filter-select"
									hide-details
									maxlength="2"
									type="text"
									label="Serie"
									v-model="newData.serie"
								></v-text-field>
							</transition>
							<transition name="fade" mode="out-in">
								<v-text-field
									v-if="showUpSeries"
									class="filter-select"
									hide-details
									type="number"
									label="Número"
									v-model.number="newData.number"
								></v-text-field>
							</transition>
							<transition name="fade" mode="out-in">
								<v-select
									clearable
									v-if="showUpSeries"
									v-bind:items="documents"
									v-model="newData.typeDocument"
									label="Tipo de documento"
									item-text="name"
									hide-details
									class="filter-select"
									content-class="filter-select-content"
								></v-select>
							</transition>
							<v-btn
								:disabled="validateInfo"
								type="button"
								color="primary"
								class="btn-action ma-0"
								v-on:click="addData"
							>
								Agregar
							</v-btn>
						</div>
						<div class="overflow-auto">
							<app-table
								name="documentAndSerie"
								:columns="documentsColumns"
								:rows="documentsRows"
								local-storage
								:main-list="false"
								:input-search="false"
								:filter-columns="false"
								class="no-main-list is-not-selectable"
							>
								<template slot="rows" slot-scope="props">
									<td class="is-not-selectable" v-show="showRow(documentsColumns, 1)">
										{{ props.row.serie }}
									</td>
									<td v-show="showRow(documentsColumns, 2)">
										{{ props.row.number }}
									</td>
									<td v-show="showRow(documentsColumns, 3)">
										<span v-if="props.row.terminal">
											{{ props.row.terminal.name }}
										</span>
									</td>
									<td v-show="showRow(documentsColumns, 4)">
										<span v-if="props.row.typeDocument">
											{{ props.row.typeDocument.name }}
										</span>
									</td>
									<td v-show="showRow(documentsColumns, 5)">
										<span v-if="props.row.subsidiary && props.row.subsidiary.id">
											{{ props.row.subsidiary.sucursalName }}
										</span>
									</td>
									<td>
										<button class="table-icon" v-on:click="editDocument(props.row)">
											<img :src="`${$imageUrl}/editar.svg`" alt="" />
										</button>
										<app-tooltip-button
											text="Eliminar"
											color="pink"
											icon="delete"
											@click-icon="deleteDocument(props.row.id)"
										></app-tooltip-button>
									</td>
								</template>
							</app-table>
						</div>
					</div>
					<div class="companies-btn">
						<v-btn
							type="button"
							color="info"
							class="btn-action mr-1"
							@click.native="step = 3"
						>
							Atrás
							<img :src="`${$imageUrl}/back.svg`" alt="" />
						</v-btn>
						<v-btn
							type="button"
							class="btn-action ml-1"
							color="primary"
							@click.native="step = 5"
						>
							Guardar
							<v-icon color="white" size="16"> check_circle_outline </v-icon>
						</v-btn>
					</div>
				</v-stepper-content>
				<v-stepper-content step="5">
					<h2 class="my-4">Configuración de Documentos y Pagos</h2>
					<v-layout wrap align-center mb-4>
						<v-flex xs12 my-3>
							<label class="label-section">Ventas</label>
						</v-flex>
						<v-flex xs12 mb-3>
							<app-select
								chips
								:item="documentsSalesSelected"
								item-text="name"
								item-value="id"
								:items="allDocumentsSales"
								label="Tipos de Documento"
								model="documentsSalesSelected"
								multiple
								:return-object="false"
								@input="setData"
							/>
						</v-flex>
						<v-flex xs12 mb-4>
							<app-select
								chips
								:item="paymentsSalesSelected"
								item-text="name"
								item-value="id"
								:items="allPaymentsSales"
								label="Tipos de Pago"
								model="paymentsSalesSelected"
								multiple
								:return-object="false"
								@input="setData"
							/>
						</v-flex>
						<v-flex>
							<v-layout wrap>
								<template v-for="item in paymentsSalesSelected">
									<v-flex
										v-if="
											['yape', 'plin'].includes(allPaymentsSales[indexPayment(item)].code)
										"
										:key="item"
										xs3
										pr-3
										mb-3
									>
										<div class="layout">
											<span class="mr-1 pt-1 primary--text text-label">
												{{ namePayment(item) }}
											</span>
											<upload-img
												:id="item"
												:allowed-files="allowedFiles"
												:url="allPaymentsSales[indexPayment(item)].qrUrl"
												icon="qr_code_2"
												text="Ver QR"
												:key="item"
												@getUrlFile="setUrlQR($event, indexPayment(item))"
											/>
										</div>
									</v-flex>
									<v-flex
										v-else-if="allPaymentsSales[indexPayment(item)].typePaymentId"
										:key="item + 500"
										xs3
										pr-3
										mb-3
									>
										<div class="layout">
											<span class="mr-1 pt-1 primary--text text-label">{{
												namePayment(item)
											}}</span>
											<v-text-field
												class="filter-select"
												hide-details
												label="%Porcentaje"
												:value="getPayPercentage(item)"
												@input="(val) => setPayPercentage(item, val)"
											></v-text-field>
										</div>
									</v-flex>
								</template>
							</v-layout>
						</v-flex>
					</v-layout>
					<v-layout wrap align-center mb-4>
						<v-flex xs12 my-3>
							<label class="label-section">Compras</label>
						</v-flex>
						<v-flex xs12 mb-3>
							<app-select
								chips
								:item="documentsPurchasesSelected"
								item-text="name"
								item-value="id"
								:items="allDocumentsPurchases"
								label="Tipos de Documento"
								model="documentsPurchasesSelected"
								multiple
								:return-object="false"
								@input="setData"
							/>
						</v-flex>
						<v-flex xs12>
							<app-select
								chips
								:item="paymentsPurchasesSelected"
								item-text="name"
								item-value="id"
								:items="allPaymentsPurchases"
								label="Tipos de Pago"
								model="paymentsPurchasesSelected"
								multiple
								:return-object="false"
								@input="setData"
							/>
						</v-flex>
					</v-layout>
					<div class="companies-btn">
						<v-btn
							type="button"
							color="info"
							class="btn-action mr-1"
							@click.native="step = 4"
						>
							Atrás
							<img :src="`${$imageUrl}/back.svg`" alt="" />
						</v-btn>
						<v-btn
							type="button"
							class="btn-action ml-1"
							color="primary"
							@click.native="sendDocsAndPays"
						>
							Guardar
							<v-icon color="white" size="16"> check_circle_outline </v-icon>
						</v-btn>
					</div>
				</v-stepper-content>
				<v-stepper-content step="6">
					<h2 class="my-4">Reparto</h2>
					<v-layout wrap align-center mb-4>
						<v-flex xs12 mb-3 v-if="showCourier">
							<v-layout class="wrapper-price">
								<v-flex xs9>
									<div class="layout">
										<button
											class="btn-tab"
											:class="{
												select: typeOrder.delivery === typeOrderSelect,
											}"
											@click="changeOrder(typeOrder.delivery)"
										>
											Delivery
										</button>
										<button
											class="btn-tab"
											:class="{ select: typeOrder.courier === typeOrderSelect }"
											@click="changeOrder(typeOrder.courier)"
										>
											Courier
										</button>
										<button
											class="btn-tab"
											:class="{ select: typeOrder.free === typeOrderSelect }"
											@click="changeOrder(typeOrder.free)"
										>
											Libre
										</button>
									</div>
								</v-flex>
								<v-flex xs4 text-xs-right>
									<button class="btn-zone" @click="openZone">
										Establecer zona de reparto para
										{{ nameTabOrder }}
									</button>
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex
							xs4
							class="content-percentage"
							mb-3
							v-if="typeOrder.delivery === typeOrderSelect"
						>
							<v-layout row align-center>
								<v-flex> Comisión por pedido (%) </v-flex>
								<v-flex xs4>
									<app-input-text
										placeholder="0"
										:text="freeCourierSettings.deliveryOrderPercentage"
										model="deliveryOrderPercentage"
										@input="setPercentage"
										type="number"
									/>
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex
							xs4
							class="content-percentage ml-50"
							mb-3
							v-if="typeOrder.delivery === typeOrderSelect"
						>
							<v-layout row align-center>
								<v-flex>
									Limitar Ordenes Asignadas
									<v-tooltip top>
										<img
											src="/static/img/informacion.svg"
											alt="signo de interrogación"
											slot="activator"
											class="ml-2"
											height="20"
										/>
										<p class="mb-0 m-w-170">
											{{
												freeCourierSettings.limitAssignedOrdersDelivery > 0
													? 'Este campo le ayuda a mantener su limite de ordenes asignadas'
													: 'Este campo le ayuda a mantener su limite de ordenes asignadas, al mantenerlo en 0 no habrá un limite de asignadas.'
											}}
										</p>
									</v-tooltip>
								</v-flex>
								<v-flex xs4>
									<app-input-text
										placeholder="0"
										:text="freeCourierSettings.limitAssignedOrdersDelivery"
										model="limitAssignedOrdersDelivery"
										@input="setPercentage"
										type="number"
									/>
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex
							xs4
							class="content-percentage"
							mb-3
							v-if="typeOrder.courier === typeOrderSelect"
						>
							<v-layout row align-center>
								<v-flex> Comisión por pedido (%) </v-flex>
								<v-flex xs4>
									<app-input-text
										placeholder="0"
										:text="freeCourierSettings.courierOrderPercentage"
										model="courierOrderPercentage"
										@input="setPercentage"
										type="number"
									/>
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex
							xs4
							class="content-percentage ml-50"
							mb-3
							v-if="typeOrder.courier === typeOrderSelect"
						>
							<v-layout row align-center>
								<v-flex>
									Limitar Ordenes Asignadas
									<v-tooltip top>
										<img
											src="/static/img/informacion.svg"
											alt="signo de interrogación"
											slot="activator"
											class="ml-2"
											height="20"
										/>
										<p class="mb-0 m-w-170">
											{{
												freeCourierSettings.limitAssignedOrdersDelivery > 0
													? 'Este campo le ayuda a mantener su limite de ordenes asignadas'
													: 'Este campo le ayuda a mantener su limite de ordenes asignadas, al mantenerlo en 0 no habrá un limite de asignadas.'
											}}
										</p>
									</v-tooltip>
								</v-flex>
								<v-flex xs4>
									<app-input-text
										placeholder="0"
										:text="freeCourierSettings.limitAssignedOrdersCourier"
										model="limitAssignedOrdersCourier"
										@input="setPercentage"
										type="number"
									/>
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex
							xs4
							class="content-percentage"
							mb-3
							v-if="typeOrder.free === typeOrderSelect"
						>
							<v-layout row align-center>
								<v-flex> Comisión por pedido (%) </v-flex>
								<v-flex xs4>
									<app-input-text
										type="number"
										placeholder="0"
										:text="freeCourierSettings.freeOrderPercentage"
										model="freeOrderPercentage"
										@input="setPercentage"
									/>
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex
							xs4
							class="content-percentage ml-50"
							mb-3
							v-if="typeOrder.free === typeOrderSelect"
						>
							<v-layout row align-center>
								<v-flex>
									Limitar Ordenes Asignadas
									<v-tooltip top>
										<img
											src="/static/img/informacion.svg"
											alt="signo de interrogación"
											slot="activator"
											class="ml-2"
											height="20"
										/>
										<p class="mb-0 m-w-170">
											{{
												freeCourierSettings.limitAssignedOrdersDelivery > 0
													? 'Este campo le ayuda a mantener su limite de ordenes asignadas'
													: 'Este campo le ayuda a mantener su limite de ordenes asignadas, al mantenerlo en 0 no habrá un limite de asignadas.'
											}}
										</p>
									</v-tooltip>
								</v-flex>
								<v-flex xs4>
									<app-input-text
										placeholder="0"
										type="number"
										:text="freeCourierSettings.limitAssignedOrdersFree"
										model="limitAssignedOrdersFree"
										@input="setPercentage"
									/>
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex xs12 v-if="typeOrder.delivery === typeOrderSelect">
							<v-layout wrap>
								<v-flex xs8>
									<v-layout>
										<v-flex xs5 pt-3>
											<v-subheader class="label-section">Precio x kilómetro</v-subheader>
										</v-flex>
										<v-flex xs3>
											<label class="caption">Kilómetro Mínimo</label>
											<v-text-field
												class="filter-select show-error"
												name="new-product-ranges"
												type="number"
												single-line
												hide-details
												v-model="priceKm.from"
											></v-text-field>
										</v-flex>
										<v-flex xs2 pt-3>
											<v-subheader>hasta</v-subheader>
										</v-flex>
										<v-flex xs3>
											<label class="caption">Kilómetro Máximo</label>
											<v-text-field
												class="filter-select show-error"
												name="new-product-ranges"
												type="number"
												single-line
												hide-details
												v-model="priceKm.to"
											></v-text-field>
										</v-flex>
										<v-flex xs1 pt-3>
											<v-subheader>a</v-subheader>
										</v-flex>
										<v-flex xs2>
											<label class="caption">Precio</label>
											<v-text-field
												class="filter-select show-error"
												name="new-product-ranges"
												type="number"
												single-line
												hide-details
												v-model="priceKm.price"
											></v-text-field>
										</v-flex>
										<v-flex xs1 pt-4>
											<v-btn
												type="button"
												class="btn-list btn-list-add"
												:disabled="disabledBtnPrice('priceKm')"
												@click="addRange('priceKm', 'priceRows', 'editPriceRange')"
											>
												<v-icon>add</v-icon>
											</v-btn>
										</v-flex>
									</v-layout>
								</v-flex>
								<v-flex xs12 mt-3>
									<div>
										<app-table
											name="priceKm"
											:columns="priceColumns"
											:rows="priceRows"
											:main-list="false"
											:input-search="false"
											:filter-columns="false"
											class="no-main-list is-not-selectable mb-0"
										>
											<template slot="rows" slot-scope="props">
												<td
													class="is-not-selectable"
													v-show="showRow(documentsColumns, 1)"
												>
													{{ props.row.from }}
												</td>
												<td v-show="showRow(documentsColumns, 2)">
													{{ props.row.to }}
												</td>
												<td v-show="showRow(documentsColumns, 3)">
													{{ props.row.price }}
												</td>
												<td v-show="showRow(documentsColumns, 4)">
													<button
														class="table-icon"
														@click="editPrice(props.row, 'priceKm', 'editPriceRange')"
													>
														<img :src="`${$imageUrl}/editar.svg`" alt="" />
													</button>
													<app-tooltip-button
														text="Eliminar"
														color="pink"
														icon="delete"
														@click-icon="deletePrice(props.row.id, 'priceRows')"
													></app-tooltip-button>
												</td>
											</template>
										</app-table>
									</div>
								</v-flex>
								<v-flex xs12 mt-4>
									<v-layout wrap>
										<v-flex xs4>
											<p class="company-text-regular ma-0">
												Habilitar notificación por N repartidor
											</p>
										</v-flex>
										<v-flex xs3 pl-3>
											<v-switch
												color="success"
												hide-details
												:label="showRandomDelivery"
												v-model="freeCourierSettings.flagNotifyRandomDelivery"
												@change="changeShowRandomDelivery"
											></v-switch>
										</v-flex>
									</v-layout>
								</v-flex>
							</v-layout>
							<v-flex xs10 mt-1>
								<v-layout v-if="freeCourierSettings.flagNotifyRandomDelivery">
									<v-flex xs3>
										<app-input-text
											placeholder="0"
											label="Cantidad"
											type="number"
											min="0"
											:max-length="maxLengthQuantity"
											:information="true"
											model="numberNotifyDelivery"
											information-text="Cantidad de repartidores a enviar notificacion"
											:text="freeCourierSettings.numberNotifyDelivery"
											@input="setDataText"
										/>
									</v-flex>
								</v-layout>
							</v-flex>
						</v-flex>
						<v-flex xs12 v-if="typeOrder.courier === typeOrderSelect">
							<v-layout wrap>
								<v-flex xs8>
									<v-layout>
										<v-flex xs5 pt-3>
											<v-subheader class="label-section">Precio x kilómetro</v-subheader>
										</v-flex>
										<v-flex xs3>
											<label class="caption">Kilómetro Mínimo</label>
											<v-text-field
												class="filter-select show-error"
												name="new-product-ranges"
												type="number"
												single-line
												hide-details
												v-model="priceKmCourier.from"
											></v-text-field>
										</v-flex>
										<v-flex xs2 pt-3>
											<v-subheader>hasta</v-subheader>
										</v-flex>
										<v-flex xs3>
											<label class="caption">Kilómetro Máximo</label>
											<v-text-field
												class="filter-select show-error"
												name="new-product-ranges"
												type="number"
												single-line
												hide-details
												v-model="priceKmCourier.to"
											></v-text-field>
										</v-flex>
										<v-flex xs1 pt-3>
											<v-subheader>a</v-subheader>
										</v-flex>
										<v-flex xs2>
											<label class="caption">Precio</label>
											<v-text-field
												class="filter-select show-error"
												name="new-product-ranges"
												type="number"
												single-line
												hide-details
												v-model="priceKmCourier.price"
											></v-text-field>
										</v-flex>
										<v-flex xs1 pt-4>
											<v-btn
												type="button"
												class="btn-list btn-list-add"
												:disabled="disabledBtnPrice('priceKmCourier')"
												@click="
													addRange(
														'priceKmCourier',
														'priceRowsCourier',
														'editPriceRangeCourier'
													)
												"
											>
												<v-icon>add</v-icon>
											</v-btn>
										</v-flex>
									</v-layout>
								</v-flex>
								<v-flex xs12 mt-3>
									<div>
										<app-table
											name="priceKmCourier"
											:columns="priceColumns"
											:rows="priceRowsCourier"
											:main-list="false"
											:input-search="false"
											:filter-columns="false"
											class="no-main-list is-not-selectable mb-0"
										>
											<template slot="rows" slot-scope="props">
												<td
													class="is-not-selectable"
													v-show="showRow(documentsColumns, 1)"
												>
													{{ props.row.from }}
												</td>
												<td v-show="showRow(documentsColumns, 2)">
													{{ props.row.to }}
												</td>
												<td v-show="showRow(documentsColumns, 3)">
													{{ props.row.price }}
												</td>
												<td v-show="showRow(documentsColumns, 4)">
													<button
														class="table-icon"
														@click="
															editPrice(
																props.row,
																'priceKmCourier',
																'editPriceRangeCourier'
															)
														"
													>
														<img :src="`${$imageUrl}/editar.svg`" alt="" />
													</button>
													<app-tooltip-button
														text="Eliminar"
														color="pink"
														icon="delete"
														@click-icon="deletePrice(props.row.id, 'priceRowsCourier')"
													></app-tooltip-button>
												</td>
											</template>
										</app-table>
									</div>
								</v-flex>
								<v-flex xs12 mt-4>
									<v-layout wrap px-4>
										<v-flex xs4>
											<p class="company-text-regular ma-0">
												Habilitar notificación por N repartidor
											</p>
										</v-flex>
										<v-flex xs3 pl-3>
											<v-switch
												color="success"
												hide-details
												:label="labelFlagNotifyRandomCourier"
												v-model="freeCourierSettings.flagNotifyRandomCourier"
												@change="changeShowflagNotifyCourier"
											></v-switch>
										</v-flex>
									</v-layout>
								</v-flex>
								<v-flex xs10 mt-1 ml-4 v-if="freeCourierSettings.flagNotifyRandomCourier">
									<v-layout>
										<v-flex xs2>
											<app-input-text
												label="Cantidad"
												type="number"
												:max-length="maxLengthQuantity"
												:information="true"
												model="numberNotifyCourier"
												information-text="Cantidad de repartidores a enviar notificacion"
												:text="freeCourierSettings.numberNotifyCourier"
												@input="setDataText"
											/>
										</v-flex>
									</v-layout>
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex xs12 v-if="typeOrder.free === typeOrderSelect">
							<v-layout wrap>
								<v-flex xs8>
									<v-layout>
										<v-flex xs5 pt-3>
											<v-subheader class="label-section">Precio x kilómetro</v-subheader>
										</v-flex>
										<v-flex xs3>
											<label class="caption">Kilómetro Mínimo</label>
											<v-text-field
												class="filter-select show-error"
												name="new-product-ranges"
												type="number"
												single-line
												hide-details
												v-model="priceKmFree.from"
											></v-text-field>
										</v-flex>
										<v-flex xs2 pt-3>
											<v-subheader>hasta</v-subheader>
										</v-flex>
										<v-flex xs3>
											<label class="caption">Kilómetro Máximo</label>
											<v-text-field
												class="filter-select show-error"
												name="new-product-ranges"
												type="number"
												single-line
												hide-details
												v-model="priceKmFree.to"
											></v-text-field>
										</v-flex>
										<v-flex xs1 pt-3>
											<v-subheader>a</v-subheader>
										</v-flex>
										<v-flex xs2>
											<label class="caption">Precio</label>
											<v-text-field
												class="filter-select show-error"
												name="new-product-ranges"
												type="number"
												single-line
												hide-details
												v-model="priceKmFree.price"
											></v-text-field>
										</v-flex>
										<v-flex xs1 pt-4>
											<v-btn
												type="button"
												class="btn-list btn-list-add"
												:disabled="disabledBtnPrice('priceKmFree')"
												@click="
													addRange('priceKmFree', 'priceRowsFree', 'editPriceRangeFree')
												"
											>
												<v-icon>add</v-icon>
											</v-btn>
										</v-flex>
									</v-layout>
								</v-flex>
								<v-flex xs12 mt-3>
									<div>
										<app-table
											name="priceKmFree"
											:columns="priceColumns"
											:rows="priceRowsFree"
											:main-list="false"
											:input-search="false"
											:filter-columns="false"
											class="no-main-list is-not-selectable mb-0"
										>
											<template slot="rows" slot-scope="props">
												<td
													class="is-not-selectable"
													v-show="showRow(documentsColumns, 1)"
												>
													{{ props.row.from }}
												</td>
												<td v-show="showRow(documentsColumns, 2)">
													{{ props.row.to }}
												</td>
												<td v-show="showRow(documentsColumns, 3)">
													{{ props.row.price }}
												</td>
												<td v-show="showRow(documentsColumns, 4)">
													<button
														class="table-icon"
														@click="
															editPrice(props.row, 'priceKmFree', 'editPriceRangeFree')
														"
													>
														<img :src="`${$imageUrl}/editar.svg`" alt="" />
													</button>
													<app-tooltip-button
														text="Eliminar"
														color="pink"
														icon="delete"
														@click-icon="deletePrice(props.row.id, 'priceRowsFree')"
													></app-tooltip-button>
												</td>
											</template>
										</app-table>
									</div>
								</v-flex>
								<v-flex xs12 mt-4>
									<v-layout px-4 wrap>
										<v-flex xs6>
											<v-layout wrap>
												<v-flex xs4>
													<p class="company-text-regular ma-0">¿Entrega inmediata?</p>
												</v-flex>
												<v-flex xs3 pl-3>
													<v-switch
														color="success"
														hide-details
														:label="showFlagImmediateDelivery"
														v-model="showFlagImmediateDeliveryComputed"
														@change="changeShowFlagImmediateDelivery"
													></v-switch>
												</v-flex>
											</v-layout>
										</v-flex>
										<v-flex xs6>
											<v-layout>
												<v-flex xs6>
													<p class="company-text-regular ma-0">
														¿Deseas que cobremos por ti?
													</p>
												</v-flex>
												<v-flex xs7 pl-4>
													<v-switch
														color="success"
														hide-details
														:label="showFlagCollectForYou"
														v-model="freeCourierSettings.showFlagCollectForYou"
													></v-switch>
												</v-flex>
											</v-layout>
										</v-flex>
										<v-flex xs6>
											<v-layout v-if="freeCourierSettings.showFlagImmediateDelivery">
												<v-flex xs3>
													<app-input-text
														label="Porcentaje"
														type="number"
														:max-length="maxLengthQuantity"
														:information="true"
														model="additionalCostPercentage"
														information-text="Es el porcentaje que tendrá el costo de envío si se solicita entrega inmediata"
														:text="freeCourierSettings.additionalCostPercentage"
														@input="setDataText"
													/>
												</v-flex>
											</v-layout>
										</v-flex>
									</v-layout>
								</v-flex>
								<v-flex xs12 mt-4>
									<v-layout wrap px-4>
										<v-flex xs4>
											<p class="company-text-regular ma-0">
												Habilitar notificación por N repartidor
											</p>
										</v-flex>
										<v-flex xs3 pl-3>
											<v-switch
												color="success"
												hide-details
												:label="labelFlagNotifyRandom"
												v-model="freeCourierSettings.flagNotifyRandom"
												@change="changeShowflagNotifyRandom"
											></v-switch>
										</v-flex>
									</v-layout>
								</v-flex>
								<v-flex xs10 mt-1 ml-4 v-if="freeCourierSettings.flagNotifyRandom">
									<v-layout>
										<v-flex xs2>
											<app-input-text
												label="Cantidad"
												type="number"
												:max-length="maxLengthQuantity"
												:information="true"
												model="numberNotifyFree"
												information-text="Cantidad de repartidores a enviar notificacion"
												:text="freeCourierSettings.numberNotifyFree"
												@input="setDataText"
											/>
										</v-flex>
									</v-layout>
								</v-flex>
							</v-layout>
						</v-flex>
					</v-layout>
					<h2 class="mt-5 mb-4 ml-4">Parámetros Globales</h2>
					<v-layout>
						<v-flex xs7>
							<v-layout>
								<v-flex xs10>
									<p class="company-text-regular ma-0">
										Notificar a los repartidores cercanos a un rango
									</p>
								</v-flex>
								<v-flex xs2 pl-2>
									<v-layout row align-center>
										<v-flex>
											<app-tooltip-button
												color="success"
												height="17"
												icon="help"
												text="Para que esta opcion pueda ser utilizada debe activar 'Notificaciones por N repartidores' en los tipos de pedido"
											></app-tooltip-button>
										</v-flex>
										<v-flex ml-1>
											<v-switch
												color="success"
												hide-details
												v-model="freeCourierSettings.notifyByRadioOrder"
											></v-switch>
										</v-flex>
									</v-layout>
								</v-flex>
							</v-layout>
							<v-layout v-if="freeCourierSettings.notifyByRadioOrder">
								<v-flex xs3>
									<app-input-text
										type="number"
										label="Rango de Proximidad"
										model="radioOrderMax"
										:text="freeCourierSettings.radioOrderMax"
										@input="setDataText"
									/>
								</v-flex>
							</v-layout>
							<v-layout>
								<v-flex xs10>
									<p class="company-text-regular ma-0">
										Ocultar costo de envío al motorizado
									</p>
								</v-flex>
								<v-flex xs2 pl-5>
									<v-switch
										color="success"
										hide-details
										v-model="doNotCostShipingToDrivers"
									></v-switch>
								</v-flex>
							</v-layout>
							<v-layout>
								<v-flex xs10>
									<p class="company-text-regular ma-0">Mostrar solo pedidos pagados</p>
								</v-flex>
								<v-flex xs2 pl-5>
									<v-switch
										color="success"
										hide-details
										v-model="flagPaymentStatesShown"
									></v-switch>
								</v-flex>
							</v-layout>
							<v-layout>
								<v-flex xs10>
									<p class="company-text-regular ma-0">
										Pedidos Libre con Recojo y Envío
									</p>
								</v-flex>
								<v-flex xs2 pl-5>
									<v-switch
										color="success"
										hide-details
										v-model="freeCourierTwoDrivers"
									></v-switch>
								</v-flex>
							</v-layout>
							<v-layout>
								<v-flex xs10>
									<p class="company-text-regular ma-0">
										Agregar Pedido Courier Listo para recoger
									</p>
								</v-flex>
								<v-flex xs2 pl-2>
									<v-layout>
										<v-flex>
											<app-tooltip-button
												color="success"
												height="17"
												icon="help"
												text="Esto le permitira generar todos los pedidos de tipo courier como listo para recoger"
											></app-tooltip-button>
										</v-flex>
										<v-flex>
											<v-switch
												color="success"
												hide-details
												v-model="flagCurrierDeliveryReady"
											></v-switch>
										</v-flex>
									</v-layout>
								</v-flex>
							</v-layout>
							<v-layout>
								<v-flex xs10>
									<p class="company-text-regular ma-0">
										Mostrar teléfono del comercio en drive
									</p>
								</v-flex>
								<v-flex xs2 pl-2>
									<v-layout>
										<v-flex>
											<app-tooltip-button
												color="success"
												height="17"
												icon="help"
												text="Habilitar esta opción si deseas mostrar el teléfono del conductor."
											></app-tooltip-button>
										</v-flex>
										<v-flex>
											<v-switch
												color="success"
												hide-details
												v-model="company.settings.flagShowPhoneCommerce"
											></v-switch>
										</v-flex>
									</v-layout>
								</v-flex>
							</v-layout>
							<v-layout>
								<v-flex xs10>
									<p class="company-text-regular ma-0">
										Mostrar teléfono del driver en comercio
									</p>
								</v-flex>
								<v-flex xs2 pl-2>
									<v-layout>
										<v-flex>
											<app-tooltip-button
												color="success"
												height="17"
												icon="help"
												text="Habilitar esta opción si deseas mostrar el teléfono del drive en el conductor."
											></app-tooltip-button>
										</v-flex>
										<v-flex>
											<v-switch
												color="success"
												hide-details
												v-model="company.settings.flagShowPhoneDrive"
											></v-switch>
										</v-flex>
									</v-layout>
								</v-flex>
							</v-layout>
							<v-layout>
								<v-flex xs10>
									<p class="company-text-regular ma-0">
										Permitir seleccionar método de pagó en Vendor
									</p>
								</v-flex>
								<v-flex xs2 pl-2>
									<v-layout>
										<v-flex>
											<app-tooltip-button
												color="success"
												height="17"
												icon="help"
												text=""
											></app-tooltip-button>
										</v-flex>
										<v-flex>
											<v-switch
												color="success"
												hide-details
												v-model="company.settings.flagPaymentVendor"
											></v-switch>
										</v-flex>
									</v-layout>
								</v-flex>
							</v-layout>
						</v-flex>
					</v-layout>
					<div class="companies-btn">
						<v-btn
							type="button"
							color="info"
							class="btn-action mr-1"
							@click.native="step = 5"
						>
							Atrás
							<img :src="`${$imageUrl}/back.svg`" alt="" />
						</v-btn>
						<v-btn
							type="button"
							class="btn-action ml-1"
							color="primary"
							@click.native="saveCompany(6)"
						>
							Guardar
							<v-icon color="white" size="16"> check_circle_outline </v-icon>
						</v-btn>
					</div>
				</v-stepper-content>
				<v-progress-linear
					:query="true"
					v-model="progressVal"
					:active="true"
					class="progress-companies"
				></v-progress-linear>
			</v-stepper-items>
		</v-stepper>
		<action-sidebar
			:width="action.width"
			v-model="action.open"
			:code-action="action.code"
			:title="action.title"
			:is-loading="loading"
			:help-actions="actionsToHelp"
			v-on:close-modal="closeModal"
		>
			<v-layout row wrap justify-center v-if="action.code === 'BA' && rowSelected">
				<v-flex xs11 my-3>
					<v-text-field
						class="filter-select"
						hide-details
						type="text"
						label="Banco"
						v-model="rowSelected.name"
					></v-text-field>
				</v-flex>
				<v-flex xs11 mb-3>
					<v-text-field
						class="filter-select"
						hide-details
						type="text"
						label="Nro. de Cuenta"
						v-model="rowSelected.accountNumber"
					></v-text-field>
				</v-flex>
				<v-flex xs11 mb-3>
					<v-text-field
						class="filter-select"
						hide-details
						type="text"
						label="Nro. de Cuenta Interbancaria"
						v-model="rowSelected.accountNumberCi"
					></v-text-field>
				</v-flex>
				<v-flex xs11>
					<v-select
						:items="currencies"
						v-model="rowSelected.currency"
						label="Tipo de Moneda"
						item-text="code"
						item-value="code"
						hide-details
						class="filter-select"
						content-class="filter-select-content"
					></v-select>
				</v-flex>
			</v-layout>
			<v-layout row wrap justify-center v-if="action.code === 'DS' && documentSelected">
				<v-flex xs11 my-3>
					<v-text-field
						class="filter-select"
						hide-details
						type="text"
						label="Serie"
						maxlength="2"
						v-model="documentSelected.serie"
					></v-text-field>
				</v-flex>
				<v-flex xs11 mb-3>
					<v-text-field
						class="filter-select"
						hide-details
						type="number"
						label="Número"
						v-model.number="documentSelected.number"
					></v-text-field>
				</v-flex>
				<v-flex xs11 mb-3>
					<v-select
						v-bind:items="terminals"
						v-model="documentSelected.salTerminalsId"
						:label="labelTerminal(true)"
						item-text="name"
						item-value="id"
						hide-details
						class="filter-select"
						content-class="filter-select-content"
					></v-select>
				</v-flex>
				<v-flex xs11 mb-3>
					<v-select
						v-bind:items="documents"
						v-model="documentSelected.salTypeDocumentsId"
						label="Tipo de documento"
						item-text="name"
						item-value="id"
						hide-details
						class="filter-select"
						content-class="filter-select-content"
					></v-select>
				</v-flex>
				<v-flex xs11 mb-3>
					<v-select
						v-bind:items="subsidiaries"
						v-model="documentSelected.comSubsidiariesId"
						:label="labelSucursal(true)"
						item-text="sucursalName"
						item-value="id"
						hide-details
						class="filter-select"
						content-class="filter-select-content"
					></v-select>
				</v-flex>
			</v-layout>
			<section class="modal-filter-footer">
				<modal-sidebar-button
					:is-loading="applyDisabled"
					v-on:cancel-button-clicked="closeModal"
					v-on:accept-button-clicked="applyFilter"
				/>
			</section>
		</action-sidebar>
		<v-dialog v-model="dialogZone" persistent max-width="800">
			<modal-items
				v-if="dialogZone"
				:title="titleModal"
				name-action="Guardar"
				show-slot
				@close-modal="closeModalZone"
				@action-modal="saveZone"
			>
				<delivery-zone
					:zones="getShowZone"
					@add-polygon="addPolygon"
					@edit-polygon="editPolygon"
				/>
			</modal-items>
		</v-dialog>
	</div>
</template>

<script>
import VueSixFour from 'vue-six-four';
import { maxLength, minLength, required } from 'vuelidate/lib/validators';
import actionSidebar from '@/components/shared/action-sidebar';
import appSelect from '@/components/shared/app-select';
import appTable from '@/components/shared/table/app-table';
import headerPage from '@/components/shared/header-page';
import helper from '@/shared/helper';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import BasePrice from '@/shared/basePrice';
import typeProduct from '@/shared/type-product';
import lib from '@/shared/lib';
import modalItems from '@/components/shared/modal-items';
import deliveryZone from '@/components/companies/delivery-zone';
import TypeOrder from '@/shared/type-order';
import TypePayment from '@/shared/type-payment';
import uploadImg from '@/components/shared/upload-img';
import TableCode from '@/shared/table-code';

const { setLocalData, getLocalData } = helper;
const { round } = lib;
const twoDecimals = round(2);

function created() {
	this.setPreDomain();
	this.labelGeneric = this.isPeru ? 'Cliente Genérico' : 'Consumidor Final';
	const terminalIndex = this.documentsColumns.findIndex((p) => p.value === 'terminal');
	this.documentsColumns[terminalIndex].name = this.labelTerminal(true);
	const sucursalIndex = this.documentsColumns.findIndex((i) => i.value === 'warehouse');
	this.documentsColumns[sucursalIndex].name = this.labelSucursal(true);
	this.codeProduct = typeProduct.Products;
	this.codeServices = typeProduct.Services;
	this.codeComposed = typeProduct.Composed;
	this.typeOrder = {
		delivery: TypeOrder.Delivery,
		courier: TypeOrder.Courier,
		free: TypeOrder.Free,
	};
	this.typeOrderSelect = TypeOrder.Delivery;
	this.loadDefaultTaxesTypes(); // Cargar tipos de impuestos para el selector
	this.loadData();
}

function addAccount() {
	let bankInfo = true;
	Object.keys(this.newBankInfo).forEach((key) => {
		if (key !== 'currencySymbol' && key !== 'name' && !this.newBankInfo[key]) {
			bankInfo = false;
		}
	});
	if (bankInfo) {
		const bankSelected = this.banks.find((b) => b.id === this.newBankInfo.bankId);
		this.newBankInfo.bank.name = bankSelected ? bankSelected.name : '';
		this.newBankInfo.accountNumber = this.newBankInfo.accountNumber;
		this.newBankInfo.accountNumberCi = this.newBankInfo.accountNumberCi || '';
		this.newBankInfo.currencySymbol = this.currencies.find(
			(c) => c.id === this.newBankInfo.currency
		).symbol;
		this.company.bankAccounts.push(this.newBankInfo);
		this.newBankInfo = {
			bankId: 0,
			bank: {
				name: '',
			},
			accountNumber: '',
			accountNumberCi: '',
			currency: '',
			currencySymbol: '',
		};
	} else {
		this.showNotification(
			'No ha completado la información de la cuenta bancaria',
			'warning'
		);
	}
}

async function addData() {
	let documentsInfo = true;
	const model = this.documentSelected || this.newData;
	if (this.documentSelected) {
		Object.keys(this.documentSelected).forEach((key) => {
			if (!this.documentSelected[key] && key !== 'description') {
				documentsInfo = false;
			}
		});
	} else {
		Object.keys(this.newData).forEach((key) => {
			if (!this.newData[key]) {
				documentsInfo = false;
			}
		});
	}
	if (documentsInfo) {
		const method = this.documentSelected ? 'patch' : 'post';
		const url = this.documentSelected ? `series/${model.id}` : 'series';
		const successMessage = this.documentSelected
			? 'La serie se actualizó correctamente'
			: 'La serie se agregó correctamente';
		const newModel = { ...model };
		newModel.number = model.number.toString();
		newModel.comSubsidiariesId = this.documentSelected
			? model.comSubsidiariesId
			: model.subsidiary.id;
		newModel.salTerminalsId = this.documentSelected
			? model.salTerminalsId
			: model.terminal.id;
		newModel.salTypeDocumentsId = this.documentSelected
			? model.salTypeDocumentsId
			: model.typeDocument.id;
		if (newModel.id) {
			delete newModel.id;
			delete newModel.companyId;
		}
		delete newModel.subsidiary;
		delete newModel.terminal;
		delete newModel.typeDocument;
		delete newModel.warehouseId;
		try {
			await this.$httpSales[method](url, newModel);
			this.showNotification(successMessage);
			this.loadData();
			if (this.documentSelected) {
				this.showNotification('Los datos han sido cambiados con éxito.');
				this.closeModal();
			}
			this.newData = {
				serie: '',
				number: null,
				terminal: null,
				typeDocument: null,
				subsidiary: {},
				warehouseId: null,
			};
		} catch (err) {
			if (err.status === 400) {
				const error = err.data;
				const message = this.isPeru ? 'el' : 'la';
				if (error.message === 'SERIE_EXIST') {
					this.showNotification(
						`La serie que desea agregar ya existe para ${message} ${this.labelTerminal()}, el tipo de documento y la ${this.labelSucursal()} que ha seleccionado.`,
						'error'
					);
				}
			} else {
				this.showGenericError();
			}
		}
	} else {
		this.showNotification('Todos los campos son requeridos', 'warning');
	}
}

function applyDisabled() {
	const disabled =
		(this.rowSelected !== null &&
			this.rowSelected.name === '' &&
			this.rowSelected.number === '' &&
			this.rowSelected.cci === '' &&
			this.rowSelected.currency === '') ||
		(this.documentSelected !== null &&
			this.documentSelected.serie === '' &&
			this.documentSelected.number === null &&
			this.documentSelected.terminal === null &&
			this.documentSelected.typeDocument === null &&
			!this.documentSelected.subsidiary.id);
	return disabled;
}

function applyFilter() {
	if (this.action.code === 'BA') {
		this.company.bankAccounts = this.company.bankAccounts.map((row) => {
			const newRow = Object.assign({}, row);
			if (this.rowSelected.bankId === row.bankId) {
				newRow.name = this.rowSelected.name;
				newRow.accountNumber = this.rowSelected.accountNumber;
				newRow.accountNumberCi = this.rowSelected.accountNumberCi || '';
				newRow.currency = this.rowSelected.currency;
				newRow.currencySymbol = this.rowSelected.currency === 'Soles' ? 'S/.' : '$';
			}
			return newRow;
		});
		this.showNotification('Los datos han sido cambiados con éxito.');
		this.closeModal();
	}
	if (this.action.code === 'DS') {
		this.addData();
	}
}

function autoDispatchValue() {
	const dispatchValue = this.company.settings.autoDispatch ? 'sí' : 'no';
	return dispatchValue;
}

function closeModal() {
	if (this.action.code === 'DS') {
		this.newData.warehouseId = 0;
		this.newData.subsidiary = { id: 0 };
	}
	this.action.code = '';
	this.action.title = '';
	this.action.open = false;
	this.rowSelected = null;
	this.documentSelected = null;
}

async function deleteDocument(id) {
	try {
		await this.$httpSales.delete(`series/${id}`);
		this.showNotification('La serie ha sido eliminada.');
		this.loadData();
	} catch (err) {
		this.showGenericError();
	}
}

function removeBankAccount(bankId) {
	const index = this.company.bankAccounts.findIndex((row) => row.bankId === bankId);
	this.company.bankAccounts.splice(index, 1);
}

async function deleteRow(bank) {
	const id = bank.id;
	if (id) {
		const url = `bank-account/${id}`;
		try {
			await this.$httpSales.delete(url);
			this.removeBankAccount(bank.bankId);
		} catch (error) {
			this.showGenericError();
		}
	} else {
		this.removeBankAccount(bank.bankId);
	}
}

function discountGlobalValue() {
	const globalValue = this.company.settings.globalDiscount ? 'sí' : 'no';
	return globalValue;
}

function discountProductValue() {
	const productValue = this.company.settings.singleDiscount ? 'sí' : 'no';
	return productValue;
}

function downloadSaleValue() {
	const downloadValue = this.company.settings.downloadSale ? 'sí' : 'no';
	return downloadValue;
}

function editPricingValue() {
	const pricingValue = this.company.flagUpdatePrice === 1 ? 'sí' : 'no';
	return pricingValue;
}

function editFlagStockDiscountSaleTransfer() {
	return this.company.settings.flagStockDiscountSaleTransfer === 1 ? 'sí' : 'no';
}

function flagImportValue() {
	return this.company.settings.flagImport ? 'sí' : 'no';
}

function flagTipValue() {
	return this.company.settings.flagTip ? 'sí' : 'no';
}

function flagTransferDisplayValue() {
	return this.company.settings.flagTransferDisplay ? 'sí' : 'no';
}

function flagLoyaltyText() {
	return this.flagLoyalti ? 'sí' : 'no';
}

function flagTransferDefaultValue() {
	return this.company.settings.flagTransferDefault ? 'sí' : 'no';
}

function editDocument(row) {
	this.newData.subsidiary.id = row.comSubsidiariesId;
	this.newData.warehouseId = row.terminal.warWarehousesId;
	this.filteredTerminals();
	this.documentSelected = { ...row };
	this.action.code = 'DS';
	this.action.title = 'Editar documento y serie';
	this.action.open = true;
}

function editRow(row) {
	this.rowSelected = { ...row };
	this.action.code = 'BA';
	this.action.title = 'Editar cuenta';
	this.action.open = true;
}

function igvValue() {
	const newIgvValue = this.company.flagIgv === 1 ? 'sí' : 'no';
	return newIgvValue;
}

function stockNegativeValue() {
	const negativeValue = this.company.settings.stockNegative ? 'sí' : 'no';
	return negativeValue;
}

async function loadDefaultTaxesTypes() {
	try {
		const taxCountry = this.isPeru ? TableCode.Taxes : TableCode.IvaRate;
		const catalogSunat = helper.getLocalData('other-taxes');
		const response = catalogSunat
			? { data: catalogSunat }
			: await this.$httpSales.get(`catalog-sunat-details-list/${taxCountry}`);
		const arrayTax = response.data;
		this.arrayTaxesGeneral = arrayTax.map((t) => {
			const newT = { ...t };
			newT.description =
				t.code === '01'
					? `${t.description} - Porcentaje: ${t.percentage}`
					: t.description;
			newT.flagTypeTaxes = t.additionalInformation
				? t.additionalInformation.flagTypeTaxes
				: null;
			newT.idCodeReference = `${t.code}${t.percentage || 0}`;
			newT.idTax = t.id;
			newT.flagSales = !!t.flagTaxes;
			newT.codeTable = TableCode.Taxes;
			if (t.description === 'GRATUITO') {
				newT.codeTable = TableCode.free;
			}
			return newT;
		});
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

async function loadData(updated) {
	const flagSales = 1;
	const flagPurchases = 2;
	const paramsSales = { flagType: flagSales };
	const paramsPurchases = { flagType: flagPurchases };
	const request = [
		this.$httpSales.get('type-documents-all', { params: paramsSales }),
		this.$httpSales.get('type-payments-all', { params: paramsSales }),
		this.$httpSales.get('type-documents-all', { params: paramsPurchases }),
		this.$httpSales.get('type-payments-all', { params: paramsPurchases }),
		this.getTypeDocuments(),
		this.getTypePayments(),
		this.$httpSales.get('subsidiaries'),
		this.$httpSales.get('companies'),
		this.$httpSales.get('series'),
		this.getBanks(),
		this.warehousesList(),
		this.$httpSales.get('currency-company'),
	];
	try {
		[
			{ data: this.allDocumentsSales },
			{ data: this.allPaymentsSales },
			{ data: this.allDocumentsPurchases },
			{ data: this.allPaymentsPurchases },
			{ data: this.documents },
			{ data: this.payments },
			{ data: this.subsidiaries },
			{ data: this.company },
			{ data: this.documentsRows },
			{ data: this.banks },
			{ data: this.warehouses },
			{ data: this.currencies },
		] = await Promise.all(request);
		this.currencies = this.currencyByCountry(this.currencies);
		this.documents = this.documents.map((document) => document.documentType);
		this.payments = this.payments.map((payment) => {
			const newData = { ...payment.paymentType };
			newData.aditionalInformation = payment.aditionalInformation;
			return newData;
		});
		const currencyDefault = this.company.currencies.find((c) => c.flagDefault) || {
			currencyId: 0,
		};
		this.currenciesSelected = this.company.currencies.map((c) => c.currencyId);
		this.company.currency = currencyDefault.currencyId || this.company.currency;
		this.company.currencies = this.company.currencies.map((c) => c.currencyId) || [];
		if (this.company.currencies.length === 1) {
			[this.newBankInfo.currency] = this.company.currencies;
		}
		this.company.theme = this.company.theme || {};
		this.company.bankAccounts = this.company.bankAccounts
			? this.company.bankAccounts
			: [];
		this.company.settings.flagTransferDisplay = this.company.settings.flagTransferDisplay
			? 1
			: 0;
		this.company.settings.domainCatalog = this.company.settings.domainCatalog || '';
		this.company.settings.flagTransferDefault = this.company.settings.flagTransferDefault
			? 1
			: 0;
		// this.company.settings.flagPaymentVendor = this.company.settings ?
		// 	this.company.settings.flagPaymentVendor : false;
		this.company.settings.flagStockDiscountSaleTransfer = this.company.settings
			.flagStockDiscountSaleTransfer
			? 1
			: 0;
		this.company.settings.typePriceShown = this.company.settings.typePriceShown || 1;
		this.company.settings.distanceMode = this.company.settings.distanceMode || 2;
		this.company.settings.codeTaxesDefault =
			this.company.settings.codeTaxesDefault || ' ';
		this.defaultTax = this.arrayTaxesGeneral.find(
			(t) => t.code === this.company.settings.codeTaxesDefault
		);
		this.companyCurrencies = this.company.currencies;
		this.currency = this.company.currency;
		this.documentsPurchasesSelected = this.documents.reduce((acum, thisDoc) => {
			if (thisDoc.flagType === 2) {
				acum.push(thisDoc.id);
			}
			return acum;
		}, []);

		this.documentsSalesSelected = this.documents.reduce((acum, thisDoc) => {
			if (thisDoc.flagType === 1) {
				acum.push(thisDoc.id);
			}
			return acum;
		}, []);
		this.paymentsPurchasesSelected = this.payments.reduce((acum, thisPay) => {
			if (thisPay.flagType === 2) {
				acum.push(thisPay.id);
			}
			return acum;
		}, []);
		this.paymentsSalesSelected = this.payments.reduce((acum, thisPay) => {
			if (thisPay.flagType === 1) {
				acum.push(thisPay.id);
			}
			return acum;
		}, []);
		this.allPaymentsSales = this.allPaymentsSales.map((a) => {
			const self = this;
			const newData = { ...a };
			const index = self.payments.findIndex((p) => p.id === a.id);
			if (index > -1) {
				const additionalInfo = self.payments[index].aditionalInformation;
				const percentage = additionalInfo ? additionalInfo.surcharge : 0;
				newData.percentage = twoDecimals(percentage * 100);
				newData.qrUrl = additionalInfo ? additionalInfo.qrUrl : '';
				return newData;
			}
			newData.qrUrl = newData.qrUrl || '';
			return newData;
		});
		this.setData({
			model: 'documentsPurchasesSelected',
			value: this.documentsPurchasesSelected,
		});
		this.setData({
			model: 'documentsSalesSelected',
			value: this.documentsSalesSelected,
		});
		this.setData({
			model: 'paymentsPurchasesSelected',
			value: this.paymentsPurchasesSelected,
		});
		this.setData({
			model: 'paymentsSalesSelected',
			value: this.paymentsSalesSelected,
		});
		this.flagUseTransportAgency = this.company.settings.flagUseTransportAgency;
		this.flagRequestLocationOrderApp = this.company.settings.flagRequestLocationOrderApp;
		this.flagAskLocationSellerApp = this.company.settings.flagAskLocationSellerApp;
		this.flagOutbox = this.company.settings.flagOutbox;
		this.flagUseIntegrationWhatsApp =
			this.company.settings.flagUseIntegrationWhatsApp || false;
		this.flagWorkingWithAI = this.company.settings.flagWorkingWithAI || false;
		this.flagRelateVehicleFloat = this.company.settings.flagRelateVehicleFloat || false;
		this.flagAlertConversions = this.company.settings.flagAlertConversions || false;
		this.selectTypeProducts = this.company.settings.typeProductsCreationPermission || [];
		this.flagCatEcomFather = this.company.settings.flagCatEcomFather || false;
		this.flagHideOutOfStock = this.company.settings.flagHideOutOfStock || false;
		this.flagShowBaseUnit = this.company.settings.flagShowBaseUnit || 0;
		this.flagTypeOriginOrder = this.company.settings.flagTypeOriginOrder || false;
		this.flagDispatchConvertedOrder =
			this.company.settings.flagDispatchConvertedOrder || false;
		this.flagAssignEmployeeOrder = this.company.settings.flagAssignEmployeeOrder || false;
		this.flagShowTotalOrders = this.company.settings.flagShowTotalOrders || false;
		this.flagPriceListChangeApproval =
			this.company.settings.flagPriceListChangeApproval || false;
		this.flagShowSlugProduct = this.company.settings.flagShowSlugProduct || true;
		this.checkSellerWritedCode = this.company.settings.checkSellerWritedCode || false;
		this.flagAddressNotRequired = this.company.settings.flagAddressNotRequired || false;
		this.restaurantFlow = this.company.settings.restaurantFlow || false;
		this.flagTypeConvertToSale = this.company.settings.flagTypeConvertToSale || false;
		this.flagEditOrderVendor = this.company.settings.flagEditOrderVendor || false;
		this.flagNotConvertToSaleFlow =
			this.company.settings.flagNotConvertToSaleFlow || false;
		this.flagEnableRequestedRoutes =
			this.company.settings.flagEnableRequestedRoutes || false;
		this.allowOrderStockNegative = this.company.settings.allowOrderStockNegative;
		this.allowEditCustomerWarehouse =
			this.company.settings.allowEditCustomerWarehouse || false;
		this.flagNotifyStorekeeper = this.company.settings.flagNotifyStorekeeper || false;
		this.flagDoNotPrintRequestedOrder =
			this.company.settings.flagDoNotPrintRequestedOrder || false;
		this.flagTaxesDefault = this.company.settings.flagTaxesDefault || false;
		this.flagCodeProductAuto = this.company.settings.flagCodeProductAuto || false;
		this.flagCodeAutoGenerate = this.company.settings.flagCodeAutoGenerate || false;
		this.flagCalculateEarnings = this.company.settings.flagCalculateEarnings || false;
		this.flagConvers = this.company.settings.flagConvers || false;
		this.showImageSearch = this.company.settings.showImageSearch || false;
		this.flagElectronicGuide = this.company.settings.flagElectronicGuide || false;
		this.flagEditPriceBySupervisor =
			this.company.settings.flagEditPriceBySupervisor || false;
		this.flagAdvanceOnSale = this.company.settings.flagAdvanceOnSale || false;
		this.flagSettlement = this.company.settings.flagSettlement || false;
		this.flagDeliveryAsConfirmed = this.company.settings.flagDeliveryAsConfirmed || false;
		this.flagDisablePrintMobile = this.company.settings.flagDisablePrintMobile || false;
		this.flagGrouper = this.company.settings.flagGrouper || false;
		this.disableRouteFollowUp = this.company.settings.disableRouteFollowUp || false;
		this.COTMoveKardex = this.company.settings.COTMoveKardex || false;
		this.flagMultipleSalesConversionsQuote =
			this.company.settings.flagMultipleSalesConversionsQuote || false;
		this.flagUseDocConsulting = this.company.settings.flagUseDocConsulting || false;
		this.flagShowCustomersAssignedToRoute =
			this.company.settings.flagShowCustomersAssignedToRoute || false;
		this.flagQuotation = this.company.settings.flagQuotation || false;
		this.flagLoyalti = this.company.flagLoyalti;
		this.flagTypeDiscount = this.company.settings.flagTypeDiscount;
		this.showNotifySale = this.company.settings.showNotifySale;
		this.flagShowVariations = this.company.settings.flagShowVariations || false;
		this.flagTypeSearch = this.company.settings.flagTypeSearch || false;
		this.flagWorkWithBatches = this.company.settings.flagWorkWithBatches || false;
		this.flagAuditService = this.company.settings.flagAuditService || false;
		this.flagRoundSales = this.company.settings.flagRoundSales || false;
		this.flagPurAutoGenerateSerie =
			this.company.settings.flagPurAutoGenerateSerie || false;
		this.flagNotifySalesConversion =
			this.company.settings.flagNotifySalesConversion || false;
		this.flagAnnexTransactions = this.company.settings.flagAnnexTransactions || false;
		this.flagTransferRequestFromPendingOrders = this.company.settings.flagTransferRequestFromPendingOrders || false;
		this.flagPurCashDeskClosing = this.company.settings.flagPurCashDeskClosing || false;
		this.flagShowIot = this.company.settings.flagShowIot || false;
		this.flagUseSimpleBrand = this.company.settings.flagUseSimpleBrand || false;
		this.flagTaxesIgvTemporary = this.company.settings.flagTaxesIgvTemporary || false;
		this.flagProductOnlyStock = this.company.settings.flagProductOnlyStock || false;
		this.flagStockByConversion = this.company.settings.flagStockByConversion || false;
		this.flagInventoryFast = this.company.settings.flagInventoryFast || false;
		this.priceToQuantityCalculation =
			this.company.settings.priceToQuantityCalculation || false;
		this.flagKardexFast = this.company.settings.flagKardexFast;
		this.typeRegisterKardex = this.company.settings.typeRegisterKardex;
		this.flagKardexOptimized = this.company.settings.flagKardexOptimized;
		this.flagImmediateTransfer = this.company.settings.flagImmediateTransfer || false;
		this.flagKardexValued = this.company.settings.flagKardexValued || false;
		this.flagNotMoveKardex =
			(this.company.settings && this.company.settings.flagNotMoveKardex) || false;
		this.flagTotalKardex =
			(this.company.settings && this.company.settings.flagTotalKardex) || false;
		this.flagChangeNtvFlow = this.company.settings.flagChangeNtvFlow || false;
		this.wholesaler = this.company.settings.wholesaler || false;
		this.flagFlowManufacturedProduct =
			this.company.settings.flagFlowManufacturedProduct || false;
		this.flagProductExpressFlow = this.company.settings.flagProductExpressFlow || false;
		this.flagAttendanceRegistration =
			this.company.settings.flagAttendanceRegistration || false;
		this.flagCompanyEliminated = this.company.settings.flagCompanyEliminated || false;
		this.balanceCustomerAll = this.company.settings.balanceCustomerAll || false;
		this.flagEditBlockedAcl = this.company.settings.flagEditBlockedAcl || false;
		this.flagNotUseGlobalUbigeo = this.company.settings.flagNotUseGlobalUbigeo || false;
		this.flagPerception = this.company.settings.flagPerception || false;
		this.flagHideOutOfStockInPOS = this.company.settings.flagHideOutOfStockInPOS || false;
		this.flagNotLimitInORC = this.company.settings.flagNotLimitInORC || false;
		this.flagStockProductGroup = this.company.settings.flagStockProductGroup || false;
		this.flagExchangePointsByProduct =
			this.company.settings.flagExchangePointsByProduct || false;
		this.flagSalDocAsCash = this.company.settings.flagSalDocAsCash || false;
		this.flagDownloadOrder = this.company.settings.flagDownloadOrder || false;
		this.flagDisabledSignature = this.company.settings.flagDisabledSignature || false;
		this.flagExternalData = this.company.settings.flagExternalData || false;
		this.flagUseTori = this.company.settings.flagUseTori || false;
		this.flagSyncMoveTypeFirebase =
			this.company.settings.flagSyncMoveTypeFirebase || false;
		this.flagNewKardexV3 =
			(this.company.settings && this.company.settings.flagNewKardexV3) || false;
		this.flagCodes = this.company.settings.flagCodes;
		this.flagShowPhoneDrive = this.company.settings.flagShowPhoneDrive;
		this.flagGenericSalesCustomer = this.company.settings.flagGenericSalesCustomer
			? this.company.settings.flagGenericSalesCustomer
			: false;
		this.flagShowPhoneCommerce = this.company.settings.flagShowPhoneCommerce;
		this.flagPaymentStatesShown = Boolean(this.company.settings.paymentStatesShown);
		this.freeCourierTwoDrivers = this.company.settings.freeCourierTwoDrivers;
		this.flagCurrierDeliveryReady = this.company.settings.flagCurrierDeliveryReady;
		this.doNotCostShipingToDrivers = this.company.settings.doNotCostShipingToDrivers;
		if (this.company.settings.deliveryZones) {
			const zonesDelivery = this.company.settings.deliveryZones.filter(
				(c) => c.orderType === TypeOrder.Delivery
			);
			const zonesCourier = this.company.settings.deliveryZones.filter(
				(c) => c.orderType === TypeOrder.Courier
			);
			const zonesFree = this.company.settings.deliveryZones.filter(
				(c) => c.orderType === TypeOrder.Free
			);
			this.zonesDelivery = zonesDelivery.map((d) => d.polygon);
			this.zonesCourier = zonesCourier.map((c) => c.polygon);
			this.zonesFree = zonesFree.map((c) => c.polygon);
			this.zonesLocalDelivery = [...this.zonesDelivery];
			this.zonesLocalCourier = [...this.zonesCourier];
			this.zonesLocalFree = [...this.zonesFree];
		} else if (this.company.settings.deliveryZone) {
			const zoneLocalLast = this.company.settings.deliveryZone.polygon;
			const body = [];
			body[0] = [...zoneLocalLast];
			this.zonesDelivery = [...body];
			this.zonesLocalDelivery = [...body];
			this.zonesCourier = [...body];
			this.zonesLocalCourier = [...body];
			this.zonesFree = [...body];
			this.zonesLocalFree = [...body];
		}
		if (this.company.settings.priceDelivery) {
			const deliveryRows = this.company.settings.priceDelivery.filter((p) =>
				p.typeOrder ? p.typeOrder === this.typeOrder.delivery : true
			);
			const courierRows = this.company.settings.priceDelivery.filter((p) =>
				p.typeOrder ? p.typeOrder === this.typeOrder.courier : false
			);
			const freeRows = this.company.settings.priceDelivery.filter((p) =>
				p.typeOrder ? p.typeOrder === this.typeOrder.free : false
			);
			if (deliveryRows.length) {
				this.priceRows = deliveryRows
					.map((p, index) => {
						const newP = {
							id: index,
							from: p.from,
							to: p.to,
							price: p.price,
						};
						return newP;
					})
					.sort((a, b) => a.from - b.from);
			}
			if (courierRows.length) {
				this.priceRowsCourier = courierRows
					.map((p, index) => {
						const newP = {
							id: index,
							from: p.from,
							to: p.to,
							price: p.price,
						};
						return newP;
					})
					.sort((a, b) => a.from - b.from);
			}
			if (freeRows.length) {
				this.priceRowsFree = freeRows
					.map((p, index) => {
						const newP = {
							id: index,
							from: p.from,
							to: p.to,
							price: p.price,
						};
						return newP;
					})
					.sort((a, b) => a.from - b.from);
			}
		}
		if (updated) {
			this.loadCurrent();
		}
		if (this.tab === 'products') {
			this.step = '3';
		}
		if (this.company.settings.freeCourierSettings) {
			this.freeCourierSettings.showFlagCollectForYou =
				this.company.settings.freeCourierSettings.showFlagCollectForYou || false;
			this.freeCourierSettings.showFlagImmediateDelivery =
				this.company.settings.freeCourierSettings.showFlagImmediateDelivery || false;
			this.freeCourierSettings.additionalCostPercentage =
				this.company.settings.freeCourierSettings.additionalCostPercentage || 0;
			this.freeCourierSettings.deliveryOrderPercentage =
				this.company.settings.freeCourierSettings.deliveryOrderPercentage || 0;
			this.freeCourierSettings.freeOrderPercentage =
				this.company.settings.freeCourierSettings.freeOrderPercentage || 0;
			this.freeCourierSettings.courierOrderPercentage =
				this.company.settings.freeCourierSettings.courierOrderPercentage || 0;
			this.freeCourierSettings.flagNotifyRandomCourier =
				this.company.settings.freeCourierSettings.flagNotifyRandomCourier;
			this.freeCourierSettings.numberNotifyCourier =
				this.company.settings.freeCourierSettings.numberNotifyCourier || 0;
			this.freeCourierSettings.flagNotifyRandom =
				this.company.settings.freeCourierSettings.flagNotifyRandom;
			this.freeCourierSettings.numberNotifyDelivery =
				this.company.settings.freeCourierSettings.numberNotifyDelivery || 0;
			this.freeCourierSettings.notifyByRadioOrder =
				this.company.settings.freeCourierSettings.notifyByRadioOrder;
			this.freeCourierSettings.radioOrderMax =
				this.company.settings.freeCourierSettings.radioOrderMax || 0;
			this.freeCourierSettings.numberNotifyFree =
				this.company.settings.freeCourierSettings.numberNotifyFree;
			this.freeCourierSettings.limitAssignedOrdersFree =
				this.company.settings.freeCourierSettings.limitAssignedOrdersFree || 0;
			this.freeCourierSettings.limitAssignedOrdersCourier =
				this.company.settings.freeCourierSettings.limitAssignedOrdersCourier || 0;
			this.freeCourierSettings.limitAssignedOrdersDelivery =
				this.company.settings.freeCourierSettings.limitAssignedOrdersDelivery || 0;
		}
		if (this.company.settings.expenseConfig) {
			this.expenseConfig.notAttachedDocument =
				this.company.settings.expenseConfig.notAttachedDocument || 0;
			this.expenseConfig.relateExpense =
				this.company.settings.expenseConfig.relateExpense || 0;
		}
	} catch (err) {
		this.showGenericError();
	}
}

async function saveCompany(step) {
	const modelCompany = {
		address: this.company.address,
		bankAccounts: this.company.bankAccounts.map((ba) => {
			const newBa = {
				accountNumber: ba.accountNumber,
				accountNumberCi: ba.accountNumberCi || '',
				bankId: ba.bankId,
				currency: ba.currency,
				currencySymbol: ba.currencySymbol,
				id: ba.id,
				name: ba.name,
			};
			return newBa;
		}),
		code: this.company.code,
		commerceCode: this.company.commerceCodecommerceCode,
		companyName: this.company.companyName,
		companyRzSocial: this.company.companyRzSocial,
		convertWeightTo: this.company.convertWeightTo,
		credential: this.company.credential,
		currencies: this.company.currencies,
		currency: this.company.currency,
		email: this.company.email,
		flagBarcodeReader: this.company.flagBarcodeReader,
		flagAutomaticRoutesClose: this.company.flagAutomaticRoutesClose || 0,
		hourOfClose: this.company.flagAutomaticRoutesClose
			? this.company.hourOfClose || '20:00'
			: undefined,
		flagTest: this.company.flagTest,
		flagIgv: this.company.flagIgv,
		flagLoyalti: this.flagLoyalti === 1,
		flagUpdatePrice: this.company.flagUpdatePrice,
		logo: this.company.logo,
		phone: this.company.phone,
		ruc: this.company.ruc,
		settings: this.getCompanysettings(),
		theme: this.company.theme,
		weight: this.company.weight,
	};
	try {
		modelCompany.urlImage = [];
		if (modelCompany.settings) {
			delete modelCompany.settings.flagUseVoucherIa;
		}
		await this.$httpSales.patch('companies', modelCompany);
		this.showNotification('Datos actualizados correctamente');
		const userInfo = getLocalData('admin-user');
		this.updateUserInfoInLocalStorage(userInfo);
		this.loadData(true);
		this.step = step;
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (
				err.data.message ===
				'child "currencies" fails because ["currencies" does not contain 1 required value(s)]'
			) {
				this.showNotification(
					'Es necesario seleccionar la(s) moneda(s) con la(s) que trabajará.',
					'error'
				);
			}
		}
	}
}

function getCompanysettings() {
	const {
		flagImport,
		flagStockDiscountSaleTransfer,
		flagTip,
		flagTransferDefault,
		flagTransferDisplay,
		flagEmployeeTransaction,
		flagTypeIntegrationGrouper,
	} = this.company.settings;
	this.company.settings.flagTypeDiscount = this.flagTypeDiscount === 1;
	this.company.settings.showNotifySale = this.showNotifySale;
	this.company.settings.flagUseTransportAgency = this.flagUseTransportAgency;
	this.company.settings.flagRequestLocationOrderApp = this.flagRequestLocationOrderApp;
	this.company.settings.flagAskLocationSellerApp = this.flagAskLocationSellerApp;
	this.company.settings.flagOutbox = this.flagOutbox;
	this.company.settings.flagUseIntegrationWhatsApp = this.flagUseIntegrationWhatsApp;
	this.company.settings.flagWorkingWithAI = this.flagWorkingWithAI;
	this.company.settings.flagRelateVehicleFloat = this.flagRelateVehicleFloat;
	this.company.settings.flagAlertConversions = this.flagAlertConversions;
	this.company.settings.flagImport = !!flagImport;
	this.company.settings.flagStockDiscountSaleTransfer = !!flagStockDiscountSaleTransfer;
	this.company.settings.flagTip = !!flagTip;
	this.company.settings.flagTransferDisplay = !!flagTransferDisplay;
	this.company.settings.flagTransferDefault = !!flagTransferDefault;
	this.company.settings.flagEmployeeTransaction = !!flagEmployeeTransaction;
	this.company.settings.typeProductsCreationPermission = this.selectTypeProducts;
	this.company.settings.flagTypeIntegrationGrouper = !!flagTypeIntegrationGrouper;
	this.company.settings.flagCatEcomFather = this.flagCatEcomFather;
	this.company.settings.flagHideOutOfStock = this.flagHideOutOfStock;
	this.company.settings.flagTypeOriginOrder = this.flagTypeOriginOrder;
	this.company.settings.flagDispatchConvertedOrder = this.flagDispatchConvertedOrder;
	this.company.settings.flagAssignEmployeeOrder = this.flagAssignEmployeeOrder;
	this.company.settings.flagShowTotalOrders = this.flagShowTotalOrders;
	this.company.settings.flagPriceListChangeApproval = this.flagPriceListChangeApproval;
	this.company.settings.flagShowSlugProduct = this.flagShowSlugProduct;
	this.company.settings.checkSellerWritedCode = this.checkSellerWritedCode;
	this.company.settings.flagAddressNotRequired = this.flagAddressNotRequired;
	this.company.settings.restaurantFlow = this.restaurantFlow;
	this.company.settings.flagTypeConvertToSale = this.flagTypeConvertToSale;
	this.company.settings.flagEditOrderVendor = this.flagEditOrderVendor;
	this.company.settings.flagNotConvertToSaleFlow = this.flagNotConvertToSaleFlow;
	this.company.settings.flagEnableRequestedRoutes = this.flagEnableRequestedRoutes;
	this.company.settings.allowOrderStockNegative = this.allowOrderStockNegative;
	this.company.settings.allowEditCustomerWarehouse = this.allowEditCustomerWarehouse;
	this.company.settings.flagNotifyStorekeeper = this.flagNotifyStorekeeper;
	this.company.settings.flagDoNotPrintRequestedOrder = this.flagDoNotPrintRequestedOrder;
	this.company.settings.flagTaxesDefault = this.flagTaxesDefault;
	this.company.settings.flagCodeProductAuto = this.flagCodeProductAuto;
	this.company.settings.flagCodeAutoGenerate = this.flagCodeAutoGenerate;
	this.company.settings.flagCalculateEarnings = this.flagCalculateEarnings;
	this.company.settings.flagConvers = this.flagConvers;
	this.company.settings.showImageSearch = this.showImageSearch;
	this.company.settings.flagElectronicGuide = this.flagElectronicGuide;
	this.company.settings.flagEditPriceBySupervisor = this.flagEditPriceBySupervisor;
	this.company.settings.flagAdvanceOnSale = this.flagAdvanceOnSale;
	this.company.settings.flagSettlement = this.flagSettlement;
	this.company.settings.flagDeliveryAsConfirmed = this.flagDeliveryAsConfirmed;
	this.company.settings.flagDisablePrintMobile = this.flagDisablePrintMobile;
	this.company.settings.flagGrouper = this.flagGrouper;
	this.company.settings.disableRouteFollowUp = this.disableRouteFollowUp;
	this.company.settings.flagQuotation = this.flagQuotation;
	this.company.settings.COTMoveKardex = this.COTMoveKardex;
	this.company.settings.flagMultipleSalesConversionsQuote =
		this.flagMultipleSalesConversionsQuote;
	this.company.settings.flagUseDocConsulting = this.flagUseDocConsulting;
	this.company.settings.flagShowCustomersAssignedToRoute =
		this.flagShowCustomersAssignedToRoute;
	this.company.settings.flagShowVariations = this.flagShowVariations;
	this.company.settings.flagTypeSearch = this.flagTypeSearch;
	this.company.settings.flagWorkWithBatches = this.flagWorkWithBatches;
	this.company.settings.flagRoundSales = this.flagRoundSales;
	this.company.settings.flagPurAutoGenerateSerie = this.flagPurAutoGenerateSerie;
	this.company.settings.flagNotifySalesConversion = this.flagNotifySalesConversion;
	this.company.settings.flagAnnexTransactions = this.flagAnnexTransactions;
	this.company.settings.flagPurCashDeskClosing = this.flagPurCashDeskClosing;
	this.company.settings.flagAuditService = this.flagAuditService;
	this.company.settings.flagShowIot = this.flagShowIot;
	this.company.settings.flagUseSimpleBrand = this.flagUseSimpleBrand;
	this.company.settings.flagTaxesIgvTemporary = this.flagTaxesIgvTemporary;
	this.company.settings.flagProductOnlyStock = this.flagProductOnlyStock;
	this.company.settings.flagStockByConversion = this.flagStockByConversion;
	this.company.settings.flagInventoryFast = this.flagInventoryFast;
	this.company.settings.flagTransferRequestFromPendingOrders = this.flagTransferRequestFromPendingOrders;
	this.company.settings.priceToQuantityCalculation = this.priceToQuantityCalculation;
	this.company.settings.flagGenericSalesCustomer = this.flagGenericSalesCustomer;
	this.company.settings.flagGenerateDocumentAutomatic = undefined;
	this.company.settings.flagKardexValued = this.flagKardexValued;
	this.company.settings.flagNotMoveKardex = this.flagNotMoveKardex;
	this.company.settings.flagTotalKardex = this.flagTotalKardex;
	this.company.settings.flagChangeNtvFlow = this.flagChangeNtvFlow;
	this.company.settings.flagSyncMoveTypeFirebase = this.flagSyncMoveTypeFirebase;
	this.company.settings.wholesaler = this.wholesaler;
	this.company.settings.flagFlowManufacturedProduct = this.flagFlowManufacturedProduct;
	this.company.settings.flagProductExpressFlow = this.flagProductExpressFlow;
	this.company.settings.flagAttendanceRegistration = this.flagAttendanceRegistration;
	this.company.settings.flagCompanyEliminated = this.flagCompanyEliminated;
	this.company.settings.balanceCustomerAll = this.balanceCustomerAll;
	this.company.settings.flagEditBlockedAcl = this.flagEditBlockedAcl;
	this.company.settings.flagNotUseGlobalUbigeo = this.flagNotUseGlobalUbigeo;
	this.company.settings.flagPerception = this.flagPerception;
	this.company.settings.flagHideOutOfStockInPOS = this.flagHideOutOfStockInPOS;
	this.company.settings.flagNotLimitInORC = this.flagNotLimitInORC;
	this.company.settings.flagStockProductGroup = this.flagStockProductGroup;
	this.company.settings.flagExchangePointsByProduct = this.flagExchangePointsByProduct;
	this.company.settings.flagSalDocAsCash = this.flagSalDocAsCash;
	this.company.settings.flagDownloadOrder = this.flagDownloadOrder;
	this.company.settings.flagDisabledSignature = this.flagDisabledSignature;
	this.company.settings.flagExternalData = this.flagExternalData;
	this.company.settings.flagUseTori = this.flagUseTori;
	this.company.settings.flagNewKardexV3 = this.flagNewKardexV3;
	this.company.settings.flagKardexFast = this.flagKardexFast;
	this.company.settings.typeRegisterKardex = this.typeRegisterKardex;
	this.company.settings.flagKardexOptimized = this.flagKardexOptimized;
	this.company.settings.flagImmediateTransfer = this.flagImmediateTransfer;
	// this.company.settings.typeProcessKardex = this.typeProcessKardex;
	if (this.flagPaymentStatesShown && this.isDistributor) {
		this.company.settings.paymentStatesShown = [TypePayment.PayOut];
	} else if (this.company.settings.paymentStatesShown) {
		delete this.company.settings.paymentStatesShown;
	}
	if (this.zonesDelivery.length || this.zonesCourier.length) {
		let deliveryZonesD = [];
		let deliveryZonesC = [];
		let deliveryZonesF = [];
		if (this.zonesDelivery) {
			deliveryZonesD = this.setOrderPaths(this.zonesDelivery, TypeOrder.Delivery);
		}
		if (this.zonesCourier) {
			deliveryZonesC = this.setOrderPaths(this.zonesCourier, TypeOrder.Courier);
		}
		if (this.zonesFree) {
			deliveryZonesF = this.setOrderPaths(this.zonesFree, TypeOrder.Free);
		}
		this.company.settings.deliveryZones = deliveryZonesD.concat(
			deliveryZonesC,
			deliveryZonesF
		);
	}
	if (this.company.settings.deliveryZone) {
		delete this.company.settings.deliveryZone;
	}
	if (this.company.settings.flagDisableTotalKardex !== undefined) {
		delete this.company.settings.flagDisableTotalKardex;
	}
	const deliverRows = this.priceRows.map((p) => {
		const newP = {
			from: Number(p.from),
			to: Number(p.to),
			price: Number(p.price),
			typeOrder: TypeOrder.Delivery,
		};
		return newP;
	});
	const courierRows = this.priceRowsCourier.map((p) => {
		const newP = {
			from: Number(p.from),
			to: Number(p.to),
			price: Number(p.price),
			typeOrder: TypeOrder.Courier,
		};
		return newP;
	});
	const freeRows = this.priceRowsFree.map((p) => {
		const newP = {
			from: Number(p.from),
			to: Number(p.to),
			price: Number(p.price),
			typeOrder: TypeOrder.Free,
		};
		return newP;
	});
	this.company.settings.priceDelivery = deliverRows.concat(courierRows, freeRows);
	this.company.settings.freeCourierTwoDrivers = this.freeCourierTwoDrivers;
	this.company.settings.flagCurrierDeliveryReady = this.flagCurrierDeliveryReady;
	this.company.settings.doNotCostShipingToDrivers = this.doNotCostShipingToDrivers;
	this.company.settings.freeCourierSettings = {
		showFlagCollectForYou: this.freeCourierSettings.showFlagCollectForYou,
		showFlagImmediateDelivery: this.freeCourierSettings.showFlagImmediateDelivery,
		additionalCostPercentage: Number(this.freeCourierSettings.additionalCostPercentage),
		limitAssignedOrdersFree: Number(this.freeCourierSettings.limitAssignedOrdersFree),
		limitAssignedOrdersCourier: Number(
			this.freeCourierSettings.limitAssignedOrdersCourier
		),
		limitAssignedOrdersDelivery: Number(
			this.freeCourierSettings.limitAssignedOrdersDelivery
		),
		numberNotifyFree: Number(this.freeCourierSettings.numberNotifyFree) || 0,
		notifyByRadioOrder: this.freeCourierSettings.notifyByRadioOrder,
		radioOrderMax: Number(this.freeCourierSettings.radioOrderMax) || 0,
		numberNotifyCourier: Number(this.freeCourierSettings.numberNotifyCourier) || 0,
		flagNotifyRandomDelivery: this.freeCourierSettings.flagNotifyRandomDelivery,
		flagNotifyRandom: this.freeCourierSettings.flagNotifyRandom,
		flagNotifyRandomCourier: this.freeCourierSettings.flagNotifyRandomCourier,
		numberNotifyDelivery: Number(this.freeCourierSettings.numberNotifyDelivery) || 0,
		freeOrderPercentage: this.freeCourierSettings.freeOrderPercentage,
		courierOrderPercentage: this.freeCourierSettings.courierOrderPercentage,
		deliveryOrderPercentage: this.freeCourierSettings.deliveryOrderPercentage,
	};
	this.company.settings.expenseConfig = {
		notAttachedDocument: Number(this.expenseConfig.notAttachedDocument || 0),
		relateExpense: Number(this.expenseConfig.relateExpense || 0),
	};
	return this.company.settings;
}

function setPercentage({ model, value }) {
	this.freeCourierSettings[model] = Number(value);
}

function updateUserInfoInLocalStorage(info) {
	const newInfo = { ...info };
	newInfo.company.currencies = this.company.currencies;
	setLocalData('admin-user', newInfo);
}

async function sendDocsAndPays() {
	this.documentsSave = this.documentsSalesSelected.concat(
		this.documentsPurchasesSelected
	);
	this.paymentsSave = this.paymentsSalesSelected.concat(this.paymentsPurchasesSelected);
	let ids = this.allPaymentsSales.reduce((acum, a) => {
		const newAcum = [...acum];
		const index = this.paymentsSalesSelected.findIndex((p) => p === a.id);
		if (index > -1) {
			const newData = { id: a.id };

			const aditionalInformation = {};
			if (Number(a.percentage) > 0) {
				aditionalInformation.surcharge = twoDecimals(Number(a.percentage) / 100);
			}
			if (a.qrUrl) {
				aditionalInformation.qrUrl = a.qrUrl;
			}
			if (!lib.isEmpty(aditionalInformation)) {
				newData.aditionalInformation = aditionalInformation;
			}
			newAcum.push(newData);
		}
		return newAcum;
	}, []);
	const idsPurchases = this.paymentsPurchasesSelected.map((p) => {
		const newData = { id: p };
		return newData;
	});
	ids = ids.concat(idsPurchases);
	const body = {
		ids,
	};
	const request = [
		this.$httpSales.delete('type-documents-company', {
			data: this.documentsSave,
		}),
		this.$httpSales.delete('type-payments-company', { data: body }),
	];
	try {
		await Promise.all(request);
		this.showNotification('La data se guardó correctamente');
		this.loadData();
	} catch (err) {
		this.showGenericError();
	}
}

function setCurrencies(currenciesData) {
	const cur = currenciesData.value;
	const model = currenciesData.model;
	this[model] = cur;
	this.company.currencies = this[model];
	this.currenciesSelected = cur;
	if (this.currenciesSelected.length === 1) {
		[this.newBankInfo.currency] = this.currenciesSelected;
		const currencyItem = this.currencies.find((c) => c.id === this.currenciesSelected[0]);
		currencyItem.value = currencyItem.code;
		this.setCurrency(currencyItem);
	} else {
		this.currency = '';
	}
}

function setCurrency(currencyData) {
	this.currency = currencyData.value;
	this.company.currency = this.currency;
}

function setData(event) {
	const { model, value } = event;
	if (model === 'hourOfClose') {
		this.company.hourOfClose = value;
	} else {
		this[model] = value;
	}
}

function useLectorValue() {
	const lectorValue = this.company.flagBarcodeReader ? 'sí' : 'no';
	return lectorValue;
}

function progressVal() {
	const progressValue = 25 * this.step;
	return progressValue;
}

function validateInfo() {
	return (
		!this.newData.subsidiary ||
		!this.newData.warehouseId ||
		!this.newData.terminal ||
		!this.newData.serie ||
		!this.newData.number ||
		!this.newData.typeDocument
	);
}

async function filteredTerminals() {
	if (!this.newData.subsidiary) {
		this.newData.subsidiary = { id: 0 };
	} else if (this.newData.subsidiary && this.newData.warehouseId) {
		const params = {
			comSubsidiariesId: this.newData.subsidiary.id,
			warWarehousesId: this.newData.warehouseId,
		};
		try {
			const response = await this.$httpSales.get('terminals', { params });
			this.terminals = response.data;
		} catch (error) {
			this.showGenericError();
		}
	} else if (!this.newData.warehouseId) {
		this.newData.warehouseId = 0;
	}
}

function rucMessage() {
	if (!this.$v.company.ruc.minLength) {
		return `El ruc debe tener ${this.labelsByCountry.rucLength} dígitos`;
	} else if (!this.$v.company.ruc.maxLength) {
		return `El ruc debe tener un máximo de ${this.labelsByCountry.rucLength} dígitos`;
	} else if (!this.$v.company.ruc.required) {
		return 'El ruc es requerido';
	}
	return '';
}

function showUpTerminals() {
	return (
		this.newData.warehouseId && this.newData.subsidiary && this.newData.subsidiary.id
	);
}

function showUpSeries() {
	return (
		this.newData.subsidiary &&
		this.newData.subsidiary.id &&
		this.newData.warehouseId &&
		this.newData.terminal
	);
}

function validations() {
	return {
		company: {
			ruc: {
				maxLength: maxLength(this.labelsByCountry.rucLength),
				minLength: minLength(this.labelsByCountry.rucLength),
				required,
			},
		},
	};
}

function flagCategoryPrice() {
	return this.company.settings.flagCategoryPrice ? 'sí' : 'no';
}

function flagEmployeeTransactionText() {
	const msg1 = 'Notas de crédito asociadas a caja del documento de venta';
	const msg2 = 'Notas de crédito asociadas al empleado';
	return this.company.settings.flagEmployeeTransaction ? msg2 : msg1;
}

function showDialog() {
	this.$refs.label.click();
}

async function getFile(fileInfo) {
	const newFile = {
		name: fileInfo.name.replace(/\s/g, '-'),
		base64data: fileInfo.sixFour,
	};
	try {
		const words = newFile.name.split('.');
		const lastItem = words.length;
		const extension = words[lastItem - 1];
		if (this.allowedFiles.indexOf(extension) > -1) {
			const { data: file } = await this.$httpProduction.post('upload-files', newFile);
			this.company.logo = file.Location;
		} else {
			this.showNotification(
				`Archivo no válido, solo se permite ${this.allowedFiles.join(',')}`,
				'warning'
			);
		}
	} catch (error) {
		this.showGenericError();
	}
}

function assignEmployee() {
	return this.company.settings.assignEmployee ? 'sí' : 'no';
}

function emailCustomerMandatory() {
	return this.company.settings.emailCustomerMandatory ? 'sí' : 'no';
}

function setTypePriceShown({ model, value }) {
	this.company.settings[model] = value.id;
}

function setDefaultTaxCode({ model, value }) {
	this.company.settings[model] = value.code;
}

function flagBasePriceDefault() {
	return this.company.settings.flagBasePriceDefault === BasePrice.PU ? 'PU' : 'PV';
}

function showCash() {
	return this.company.settings.showCash ? 'sí' : 'no';
}

// function showUseOrderCredits() {
// 	return this.company.settings.useOrderCredits ? 'sí' : 'no';
// }

function showFlagIntegrationGrouper() {
	return this.company.settings.flagTypeIntegrationGrouper ? 'sí' : 'no';
}

function textDiscount() {
	if (this.flagTypeDiscount) {
		return 'Descuento por monto';
	}
	return 'Descuento por porcentaje';
}

function labelSwitchQuantion() {
	if (this.flagMultipleSalesConversionsQuote) {
		return 'Permitir realizar solamente una conversión a venta';
	}
	return 'Permitir realizar multiples conversiones a venta';
}

function namePayment(id) {
	const index = this.allPaymentsSales.findIndex((a) => a.id === id);
	if (index > -1) {
		return this.allPaymentsSales[index].name;
	}
	return id;
}

function indexPayment(item) {
	return this.allPaymentsSales.findIndex((a) => a.id === item);
}

function addRange(price, rows, edit) {
	if (
		Number(this[price].to) >= 0 &&
		Number(this[price].from) >= 0 &&
		Number(this[price].price)
	) {
		if (Number(this[price].to) >= Number(this[price].from)) {
			const indexFrom = this[rows].findIndex(
				(p) =>
					Number(p.from) <= Number(this[price].from) &&
					Number(this[price].from) < Number(p.to) &&
					p.id !== this[price].id
			);
			const indexTo = this[rows].findIndex(
				(p) => Number(p.to) === Number(this[price].to) && p.id !== this[price].id
			);
			if (indexFrom > -1 || indexTo > -1) {
				this.showGenericError('El rango ya existe');
			} else {
				if (this[edit]) {
					const indexId = this[rows].findIndex((p) => p.id === this[price].id);
					if (indexId > -1) {
						this[rows][indexId] = { ...this[price] };
						this[edit] = false;
					}
				} else {
					this[price].id = this[rows].length;
					this[rows].push({ ...this[price] });
				}
				this[price] = {
					id: null,
					from: null,
					to: null,
					price: null,
				};
			}
		} else {
			this.showGenericError('El rango debe ser de menor a mayor');
		}
	} else {
		this.showGenericError('Los valores no deben ser negativos');
	}
}

function disabledBtnPrice(value) {
	return (
		this[value].from === null ||
		Number(this[value].to) === 0 ||
		Number(this[value].price) === 0 ||
		this[value].from === ''
	);
}

function deletePrice(id, rows) {
	const index = this[rows].findIndex((p) => p.id === id);
	if (index > -1) {
		this[rows].splice(index, 1);
		this[rows] = this[rows].map((p, indexP) => {
			const newP = { ...p };
			newP.id = indexP;
			return newP;
		});
	}
}

function editPrice(edit, price, nameEdit) {
	this[price] = {
		id: edit.id,
		from: edit.from,
		to: edit.to,
		price: edit.price,
	};
	this[nameEdit] = true;
}

function showFlagShowSlugProduct() {
	return this.flagShowSlugProduct ? 'sí' : 'no';
}

function showFlagShowVariations() {
	return this.flagShowVariations ? 'sí' : 'no';
}

function showFlagDistribuitor() {
	return this.flagGrouper ? 'sí' : 'no';
}

function openZone() {
	this.dialogZone = true;
}

function closeModalZone() {
	this.dialogZone = false;
}

function addPolygon(value) {
	const zoneL = `zonesLocal${this.selectZone}`;
	this[zoneL].push([...value.paths]);
}

function saveZone() {
	const zoneL = `zonesLocal${this.selectZone}`;
	const zoneC = `zones${this.selectZone}`;
	const flag = this[zoneL].every((z) => z.length > 2 && z.length < 7);
	if (flag) {
		this[zoneC] = [...this[zoneL]];
		this.closeModalZone();
	} else {
		this.showNotification(
			'Los polígonos deben tener mínimo 3 puntos y máximo 6 puntos',
			'info'
		);
	}
}

function editPolygon(value, index, flag) {
	const zoneL = `zonesLocal${this.selectZone}`;
	const indexP = flag ? this[`zones${this.selectZone}`].length + index : index;
	this[zoneL][indexP] = [...value];
}

function showCourier() {
	if (this.company.settings.flagGrouper) {
		return this.company.settings.flagGrouper;
	}
	return false;
}

function changeOrder(value) {
	this.typeOrderSelect = value;
}

function validDomainCatalog(value) {
	const invalidValue = value.lastIndexOf('/') === value.length - 1;
	this.domainMessage = invalidValue ? 'El dominio no debe terminar en slash (/).' : '';
}

async function loadCurrent() {
	try {
		({ data: this.userData } = await this.$httpSales.get('employees/current'));
		setLocalData('admin-user', this.userData);
		this.$bus.$emit('USER_INFO', this.userData);
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function showFlagCollectForYou() {
	return this.freeCourierSettings.showFlagCollectForYou ? 'sí' : 'no';
}

function showFlagImmediateDelivery() {
	return this.freeCourierSettings.showFlagImmediateDelivery ? 'sí' : 'no';
}

function showRandomDelivery() {
	return this.freeCourierSettings.flagNotifyRandomDelivery ? 'sí' : 'no';
}

function labelFlagNotifyRandom() {
	return this.freeCourierSettings.flagNotifyRandom ? 'sí' : 'no';
}

function labelFlagNotifyRandomCourier() {
	return this.freeCourierSettings.flagNotifyRandomCourier ? 'sí' : 'no';
}

function selectZone() {
	let name = 'Delivery';
	if (this.typeOrderSelect === this.typeOrder.courier) {
		name = 'Courier';
	} else if (this.typeOrderSelect === this.typeOrder.free) {
		name = 'Free';
	}
	return name;
}

function setOrderPaths(items, type) {
	return items.map((item) => {
		const newZone = {
			orderType: type,
			polygon: item.map((i, index) => {
				const newP = { ...i };
				newP.order = Number(index + 1);
				return newP;
			}),
			length: item.length,
		};
		return newZone;
	});
}

function nameTabOrder() {
	let name = 'Delivery';
	if (this.typeOrderSelect === this.typeOrder.courier) {
		name = 'Courier';
	} else if (this.typeOrderSelect === this.typeOrder.free) {
		name = 'Libre';
	}
	return name;
}

function getShowZone() {
	let zone = this.zonesDelivery;
	if (this.typeOrderSelect === this.typeOrder.courier) {
		zone = this.zonesCourier;
	} else if (this.typeOrderSelect === this.typeOrder.free) {
		zone = this.zonesFree;
	}
	return zone;
}

function titleModal() {
	if (this.typeOrderSelect === this.typeOrder.delivery) {
		return 'Escoge tu zona de reparto - Delivery';
	} else if (this.typeOrderSelect === this.typeOrder.courier) {
		return 'Escoge tu zona de reparto - Courier';
	}
	return 'Escoge tu zona de reparto - Libre';
}

function setDataText({ model, value }) {
	this.freeCourierSettings[model] = value;
}

function changeShowFlagImmediateDelivery(value) {
	if (!value) {
		this.freeCourierSettings.additionalCostPercentage = 0;
	}
}

function changeShowRandomDelivery(value) {
	if (!value) {
		this.freeCourierSettings.flagNotifyRandomDelivery = value;
	}
}

function changeShowflagNotifyRandom(value) {
	if (!value) {
		this.freeCourierSettings.flagNotifyRandom = value;
	}
}

function changeShowflagNotifyCourier(value) {
	if (!value) {
		this.freeCourierSettings.flagNotifyRandomCourier = value;
	}
}

function labelDownload() {
	return this.company.settings.downloadSale
		? 'Descargar Documento'
		: 'Vista Previa del Documento';
}

function labelShowKardex() {
	return this.flagKardexValued ? 'Utilizar costo promedio' : 'Utilizar último costo';
}

function setTypeProcess({ model, value }) {
	this[model] = value.id;
}

function textGenericCustomer() {
	if (this.isEcuador) {
		return 'Al deshabilitar este campo, no podrá realizar un documento de venta con un consumidor final';
	}
	return 'Al deshabilitar este campo, no podrá realizar un documento de venta con un cliente genérico';
}

function labelShowRegisterKardex() {
	return this.typeRegisterKardex ? 'Registro inmediato por DB' : 'Registro por SQS';
}

function showNotMoveKardex(value) {
	this.flagNotMoveKardex = value;
	if (value) {
		this.flagKardexValued = false;
		this.flagKardexFast = false;
	}
}

function data() {
	return {
		isSupport: this.$userInfo.roleCode === 'SUPPORT',
		action: {
			code: '',
			open: false,
			title: '',
			width: 469,
		},
		arrayTaxesGeneral: [],
		allowOrderStockNegative: true,
		allowEditCustomerWarehouse: false,
		flagNotifyStorekeeper: false,
		flagDoNotPrintRequestedOrder: true,
		flagTaxesDefault: false,
		allDocumentsPurchases: [],
		allDocumentsSales: [],
		allPaymentsPurchases: [],
		allPaymentsSales: [],
		banks: [],
		columns: [
			{ id: 1, name: 'Banco', visible: true, checked: true },
			{ id: 2, name: 'Nro de Cuenta', visible: true, checked: true },
			{ id: 3, name: 'CCI', visible: true, checked: true },
			{ id: 4, name: 'Tipo de Moneda', visible: true, checked: true },
			{
				id: 5,
				name: 'Acciones',
				visible: true,
				checked: true,
				flagVisible: true,
			},
		],
		flagGenericSalesCustomer: false,
		flagRequestLocationOrderApp: false,
		flagAskLocationSellerApp: false,
		flagOutbox: false,
		flagUseIntegrationWhatsApp: false,
		flagWorkingWithAI: false,
		flagRelateVehicleFloat: false,
		flagAlertConversions: false,
		flagUseTransportAgency: false,
		defaultTax: '',
		company: {
			address: '',
			bankAccounts: [],
			commerceCode: '',
			companyName: '',
			companyRzSocial: '',
			convertWeightTo: '',
			credential: '',
			currencies: [],
			email: '',
			flagUpdatePrice: 1,
			flagBarcodeReader: false,
			flagAutomaticRoutesClose: 0,
			hourOfClose: '20:00',
			flagIgv: 0,
			flagTest: false,
			phone: '',
			ruc: '',
			settings: {
				autoDispatch: false,
				codeTaxesDefault: '',
				domainCatalog: '',
				globalDiscount: false,
				flagShowAccountingEngine: false,
				flagBasePriceDefault: 0,
				flagCategoryPrice: false,
				flagCodes: false,
				flagShowPhoneCommerce: false,
				flagPaymentVendor: false,
				flagEmployeeTransaction: 0,
				flagGenerateDocumentAutomatic: undefined,
				flagImport: 0,
				flagStockDiscountSaleTransfer: 0,
				flagTip: 0,
				flagTransferDefault: 1,
				flagTransferDisplay: 1,
				singleDiscount: false,
				assignEmployee: false,
				emailCustomerMandatory: false,
				typePriceShown: 1,
				showCash: false,
				// useOrderCredits: false,
				typeProductsCreationPermission: [],
				flagCatEcomFather: 0,
				flagShowTotalOrders: false,
				flagPriceListChangeApproval: false,
				flagShowSlugProduct: 0,
				flagCodeProductAuto: 0,
				flagConvers: 0,
				flagElectronicGuide: false,
				flagEditPriceBySupervisor: false,
				flagAdvanceOnSale: false,
				flagSettlement: false,
				flagCalculateEarnings: false,
				flagDeliveryAsConfirmed: false,
				flagShowVariations: 0,
				flagTypeSearch: 0,
				distanceMode: 2,
			},
			theme: {},
			weight: '',
			logo: '',
		},
		companyCurrencies: [],
		currencies: [],
		currenciesSelected: [],
		currency: '',
		currencyProperties: ['code'],
		data: [],
		documents: [],
		documentsColumns: [
			{ id: 1, name: 'Serie', visible: true, checked: true },
			{ id: 2, name: 'Número', visible: true, checked: true },
			{
				id: 3,
				name: 'Terminales',
				value: 'terminal',
				visible: true,
				checked: true,
			},
			{ id: 4, name: 'Tipo de documento', visible: true, checked: true },
			{
				id: 5,
				name: 'Sucursales',
				value: 'warehouse',
				visible: true,
				checked: true,
			},
			{ id: 6, name: 'Acciones', visible: true, checked: true },
		],
		documentsRows: [],
		documentsSave: [],
		documentSelected: null,
		documentsPurchasesSelected: [],
		documentsSalesSelected: [],
		domainMessage: '',
		emailRules: [
			(v) => !!v || 'El correo es requerido',
			(v) =>
				/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'El correo no es válido',
		],
		exchangeRate: '',
		flagWorkWithBatches: false,
		flagRoundSales: false,
		flagPurAutoGenerateSerie: false,
		flagNotifySalesConversion: false,
		flagAnnexTransactions: false,
		flagPurCashDeskClosing: false,
		flagAuditService: false,
		flagShowIot: false,
		flagCodeAutoGenerate: false,
		flagCalculateEarnings: false,
		flagUseSimpleBrand: false,
		flagTaxesIgvTemporary: false,
		flagProductOnlyStock: false,
		flagStockByConversion: false,
		flagInventoryFast: false,
		priceToQuantityCalculation: false,
		labelGeneric: '',
		loading: false,
		maxLengthQuantity: 3,
		newBankInfo: {
			bankId: 0,
			bank: {
				name: '',
			},
			accountNumber: '',
			accountNumberCi: '',
			currency: '',
			currencySymbol: '',
			name: '',
		},
		newData: {
			serie: '',
			number: null,
			terminal: null,
			typeDocument: null,
			subsidiary: {},
			warehouseId: 0,
		},
		payments: [],
		paymentsSave: [],
		paymentsPurchasesSelected: [],
		paymentsSalesSelected: [],
		rows: [],
		rowSelected: null,
		step: 0,
		subsidiaries: [],
		terminals: [],
		typePricesLists: [
			{
				id: 1,
				label: 'Por Categoría',
			},
			{
				id: 2,
				label: 'Por Producto',
			},
		],
		typeProcess: [
			{
				id: 1,
				name: 'Actualización de stock inmediato',
			},
			{
				id: 2,
				name: 'Actualización de stock normal',
			},
		],
		units: ['kilos', 'libras'],
		warehouses: [],
		allowedFiles: ['png'],
		selectTypeProducts: [],
		codeComposed: 0,
		codeProduct: 0,
		codeServices: 0,
		priceRows: [],
		priceColumns: [
			{ id: 1, name: 'Kílometro Mínimo', visible: true, checked: true },
			{ id: 2, name: 'Kílometro Maxímo', visible: true, checked: true },
			{ id: 3, name: 'Precio', visible: true, checked: true },
			{ id: 4, name: 'Acciones', visible: true, checked: true },
		],
		priceKm: {
			id: null,
			from: null,
			to: null,
			price: null,
		},
		editPriceRange: false,
		flagCatEcomFather: false,
		flagHideOutOfStock: false,
		flagShowBaseUnit: 0,
		flagTypeOriginOrder: false,
		flagDispatchConvertedOrder: false,
		flagAssignEmployeeOrder: false,
		flagShowTotalOrders: false,
		flagPriceListChangeApproval: false,
		flagShowSlugProduct: true,
		checkSellerWritedCode: false,
		flagAddressNotRequired: false,
		restaurantFlow: false,
		flagTypeConvertToSale: false,
		flagEditOrderVendor: false,
		flagNotConvertToSaleFlow: false,
		flagEnableRequestedRoutes: false,
		flagCodeProductAuto: false,
		flagConvers: false,
		showImageSearch: false,
		flagElectronicGuide: false,
		flagEditPriceBySupervisor: false,
		flagAdvanceOnSale: false,
		flagSettlement: false,
		flagDeliveryAsConfirmed: false,
		flagDisablePrintMobile: false,
		flagShowVariations: false,
		flagTypeSearch: false,
		flagGrouper: false,
		disableRouteFollowUp: false,
		flagLoyalti: false,
		flagTypeDiscount: 0,
		showNotifySale: false,
		dialogZone: false,
		typeOrder: {},
		typeOrderSelect: 1,
		priceRowsCourier: [],
		priceKmCourier: {
			id: null,
			from: null,
			to: null,
			price: null,
		},
		priceRowsFree: [],
		priceKmFree: {
			id: null,
			from: null,
			to: null,
			price: null,
		},
		editPriceRangeCourier: false,
		userData: {},
		flagKardexValued: false,
		flagNotMoveKardex: false,
		flagTotalKardex: false,
		flagChangeNtvFlow: false,
		flagSyncMoveTypeFirebase: false,
		wholesaler: false,
		flagProductExpressFlow: false,
		flagFlowManufacturedProduct: false,
		flagAttendanceRegistration: false,
		flagCompanyEliminated: false,
		balanceCustomerAll: false,
		flagEditBlockedAcl: false,
		flagNotUseGlobalUbigeo: false,
		flagPerception: false,
		flagHideOutOfStockInPOS: false,
		flagNotLimitInORC: false,
		flagStockProductGroup: false,
		flagExchangePointsByProduct: false,
		flagSalDocAsCash: false,
		flagDownloadOrder: false,
		flagDisabledSignature: false,
		flagExternalData: false,
		flagUseTori: false,
		flagNewKardexV3: false,
		flagPaymentStatesShown: false,
		zonesLocalDelivery: [],
		zonesDelivery: [],
		zonesLocalCourier: [],
		zonesLocalFree: [],
		zonesCourier: [],
		zonesFree: [],
		typeDistanceMode: [
			{
				id: 2,
				name: 'Vehicular',
			},
			{
				id: 1,
				name: 'Lineal',
			},
		],
		typeShowBaseUnit: [
			{
				id: 0,
				name: 'Se mostrará la unidad principal y las conversiones.',
			},
			{
				id: 1,
				name: 'Se ocultará la unidad principal y se mostrará las conversiones.',
			},
			{
				id: 2,
				name: 'Se mostrará la unidad principal y se ocultará las conversiones.',
			},
		],
		freeCourierTwoDrivers: false,
		flagCurrierDeliveryReady: false,
		doNotCostShipingToDrivers: false,
		freeCourierSettings: {
			radioOrderMax: 0,
			notifyByRadioOrder: false,
			flagNotifyRandom: false,
			numberNotifyFree: null,
			flagNotifyRandomCourier: false,
			numberNotifyCourier: null,
			flagNotifyRandomDelivery: false,
			limitAssignedOrdersFree: 0,
			limitAssignedOrdersCourier: 0,
			limitAssignedOrdersDelivery: 0,
			numberNotifyDelivery: null,
			freeOrderPercentage: 0,
			courierOrderPercentage: 0,
			deliveryOrderPercentage: 0,
			showFlagCollectForYou: false,
			showFlagImmediateDelivery: false,
			additionalCostPercentage: 0,
		},
		expenseConfig: {
			notAttachedDocument: 0,
			relateExpense: 0,
		},
		flagQuotation: false,
		COTMoveKardex: false,
		flagMultipleSalesConversionsQuote: false,
		flagUseDocConsulting: false,
		flagShowCustomersAssignedToRoute: false,
		typeRegisterKardex: 1,
		flagKardexOptimized: false,
		flagImmediateTransfer: false,
		typeProcessKardex: false,
		flagKardexFast: false,
		preDomain: '',
		codeTypePaymentQRImage: ['yape', 'plin'],
		flagTransferRequestFromPendingOrders: false,
		showIgvModal: false,
	};
}

export default {
	name: 'companies',
	components: {
		actionSidebar,
		appSelect,
		appTable,
		headerPage,
		modalSidebarButton,
		VueSixFour,
		modalItems,
		deliveryZone,
		uploadImg,
	},
	computed: {
		applyDisabled,
		assignEmployee,
		autoDispatchValue,
		discountGlobalValue,
		discountProductValue,
		downloadSaleValue,
		editFlagStockDiscountSaleTransfer,
		editPricingValue,
		emailCustomerMandatory,
		flagBasePriceDefault,
		flagCategoryPrice,
		flagEmployeeTransactionText,
		flagImportValue,
		flagLoyaltyText,
		flagTipValue,
		flagTransferDefaultValue,
		flagTransferDisplayValue,
		igvValue,
		labelDownload,
		labelShowKardex,
		labelShowRegisterKardex,
		progressVal,
		rucMessage,
		selectZone,
		showCash,
		showCourier,
		showFlagDistribuitor,
		showFlagIntegrationGrouper,
		showFlagShowSlugProduct,
		showFlagShowVariations,
		labelSwitchQuantion,
		showUpSeries,
		showUpTerminals,
		// showUseOrderCredits,
		stockNegativeValue,
		useLectorValue,
		validateInfo,
		nameTabOrder,
		getShowZone,
		textGenericCustomer,
		titleModal,
		showFlagCollectForYou,
		showFlagImmediateDelivery,
		showRandomDelivery,
		labelFlagNotifyRandom,
		labelFlagNotifyRandomCourier,
		textDiscount,
		showFlagImmediateDeliveryComputed: {
			get() {
				return this.freeCourierSettings.showFlagImmediateDelivery;
			},
			set(value) {
				this.freeCourierSettings.showFlagImmediateDelivery = value;
			},
		},
	},
	created,
	data,
	methods: {
		handleIgvToggle(newValue) {
			if (newValue === true) {
				this.showIgvModal = true;
			} else {
				this.flagTaxesIgvTemporary = false;
			}
		},
		handleConfirmIgv() {
			this.flagTaxesIgvTemporary = true;
			this.showIgvModal = false;
		},
		handleCancelIgv() {
			this.showIgvModal = false;
		},
		getPayPercentage(item) {
			return this.allPaymentsSales[this.indexPayment(item)].percentage;
		},
		setPayPercentage(item, val) {
			this.allPaymentsSales[this.indexPayment(item)].percentage = val;
		},
		addAccount,
		addData,
		applyFilter,
		changeShowFlagImmediateDelivery,
		changeShowflagNotifyCourier,
		changeShowflagNotifyRandom,
		changeShowRandomDelivery,
		closeModal,
		deleteDocument,
		deleteRow,
		editDocument,
		editRow,
		filteredTerminals,
		getCompanysettings,
		setDefaultTaxCode,
		loadData,
		loadDefaultTaxesTypes,
		removeBankAccount,
		saveCompany,
		sendDocsAndPays,
		setCurrencies,
		setCurrency,
		setData,
		setPercentage,
		setTypePriceShown,
		updateUserInfoInLocalStorage,
		showDialog,
		getFile,
		namePayment,
		indexPayment,
		addRange,
		editPrice,
		deletePrice,
		openZone,
		closeModalZone,
		addPolygon,
		saveZone,
		editPolygon,
		changeOrder,
		disabledBtnPrice,
		validDomainCatalog,
		loadCurrent,
		setTypeProcess,
		setOrderPaths,
		setDataText,
		showNotMoveKardex,
		setPreDomain() {
			const dynamicSaleURL = helper.getEndPointDynamic('SALES_URL') || {};
			const urlSale = dynamicSaleURL || process.env.SALES_URL;
			if (!urlSale) {
				this.urlSale = '?';
			}
			const urlObj = new URL(urlSale);
			const hostname = urlObj.hostname;
			const partes = hostname.split('.');
			this.preDomain = partes[0];
		},
		copy(text) {
			const camp = document.createElement('textarea');
			camp.value = text;
			document.body.appendChild(camp);
			camp.select();
			document.execCommand('copy');
			document.body.removeChild(camp);
			this.showNotification('Texto copiado');
		},
		setUrlQR(url, index) {
			this.allPaymentsSales[index].qrUrl = url;
		},
	},
	props: {
		tab: [Number, String],
	},
	validations,
};
</script>

<style lang="scss">
.companies {
	margin: 0px auto;

	.stepper {
		box-shadow: 0 0 0 0;

		&__header {
			box-shadow: 0 0 0 0;
		}

		&__content {
			padding: 58px 30px 16px;
			max-width: 1150px;
			margin: 0 auto;
		}
	}

	.stepper__label {
		color: #9ca6b0;
		font-size: 12px !important;
		font-weight: 600;
	}

	.stepper__step--active {
		background-color: #e4e4e4;
		color: #4a4a4a !important;
	}

	.stepper__step {
		padding: 21px 13px !important;
	}

	.stepper:not(.stepper--vertical) .stepper__label {
		@media (max-width: 1200px) {
			display: none !important;
		}
	}
}

.companies-stepper {
	background-color: #f5f5f5;
	border-bottom: 3px solid #e4e4e4;
	border-top: 3px solid #e4e4e4;
	justify-content: center !important;
	padding: 0 25px;

	@media (min-width: 1300px) {
		padding: 0 158px;
	}
}

.companies-content {
	background-color: color(white-content);

	.companies-btn {
		display: flex;
		justify-content: center;
		margin-top: 20px;
	}

	.card {
		box-shadow: 0 0 0 0;
	}

	h2 {
		color: map-get($colors, color-input);
		font-family: map-get($fonts, open-semibold);
		font-size: map-get($sizes, large);
	}

	h3 {
		color: map-get($colors, paginationText);
		font-family: map-get($fonts, open-semibold);
		font-size: map-get($sizes, medium18);
		font-weight: normal;
	}
}

.radio-selection {
	@include flex-between;
	margin-bottom: 25px;
	width: 502px;

	@media (max-width: 425px) {
		display: block;
	}

	label {
		margin-right: 15px;
	}

	.radio-igv,
	.radio-edit-price {
		margin-right: 15px;

		&.radio-group--column {
			padding-top: 0;
		}

		&.radio-group--column .input-group__input {
			display: inline;
		}
	}
}

.ft-12 {
	font-size: size(small);
}

.bank-list-form {
	align-items: center;
	display: flex;
	flex-wrap: wrap;
	margin: auto;

	@media (max-width: 425px) {
		display: block;
	}

	div {
		margin-right: 20px;
		width: 330px;
		@media (max-width: 425px) {
			width: 100%;
		}
	}
}

.progress-linear {
	margin: 0px;
}

table.table-list {
	tbody {
		tr {
			td {
				&:first-child {
					border-left: 1px solid map-get($colors, grey-border);
				}

				&:last-child {
					border-right: 1px solid map-get($colors, grey-border) !important;
				}
			}
		}
	}
}

.company-text-regular {
	color: map-get($colors, paginationText);
	font-family: map-get($fonts, open-regular);
	font-size: map-get($sizes, medium16);
	font-weight: normal;
}

.label-section {
	color: map-get($colors, background-sidebar);
	font-family: map-get($fonts, open-bold);
	font-size: map-get($sizes, medium18);
}

.text-label {
	font-size: map-get($sizes, small13);
	font-weight: 700;
}

.btn-zone {
	background-color: color(success);
	border-radius: 5px;
	color: color(primary);
	font-size: 12px;
	padding: 7px 11px;
}

.btn-tab {
	border: 1px solid color(primary);
	color: color(primary);
	font-size: 13px;
	padding: 3px 0;
	text-align: center;
	width: 103px;

	&.select {
		background-color: color(primary);
		color: color(white);
	}
}

.wrapper-price {
	border-bottom: 1px solid color(border-title);
	padding-bottom: 9px;
}

.title-global {
	color: #494949;
	font-family: map-get($fonts, open-semibold);
}

.title-section {
	border-bottom: 1px solid #dbe0e5;
	color: color(sidebar);
	font-family: map-get($fonts, open-bold);
	font-size: 18px;
	padding-bottom: 9px;
}

.content-percentage {
	border-radius: 6px;
	background-color: rgba(2, 151, 155, 0.08);
	color: color(sidebar);
	font-family: map-get($fonts, open-bold);
	font-size: 13px;
	padding: 15px 14px;
}

.ml-50 {
	margin-left: 235px;
}
</style>
