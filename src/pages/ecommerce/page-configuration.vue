<template>
	<div class="configuration-ecommerce">
		<header-page
			caption-navigation="Ecommerce"
			:title="`CONFIGURACIÓN GENERAL - ${listCommerces.name}`"
			:limitTitle="isMovil ? 18 : 40"
		/>
		<app-loading
			:show-loading="loadingServices"
			label="La carga terminará en un momento y podrás ver
			toda la información configurada para el comercio."
		/>
		<v-alert :value="listCommerces.wayPaymentRelated.length === 0" type="info">
			Debe tener configurado al menos un medio de pago para no tener incovenientes con la
			aplicación e ecommerce, sino aún no cuenta con las opciones de tarjeta de crédito,
			débito, banca por internet y depósito se le recomienda elegir Pago al recibir y la
			opción Efectivo.
		</v-alert>
		<v-stepper v-model="step" non-linear>
			<v-stepper-header class="companies-stepper">
				<v-stepper-step step="1" editable>Datos de la empresa</v-stepper-step>
				<v-divider></v-divider>
				<v-stepper-step step="2" editable>Productos</v-stepper-step>
				<v-divider></v-divider>
				<v-stepper-step step="3" editable
					>Cuentas y Proceso y medios de pago</v-stepper-step
				>
				<v-divider></v-divider>
				<v-stepper-step step="4" editable>Envío y recojo</v-stepper-step>
				<v-divider></v-divider>
				<v-stepper-step step="5" editable :complete="step > 5"
					>Lista de precios</v-stepper-step
				>
			</v-stepper-header>
			<v-stepper-items>
				<v-stepper-content step="1">
					<v-layout wrap px-3 mt-2 mb-5 pb-5 pt-3>
						<v-flex xs12 md6 mb-3 class="pr-5-rs">
							<v-layout wrap>
								<v-flex xs12>
									<p class="title-form">Datos Generales</p>
								</v-flex>
								<v-flex xs12 mb-3>
									<app-input-text
										label="Nombre de comercio(*)"
										model="name"
										:text="commerce.name"
										@input="setDataCommerce"
									></app-input-text>
									<span class="form-group__message" v-if="!$v.commerce.name.required">
										El nombre es requerido
									</span>
								</v-flex>
								<v-flex xs12 mb-3>
									<div v-if="existCommerceAddress">
										<v-layout>
											<v-flex xs11 pr-1>
												<app-input-text
													label="Dirección de recojo"
													model="address"
													disabled
													:text="commerce.address"
													v-if="existCommerceAddress"
												></app-input-text>
											</v-flex>
											<v-flex xs1 pt-3 mt-1 text-xs-center>
												<button @click="openSlide(true)">
													<v-icon size="26" id="add-icon" color="primary"
														>edit_location</v-icon
													>
												</button>
											</v-flex>
										</v-layout>
									</div>
									<div v-else>
										<btn-add-item
											title="Añadir dirección de recojo"
											@click-add="openSlide(true)"
										/>
									</div>
								</v-flex>
								<v-flex xs12 mb-4 v-if="false">
									<app-input-text
										label="Slug del comercio"
										model="slug"
										:information="true"
										information-text="Sirve para la busqueda de su comercio en el catálogo"
										:text="commerce.slug"
										@input="setDataCommerce"
										:disabled="disabledSlugCommerce"
									></app-input-text>
								</v-flex>
								<v-flex xs12 md6 mb-4 pr-3>
									<v-layout>
										<v-flex xs4>
											<v-select
												v-model="countryPhone"
												item-text="value"
												item-value="name"
												:items="countries"
												label="Celular"
												class="filter-select shadow-inset mt-3"
											>
												<template slot="selection" slot-scope="data">
													<div class="pl-2">
														<img
															:src="data.item.image"
															:alt="data.item.name"
															height="20"
														/>
														<span class="text-map-cation">{{ data.item.value }}</span>
													</div>
												</template>
												<template slot="item" slot-scope="data">
													<div>
														<img
															:src="data.item.image"
															:alt="data.item.name"
															height="20"
														/>
														<span>{{ data.item.value }}</span>
													</div>
												</template>
											</v-select>
										</v-flex>
										<v-flex xs8 pl-2 class="pt-20">
											<app-input-text
												model="phone"
												:text="commerce.phone"
												@input="setDataCommerce"
											></app-input-text>
										</v-flex>
									</v-layout>
								</v-flex>
								<v-flex xs12 md6 mb-4>
									<v-layout>
										<v-flex xs4>
											<v-select
												v-model="country"
												item-text="value"
												item-value="name"
												:items="countries"
												label="Whatsapp"
												class="filter-select shadow-inset mt-3"
											>
												<template slot="selection" slot-scope="data">
													<div class="pl-2">
														<img
															:src="data.item.image"
															:alt="data.item.name"
															height="20"
														/>
														<span class="text-map-cation">{{ data.item.value }}</span>
													</div>
												</template>
												<template slot="item" slot-scope="data">
													<div>
														<img
															:src="data.item.image"
															:alt="data.item.name"
															height="20"
														/>
														<span>{{ data.item.value }}</span>
													</div>
												</template>
											</v-select>
										</v-flex>
										<v-flex xs8 pl-2 class="pt-20">
											<app-input-text
												model="whatsappNumber"
												:text="commerce.whatsappNumber"
												@input="setDataCommerce"
											></app-input-text>
										</v-flex>
									</v-layout>
								</v-flex>
								<v-flex xs12 mb-3 :class="[isEcuador ? 'md6' : 'md12']" pr-3>
									<app-input-text
										label="Correo"
										model="email"
										:text="commerce.email"
										@input="setDataCommerce"
									></app-input-text>
								</v-flex>
								<v-flex xs12 mb-3 pr-3 v-if="$userInfo.roleCode === 'SUPPORT'">
									<app-input-text
										label="Sitio Web"
										model="urlDomain"
										:text="commerce.urlDomain"
										@input="setDataCommerce"
									></app-input-text>
								</v-flex>
								<v-flex xs12 md6 v-if="isEcuador" mb-3>
									<v-layout>
										<v-flex xs12 pr-2>
											<app-input-text
												type="number"
												label="Código de Establecimiento"
												model="codeTaxes"
												:text="commerce.codeTaxes"
												:information="true"
												information-text="Corresponde al primer grupo del
													número de serie de una factura o comprobante autorizado,  este número identifica
													al establecimiento o negocio en particular"
												@input="setDataCommerce"
											></app-input-text>
											<span
												class="form-group__message"
												v-if="!$v.commerce.codeTaxes.required"
											>
												Ingresar 3 dígitos
											</span>
											<span
												class="form-group__message"
												v-if="!$v.commerce.codeTaxes.maxLength"
											>
												Maximo 3 dígitos
											</span>
											<span
												class="text-not-code-blank"
												v-if="checkBlankCode(commerce.codeTaxes)"
											>
												No se permite espacios en blanco
											</span>
										</v-flex>
									</v-layout>
								</v-flex>
								<v-flex xs12 mb-3 v-if="false">
									<v-layout>
										<v-flex xs12>
											<app-input-text
												label="Dominio (URL)"
												model="urlDomain"
												readonly
												:text="commerce.urlDomain"
												@input="setDataCommerce"
												:information="true"
												information-text="Corresponde al dominio del
													catálogo, si no cuenta con uno se puede
													comunicar con soporte"
											></app-input-text>
										</v-flex>
									</v-layout>
								</v-flex>
								<v-flex xs12 mb-3>
									<label ref="label-image" for="upload-url-image" class="w-100">
										<v-layout wrap xs12>
											<v-flex
												:class="[commerce.urlImage ? (isMovil ? 'xs9' : 'xs10') : 'xs12']"
											>
												<v-layout>
													<v-flex xs11>
														<vue-six-four
															id="upload-url-image"
															hidden
															@vue-six-four="getFile('urlImage', $event)"
														/>
														<app-input-text
															label="Imagen de logotipo"
															readonly
															:information="true"
															information-text="Se muestra en el logo de su ecommerce"
															:text="commerce.urlImage"
														/>
													</v-flex>
													<v-flex flex text-xs-left xs1>
														<button
															@click="showDialogFavicon('label-image')"
															class="btn-upload"
														>
															<v-icon color="white" size="14">image</v-icon>
														</button>
													</v-flex>
												</v-layout>
											</v-flex>
											<v-flex
												pt-4
												v-if="commerce.urlImage"
												:class="[commerce.urlImage ? (isMovil ? 'xs3' : 'xs2') : '']"
												text-xs-right
											>
												<a class="link-green" target="_blank" :href="commerce.urlImage"
													>Ver Imagen</a
												>
											</v-flex>
										</v-layout>
									</label>
								</v-flex>
								<v-flex xs12 mb-4>
									<v-layout mb-1>
										<v-flex
											:class="[commerce.favicon ? (isMovil ? 'xs9' : 'xs10') : 'xs12']"
										>
											<label ref="label-favicon" for="upload-image-favicon" class="w-100">
												<vue-six-four
													id="upload-image-favicon"
													hidden
													@vue-six-four="getFile('favicon', $event)"
												/>
												<v-layout wrap xs12>
													<v-flex xs11>
														<app-input-text
															label="Favicon"
															readonly
															:text="commerce.favicon"
															:information="true"
															information-text="Se muestra en el favicon de su ecommerce"
														/>
													</v-flex>
													<v-flex flex text-xs-left xs1>
														<button
															@click="showDialogFavicon('label-favicon')"
															class="btn-upload"
														>
															<v-icon color="white" size="14">image</v-icon>
														</button>
													</v-flex>
												</v-layout>
											</label>
										</v-flex>
										<v-flex
											pt-4
											v-if="commerce.favicon"
											:class="[commerce.favicon ? (isMovil ? 'xs3' : 'xs2') : '']"
											text-xs-right
										>
											<a class="link-green" target="_blank" :href="commerce.favicon"
												>Ver Imagen</a
											>
										</v-flex>
									</v-layout>
								</v-flex>
								<v-flex xs12 md6 mb-3 mt-1 v-if="commerce.limitCatalog && isMibodega">
									<v-layout>
										<v-flex xs12 pr-2>
											<app-input-text
												type="number"
												label="Cant. de productos por catálogo"
												model="limitCatalog"
												:text="commerce.limitCatalog"
												@input="setDataCommerce"
												:information="true"
												information-text="Si desea aumentar la cantidad de
													productos comunicarse con un asesor"
											></app-input-text>
										</v-flex>
									</v-layout>
								</v-flex>
								<v-flex xs12>
									<p class="title-form">Redes Sociales</p>
								</v-flex>
								<v-flex xs12 mb-3>
									<div v-if="socialNetworksSelect.length">
										<content-select
											text-tooltip="Agregar redes sociales"
											:items="socialNetworksSelect"
											value="code"
											@click-add="openModal('dialogSocialNetworks')"
											@delete-item="deleteSocialNetworks"
										/>
									</div>
									<div v-else>
										<btn-add-item
											title="Agregar Redes sociales"
											@click-add="openModal('dialogSocialNetworks')"
										/>
									</div>
								</v-flex>
								<v-flex
									xs12
									md12
									mb-2
									v-for="(item, index) in socialNetworksSelect"
									:key="item.code"
								>
									<v-layout wrap align-center>
										<label :ref="item.code" :for="item.code" class="w-100">
											<v-flex xs12 md12 mt-3>
												<app-input-text
													:label="`Link de ${item.code}`"
													model="linkSocialNetwork"
													:text="item.link"
													@input="setDataCommerce($event, index)"
												></app-input-text>
												<span class="ml-2 text-small error--text" v-if="!item.link">
													El link es obligatorio
												</span>
											</v-flex>
										</label>
									</v-layout>
								</v-flex>
								<v-flex xs12 mt-3>
									<v-layout row wrap>
										<v-flex xs4>
											<v-switch
												color="success"
												hide-details
												label="Facturación"
												v-model="commerce.flagBilling"
											></v-switch>
										</v-flex>
										<v-flex xs8 v-if="isEcuador">
											<v-layout>
												<v-flex xs7>
													<v-switch
														color="success"
														hide-details
														label="Validar datos de facturación"
														v-model="commerce.flagBillingValidate"
													></v-switch>
												</v-flex>
												<v-flex xs1>
													<v-tooltip top>
														<img
															src="/static/img/informacion.svg"
															alt="signo de interrogación"
															slot="activator"
															height="18"
														/>
														<span
															>Al activar la opción se validará si los datos son correctos
															al realizar una factura</span
														>
													</v-tooltip>
												</v-flex>
											</v-layout>
										</v-flex>
									</v-layout>
								</v-flex>
								<v-flex xs12 mb-3>
									<v-switch
										hide-details
										color="success"
										label="Activar Notificaciones"
										v-model="commerce.enablePushNotification"
									></v-switch>
								</v-flex>
								<v-flex xs12 mb-3>
									<v-switch
										hide-details
										color="success"
										label="No validar email al crear nuevos usuarios"
										v-model="commerce.flagNotValidEmailUser"
									></v-switch>
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex xs12 md6 mb-3 class="pl-5-rs">
							<v-layout wrap>
								<v-flex xs12 mb-3>
									<v-layout wrap row>
										<v-flex xs12>
											<p class="title-form">Facebook Live</p>
										</v-flex>
										<v-flex xs10>
											<app-input-text
												label="Link Facebook live"
												model="fblink"
												:text="facebookLive.link"
												@input="setDataCommerce"
											></app-input-text>
										</v-flex>
										<v-flex xs2 pl-3 pt-3 v-if="facebookLive.link">
											<v-switch
												hide-details
												color="success"
												v-model="facebookLive.status"
											></v-switch>
										</v-flex>
										<v-flex xs2 pl-3 pt-3 v-else>
											<v-tooltip top>
												<v-switch
													hide-details
													color="success"
													v-model="facebookLive.status"
													disabled
													slot="activator"
												></v-switch>
												<span>Debe colocar un enlace para hablilitar el switch</span>
											</v-tooltip>
										</v-flex>
									</v-layout>
								</v-flex>
								<v-flex xs12 mb-3>
									<v-layout wrap row>
										<v-flex xs12>
											<p class="title-form">Rubros</p>
										</v-flex>
										<v-flex xs6>
											<app-select
												:item="commerce.itemId"
												:items="itemsEcommerce"
												item-text="name"
												item-value="id"
												label="Rubros"
												model="itemId"
												:return-object="false"
												@input="setDataCommerce"
											></app-select>
										</v-flex>
									</v-layout>
								</v-flex>
								<v-flex xs12>
									<v-layout row wrap>
										<v-flex xs12>
											<p class="title-form">Horario de atención</p>
										</v-flex>
										<v-flex xs12 mb-3>
											<v-layout wrap>
												<v-flex xs4>
													<v-checkbox
														color="success"
														hide-details
														label="Fuera de atención"
														v-model="outOfAttention"
														@change="changeOutOfAttention"
													></v-checkbox>
												</v-flex>
												<v-flex xs1>
													<v-tooltip top>
														<img
															src="/static/img/question-green.svg"
															alt="signo de interrogación"
															slot="activator"
														/>
														<span>
															Se mostrará el comercio desactivado si está fuera del
															horario de atención.
														</span>
													</v-tooltip>
												</v-flex>
												<v-flex xs12 my-4 v-if="false">
													<v-text-field
														type="text"
														class="filter-select"
														label="Personaliza tu mensaje"
														v-model="messageOutOfAttention"
													></v-text-field>
												</v-flex>
											</v-layout>
										</v-flex>
										<v-flex xs12 v-show="toggleTime">
											<v-layout
												row
												wrap
												mb-3
												v-for="(hour, key) in listCommerces.settings.dailyAttentionHours"
												:key="key"
											>
												<v-flex xs3 md2>
													<span class="text-hour">{{ daysInLetters(key) }}</span>
												</v-flex>
												<v-flex xs3 md2>
													<vue-timepicker
														manual-input
														:value="hour.hourFrom"
														@input="
															setDailyAttentionHours(
																{ model: 'hourFrom', value: $event },
																key
															)
														"
													></vue-timepicker>
													<span
														class="text-small error--text"
														v-if="hour.hourFrom.split(':')[0] === 'HH'"
													>
														Elige una hora
													</span>
													<span
														class="text-small error--text"
														v-if="hour.hourFrom.split(':')[1] === 'mm'"
													>
														Elige los minutos
													</span>
												</v-flex>
												<v-flex xs1 text-xs-center> a </v-flex>
												<v-flex xs3 md2>
													<vue-timepicker
														manual-input
														:value="hour.hourTo"
														@input="
															setDailyAttentionHours(
																{ model: 'hourTo', value: $event },
																key
															)
														"
													></vue-timepicker>
													<span
														class="text-small error--text"
														v-if="hour.hourTo.split(':')[0] === 'HH'"
													>
														Elige una hora
													</span>
													<span
														class="text-small error--text"
														v-if="hour.hourTo.split(':')[1] === 'mm'"
													>
														Elige los minutos
													</span>
												</v-flex>
												<v-flex xs2 :class="[isMovil ? 'pl-2' : 'ml-5']">
													<v-tooltip top>
														<v-switch
															slot="activator"
															color="success"
															hide-details
															v-model="hour.closed"
														></v-switch>
														<span>{{ hour.closed ? 'Atiende' : 'No atiende' }}</span>
													</v-tooltip>
												</v-flex>
											</v-layout>
										</v-flex>
									</v-layout>
								</v-flex>
								<v-flex xs12>
									<v-layout row wrap>
										<v-flex xs12>
											<p class="title-form">Contacto</p>
										</v-flex>
										<v-flex xs4 pr-2>
											<app-input-text
												label="Nombres"
												model="name"
												:text="commerce.contactData.name"
												@input="setContactData"
											></app-input-text>
										</v-flex>
										<v-flex xs4 px-1>
											<app-input-text
												label="Apellidos"
												model="lastname"
												:text="commerce.contactData.lastname"
												@input="setContactData"
											></app-input-text>
										</v-flex>
										<v-flex xs4 pl-2>
											<v-layout row wrap>
												<v-flex xs4>
													<label class="label-contact">Cód.</label>
													<v-select
														hide-details
														item-text="value"
														item-value="name"
														:items="countries"
														class="filter-select shadow-inset ma-0"
														v-model="countryContact"
													>
														<template slot="selection" slot-scope="data">
															<div class="pl-2">
																<img
																	:src="data.item.image"
																	:alt="data.item.name"
																	height="20"
																/>
																<span class="text-map-cation">{{ data.item.value }}</span>
															</div>
														</template>
														<template slot="item" slot-scope="data">
															<div>
																<img
																	:src="data.item.image"
																	:alt="data.item.name"
																	height="20"
																/>
																<span>{{ data.item.value }}</span>
															</div>
														</template>
													</v-select>
												</v-flex>
												<v-flex xs8>
													<app-input-text
														label="Teléfono"
														model="phone"
														:text="commerce.contactData.phone"
														type="number"
														@input="setContactData"
													></app-input-text>
												</v-flex>
											</v-layout>
										</v-flex>
									</v-layout>
								</v-flex>
							</v-layout>
						</v-flex>
					</v-layout>
				</v-stepper-content>
				<v-stepper-content step="2">
					<v-layout wrap px-3 mt-2 mb-5 pb-5 pt-3>
						<v-flex xs12 md6 mb-3 class="pr-5-rs">
							<v-layout wrap>
								<v-flex xs12>
									<p class="title-form">Productos por categoría</p>
								</v-flex>
								<v-flex xs12 mb-3>
									<v-layout wrap>
										<v-flex xs3 sm2>
											<app-input-text
												type="number"
												label="Cantidad"
												model="limitHome"
												:text="commerce.limitHome"
												@input="setDataCommerce"
											></app-input-text>
										</v-flex>
										<v-flex xs1 sm1 pt-3 class="layout justify-center align-center">
											<v-tooltip top>
												<v-icon color="primary" slot="activator">help</v-icon>
												<span
													>Muestra la cantidad de productos por categoria en el home de su
													ecommerce.</span
												>
											</v-tooltip>
										</v-flex>
										<v-flex xs8 sm9 pt-3 pl-1 class="layout align-center">
											<span class="text-gray">Límite agrupados por categoría</span>
										</v-flex>
									</v-layout>
								</v-flex>
								<v-flex xs12 mb-3>
									<p class="title-form">Detalle de Producto</p>
								</v-flex>
								<v-flex xs12 mb-3>
									<v-layout wrap>
										<v-flex xs3 sm2>
											<app-input-text
												type="number"
												label="Cantidad"
												model="limitShownHome"
												:text="commerce.limitShownHome"
												@input="setDataCommerce"
											></app-input-text>
										</v-flex>
										<v-flex xs1 sm1 pt-3 class="layout justify-center align-center">
											<v-tooltip top>
												<v-icon color="primary" slot="activator">help</v-icon>
												<span
													>Corresponde al límite de visitas a un producto para que quede
													fijo en la búsqueda.</span
												>
											</v-tooltip>
										</v-flex>
										<v-flex xs8 sm9 pt-3 pl-1 class="layout align-center">
											<span class="text-gray"
												>Cantidad de visitas minimas al detalle de producto</span
											>
										</v-flex>
									</v-layout>
								</v-flex>
								<v-flex xs12 mb-3>
									<p class="title-form">Formas de mostrar productos</p>
								</v-flex>
								<v-flex xs12 mb-3>
									<v-layout>
										<v-flex xs6>
											<app-select
												:item="listCommerces.settings.flagGrouper"
												item-text="name"
												item-value="id"
												:items="options"
												label="Forma de mostrar nuestros productos"
												model="flagGrouper"
												:return-object="false"
												:information="true"
												information-text="Se mostrará solo los productos padres o todos en el ecommerce"
												@input="setFlagGrouper"
											></app-select>
										</v-flex>
									</v-layout>
								</v-flex>
								<v-flex xs12>
									<p class="title-form">Almacén por defecto</p>
								</v-flex>
								<v-flex xs12>
									<v-layout>
										<v-flex xs6>
											<app-select
												:item="listCommerces.settings.defaultWarehouse"
												:items="warehouses"
												item-text="name"
												item-value="id"
												label="Selecciona almacén por defecto"
												model="settingDefaultWarehouse"
												@input="setDataCommerce"
											></app-select>
										</v-flex>
										<v-flex
											xs6
											md4
											pl-3
											pt-3
											v-if="listCommerces.settings.defaultWarehouse"
										>
											<button class="layout align-center caption" @click="openDialog">
												<span class="pr-1">
													<v-icon color="primary" size="20">add_circle</v-icon>
												</span>
												<span class="link-green">Añadir dirección</span>
											</button>
										</v-flex>
									</v-layout>
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex xs12 md6 mb-3 class="pl-5-rs">
							<v-layout wrap>
								<!-- ocultar seleccion de tienda para el ecommerce -->
								<!-- solo es posible tener una tienda por temas de stock y kardex -->
								<v-flex xs12 v-if="false">
									<p class="title-form">Tienda</p>
								</v-flex>
								<v-flex mb-3 v-if="false">
									<div v-if="listCommerces.warehousesRelated">
										<div v-if="listCommerces.warehousesRelated.length">
											<content-select
												text-tooltip="Agregar almacénes"
												:items="listCommerces.warehousesRelated"
												:items-all="warehouses"
												value="id"
												flag-object
												@click-add="openModal('dialogWarehouses')"
												@delete-item="deleteWarehouses"
											/>
										</div>
										<div v-else>
											<btn-add-item
												title="Agregar almacénes"
												@click-add="openModal('dialogWarehouses')"
											/>
										</div>
									</div>
								</v-flex>
								<v-flex xs12>
									<p class="title-form">
										¿Como quieres ordenar tus productos en tu ecommerce?
									</p>
								</v-flex>
								<v-flex xs12 mb-3>
									<v-layout>
										<v-flex xs4 pr-2>
											<app-select
												:item="productOrderConfig.typeOrder"
												:items="valuesTypeOrder"
												item-text="value"
												item-value="code"
												label="Tipo de ordenamiento"
												model="typeOrder"
												@input="setDataCommerce"
												:return-object="false"
											></app-select>
										</v-flex>
										<v-flex xs4 pr-2 v-if="productOrderConfig.typeOrder !== 3">
											<app-select
												:item="productOrderConfig.fieldToQuery"
												:items="valuesFieldToQuery"
												item-text="value"
												item-value="code"
												label="Campo"
												model="fieldToQuery"
												@input="setDataCommerce"
												:return-object="false"
												:disabled="!productOrderConfig.typeOrder"
											></app-select>
										</v-flex>
										<v-flex v-if="productOrderConfig.typeOrder !== 3" xs4 pr-2>
											<app-select
												:item="productOrderConfig.desc"
												:items="valuesDesc"
												item-text="value"
												item-value="code"
												label="Orden"
												model="desc"
												@input="setDataCommerce"
												:return-object="false"
												:disabled="!productOrderConfig.typeOrder"
											></app-select>
										</v-flex>
										<v-flex v-if="productOrderConfig.typeOrder === 3" xs6 pr-2>
											<p class="numeric-order-style">
												El orden numerico es de mayor a menor
											</p>
										</v-flex>
									</v-layout>
								</v-flex>
								<v-flex xs12>
									<p class="title-form">Configuración</p>
								</v-flex>
								<v-flex xs6 md4>
									<v-switch
										color="success"
										hide-details
										label="Facturación"
										v-model="commerce.flagBilling"
									></v-switch>
								</v-flex>
							</v-layout>
						</v-flex>
					</v-layout>
				</v-stepper-content>
				<v-stepper-content step="3">
					<v-layout wrap px-3 mt-2 mb-5 pb-5 pt-3 class="min-h-191">
						<v-flex xs6 xs12 md6 mb-3 class="pr-5-rs">
							<v-layout row wrap>
								<v-flex xs12>
									<p class="title-form">Proceso de pago</p>
								</v-flex>
								<v-flex xs12 mb-4>
									<v-layout>
										<v-flex xs9>
											<v-switch
												color="success"
												hide-details
												label="Proceso de pago fuera del ecommerce"
												v-model="commerce.flagShoppyRunn"
											></v-switch>
										</v-flex>
										<v-flex xs2>
											<v-tooltip top>
												<img
													src="/static/img/informacion.svg"
													alt="signo de interrogación"
													slot="activator"
													height="18"
												/>
												<span
													>Al activar la opción, para realizar el proceso de pago se
													redirigirá a una ruta externa desde el ecommerce</span
												>
											</v-tooltip>
										</v-flex>
									</v-layout>
								</v-flex>
							</v-layout>
							<v-layout wrap>
								<v-flex xs12>
									<p class="title-form">Método de pago</p>
								</v-flex>
								<v-flex xs12 mb-4>
									<div v-if="listCommerces.wayPaymentRelated.length">
										<content-select
											text-tooltip="Agregar métodos de pago"
											:items="listCommerces.wayPaymentRelated"
											:items-all="listPayments"
											flag-object
											emit-event
											value="id"
											@change-items="changeWaypaymentRelated"
											@delete-item="deleteWaypaymentRelated"
											@click-add="openModal('dialogWayPayment')"
										/>
									</div>
									<div v-else>
										<btn-add-item
											title="Seleccionar métodos de pago"
											@click-add="openModal('dialogWayPayment')"
										/>
									</div>
								</v-flex>
								<v-flex xs12>
									<v-layout
										row
										wrap
										mb-4
										v-for="payment in listCommerces.wayPayment"
										:key="payment.id"
									>
										<template v-if="payment.gatewayConfiguration.length">
											<v-flex xs12 mb-2>
												<h3 class="payment-subtitle">{{ payment.name }}</h3>
											</v-flex>
										</template>
										<template v-if="listCommerces.gateway">
											<template v-if="listCommerces.gateway[payment.id]">
												<template
													v-if="
														listCommerces.gateway[payment.id].gatewayConfiguration.length
													"
												>
													<content-select
														text-tooltip="Agregar tipos de pago"
														:items="
															listCommerces.gateway[payment.id].gatewayConfiguration
														"
														:items-all="payment.gatewayConfiguration"
														:disabled="payment.code === onlinePayments"
														:flag-delete="flagDelete"
														value="code"
														@click-add="openModalGateway(payment)"
														@delete-item="deleteGatewayConfiguration($event, payment)"
													/>
												</template>
												<template v-else>
													<btn-add-item
														title="Seleccionar tipos de pago"
														@click-add="openModalGateway(payment)"
													/>
												</template>
											</template>
										</template>
										<v-flex xs12 v-if="payment.code === internetBanking" pl-5 mt-3>
											<v-layout wrap>
												<v-flex xs12 mb-4 v-if="showBilleters('yape')">
													<p class="title-billers">YAPE</p>
													<v-layout>
														<v-flex xs4 pr-2>
															<app-input-text
																type="number"
																label="Celular"
																model="phoneYape"
																:text="billeters.yape.phone"
																@input="setDataBilleters"
															></app-input-text>
														</v-flex>
														<v-flex xs6 pl-2 pt-3>
															<label ref="label-qr-yape" for="upload-image-qr-yape">
																<vue-six-four
																	id="upload-image-qr-yape"
																	hidden
																	@vue-six-four="getFile('imageQR', $event, null, 'yape')"
																/>
																<btn-add-item
																	:title="
																		billeters.yape.imageQR
																			? 'Cambiar imagen QR'
																			: 'Agregar imagen QR'
																	"
																	:active="!!billeters.yape.imageQR"
																	@click-add="showOpenImage('label-qr-yape')"
																/>
															</label>
														</v-flex>
														<v-flex xs2 v-if="billeters.yape.imageQR" pt-3>
															<a
																class="link-green"
																target="_blank"
																:href="billeters.yape.imageQR"
																>Ver Imagen</a
															>
														</v-flex>
													</v-layout>
												</v-flex>
												<v-flex xs12 mb-4 v-if="showBilleters('lukita')">
													<p class="title-billers">LUKITA</p>
													<v-layout>
														<v-flex xs4 pr-2>
															<app-input-text
																type="number"
																label="Celular"
																model="phoneLukita"
																:text="billeters.lukita.phone"
																@input="setDataBilleters"
															></app-input-text>
														</v-flex>
														<v-flex xs6 pl-2 pt-3>
															<label ref="label-qr-lukita" for="upload-image-qr-lukita">
																<vue-six-four
																	id="upload-image-qr-lukita"
																	hidden
																	@vue-six-four="
																		getFile('imageQR', $event, null, 'lukita')
																	"
																/>
																<btn-add-item
																	:title="
																		billeters.lukita.imageQR
																			? 'Cambiar imagen QR'
																			: 'Agregar imagen QR'
																	"
																	:active="!!billeters.lukita.imageQR"
																	@click-add="showOpenImage('label-qr-lukita')"
																/>
															</label>
														</v-flex>
														<v-flex xs2 v-if="billeters.lukita.imageQR" pt-3>
															<a
																class="link-green"
																target="_blank"
																:href="billeters.lukita.imageQR"
																>Ver Imagen</a
															>
														</v-flex>
													</v-layout>
												</v-flex>
												<v-flex xs12 v-if="showBilleters('plin')">
													<p class="title-billers">PLIN</p>
													<v-layout>
														<v-flex xs4 pr-2>
															<app-input-text
																type="number"
																label="Celular"
																model="phonePlin"
																:text="billeters.plin.phone"
																@input="setDataBilleters"
															></app-input-text>
														</v-flex>
														<v-flex xs6 pl-2 pt-3>
															<label ref="label-qr-plin" for="upload-image-qr-plin">
																<vue-six-four
																	id="upload-image-qr-plin"
																	hidden
																	@vue-six-four="getFile('imageQR', $event, null, 'plin')"
																/>
																<btn-add-item
																	:title="
																		billeters.plin.imageQR
																			? 'Cambiar imagen QR'
																			: 'Agregar imagen QR'
																	"
																	:active="!!billeters.plin.imageQR"
																	@click-add="showOpenImage('label-qr-plin')"
																/>
															</label>
														</v-flex>
														<v-flex xs2 v-if="billeters.plin.imageQR" pt-3>
															<a
																class="link-green"
																target="_blank"
																:href="billeters.plin.imageQR"
																>Ver Imagen</a
															>
														</v-flex>
													</v-layout>
												</v-flex>
											</v-layout>
										</v-flex>
									</v-layout>
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex xs12 md6 mb-3 class="pl-5-rs">
							<v-layout wrap>
								<v-flex xs12>
									<p class="title-form">
										<v-layout>
											<v-flex xs11>
												<span>Cuentas bancarias</span>
											</v-flex>
											<v-flex xs1>
												<app-tooltip-button
													color="primary"
													icon="add_circle"
													height="30"
													text="Crear Cuenta Bancaria"
													@click-icon="openNewBank"
												></app-tooltip-button>
											</v-flex>
										</v-layout>
									</p>
								</v-flex>
								<v-flex xs12 mb-4 v-if="rowsAssigned.length">
									<content-select
										text-tooltip="Agregar cuentas bancarias"
										:items="rowsAssigned"
										:items-all="rows"
										value="id"
										text="fullBankAccount"
										@click-add="openModal('dialogBankAccount')"
										@delete-item="deleteBankAccount"
									/>
								</v-flex>
								<v-flex xs12 mb-4 v-else>
									<btn-add-item
										title="Seleccionar cuenta bancaria"
										@click-add="openModal('dialogBankAccount')"
									/>
								</v-flex>
							</v-layout>
						</v-flex>
					</v-layout>
				</v-stepper-content>
				<v-stepper-content step="4">
					<v-layout px-3 mt-2 mb-5 pb-5 pt-3 class="column-group min-h-191">
						<v-flex xs12 md7 class="pr-5-rs">
							<v-layout row wrap mb-3 align-center>
								<v-flex xs12>
									<p class="title-form">Tipos de entrega</p>
								</v-flex>
								<v-flex xs12 mb-4>
									<app-select
										chips
										multiple
										return-object
										item-text="name"
										item-value="id"
										:items="deliveryTypes"
										label="Tipos de entrega"
										:item="listCommerces.deliveryType"
										@input="setDataCommerce"
										model="deliveryType"
									/>
								</v-flex>
								<v-flex xs12 md6 mb-4 pr-3>
									<app-input-text
										type="number"
										label="Costo de envio"
										model="shippingCost"
										:text="commerce.shippingCost"
										@input="setDataCommerce"
									></app-input-text>
								</v-flex>
								<v-flex xs12 md6 mb-4>
									<app-input-text
										type="number"
										label="Costo de servicio"
										model="serviceCost"
										:text="commerce.serviceCost"
										@input="setDataCommerce"
									></app-input-text>
								</v-flex>
								<v-flex xs12 md6 pr-2 mb-4>
									<app-input-text
										type="number"
										label="Precio mínimo de pedido"
										model="minOrderPrice"
										:text="minOrderPrice"
										@input="setDataCommerce"
									></app-input-text>
								</v-flex>
								<v-flex xs12 md6 pr-2 mb-4>
									<v-layout row wrap align-center>
										<v-flex xs10 md8>
											<app-input-text
												type="number"
												label="Tiempo de Entrega"
												model="daysToSend"
												:text="daysToSend"
												@input="setDataCommerce"
											></app-input-text>
										</v-flex>
										<v-flex xs2 md4 pl-3 pt-3 class="text-hour"> días </v-flex>
									</v-layout>
								</v-flex>
								<v-layout row wrap>
									<v-flex xs5>
										<span class="text-hour">Rango de Horas de Entrega</span>
									</v-flex>
									<v-flex xs3>
										<vue-timepicker
											manual-input
											:value="dateRangeFrom"
											@input="setDailyAttentionHoursRange($event)"
										></vue-timepicker>
									</v-flex>
									<v-flex xs1 text-xs-center>
										<span class="text-hour">a</span>
									</v-flex>
									<v-flex xs3>
										<vue-timepicker
											manual-input
											:value="dateRangeTo"
											@input="setDailyAttentionHoursRangeFrom($event)"
										></vue-timepicker>
									</v-flex>
								</v-layout>
							</v-layout>
							<v-layout row wrap mt-2>
								<v-flex xs12>
									<v-switch
										color="success"
										hide-details
										label="Determinar si el comercio tendra la opción 'Ubicar en el Mapa'"
										v-model="commerce.flagShowMap"
									></v-switch>
									<!-- <span class="text-hour">Determinar si el comercio va tener que ubicar en el mapa </span> -->
								</v-flex>
							</v-layout>
						</v-flex>
					</v-layout>
				</v-stepper-content>
				<v-stepper-content step="5">
					<v-layout wrap px-3 mt-2 mb-5 pb-5 pt-3 class="column-group min-h-191">
						<v-flex xs12 md6 class="pr-5-rs">
							<v-layout wrap>
								<v-flex xs12>
									<v-layout class="title-form">
										<v-flex xs4>
											<p class="mb-0">Lista de precios</p>
										</v-flex>
										<v-flex xs8 class="show-desktop">
											<v-layout row wrap align-center pl-4>
												<v-flex xs6 pl-2>
													<label ref="label" for="upload-file-prices">
														<vue-six-four
															id="upload-file-prices"
															hidden
															@vue-six-four="importPrices"
														/>
														<v-btn
															class="btn-action btn-auto btn-full py-2"
															color="success"
															outline
															@click="onClick('import')"
														>
															<img
																src="/static/img/excel.svg"
																height="19"
																class="ml-0 mr-2"
															/>
															<span class="primary--text">Importar precios</span>
														</v-btn>
													</label>
												</v-flex>
												<v-flex xs6 pl-2>
													<v-btn
														class="btn-action btn-auto btn-full py-2"
														color="success"
														outline
														@click="onClick('export')"
													>
														<img
															src="/static/img/excel.svg"
															height="19"
															class="ml-0 mr-2"
														/>
														<span class="primary--text">Exportar precios</span>
													</v-btn>
												</v-flex>
											</v-layout>
										</v-flex>
									</v-layout>
								</v-flex>
								<v-flex xs12 class="show-mobile" mb-4>
									<v-layout row wrap align-center>
										<v-flex xs6>
											<label ref="label" for="upload-file-prices">
												<vue-six-four
													id="upload-file-prices"
													hidden
													@vue-six-four="importPrices"
												/>
												<v-btn
													class="btn-action btn-auto btn-full py-2"
													color="success"
													outline
													@click="onClick('import')"
												>
													<img
														src="/static/img/excel.svg"
														height="19"
														class="ml-0 mr-2"
													/>
													<span class="primary--text">Importar precios</span>
												</v-btn>
											</label>
										</v-flex>
										<v-flex xs6 pl-2>
											<v-btn
												class="btn-action btn-auto btn-full py-2"
												color="success"
												outline
												@click="onClick('export')"
											>
												<img src="/static/img/excel.svg" height="19" class="ml-0 mr-2" />
												<span class="primary--text">Exportar precios</span>
											</v-btn>
										</v-flex>
									</v-layout>
								</v-flex>
								<v-flex xs12 md6>
									<app-select
										:item="commerce.salPriceListId"
										:items="listPrices"
										item-text="name"
										item-value="id"
										label="Lista de precio"
										model="salPriceListId"
										:return-object="false"
										@input="setDataCommerce"
									></app-select>
								</v-flex>
							</v-layout>
						</v-flex>
					</v-layout>
				</v-stepper-content>
			</v-stepper-items>
		</v-stepper>
		<section class="buttons-configuration" v-if="hideButtons">
			<v-layout wrap align-center justify-center class="wrapper-btns">
				<v-flex xs4 md2 text-xs-center>
					<v-btn
						type="button"
						small
						color="pink"
						class="btn-action ml-1"
						@click="cancelProduct"
					>
						Cancelar
					</v-btn>
				</v-flex>
				<v-flex xs4 md2 text-xs-center>
					<v-btn
						type="button"
						small
						color="primary"
						class="btn-action"
						@click="saveCommerce"
						:disabled="disabledSave || checkBlankCode(commerce.codeTaxes)"
					>
						Guardar
					</v-btn>
				</v-flex>
			</v-layout>
		</section>
		<action-sidebar
			v-model="action.open"
			:active="action.active"
			:title="action.title"
			:width="action.width"
			@close-modal="closeModal"
		>
			<address-slide
				v-if="action.code === 'address-slide'"
				:commerce="commerce"
				@get-data="setAddressData"
				@accept-action="openDialog"
				@cancel-action="openSlide(false)"
			></address-slide>
			<configuration-yape
				v-if="action.code === 'configuration-yape'"
				:billeters="billeters"
				@cancel-action="openSlide(false)"
				@change-config-billeters="changeConfigBilleters"
			/>
			<configuration-plin
				v-if="action.code === 'configuration-plin'"
				:billeters="billeters"
				@cancel-action="openSlide(false)"
				@change-config-billeters="changeConfigBilleters"
			/>
			<new-account-bank-slider
				v-if="action.code === 'new-account-bank-slider'"
				:subsidiary="listCommerces.subsidiary.id"
				@close-modal="openSlide(false)"
				@update-banks="updateBanks"
			/>
		</action-sidebar>
		<v-dialog v-model="dialog" max-width="425">
			<v-card>
				<template v-if="action.code === 'address-slide'">
					<v-card-title class="headline justify-center">
						Guardar Información del Comercio
					</v-card-title>
					<v-card-text class="subtext">
						Si realizaste modificaciones en la pantalla principal, al hacer clic en el
						botón con texto "Guardar", se grabará junto a la dirección agregada.
					</v-card-text>
					<v-card-actions class="btn-block">
						<v-layout row wrap>
							<v-flex xs6 pr-2 text-xs-right>
								<v-btn
									color="pink"
									class="btn-action white--text"
									@click.native="closeDialog"
								>
									Cancelar
								</v-btn>
							</v-flex>
							<v-flex xs6 pl-2 text-xs-left>
								<v-btn
									color="success"
									class="btn-action white--text"
									@click.native="saveCommerce"
								>
									Guardar
								</v-btn>
							</v-flex>
						</v-layout>
					</v-card-actions>
				</template>
				<template v-else>
					<v-card-title class="headline"> ¿Qué acción desea realizar? </v-card-title>
					<v-card-actions class="btn-block">
						<v-layout row wrap>
							<v-flex xs4 pr-1 text-xs-left>
								<v-btn
									color="success"
									class="btn-action white--text"
									@click.native="saveAndGetOut"
								>
									Guardar y Salir
								</v-btn>
							</v-flex>
							<v-flex xs4 pl-1 text-xs-center>
								<v-btn
									color="info"
									class="btn-action white--text"
									@click.native="goToEditWarehouse"
								>
									Salir sin guardar
								</v-btn>
							</v-flex>
							<v-flex xs4 pr-1 text-xs-right>
								<v-btn
									color="pink"
									class="btn-action white--text"
									@click.native="closeDialog"
								>
									Cancelar
								</v-btn>
							</v-flex>
						</v-layout>
					</v-card-actions>
				</template>
			</v-card>
		</v-dialog>
		<v-dialog v-model="modal.open" persistent max-width="425">
			<v-card>
				<v-card-title class="headline justify-center">
					{{ modal.title }}
				</v-card-title>
				<v-card-text class="subtext">
					{{ modal.message }}
				</v-card-text>
				<v-card-actions class="btn-block">
					<v-layout row wrap justify-center>
						<v-flex xs4 pr-2 text-xs-right>
							<v-btn
								color="error"
								class="btn-action white--text"
								@click.native="actionCancel"
							>
								Cancelar
							</v-btn>
						</v-flex>
						<v-flex xs4 px-2 text-xs-center>
							<v-btn
								color="primary"
								class="btn-action white--text"
								@click.native="actionSuccess('save')"
							>
								Guardar e ir
							</v-btn>
						</v-flex>
						<v-flex xs4 pl-2 text-xs-left>
							<v-btn
								color="primary"
								class="btn-action white--text"
								@click.native="actionSuccess('go')"
							>
								Ir sin guardar
							</v-btn>
						</v-flex>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-dialog v-model="dialogSocialNetworks" persistent max-width="403">
			<modal-items
				v-if="dialogSocialNetworks"
				title="Redes Sociales"
				:items="socialNetworksList"
				:select-items="socialNetworksSelect"
				@close-modal="closeModalItems('dialogSocialNetworks')"
				@action-modal="addSocialNetworks"
			/>
		</v-dialog>
		<v-dialog v-model="dialogWarehouses" persistent max-width="403">
			<modal-items
				v-if="dialogWarehouses"
				title="Almacénes"
				:items="warehouses"
				:select-items="listCommerces.warehousesRelated"
				:return-object="false"
				label-value="id"
				@close-modal="closeModalItems('dialogWarehouses')"
				@action-modal="addWarehouse"
			/>
		</v-dialog>
		<v-dialog v-model="dialogWayPayment" persistent max-width="403">
			<modal-items
				v-if="dialogWayPayment"
				title="Medios de Pago"
				:items="listPayments"
				:select-items="listCommerces.wayPaymentRelated"
				:return-object="false"
				label-value="id"
				@close-modal="closeModalItems('dialogWayPayment')"
				@action-modal="addWaypaymentRelated"
			/>
		</v-dialog>
		<v-dialog v-model="dialogGatewayConfiguration" persistent max-width="403">
			<modal-items
				v-if="dialogGatewayConfiguration"
				title="Medios de Pago"
				:items="listGateway"
				:select-items="listGatewaySelects"
				label-value="code"
				@close-modal="closeModalItems('dialogGatewayConfiguration')"
				@action-modal="addGatewayConfiguration"
			/>
		</v-dialog>
		<v-dialog v-model="dialogBankAccount" persistent max-width="403">
			<modal-items
				v-if="dialogBankAccount"
				title="Cuentas Bancarias"
				:items="rows"
				:select-items="rowsAssigned"
				label-value="id"
				@close-modal="closeModalItems('dialogBankAccount')"
				@action-modal="addBankAccount"
			/>
		</v-dialog>
	</div>
</template>

<script>
import { maxLength, required, requiredIf } from 'vuelidate/lib/validators';
import 'vue2-timepicker/dist/VueTimepicker.css';
import VueTimepicker from 'vue2-timepicker/src';
import actionSidebar from '@/components/shared/action-sidebar';
import addressSlide from '@/components/ecommerce/address-slide';
import appTable from '@/components/shared/table/app-table';
import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
import bankAccountTab from '@/components/ecommerce/bank-accounts';
import bankTransactionsSetting from '@/pages/ecommerce/bank-transactions-setting';
import creditCardSettings from '@/pages/ecommerce/credit-card-settings';
import formCenterHelp from '@/components/ecommerce/form-center-help';
import formMultiple from '@/components/ecommerce/form-multiple';
import headerPage from '@/components/shared/header-page';
import helper from '@/shared/helper';
import tableUploadImage from '@/components/ecommerce/table-upload-image';
import typeSocialNetworks from '@/shared/type-social-networks';
import upLoadImageMixin from '@/mixins/upLoadImage';
import VueSixFour from 'vue-six-four';
import wayPaymentsCode from '@/shared/wayPaymentsCodes';
import configurationYape from '@/components/ecommerce/configuration-yape';
import configurationPlin from '@/components/ecommerce/configuration-plin';
import btnAddItem from '@/components/shared/btn-add-item';
import modalItems from '@/components/shared/modal-items';
import contentSelect from '@/components/shared/content-select';
import newAccountBankSlider from '@/components/bank-account/new-account-bank-slider';

const { generateBlob, showDownloadDialog } = helper;

async function created() {
	this.loadingServices = true;
	this.onlinePayments = wayPaymentsCode.CDC;
	this.internetBanking = wayPaymentsCode.IBD;
	this.socialNetworksList = Object.keys(typeSocialNetworks).map((t) => {
		const newSocial = {};
		newSocial.code = typeSocialNetworks[t];
		newSocial.name = t;
		newSocial.logo = this.logosSocialNetworks[t];
		newSocial.link = '';
		return newSocial;
	});
	this.getListCenter();
	this.loadBankAccounts();
	this.filterData();
	this.loadSections();
	await this.detailCommerce();
	// this.disabledSlugCommerce = !!this.id;
}

function actionCancel() {
	this.deletePaymentItem();
	this.modal.open = false;
	this.modal.message = '';
	this.modal.title = '';
}

function actionSuccess(code) {
	if (code === 'go') {
		this.goTo('payment-gateway');
	} else if (code === 'save') {
		this.saveCommerce('go');
	}
}

function addressBtnText() {
	return this.existCommerceAddress
		? 'Cambiar dirección de comercio'
		: 'Añadir dirección de comercio';
}

function addHelpSection(section) {
	if (section.id) {
		this.updateRowsHelp(section);
	} else {
		this.addRowsHelp(section);
	}
}

function addRowsHelp(section) {
	this.rowsHelp = [].concat(section, this.rowsHelp);
}

function addSectionNameRowsHelp() {
	this.rowsHelp = this.rowsHelp.map((r) => {
		const section = this.sections.find((s) => s.id === r.typeHelperCenter);
		const newR = { ...r };
		newR.sectionName = section ? section.name : '';
		return newR;
	});
}

function assignBankSelected() {
	this.rowsAssigned = this.rowsAssigned.concat(this.dataSelected);
	this.rows = this.rows.map((r) => {
		const newRow = { ...r };
		if (r.isSelected) {
			newRow.disabled = Number(r.isSelected);
		}
		newRow.isSelected = false;
		return newRow;
	});
}

function buildHelperCenter(rows) {
	return rows.map((h) => {
		const {
			id,
			name,
			subTitle,
			type,
			urlImage,
			description,
			orderNumber,
			typeHelperCenter,
		} = h;
		const s = {
			name,
			subTitle,
			type,
			urlImage,
			description,
			orderNumber,
			typeHelperCenter,
		};
		if (id) {
			s.id = id;
		}
		return s;
	});
}

function buildWayPayment() {
	const gateKeys = Object.keys(this.listCommerces.gateway);
	return gateKeys.reduce((a, k) => {
		const wayPaymentK = this.listCommerces.wayPaymentRelated.findIndex(
			(wp) => Number(wp) === Number(k)
		);
		if (wayPaymentK > -1) {
			const newItem = {
				wayPaymentId: Number(k),
				gatewayConfiguration: this.listCommerces.gateway[k].gatewayConfiguration.map(
					(gwc) => this.setGateway(gwc)
				),
			};
			a.push(newItem);
		}
		return a;
	}, []);
}

async function cancelForm() {
	this.show = false;
	this.openForm = true;
	this.hideButtons = true;
	await this.getListCenter();
	this.addSectionNameRowsHelp();
}

function cancelModal() {
	this.dialogCancel = false;
	this.featureName = '';
}

function cancelProduct() {
	this.goTo('commerce');
}

function closeDialog() {
	this.dialog = false;
}

function closeModal() {
	this.action = {
		active: false,
		code: null,
		open: false,
		title: 'titulo desde data',
		width: 500,
	};
}

function confirmDelete({ id, name }) {
	this.dialogMessage = ` ¿Desea eliminar '${name}' de la lista de centro de ayuda? `;
	this.itemId = id;
	this.featureName = name;
	this.dialogCancel = true;
}

function createCenter() {
	this.show = false;
	this.hideButtons = true;
	this.getListCenter();
}

function deleteHelpCenter(deleteId) {
	this.itemId = null;
	this.rowsHelp = this.rowsHelp.reduce((acc, item) => {
		if (item.id === deleteId) {
			return acc;
		}
		return acc.concat(item);
	}, []);
	this.cancelModal();
}

function deletePaymentItem() {
	const indexPayment = this.listCommerces.wayPaymentRelated.findIndex(
		(wpr) => wpr === this.listPaymentItem.id
	);
	this.listCommerces.wayPaymentRelated.splice(indexPayment, 1);
	this.listPaymentItem = {};
}

function deleteRow(id) {
	const index = this.rowsAssigned.findIndex((o) => o.id === id);
	const indexRow = this.rows.findIndex((r) => r.id === id);
	if (index > -1) {
		this.rowsAssigned.splice(index, 1);
	}
	if (indexRow > -1) {
		this.rows[indexRow].disabled = 0;
	}
}

function detailCenter(value) {
	if (value.name) {
		this.helpCenter.description = this.detailCenter.description;
		this.helpCenter.name = this.detailCenter.name;
		this.helpCenter.order = this.detailCenter.orderNumber;
		this.helpCenter.subtitle = this.detailCenter.subtitle;
		this.helpCenter.imageForm = this.detailCenter.urlImage;
		this.getCommerceInformation();
	}
}

async function detailCommerce() {
	({ data: this.listCommerces } = await this.$httpSales.get(
		`com-ecommerce-companies/${this.id}`
	));
	this.setSocialNetworks(this.listCommerces);
	this.setConfiguratedWayPayments(this.listCommerces);
	this.setSubsidiariesList(this.listCommerces);
	// this.setRows(this.listCommerces);
	this.setRowsAssigned(this.listCommerces);
	if (this.listCommerces.slug === null) {
		this.disabledSlugCommerce = false;
	} else {
		this.disabledSlugCommerce = true;
	}
	this.listCommerces.deliveryType = this.listCommerces.deliveryType || [];
	this.listCommerces.settings.flagGrouper = this.listCommerces.settings.flagGrouper || 2;
	this.listCommerces.settings.flagShoppyRunn =
		this.listCommerces.settings.flagShoppyRunn || false;
	this.listCommerces.settings.flagShowMap =
		this.listCommerces.settings.flagShowMap || false;
	if (this.listCommerces.settings.dailyAttentionHours) {
		this.listCommerces.settings.dailyAttentionHours = Object.keys(
			this.listCommerces.settings.dailyAttentionHours
		).reduce((acum, h) => {
			const newAcum = { ...acum };
			const newData = { ...this.listCommerces.settings.dailyAttentionHours[h] };
			newData.closed = !this.listCommerces.settings.dailyAttentionHours[h].closed;
			newAcum[h] = { ...newData };
			return newAcum;
		}, {});
	} else if (this.listCommerces.settings.attentionHours) {
		this.listCommerces.settings.dailyAttentionHours = Object.keys(
			this.dailyAttentionHours
		).reduce((acum, h) => {
			const newAcum = { ...acum };
			newAcum[h] = {
				hourFrom: this.listCommerces.settings.attentionHours.hourFrom,
				hourTo: this.listCommerces.settings.attentionHours.hourTo,
				closed: false,
			};
			return newAcum;
		}, {});
	} else {
		this.listCommerces.settings.dailyAttentionHours = this.dailyAttentionHours;
	}
	this.listCommerces.settings.attentionHours = this.listCommerces.settings
		.attentionHours || { hourFrom: '', hourTo: '' };
	this.minOrderPrice = this.listCommerces.settings.minOrderPrice || null;
	this.outOfAttention = this.listCommerces.settings.outOfAttention || false;
	this.messageOutOfAttention = this.listCommerces.settings.messageOutOfAttention || '';
	if (this.listCommerces.settings.billeters) {
		if (this.listCommerces.settings.billeters.yape) {
			this.billeters.yape = { ...this.listCommerces.settings.billeters.yape };
		}
		if (this.listCommerces.settings.billeters.lukita) {
			this.billeters.lukita = {
				...this.listCommerces.settings.billeters.lukita,
			};
		}
		if (this.listCommerces.settings.billeters.plin) {
			this.billeters.plin = { ...this.listCommerces.settings.billeters.plin };
		}
	}
	const index = this.listCommerces.wayPaymentCommerce.findIndex(
		(w) => w.wayPayment.code === wayPaymentsCode.IBD
	);
	if (index > -1) {
		const selectWaypament = this.listCommerces.wayPaymentCommerce[index];
		this.oldVal = selectWaypament.gatewayConfiguration.map((g) => g.name);
	}
	this.daysToSend = this.listCommerces.settings.daysToSend || null;
	this.setTemplateAndTheme();
	this.loadData();
}

async function detailWayPaymet() {
	const params = {
		flagCompany: true,
		commerceId: this.id,
	};
	try {
		({ data: this.wayPaymentByCommerce } = await this.$httpSales.get('way-payment', {
			params,
		}));
		this.listCommerces.wayPayment = this.setWayPayment();
		this.listCommerces.gateway = this.setGatewayItem(this.listCommerces.wayPayment);
	} catch (error) {
		if (error.status === 500) {
			this.showGenericError();
		}
	} finally {
		this.loadingServices = false;
	}
}

function existCommerceAddress() {
	return !!this.listCommerces.address;
}

async function exportPrices() {
	const responseType = 'blob';
	const body = {
		commerceId: Number(this.id),
		salPriceListId: this.commerce.salPriceListId,
	};
	this.loading = true;
	try {
		const { data: response } = await this.$httpProducts.post('products/exports', body, {
			responseType,
		});
		const blob = generateBlob(
			response,
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		);
		const name = this.listPrices.find(
			(lp) => lp.id === this.commerce.salPriceListId
		).name;
		showDownloadDialog(blob, `precios-list-${name}`, 'xlsx');
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	} finally {
		this.loading = false;
	}
}

async function filterData() {
	const request = [this.listPricingPromise()];
	try {
		[{ data: this.listPrices }] = await Promise.all(request);
		this.listPrices = this.listPrices.map((price) => {
			const newPrice = Object.assign({}, price);
			newPrice.type = 'salPriceId';
			return newPrice;
		});
	} catch (error) {
		this.showGenericError();
	}
}

function flagBilling() {
	return this.commerce.flagBilling ? 'sí' : 'no';
}

async function getFile(name, fileInfo, index, bill) {
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
			if (index) {
				this.socialNetworksSelect[index].logo = file.Location;
			} else if (bill) {
				this.billeters[bill][name] = file.Location;
			} else {
				this.commerce[name] = file.Location;
			}
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

async function getListCenter() {
	const params = {
		commerceId: this.$route.params.id,
	};
	({ data: this.rowsHelp } = await this.$httpSales.get('commerce-information', {
		params,
	}));
}

function goToEditWarehouse() {
	this.goTo('page-warehouses-edit', {
		params: { id: this.listCommerces.settings.defaultWarehouse.id },
	});
}

async function importPrices(fileInfo) {
	const name = fileInfo.name.replace(/\s/g, '-');
	const body = {
		base64: fileInfo.sixFour,
		commerceId: Number(this.id),
		salPriceListId: this.commerce.salPriceListId,
	};
	this.loading = true;
	try {
		const words = name.split('.');
		const lastItem = words.length;
		const extension = words[lastItem - 1];
		if (this.allowedFilesPrices.indexOf(extension) > -1) {
			const { data: response } = await this.$httpProducts.post('products/imports', body);
			this.importData = response;
		} else {
			this.showNotification(
				`Archivo no válido, solo se permite ${this.allowedFilesPrices.join(',')}`,
				'warning'
			);
		}
	} catch (error) {
		if (error.status === 500) {
			this.showGenericError();
		} else if (error.status === 400) {
			if (error.data.message === 'READ_FILE_XLSX_ERROR') {
				this.showNotification(
					'No se pudo leer el archivo excel. Recargue la página e inténtelo de nuevo.',
					'error'
				);
			} else if (error.data.message === 'WRITE_FILE_XLSX_ERROR') {
				this.showNotification(
					'Se produjo un error de escritura en el archivo. Recargue la página e inténtelo de nuevo.',
					'error'
				);
			}
		}
	} finally {
		this.loading = false;
	}
}

async function loadBankAccounts() {
	const { data: rows } = await this.$httpSales.get('bank-account');
	this.rows = rows;
	if (this.id) {
		this.detailCommerce();
	}
}

async function loadData() {
	const params = { type: 2 };
	const paramsWarehouse = { subsidiaryId: this.listCommerces.subsidiaryId };
	const request = [
		this.$httpProducts.get('warehouses', { params: paramsWarehouse }),
		this.getBanks(),
		this.getAccountType(),
		this.$httpSales.get('way-payment'),
		this.$httpSales.get('group/typeDelivery/table'),
		this.$httpSales.get('items', { params }),
	];
	[
		{ data: this.warehouses },
		{ data: this.banks },
		{ data: this.bankAccountTypes },
		{ data: this.listPayments },
		{ data: this.deliveryTypes },
		{ data: this.itemsEcommerce },
	] = await Promise.all(request);
	this.detailWayPaymet();
	this.setCommerceData();
}

async function loadSections() {
	({ data: this.sections } = await this.$httpSales.get('group/typeHelperCenter/table'));
	this.addSectionNameRowsHelp();
}

function onClick(code) {
	if (!this.commerce.salPriceListId) {
		this.showNotification('Es necesario seleccionar una lista de precios', 'info');
	} else if (code === 'export') {
		this.exportPrices();
	} else if (code === 'import') {
		this.showDialogPrices();
	}
}

function onSearch(search) {
	this.params.search = search ? search.trim() : null;
	this.loadBankAccounts();
}

function onSelectedAll(checked) {
	this.checkAll = checked;
	this.rows = this.rows.map((row) => {
		const newRow = { ...row };
		if (!row.disabled) {
			newRow.isSelected = checked;
		}
		return newRow;
	});
	this.dataSelected = this.rows.filter((r) => r.isSelected);
}

function openDialog(ubigeoData) {
	this.commerce.ubigeoData = { ...ubigeoData };
	this.dialog = true;
}

async function openEditCenter(row) {
	this.itemId = row.id;
	this.currentHelpSection = { ...row };
	this.show = true;
	this.hideButtons = false;
}

function openFormHelpCenter() {
	this.show = true;
	this.openForm = false;
	this.hideButtons = false;
	this.currentHelpSection = {};
}

function openSlide(open) {
	this.action.code = open ? 'address-slide' : null;
	this.action.title = open ? 'DIRECCIÓN' : '';
	this.action.open = open;
}

function rowIsSelected({ id, disabled }) {
	if (disabled) {
		this.rows = this.rows.map((row) => {
			const newRow = { ...row };
			if (row.id === id) {
				newRow.isSelected = false;
			}
			return newRow;
		});
	}
	this.checkAll = this.rows.every((r) => r.isSelected);
	this.dataSelected = this.rows.filter((r) => r.isSelected);
}

function saveAndGetOut() {
	this.saveCommerce('go-to-edit-warehouse');
}

async function saveCommerce(flagEdit = null) {
	this.loading = true;
	const deliveryType = this.listCommerces.deliveryType.map((type) => ({
		id: type.id,
		code: type.code,
		name: type.name,
	}));
	const self = this;
	const wayPaymentRelated = this.listCommerces.wayPaymentRelated;
	if (flagEdit === 'go') {
		const index = wayPaymentRelated.findIndex((wpr) => wpr.code === this.onlinePayments);
		wayPaymentRelated.splice(index, 1);
	}
	const prefix = this.country
		? this.countries.find((c) => c.name === this.country).value
		: null;
	const prefixPhone = this.countryPhone
		? this.countries.find((c) => c.name === this.countryPhone).value
		: null;
	if (typeof this.listCommerces.settings.defaultWarehouse === 'number') {
		const index = this.warehouses.findIndex(
			(w) => Number(w.id) === Number(this.listCommerces.settings.defaultWarehouse)
		);
		if (index > -1) {
			this.listCommerces.settings.defaultWarehouse = this.warehouses[index];
		}
	}
	const body = {
		settings: {
			deliverySettings: {
				daysToSend: this.daysToSend,
				hourFrom: this.dateRangeFrom ? this.dateRangeFrom : '',
				hourTo: this.dateRangeTo ? this.dateRangeTo : '',
			},
			codeTaxes: this.commerce.codeTaxes,
			salPriceListId: this.commerce.salPriceListId,
			limitHome: this.commerce.limitHome,
			limitShownHome: this.commerce.limitShownHome,
			template: this.template,
			theme: this.theme,
			defaultWarehouse: this.listCommerces.settings.defaultWarehouse,
			flagGrouper: this.listCommerces.settings.flagGrouper,
			enablePushNotification: this.commerce.enablePushNotification,
			flagNotValidEmailUser: this.commerce.flagNotValidEmailUser,
			flagBilling: this.commerce.flagBilling,
			flagBillingValidate: this.commerce.flagBillingValidate,
			shippingCost: String(this.commerce.shippingCost || 0),
			serviceCost: String(this.commerce.serviceCost || 0),
			attentionHours: this.listCommerces.settings.attentionHours || {
				hourFrom: '',
				hourTo: '',
			},
			dailyAttentionHours:
				Object.keys(this.listCommerces.settings.dailyAttentionHours).reduce((acum, h) => {
					const newAcum = { ...acum };
					const newData = {
						...this.listCommerces.settings.dailyAttentionHours[h],
					};
					newData.closed = !this.listCommerces.settings.dailyAttentionHours[h].closed;
					newAcum[h] = { ...newData };
					return newAcum;
				}, {}) || this.dailyAttentionHours,
			minOrderPrice: this.minOrderPrice ? Number(this.minOrderPrice) : null,
			outOfAttention: this.outOfAttention,
			messageOutOfAttention: this.messageOutOfAttention.length
				? this.messageOutOfAttention
				: null,
			billeters: { ...this.billeters },
			country: this.country,
			countryPhone: this.countryPhone,
			facebookLive: {
				link: this.facebookLive.link,
				status: this.facebookLive.link ? this.facebookLive.status : false,
			},
			flagShoppyRunn: this.commerce.flagShoppyRunn,
			flagShowMap: this.commerce.flagShowMap,
		},
		itemId: this.commerce.itemId,
		address: this.commerce.address,
		bankAccountsRelated: this.rowsAssigned,
		colorCode: this.commerce.colorCode,
		email: this.commerce.email,
		favicon: {
			value: this.commerce.favicon,
		},
		phone: this.commerce.phone,
		socialNetworks: this.socialNetworksSelect.reduce((acum, s) => {
			const newAcum = [...acum];
			if (s.link !== '') {
				const newSocial = {
					link: s.link,
					code: s.code,
					logo: s.logo || self.logosSocialNetworks[s.name],
				};
				newAcum.push(newSocial);
			}
			return newAcum;
		}, []),
		templateCode: this.commerce.templateCode,
		templateId: this.commerce.templateId,
		warehousesRelated: this.listCommerces.warehousesRelated,
		wayPaymentRelated,
		urlQr: this.commerce.urlQr,
		urlDomain: this.commerce.urlDomain,
		urlImage: this.commerce.urlImage,
		scriptChat: this.commerce.scriptChat,
		helperCenter: this.buildHelperCenter(this.rowsHelp),
		wayPayment: this.buildWayPayment(),
		deliveryType,
		name: this.commerce.name,
		latitude: this.commerce.latitude,
		longitude: this.commerce.longitude,
		slug: this.commerce.slug,
	};
	if (this.commerce.whatsappNumber) {
		body.whatsappNumber =
			this.commerce.whatsappNumber[0] === '+'
				? this.commerce.whatsappNumber.replace(/ /g, '')
				: `${prefix}${this.commerce.whatsappNumber}`.replace(/ /g, '');
	}
	if (this.commerce.phone) {
		body.phone =
			this.commerce.phone[0] === '+'
				? this.commerce.phone.replace(/ /g, '')
				: `${prefixPhone}${this.commerce.phone}`.replace(/ /g, '');
	}
	if (this.productOrderConfig.typeOrder) {
		body.settings.productOrderConfig = {
			typeOrder: this.productOrderConfig.typeOrder,
			fieldToQuery: this.productOrderConfig.fieldToQuery,
			desc:
				this.productOrderConfig.typeOrder === 3 ? false : this.productOrderConfig.desc,
		};
	}
	if (this.commerce.ubigeoData) {
		if (this.commerce.ubigeoData.city) {
			if (this.commerce.ubigeoData.city.id) {
				body.ubigeoData = this.commerce.ubigeoData;
			}
		}
	}
	if (this.commerce.contactData) {
		body.settings.contactData = this.commerce.contactData || {
			lastname: '',
			name: '',
			phone: '',
		};
	}
	try {
		await this.$httpSales.patch(`com-ecommerce-companies/${this.$route.params.id}`, body);
		this.showNotification('El comercio fue actualizado.');
		this.openSlide(false);
		this.dialog = false;
		if (flagEdit === 'go-to-edit-warehouse') {
			this.goToEditWarehouse();
		} else if (flagEdit === 'go') {
			this.actionSuccess(flagEdit);
		} else {
			this.goTo(this.$route.query.origin);
		}
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	} finally {
		this.loading = false;
	}
}

function setAddressData({ model, value }) {
	this.commerce[model] = value;
}

function setCommerceData() {
	this.daysToSend = this.listCommerces.settings.deliverySettings
		? this.listCommerces.settings.deliverySettings.daysToSend
		: null;
	if (this.listCommerces.settings.deliverySettings) {
		this.dateRangeFrom =
			this.listCommerces.settings.deliverySettings.hourFrom &&
			typeof this.listCommerces.settings.deliverySettings.hourFrom === 'object'
				? `${this.listCommerces.settings.deliverySettings.hourFrom.HH}:${this.listCommerces.settings.deliverySettings.hourFrom.mm}`
				: this.listCommerces.settings.deliverySettings.hourFrom;
		this.dateRangeTo =
			this.listCommerces.settings.deliverySettings.hourTo &&
			typeof this.listCommerces.settings.deliverySettings.hourTo === 'object'
				? `${this.listCommerces.settings.deliverySettings.hourTo.HH}:${this.listCommerces.settings.deliverySettings.hourTo.mm}`
				: this.listCommerces.settings.deliverySettings.hourTo;
	} else {
		this.dateRangeFrom = '';
		this.dateRangeTo = '';
	}
	this.commerce.address = this.listCommerces.address;
	this.commerce.codeTaxes = this.listCommerces
		? this.listCommerces.settings.codeTaxes
		: '';
	this.commerce.email = this.listCommerces.email;
	this.commerce.enablePushNotification =
		this.listCommerces.settings.enablePushNotification;
	this.commerce.flagNotValidEmailUser = this.listCommerces.settings.flagNotValidEmailUser;
	this.commerce.favicon = this.listCommerces.favicon
		? this.listCommerces.favicon.value
		: '';
	this.commerce.flagBilling = this.listCommerces.settings.flagBilling || false;
	this.commerce.flagBillingValidate =
		this.listCommerces.settings.flagBillingValidate || false;
	this.commerce.flagGrouper = this.listCommerces.settings.flagGrouper || 2;
	this.commerce.flagShoppyRunn = this.listCommerces.settings.flagShoppyRunn || false;
	this.commerce.flagShowMap = this.listCommerces.settings.flagShowMap || false;
	this.commerce.itemId = this.listCommerces.itemId;
	this.commerce.latitude = this.listCommerces.location
		? this.listCommerces.location.x
		: 0;
	this.commerce.limitHome = this.listCommerces.settings.limitHome;
	this.commerce.limitShownHome = this.listCommerces.settings.limitShownHome;
	this.commerce.longitude = this.listCommerces.location
		? this.listCommerces.location.y
		: 0;
	this.commerce.name = this.listCommerces.name;
	this.commerce.phone = this.listCommerces.phone;
	this.commerce.salPriceListId = this.listCommerces.settings.salPriceListId;
	this.commerce.scriptChat = this.listCommerces.scriptChat;
	this.commerce.serviceCost = this.listCommerces.settings.serviceCost || '';
	this.commerce.shippingCost = this.listCommerces.settings.shippingCost || '';
	this.commerce.socialNetworks = this.listCommerces
		? this.listCommerces.socialNetworks
		: [];
	this.commerce.urlDomain = this.listCommerces.urlDomain;
	this.commerce.urlImage = this.listCommerces.urlImage;
	this.commerce.urlQr = this.listCommerces.urlQr;
	this.commerce.limitCatalog = this.listCommerces.settings.limitCatalog || null;
	this.commerce.ubigeoData = this.listCommerces.ubigeoData || {
		city: {},
		parish: {},
		province: {},
		ubigeo: null,
	};
	this.commerce.contactData = this.listCommerces.settings.contactData || {
		lastname: '',
		name: '',
		phone: '',
	};
	if (this.listCommerces.settings.country) {
		this.country = this.listCommerces.settings.country;
		const index = this.countries.findIndex(
			(c) => c.name === this.listCommerces.settings.country
		);
		if (index > -1) {
			const prefix = this.countries[index].value;
			this.commerce.whatsappNumber = this.listCommerces.whatsappNumber
				? this.listCommerces.whatsappNumber.substring(prefix.length)
				: null;
		}
	} else {
		this.country = this.isEcuador ? 'Ecuador' : 'Peru';
		this.commerce.whatsappNumber = this.listCommerces.whatsappNumber;
	}
	if (this.listCommerces.settings.countryPhone) {
		this.countryPhone = this.listCommerces.settings.countryPhone;
		const index = this.countries.findIndex(
			(c) => c.name === this.listCommerces.settings.countryPhone
		);
		if (index > -1) {
			const prefix = this.countries[index].value;
			this.commerce.phone = this.commerce.phone
				? this.listCommerces.phone.substring(prefix.length)
				: null;
		}
	} else {
		this.countryPhone = this.isEcuador ? 'Ecuador' : 'Peru';
		this.commerce.phone = this.listCommerces.phone;
	}
	if (this.commerce.contactData.phone) {
		const cp = this.commerce.contactData.phone;
		const cps1 = cp.substring(0, 3);
		const cps2 = cp.substring(0, 4);
		const countryFind = this.countries.find((c) => c.value === cps1 || c.value === cps2);
		if (countryFind) {
			this.countryContact = countryFind.name;
			this.commerce.contactData.phone =
				countryFind.value === cps1
					? cp.substring(3, cp.length)
					: cp.substring(4, cp.length);
		} else {
			this.countryContact = this.isEcuador ? 'Ecuador' : 'Peru';
		}
	} else {
		this.countryContact = this.isEcuador ? 'Ecuador' : 'Peru';
	}
	this.commerce.slug = this.listCommerces.slug;
	this.facebookLive.link = this.listCommerces.settings.facebookLive
		? this.listCommerces.settings.facebookLive.link
		: null;
	this.facebookLive.status = this.listCommerces.settings.facebookLive
		? this.listCommerces.settings.facebookLive.status
		: false;
	if (this.listCommerces.settings.productOrderConfig) {
		this.productOrderConfig = {
			...this.listCommerces.settings.productOrderConfig,
		};
	}
}

function setConfiguratedWayPayments(listCommerces) {
	this.wayPaymentCommerce = listCommerces.wayPaymentCommerce || [];
}

function setFlagGrouper({ value }) {
	this.listCommerces.settings.flagGrouper = value;
	this.commerce.flagGrouper = value;
}

function setGateway(gatewayInfo) {
	if (gatewayInfo) {
		const { code, fields, name } = gatewayInfo;
		if (fields) {
			const fieldsData = fields.reduce((a, f) => {
				const newA = { ...a };
				newA[f.name] = f.value;
				return newA;
			}, {});
			return { code, name, ...fieldsData };
		}
		return { code, name };
	}
	return {};
}

function setGatewayItem(items) {
	const newItems = items.reduce((a, item) => {
		const newA = { ...a };
		const wpCommerce =
			this.wayPaymentByCommerce.find((wpc) => wpc.wayPaymentId === item.id) || {};
		newA[item.id] = {
			gatewayConfiguration: wpCommerce.gateWayPaymentCommerce || [],
			isSelected: true,
		};
		return newA;
	}, {});
	if (this.wayPaymentByCommerce.length < this.listPayments.length) {
		this.listPayments.forEach((lp) => {
			const index = items.findIndex((i) => i.id === lp.id);
			if (index === -1) {
				newItems[lp.id] = {
					gatewayConfiguration: [],
					isSelected: false,
				};
			}
		});
	}
	return newItems;
}

function setPaymentData(paymentData) {
	const validValidation = this.wayPaymentByCommerce.length > 0;
	this.listPaymentItem = this.listPayments.find((lp) => lp.code === this.onlinePayments);
	const paymentDataIndex = paymentData.findIndex((pd) => pd === this.listPaymentItem.id);
	const paymentDisabled = paymentDataIndex > -1;
	if (validValidation) {
		const pItem = this.wayPaymentByCommerce.find(
			(wpc) => wpc.wayPaymentId === this.listPaymentItem.id
		);
		if (paymentDisabled) {
			if (pItem) {
				const opEmpty =
					!pItem.gateWayPaymentCommerce || pItem.gateWayPaymentCommerce.length === 0;
				if (opEmpty) {
					this.showPaymentAlert();
				} else {
					this.setPaymentDataValid(paymentData, pItem);
				}
			} else {
				this.showPaymentAlert();
			}
		} else {
			this.setPaymentDataValid(paymentData);
		}
	} else if (!validValidation) {
		if (paymentDisabled) {
			this.showPaymentAlert();
		} else {
			this.setPaymentDataValid(paymentData);
		}
	} else {
		this.setPaymentDataValid(paymentData);
	}
}

function setPaymentDataValid(dataSelected, paymentItem) {
	const gatewayKeys = Object.keys(this.listCommerces.gateway);
	if (dataSelected.length === 2) {
		const keyItem = gatewayKeys.find(
			(k) =>
				Number(k) !== Number(dataSelected[0]) && Number(k) !== Number(dataSelected[1])
		);
		this.listCommerces.gateway[keyItem].gatewayConfiguration = [];
		this.listCommerces.gateway[keyItem].isSelected = false;
	}
	if (dataSelected.length === 1) {
		gatewayKeys.forEach((gk) => {
			if (Number(gk) !== Number(dataSelected[0])) {
				this.listCommerces.gateway[gk].gatewayConfiguration = [];
				this.listCommerces.gateway[gk].isSelected = false;
			}
		});
	}
	if (dataSelected.length === 0) {
		gatewayKeys.forEach((gk) => {
			this.listCommerces.gateway[gk].gatewayConfiguration = [];
			this.listCommerces.gateway[gk].isSelected = false;
		});
	}
	this.listCommerces.wayPayment = this.listPayments.reduce((a, lp) => {
		const pay = dataSelected.find((pd) => pd === lp.id);
		if (pay) {
			if (paymentItem) {
				const i = gatewayKeys.find((k) => Number(k) === Number(paymentItem.wayPaymentId));
				this.listCommerces.gateway[i].isSelected = true;
				this.listCommerces.gateway[i].gatewayConfiguration =
					paymentItem.gateWayPaymentCommerce || [];
			} else {
				this.listCommerces.gateway[lp.id].isSelected = true;
				this.listCommerces.gateway[lp.id].gatewayConfiguration =
					this.listCommerces.gateway[lp.id].gatewayConfiguration;
			}
			a.push(lp);
		}
		return a;
	}, []);
}

function setRows(listCommerces) {
	this.rows = this.rows.map((r) => {
		const newRow = { ...r };
		const index = listCommerces.bankAccountsRelated.findIndex((a) => a.id === r.id);
		if (index > -1) {
			newRow.disabled = 1;
		} else {
			newRow.disabled = 0;
		}
		return newRow;
	});
}

function setRowsAssigned(listCommerces) {
	this.rowsAssigned = this.rows.reduce((acum, row) => {
		const flag = listCommerces.bankAccountsRelated.filter((b) => b.id === row.id);
		if (flag.length) {
			acum.push(row);
		}
		return acum;
	}, []);
}

function setSalPriceId(list) {
	if (list && list.id) {
		this.commerce.salPriceListId = list.id;
	}
}

function setSocialNetworks(listCommerces) {
	if (listCommerces.socialNetworks) {
		this.socialNetworksSelect = this.listCommerces.socialNetworks.reduce((acum, item) => {
			const newAcum = [...acum];
			if (item.link.trim() !== '') {
				const indexSearch = this.socialNetworksList.findIndex(
					(s) => item.link.search(s.name.toLowerCase()) > -1
				);
				if (indexSearch > -1) {
					const newSocial = {
						code: this.socialNetworksList[indexSearch].code,
						link: item.link,
						name: this.socialNetworksList[indexSearch].name,
					};
					newAcum.push(newSocial);
				}
			}
			return newAcum;
		}, []);
		this.listCommerces.socialNetworks = listCommerces.socialNetworks.map(
			(item, index) => {
				const newDetail = { ...item };
				newDetail.nameSocial = `Red Social ${index}`;
				newDetail.logoSocial = '';
				return newDetail;
			}
		);
	}
}

function setSubsidiariesList(listCommerces) {
	this.listSubsidiaries = listCommerces.subsidiary || [];
}

function setTemplate(template) {
	this.template = template;
}

function setTemplateAndTheme() {
	this.template = this.listCommerces.settings.template || {};
	this.theme = this.listCommerces.settings.theme || {};
}

function setTheme(theme) {
	this.theme = theme;
}

function setWayPayment() {
	return this.wayPaymentByCommerce.reduce((a, wpr) => {
		const item = this.listPayments.find((lp) => lp.id === wpr.wayPaymentId);
		if (item) {
			a.push(item);
		}
		return a;
	}, []);
}

function showDialog(code) {
	this.$refs[code][0].click();
}

function showDialogFavicon(name) {
	this.$refs[name].click();
}

function showDialogPrices() {
	this.$refs.label.click();
}

function showPaymentAlert() {
	this.modal.title = `¿Deseas configurar integraciones para el medio de pago ${this.listPaymentItem.name}?`;
	this.modal.message =
		'Este medio de pago se mostrará seleccionado automáticamente al configurar integraciones, para eso te enviamos a la pantalla de "Pagos Online" al seleccionar una de las dos últimas opciones mostradas:';
	this.modal.open = true;
}

async function toggleActive(row, index) {
	const { id, flagActive } = row;
	this.$set(this.rowsHelp[index], 'flagActive', flagActive);
	const body = { flagActive };
	await this.$httpSales.patch(`commerce-information/${id}/active`, body);
}

function updateRowsHelp(section) {
	const index = this.rowsHelp.findIndex((r) => r.id === section.id);
	this.$set(this.rowsHelp, index, { ...section });
}

function setDailyAttentionHours({ model, value }, key) {
	this.listCommerces.settings.dailyAttentionHours[key][model] = value;
}

function setDailyAttentionHoursRange(value) {
	this.dateRangeFrom = value;
}

function setDailyAttentionHoursRangeFrom(value) {
	this.dateRangeTo = value;
}

function validations() {
	return {
		commerce: {
			codeTaxes: {
				maxLength: maxLength(3),
				required: requiredIf(() => this.isEcuador),
			},
			name: { required },
		},
		listCommerces: {
			wayPaymentRelated: this.validationWayPaymentRelated,
		},
	};
}

function daysInLetters(day) {
	let letters = '';
	switch (Number(day)) {
		case 1:
			letters = 'Lunes';
			break;
		case 2:
			letters = 'Martes';
			break;
		case 3:
			letters = 'Miércoles';
			break;
		case 4:
			letters = 'Jueves';
			break;
		case 5:
			letters = 'Viernes';
			break;
		case 6:
			letters = 'Sábado';
			break;
		default:
			letters = 'Domingo';
	}
	return letters;
}

function changeToggleTime() {
	this.toggleTime = !this.toggleTime;
}

function validationWayPaymentRelated(p) {
	return p.wayPaymentRelated.length > 0;
}

function changeOutOfAttention($event) {
	if (!$event) {
		this.messageOutOfAttention = '';
	}
}

function clickItemPayment(item) {
	if (item.name === this.namePaymentYape) {
		this.action.code = 'configuration-yape';
		this.action.title = 'Configuración - Yape';
		this.action.open = true;
		this.action.width = 450;
	}
}

function changeConfigBilleters(model) {
	this.openSlide(false);
	this.billeters = {
		yape: { ...model },
		plin: { ...model },
	};
}

function changeSelectGateway(code, value) {
	const arrayName = value.map((v) => v.name);
	const diff = [
		...arrayName.filter((x) => !this.oldVal.includes(x)),
		...this.oldVal.filter((x) => !arrayName.includes(x)),
	];
	this.oldVal = value.map((v) => v.name);
	if (code === 'IBD') {
		const index = value.findIndex((v) => v.name === this.namePaymentYape);
		if (index === -1) {
			this.billeters = {};
		} else if (index > -1 && diff[0] === 'Yape') {
			setTimeout(() => {
				this.clickItemPayment({ name: this.namePaymentYape });
			}, 300);
		}
	}
}

function setDataCommerce({ model, value }, index, id) {
	this.commerce[model] = value;
	if (model === 'minOrderPrice') {
		this.minOrderPrice = value;
	} else if (model === 'socialNetworksSelect') {
		this.socialNetworksSelect = value;
	} else if (model === 'linkSocialNetwork') {
		this.socialNetworksSelect[index].link = value;
	} else if (model === 'deliveryType') {
		this.listCommerces.deliveryType = value;
	} else if (model === 'settingDefaultWarehouse') {
		this.listCommerces.settings.defaultWarehouse = value;
	} else if (model === 'warehousesRelated') {
		this.listCommerces.warehousesRelated = value;
	} else if (model === 'wayPaymentRelated') {
		this.listCommerces.wayPaymentRelated = value;
		this.setPaymentData(value);
	} else if (model === 'gatewayConfiguration') {
		this.listCommerces.gateway[id].gatewayConfiguration = value;
	} else if (model === 'rowsAssigned') {
		this.rowsAssigned = value;
	} else if (model === 'salPriceListId') {
		this.commerce.salPriceListId = value;
	} else if (model === 'fblink') {
		this.facebookLive.link = value;
		if (value.trim() === '') {
			this.facebookLive.status = false;
		}
	} else if (model === 'daysToSend') {
		this.daysToSend = value;
	} else if (model === 'typeOrder' || model === 'fieldToQuery' || model === 'desc') {
		this.productOrderConfig[model] = value;
	}
}

function disabledSave() {
	const hoursKeys = Object.keys(this.listCommerces.settings.dailyAttentionHours);
	const invalidHours = hoursKeys.some(
		(hk) =>
			this.listCommerces.settings.dailyAttentionHours[hk].hourFrom.split(':')[0] ===
				'HH' ||
			this.listCommerces.settings.dailyAttentionHours[hk].hourFrom.split(':')[1] ===
				'mm' ||
			this.listCommerces.settings.dailyAttentionHours[hk].hourTo.split(':')[0] === 'HH' ||
			this.listCommerces.settings.dailyAttentionHours[hk].hourTo.split(':')[1] === 'mm'
	);
	return this.$v.$invalid || invalidHours;
}

function openModal(name) {
	this[name] = true;
}

function addSocialNetworks(values) {
	this.closeModalItems('dialogSocialNetworks');
	this.socialNetworksSelect = values.map((v) => {
		const index = this.socialNetworksSelect.findIndex((s) => s.code === v);
		const indexS = this.socialNetworksList.findIndex((s) => s.code === v);
		let newSocial = {};
		if (index > -1) {
			newSocial = { ...this.socialNetworksSelect[index] };
		} else {
			newSocial = {
				code: v,
				name: this.socialNetworksList[indexS].name,
				link: '',
			};
		}
		return newSocial;
	});
}

function deleteSocialNetworks(value) {
	const index = this.socialNetworksSelect.findIndex((s) => s.code === value.code);
	if (index > -1) {
		this.socialNetworksSelect.splice(index, 1);
	}
}

function closeModalItems(name) {
	this[name] = false;
}

function addWarehouse(values) {
	this.closeModalItems('dialogWarehouses');
	this.listCommerces.warehousesRelated = [...values];
}

function deleteWarehouses(value) {
	const index = this.listCommerces.warehousesRelated.findIndex((s) => s === value.id);
	if (index > -1) {
		this.listCommerces.warehousesRelated.splice(index, 1);
	}
}

function changeWaypaymentRelated(values) {
	if (this.listPaymentItem) {
		if (Object.keys(this.listPaymentItem).length) {
			this.setPaymentData(values);
		}
	}
}

function deleteWaypaymentRelated(value) {
	const index = this.listCommerces.wayPaymentRelated.findIndex((l) => l === value.id);
	if (index > -1) {
		this.listCommerces.wayPaymentRelated.splice(index, 1);
		this.setPaymentData(this.listCommerces.wayPaymentRelated);
	}
}

function addWaypaymentRelated(values) {
	this.closeModalItems('dialogWayPayment');
	this.listCommerces.wayPaymentRelated = values;
	this.setPaymentData(values);
}

function openModalGateway(payment) {
	this.listGateway = [...payment.gatewayConfiguration];
	this.listGateway = this.listGateway.reduce((acum, s) => {
		const newAcum = [...acum];
		if (newAcum.length) {
			const index = newAcum.findIndex((n) => n.code === s.code);
			if (index === -1) {
				newAcum.push(s);
			}
		} else {
			newAcum.push(s);
		}
		return newAcum;
	}, []);
	this.listGatewaySelects = [
		...this.listCommerces.gateway[payment.id].gatewayConfiguration,
	];
	this.idGateway = payment.id;
	this.indexGateway = payment.code;
	this.openModal('dialogGatewayConfiguration');
}

function addGatewayConfiguration(values) {
	const selects = this.listGateway.filter((l) => values.find((v) => v === l.code));
	this.listCommerces.gateway[this.idGateway].gatewayConfiguration = selects;
	this.closeModalItems('dialogGatewayConfiguration');
}

function deleteGatewayConfiguration(value, payment) {
	const index = this.listCommerces.gateway[payment.id].gatewayConfiguration.findIndex(
		(l) => l.code === value.code
	);
	if (index > -1) {
		this.listCommerces.gateway[payment.id].gatewayConfiguration.splice(index, 1);
		this.flagDelete = !this.flagDelete;
	}
}

function addBankAccount(values) {
	const selectsBank = this.rows.filter((r) => values.find((v) => v === r.id));
	this.rowsAssigned = [...selectsBank];
	this.closeModalItems('dialogBankAccount');
}

function deleteBankAccount(value) {
	const index = this.rowsAssigned.findIndex((b) => b.id === value.id);
	if (index > -1) {
		this.rowsAssigned.splice(index, 1);
	}
}

function setContactData({ model, value }) {
	this.commerce.contactData[model] = value;
}

function setDataBilleters({ model, value }) {
	if (model === 'phoneYape') {
		this.billeters.yape.phone = value;
	} else if (model === 'phoneLukita') {
		this.billeters.lukita.phone = value;
	} else {
		this.billeters.plin.phone = value;
	}
}

function showOpenImage(name) {
	this.$refs[name][0].click();
}

function showBilleters(value) {
	const arrayGateway = Object.keys(this.listCommerces.gateway);
	const flag = arrayGateway.reduce((acum, l) => {
		let newAcum = acum;
		const val = this.listCommerces.gateway[l].gatewayConfiguration.findIndex(
			(g) => g.code === value
		);
		if (val > -1) {
			newAcum = true;
		}
		return newAcum;
	}, false);
	if (!flag) {
		this.billeters[value] = {
			imageQR: null,
			phone: null,
		};
	}
	return flag;
}

function openNewBank() {
	this.action.code = 'new-account-bank-slider';
	this.action.title = 'Nueva Cuenta Bancaria';
	this.action.open = true;
}

function updateBanks() {
	this.loadBankAccounts();
	this.openSlide(false);
}

function showOrderProducts() {
	if (this.$userInfo.company.settings) {
		return this.$userInfo.company.settings.flagGrouper || false;
	}
	return false;
}

function data() {
	return {
		dateRangeFrom: '',
		dateRangeTo: '',
		action: {
			active: false,
			code: null,
			open: false,
			title: '',
			width: 500,
		},
		allowedFiles: [
			'jpg',
			'jpeg',
			'png',
			'doc',
			'docx',
			'xls',
			'xlsx',
			'pdf',
			'txt',
			'svg',
		],
		allowedFilesPrices: ['xls', 'xlsx'],
		banks: [],
		bankAccountTypes: [],
		bank: {
			bankId: null,
			colorCode: null,
			typeTypeId: null,
			name: null,
			numAccount: null,
			urlQr: null,
			limitHome: null,
			limitShownHome: null,
		},
		checkAll: false,
		columns: [
			{ id: 1, name: 'Banco', value: 'bank', visible: true, checked: true },
			{
				id: 2,
				name: 'Tipo',
				value: 'typeAccount',
				visible: true,
				checked: true,
			},
			{ id: 3, name: 'Nombre', value: 'name', visible: true, checked: true },
			{ id: 4, name: 'Número', value: 'number', visible: true, checked: true },
		],
		columnsHelp: [
			{ id: 1, name: 'Orden', value: 'order', visible: true, checked: true },
			{
				id: 2,
				name: 'Sección',
				value: 'typeHelperCenter',
				visible: true,
				checked: true,
			},
			{ id: 3, name: 'Nombre', value: 'name', visible: true, checked: true },
			{
				id: 4,
				name: 'Acciones',
				value: 'actions',
				visible: true,
				checked: true,
			},
		],
		daysToSend: null,
		commerce: {
			address: null,
			codeTaxes: null,
			colorCode: null,
			contactData: {
				lastname: '',
				name: '',
				phone: '',
			},
			daysToSend: null,
			email: null,
			enablePushNotification: false,
			flagNotValidEmailUser: false,
			favicon: null,
			flagBilling: false,
			flagBillingValidate: false,
			flagGrouper: 2,
			flagShoppyRunn: false,
			flagShowMap: false,
			itemId: null,
			imagenForm: '',
			latitude: 0,
			longitude: 0,
			name: '',
			phone: null,
			salPriceListId: null,
			scriptChat: '',
			socialNetworks: [],
			templateCode: null,
			templateId: null,
			ubigeoData: {
				city: {},
				parish: {},
				province: {},
				ubigeo: null,
			},
			urlImage: null,
			urlQr: null,
			whatsappNumber: null,
		},
		configuration: {
			logo: null,
			direction: '',
			email: '',
			imageQr: null,
			logoNetwork: null,
			linkNetwork: null,
			logoNetworkTwo: null,
			linkNetworkTwo: null,
			logoNetworkThree: null,
			linkNetworkThree: null,
			phone: 0,
		},
		currentHelpSection: {},
		dataSelected: [],
		deliveryTypes: [],
		detailCenter: {},
		dialog: false,
		dialogCancel: false,
		dialogMessage: '',
		disabledSlugCommerce: null,
		featureName: '',
		hideButtons: true,
		itemId: null,
		itemsEcommerce: [],
		listCommerces: {
			contactData: {
				lastname: '',
				name: '',
				phone: '',
			},
			deliveryType: [],
			gateway: {},
			gatewayConfiguration: [],
			settings: {
				attentionHours: {
					hourFrom: '',
					hourTo: '',
				},
				dailyAttentionHours: {
					0: {
						hourTo: '',
						hourFrom: '',
						closed: false,
					},
					1: {
						hourTo: '',
						hourFrom: '',
						closed: false,
					},
					2: {
						hourTo: '',
						hourFrom: '',
						closed: false,
					},
					3: {
						hourTo: '',
						hourFrom: '',
						closed: false,
					},
					4: {
						hourTo: '',
						hourFrom: '',
						closed: false,
					},
					5: {
						hourTo: '',
						hourFrom: '',
						closed: false,
					},
					6: {
						hourTo: '',
						hourFrom: '',
						closed: false,
					},
				},
				codeTaxes: null,
				defaultWarehouse: null,
				flagGrouper: 2,
				imageQR: null,
				salPriceListId: null,
				whatsappNumber: null,
				shippingCost: null,
				serviceCost: null,
				flagShoppyRunn: false,
				flagShowMap: false,
			},
			ubigeoData: {
				city: {},
				parish: {},
				province: {},
				ubigeo: null,
			},
			wayPayment: [],
			wayPaymentRelated: [],
		},
		listPaymentItem: {},
		listPayments: [],
		listPrices: [],
		listSubsidiaries: {},
		loading: false,
		loadingServices: false,
		logosSocialNetworks: {
			Facebook: 'https://maki-landing.s3.us-east-2.amazonaws.com/facebook_3.svg',
			Instagram: 'https://maki-landing.s3.us-east-2.amazonaws.com/instagram_5.svg',
			Youtube: 'https://maki-landing.s3.us-east-2.amazonaws.com/youtube_1.svg',
			Twitter: 'https://maki-landing.s3.us-east-2.amazonaws.com/twitter.svg',
			Tiktok:
				'https://static.vecteezy.com/system/resources/previews/023/986/492/non_2x/tiktok-logo-tiktok-logo-transparent-tiktok-icon-transparent-free-free-png.png',
		},
		modal: {
			message: '',
			open: false,
			title: '',
		},
		onlinePayments: '',
		openForm: true,
		options: [
			{
				id: 1,
				name: 'Agrupados',
			},
			{
				id: 2,
				name: 'Todos',
			},
		],
		params: {
			search: null,
		},
		payments: [],
		paymentsSelect: [],
		rowsAssigned: [],
		show: false,
		socialNetworksConfiguration: [],
		step: 0,
		warehouses: [],
		rows: [],
		rowsCenter: [],
		rowsHelp: [],
		sections: [],
		socialNetworksList: [],
		socialNetworksSelect: [],
		template: {},
		theme: {},
		wayPaymentByCommerce: [],
		wayPaymentCommerce: [],
		dailyAttentionHours: {
			0: {
				hourTo: '',
				hourFrom: '',
				closed: false,
			},
			1: {
				hourTo: '',
				hourFrom: '',
				closed: false,
			},
			2: {
				hourTo: '',
				hourFrom: '',
				closed: false,
			},
			3: {
				hourTo: '',
				hourFrom: '',
				closed: false,
			},
			4: {
				hourTo: '',
				hourFrom: '',
				closed: false,
			},
			5: {
				hourTo: '',
				hourFrom: '',
				closed: false,
			},
			6: {
				hourTo: '',
				hourFrom: '',
				closed: false,
			},
		},
		toggleTime: true,
		minOrderPrice: null,
		outOfAttention: false,
		messageOutOfAttention: '',
		namePaymentYape: 'Yape',
		billeters: {
			yape: {
				imageQR: null,
				phone: null,
			},
			lukita: {
				imageQR: null,
				phone: null,
			},
			plin: {
				imageQR: null,
				phone: null,
			},
		},
		oldVal: [],
		countries: [
			{
				id: 1,
				value: '+51',
				name: 'Peru',
				image: '/static/img/banderas/peru.svg',
				phone: '51',
			},
			{
				id: 2,
				value: '+593',
				name: 'Ecuador',
				image: '/static/img/banderas/ecuador.svg',
				phone: '593',
			},
			{
				id: 3,
				value: '+56',
				name: 'Chile',
				image: '/static/img/banderas/chile.svg',
				phone: '56',
			},
			{
				id: 4,
				value: '+57',
				name: 'Colombia',
				image: '/static/img/banderas/colombia.svg',
				phone: '57',
			},
			{
				id: 5,
				value: '+591',
				name: 'Bolivia',
				image: '/static/img/banderas/bolivia.svg',
				phone: '91',
			},
			{
				id: 6,
				value: '+27',
				name: 'Sudáfrica',
				image: '/static/img/banderas/sudafrica.svg',
				phone: '27',
			},
			{
				id: 7,
				value: '+254',
				name: 'Kenia',
				image: '/static/img/banderas/kenia.svg',
				phone: '254',
			},
		],
		country: null,
		countryPhone: null,
		countryContact: null,
		dialogSocialNetworks: false,
		dialogWarehouses: false,
		facebookLive: {
			link: null,
			status: false,
		},
		dialogWayPayment: false,
		dialogGatewayConfiguration: false,
		listGateway: [],
		listGatewaySelects: [],
		idGateway: null,
		indexGateway: null,
		dialogBankAccount: false,
		flagDelete: false,
		internetBanking: '',
		valuesTypeOrder: [
			{
				code: 1,
				value: 'Orden Alfabético',
			},
			{
				code: 3,
				value: 'Orden Numerico',
			},
		],
		valuesFieldToQuery: [
			{
				code: 'name',
				value: 'Nombre',
			},
			{
				code: 'code',
				value: 'Código',
			},
			{
				code: 'description',
				value: 'Descripción',
			},
		],
		valuesDesc: [
			{
				code: false,
				value: 'A - Z',
			},
			{
				code: true,
				value: 'Z - A',
			},
		],
		productOrderConfig: {
			typeOrder: null,
			desc: null,
			fieldToQuery: null,
		},
	};
}

export default {
	name: 'page-configuration',
	components: {
		actionSidebar,
		addressSlide,
		appTable,
		autocompleteComponent,
		bankTransactionsSetting,
		creditCardSettings,
		headerPage,
		formCenterHelp,
		tableUploadImage,
		formMultiple,
		bankAccountTab,
		VueSixFour,
		VueTimepicker,
		configurationYape,
		configurationPlin,
		btnAddItem,
		modalItems,
		contentSelect,
		newAccountBankSlider,
	},
	computed: {
		addressBtnText,
		disabledSave,
		existCommerceAddress,
		flagBilling,
		showOrderProducts,
	},
	created,
	data,
	methods: {
		actionCancel,
		actionSuccess,
		addHelpSection,
		addRowsHelp,
		addSectionNameRowsHelp,
		assignBankSelected,
		buildHelperCenter,
		buildWayPayment,
		cancelForm,
		cancelModal,
		cancelProduct,
		closeDialog,
		closeModal,
		confirmDelete,
		createCenter,
		deleteHelpCenter,
		deletePaymentItem,
		deleteRow,
		detailCommerce,
		detailWayPaymet,
		exportPrices,
		filterData,
		getFile,
		getListCenter,
		goToEditWarehouse,
		importPrices,
		loadBankAccounts,
		loadData,
		loadSections,
		onClick,
		onSearch,
		onSelectedAll,
		openDialog,
		openEditCenter,
		openFormHelpCenter,
		openSlide,
		rowIsSelected,
		saveAndGetOut,
		saveCommerce,
		setAddressData,
		setCommerceData,
		setConfiguratedWayPayments,
		setContactData,
		setFlagGrouper,
		setGateway,
		setGatewayItem,
		setPaymentData,
		setPaymentDataValid,
		setRows,
		setRowsAssigned,
		setSalPriceId,
		setSocialNetworks,
		setSubsidiariesList,
		setTemplate,
		setTemplateAndTheme,
		setTheme,
		setWayPayment,
		showDialog,
		showDialogFavicon,
		showDialogPrices,
		showPaymentAlert,
		toggleActive,
		updateRowsHelp,
		daysInLetters,
		setDailyAttentionHours,
		setDailyAttentionHoursRange,
		setDailyAttentionHoursRangeFrom,
		changeToggleTime,
		validationWayPaymentRelated,
		changeOutOfAttention,
		clickItemPayment,
		changeConfigBilleters,
		changeSelectGateway,
		setDataCommerce,
		openModal,
		addSocialNetworks,
		deleteSocialNetworks,
		closeModalItems,
		addWarehouse,
		deleteWarehouses,
		changeWaypaymentRelated,
		deleteWaypaymentRelated,
		addWaypaymentRelated,
		openModalGateway,
		addGatewayConfiguration,
		deleteGatewayConfiguration,
		addBankAccount,
		deleteBankAccount,
		setDataBilleters,
		showOpenImage,
		showBilleters,
		openNewBank,
		updateBanks,
	},
	mixins: [upLoadImageMixin],
	props: {
		id: [Number, String],
	},
	validations,
	watch: {
		detailCenter,
	},
};
</script>

<style lang="scss" scoped>
.page-configuration {
	display: flex;
	flex-direction: row;
	width: 100%;
}

.container-image {
	width: 50%;
}

.text-support-image {
	color: map-get($colors, paginationText);
	font-family: map-get($fonts, open-regular);
	font-size: map-get($sizes, small11);
	margin: 4px 0 0 0;
}

.title-form {
	border-bottom: 1px solid color(subheader);
	color: color(background-sidebar);
	font-family: font(open-bold);
	font-size: size(medium16);
	margin-bottom: 21px;
	padding-bottom: 9px;
}

.wrapper-upload {
	align-items: flex-end;
	display: flex;
}

.w-100 {
	width: 100%;
}

.border-bottom {
	border-bottom: 1px solid map-get($colors, blue-grey);
}

.background-table {
	background-color: map-get($colors, white);
	border: 1px solid map-get($colors, border-tab);
	border-radius: 8px;
	overflow: hidden;
}

.title-center-help {
	color: map-get($colors, paginationText);
	font-family: map-get($fonts, lato-bold);
	font-size: map-get($sizes, medium16);
}

.modal-confirm-delete {
	border-radius: 9px;
	text-align: center;
}

.buttons-configuration {
	background-color: white;
	bottom: 0%;
	left: 0px;
	padding: 12px 0;
	position: fixed;
	right: 0px;
	width: 100%;
	z-index: 2;
}

.create-help-center {
	border-left: 1px solid #d3dde6;
}

.help-actions {
	width: 100px;
}

.payment-title {
	color: color(primary);
}

.config-button {
	background-color: color(info);
	border-radius: 13px;
	color: white;
	font-size: size(small11);
	height: 26px;
	width: 110px;
}

.title-container {
	display: flex;
}

.title-stepper {
	color: map-get($colors, background-sidebar);
	font-family: map-get($fonts, lato-bold);
	font-size: 16px;
	padding-bottom: 10px;
}

.link-green {
	color: color(primary);
	font-size: 13px;
	text-decoration: underline;
}

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

.address-caption,
.address-text {
	color: color(paginationText);
	font-family: font(open-regular);
}

.address-caption {
	color: color(brown-grey);
}

.payment-subtitle {
	border-bottom: 1px solid color(subheader);
	color: color(paginationText);
	font-family: font(open-bold);
	font-size: size(small13);
	padding-bottom: 6px;
	text-transform: uppercase;
}

.configuration-ecommerce {
	position: relative;
}

.btn-upload {
	align-items: center;
	background: color(primary);
	border-radius: 0 5px 5px 0;
	display: flex;
	justify-content: center;
	height: 27px;
	margin-top: 21px;
	width: 100%;
}

.text-hour {
	color: color(brown-grey);
	font-size: 13px;
}

.column-group {
	flex-direction: column;
}

.min-h-191 {
	min-height: calc(100vh - 191px);
}

.text-map-cation {
	color: color(paginationText);
	font-size: 13px;
	font-weight: 100;
}

.text-small {
	font-size: size(small10);
}

.pt-20 {
	padding-top: 18px;
}

.text-gray {
	color: color(paginationText);
	font-size: 12px;
}

.pr-5-rs {
	padding-right: 48px;

	@media (max-width: 760px) {
		padding: 0;
	}
}

.pl-5-rs {
	padding-left: 48px;

	@media (max-width: 760px) {
		padding: 0;
	}
}

.label-contact {
	color: color(brown-grey);
	font-family: font(open-regular);
	font-size: size(small13);
	margin-bottom: 1px;
}

.configuration-ecommerce .filter-select.input-group.shadow-inset.ma-0 {
	margin: 0px !important;
}

.title-billers {
	border-bottom: 1px solid color(subheader);
	color: color(primary);
	font-size: 13px;
	padding-bottom: 4px;
}
.numeric-order-style {
	color: color(primary);
	font-size: 13px;
}
</style>
