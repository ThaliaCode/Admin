<template>
	<div class="pb-5">
		<v-flex xs12>
			<v-alert :value="showModalDistribution" type="warning">
				Seleccione una Agencia de Transporte o Repartidor para generar una guía de
				remisión.
			</v-alert>
		</v-flex>
		<v-layout wrap px-3 mb-3 mt-2>
			<v-flex xs12>
				<label class="section-label">Datos de Guía</label>
			</v-flex>
			<v-flex xs4 pr-1>
				<app-input-text
					label="Nro de Serie"
					model="serie"
					:text="guide.serie"
					@input="setValue"
					:readonly="!!guide.serie"
				/>
			</v-flex>
			<v-flex xs4 pr-1>
				<app-input-text
					label="Nro de Guía"
					model="number"
					:text="guide.number"
					@input="setValue"
					:readonly="!!guide.number"
				/>
				<span class="form-group__message" v-if="$v.guide.number.$invalid">
					El número es requerido
				</span>
			</v-flex>
			<v-flex xs6 pr-1 pt-2>
				<app-date-mask
					id="departure-date"
					label="Fecha de Emisión"
					v-model="valueDepartureDate"
					readonly
					@format-date="setValue({ model: 'departureDate', value: $event })"
				/>
			</v-flex>
			<v-flex xs6 pl-1 pt-2>
				<app-date-mask
					id="arrival-date"
					label="Fecha de Traslado"
					v-model="valueArrivalDate"
					@format-date="setValue({ model: 'arrivalDate', value: $event })"
				/>
			</v-flex>
		</v-layout>
		<v-layout wrap px-3 mb-3 v-if="courier && !flagUseVehicleTransfer">
			<v-flex xs12>
				<label class="section-label">Datos del Repartidor</label>
			</v-flex>
			<v-flex xs6 pr-1>
				<label class="info-label"> Nombre: </label>
				<span class="info-label">{{ guide.driverName }}</span>
			</v-flex>
			<v-flex xs6 pl-1>
				<label class="info-label"> Teléfono: </label>
				<span class="info-label">{{ guide.driverCelphone }}</span>
			</v-flex>
			<v-flex xs6 pr-1 mt-2>
				<span class="info-label">
					<app-input-text
						label="Número de Licencia"
						model="driverLicense"
						:text="guide.driverLicense"
						@input="setValue"
						@keypress.native="preventSpecialChars"
					/>
				</span>
			</v-flex>
			<v-flex xs6 pl-1 mt-2>
				<autocomplete-component
					v-if="plates.length > 1"
					:items="plates"
					label-value="# Placa"
					local-search
					:item="guide.driverLicensePlate"
					@return-data="setValue({ model: 'driverLicensePlate', value: $event })"
				></autocomplete-component>
				<v-layout v-else>
					<v-flex pr-1>
						<app-select
							v-if="isEditPlate"
							:items="primaryVehicles"
							item-text="autocomplete"
							item-value="plate"
							place-holder="Número de Placa"
							:item="guide.driverLicensePlate"
							model="driverLicensePlate"
							label="Número de Placa"
							@input="setValue"
						></app-select>
						<app-input-text
							v-else
							label="Número de Placa"
							model="driverLicensePlate"
							:text="guide.driverLicensePlate"
							@input="setValue"
							@keypress.native="preventSpecialChars"
						/>
						<span
							class="form-group__message"
							v-if="!$v.guide.driverLicensePlate.required"
						>
							El número de placa es requerida
						</span>
					</v-flex>

					<app-tooltip-button
						color="primary"
						icon="edit"
						class="pt-4"
						:text="'Editar el número de placa'"
						@click-icon="changePlate"
					/>
				</v-layout>
			</v-flex>
			<v-flex xs6 pl-1 mt-2>
				<v-checkbox
					v-model="showSecondaryVehicle"
					label="Vehiculo Secundario"
				></v-checkbox>
			</v-flex>
			<v-flex xs6 pl-1 mt-2 v-if="showSecondaryVehicle">
				<autocomplete-component
					v-if="plates.length > 1"
					:items="plates"
					label-value="# Placa"
					local-search
					:item="guide.driverLicensePlateSecondary"
					@return-data="setValue({ model: 'driverLicensePlateSecondary', value: $event })"
				></autocomplete-component>
				<v-layout v-else>
					<v-flex pr-1>
						<app-select
							v-if="isEditPlateSecondary"
							:items="secondaryVehicles"
							item-text="autocomplete"
							item-value="plate"
							place-holder="Número de Placa"
							:item="guide.driverLicensePlateSecondary"
							model="driverLicensePlateSecondary"
							label="Número de Placa Secundaria"
							@input="setValue"
						></app-select>
						<app-input-text
							v-else
							label="Número de Placa Secundaria"
							model="driverLicensePlateSecondary"
							:text="guide.driverLicensePlateSecondary"
							@input="setValue"
						/>
						<span
							class="form-group__message"
							v-if="
								showSecondaryVehicle && !$v.guide.driverLicensePlateSecondary.required
							"
						>
							El número de placa secundaria es requerida
						</span>
					</v-flex>

					<app-tooltip-button
						color="primary"
						icon="edit"
						class="pt-4"
						:text="'Editar el número de placa secundaria'"
						@click-icon="changePlateSecondary"
					/>
				</v-layout>
			</v-flex>
			<v-flex xs6 pr-1 mt-2 v-if="showIsCarrier">
				<span class="info-label">
					<app-input-text
						label="Numero MTC"
						model="numberMtc"
						:text="guide.numberMtc"
						@input="setValue"
					/>
				</span>
			</v-flex>
		</v-layout>
		<v-layout wrap px-3 mb-3 v-else-if="flagUseVehicleTransfer">
			<v-flex xs12>
				<label class="section-label">Datos del Repartidor</label>
			</v-flex>
			<v-flex xs6 mt-2>
				<app-input-text
					label="Número de Placa"
					model="driverLicensePlate"
					:text="guide.driverLicensePlate"
					@input="setValue"
				/>
				<span class="form-group__message" v-if="!$v.guide.driverLicensePlate.required">
					El número de placa es requerida
				</span>
			</v-flex>
		</v-layout>
		<v-layout wrap px-3 align-end mb-3 v-if="transportAgency">
			<v-flex xs12>
				<label class="section-label">Datos de Agencia de Transporte</label>
			</v-flex>
			<v-flex xs6 pr-1 mb-2>
				<label class="info-label"> Nombre: </label>
				<span class="info-label">{{ guide.nameAgency }}</span>
			</v-flex>
			<v-flex xs6 pl-1 mb-2>
				<label class="info-label"> Teléfono: </label>
				<span class="info-label">{{ guide.phoneAgency }}</span>
			</v-flex>
			<v-flex xs6 pr-1>
				<label class="info-label"> Dirección: </label>
				<span class="info-label">{{ guide.addressAgency }}</span>
			</v-flex>
			<v-flex xs6 pl-1>
				<label class="info-label"> Contacto: </label>
				<span class="info-label">{{ guide.contactAgency }}</span>
			</v-flex>
			<v-flex xs6 mt-1>
				<label class="info-label"> Numero MTC: </label>
				<span class="info-label">{{ guide.numberMtc }}</span>
			</v-flex>
		</v-layout>
		<v-layout wrap px-3 mb-3>
			<v-flex xs6 pr-1 pt-2 v-if="noShowIsCarrier">
				<app-select
					item-text="name"
					item-value="id"
					label="Tipo de Transporte"
					:items="typeTransports"
					:item="guide.typeTransport"
					model="typeTransport"
					@input="setValue"
				/>
				<span class="form-group__message" v-if="showAlert">
					Es necesario cambiar el tipo de distribución.
				</span>
			</v-flex>
			<v-flex xs6 pl-1 pt-2 v-if="noShowIsCarrier">
				<app-select
					item-text="name"
					item-value="id"
					label="Motivo de Translado"
					:items="reasonTrans"
					model="reasonTran"
					:item="guide.reasonTran"
					@input="setValue"
				/>
				<span class="form-group__message" v-if="!$v.guide.reasonTran.required">
					Es necesario motivo de translado.
				</span>
			</v-flex>
		</v-layout>
		<v-layout wrap px-3 align-end mb-3 v-if="transportAgency && viewCourrierAndVehicle">
			<v-flex xs12>
				<label class="section-label">Repartidor y vehiculo</label>
			</v-flex>
			<v-flex xs6 pr-1>
				<app-select
					:item="guide.courierId"
					item-text="name"
					:items="transportAgency.couriers"
					item-value="id"
					label="Conductor"
					model="courierId"
					return-object
					@input="setValue"
				/>
			</v-flex>
			<v-flex xs6 pl-1>
				<app-select
					:item="guide.driverLicensePlate"
					item-text="plate"
					:items="platesOfTransport"
					item-value="plate"
					label="Vehiculo"
					model="driverLicensePlate"
					return-object
					@input="setValue"
				/>
			</v-flex>
		</v-layout>
		<v-layout wrap px-3 align-end mb-3 v-if="showIsCarrier">
			<v-flex xs12>
				<label class="section-label">Datos de Cliente Remitente</label>
			</v-flex>
			<v-flex xs6 pr-1>
				<app-input-text
					label="Rz. Social de Remitente"
					model="senderName"
					:text="guide.sender.senderName"
					@input="setValue"
				/>
			</v-flex>
			<v-flex xs6 pl-1>
				<app-input-text
					label="Nro. Documento de Remitente"
					model="senderDocument"
					:text="guide.sender.senderDocument"
					@input="setValue"
				/>
			</v-flex>
		</v-layout>
		<v-layout wrap px-3 mb-3 v-if="showIsCarrier">
			<v-flex xs12>
				<label class="section-label">Datos de Ruta Remitente</label>
			</v-flex>

			<v-flex xs6 pr-1 pt-2>
				<v-layout v-if="customDestinationsSender && customDestinationsSender.length">
					<v-flex xs11 pr-1>
						<app-select
							v-if="isEditSender"
							:item="guide.sender.destination"
							item-text="addressLine1"
							item-value="addressLine1"
							:items="customDestinationsSender"
							label="Dirección Remitente"
							model="destination"
							return-object
							@input="setValueSender"
						/>
						<app-input-text
							v-else
							label="Dirección Remitente"
							model="destination"
							:text="guide.sender.destination"
							@input="setValueSender"
						/>
					</v-flex>
					<app-tooltip-button
						color="primary"
						icon="edit"
						class="pt-4 pr-1"
						:text="'Editar la direccion de Remitente'"
						@click-icon="handleClickSender"
					/>
				</v-layout>

				<app-input-text
					v-else
					label="Dirección Remitente"
					model="destination"
					:text="guide.sender.destination"
					@input="setValueSender"
				/>

				<span class="form-group__message" v-if="!guide.sender.destination">
					El dirección remitente es requerida
				</span>
			</v-flex>
			<v-flex xs6 pr-1 pt-2>
				<app-select
					item-text="name"
					item-value="id"
					label="Departamento"
					:items="departments"
					:item="guide.sender.departmentId"
					model="departmentId"
					@input="setValueUbigeoSender"
				/>
				<span class="form-group__message" v-if="!guide.sender.departmentId">
					El Departamento es requerida
				</span>
			</v-flex>
			<v-flex xs6 pr-1 pt-2>
				<app-select
					item-text="name"
					item-value="id"
					label="Provincia"
					:items="provincesSender"
					:item="guide.sender.provinceId"
					model="provinceId"
					@input="setValueUbigeoSender"
				/>
				<span class="form-group__message" v-if="!guide.sender.provinceId">
					La Provincia es requerida
				</span>
			</v-flex>
			<v-flex xs6 pr-1 pt-2>
				<app-select
					item-text="name"
					item-value="id"
					label="Distrito"
					:items="districsSender"
					:item="guide.sender.districtId"
					model="districtId"
					@input="setValueUbigeoSender"
				/>
				<span class="form-group__message" v-if="!guide.sender.districtId">
					El Distrito es requerida
				</span>
			</v-flex>
		</v-layout>

		<v-layout wrap px-3 align-end mb-3>
			<v-flex xs12>
				<label class="section-label">{{
					showIsCarrier ? 'Datos de Cliente del Destino' : 'Datos de Cliente'
				}}</label>
			</v-flex>
			<v-flex xs6 pr-1>
				<app-input-text
					label="Rz. Social de Destinatario"
					model="rzSocialAddressee"
					:text="guide.rzSocialAddressee"
					@input="setValue"
					:readonly="Boolean(id)"
				/>
				<span class="form-group__message" v-if="!$v.guide.rzSocialAddressee.required">
					La razón social es requerida
				</span>
			</v-flex>
			<v-flex xs6 pl-1>
				<app-input-text
					label="Nro. Documento de Destinatario"
					model="recipientDocument"
					:text="guide.recipientDocument"
					@input="setValue"
					:readonly="Boolean(id)"
				/>
				<span class="form-group__message" v-if="!$v.guide.recipientDocument.required">
					El número de documento es requerido
				</span>
			</v-flex>
		</v-layout>
		<v-layout
			wrap
			px-3
			align-end
			mb-3
			v-if="guide.documentAttention || guide.nameAttention || guide.phoneAttention"
		>
			<v-flex xs12>
				<label class="section-label">Datos de Atención</label>
			</v-flex>
			<v-flex xs6 pr-1>
				<app-input-text
					label="DNI de Atención"
					model="documentAttention"
					:text="guide.documentAttention"
					@input="setValue"
				/>
			</v-flex>
			<v-flex xs6 pr-1>
				<app-input-text
					label="Nombre de Atención"
					model="nameAttention"
					:text="guide.nameAttention"
					@input="setValue"
				/>
			</v-flex>
			<v-flex xs6 pr-1 pt-2>
				<app-input-text
					label="Teléfono de Atención"
					model="phoneAttention"
					:text="guide.phoneAttention"
					@input="setValue"
				/>
			</v-flex>
		</v-layout>
		<v-layout wrap px-3 mb-3>
			<v-flex xs12>
				<label class="section-label">{{
					showIsCarrier ? 'Datos de Ruta del Destino' : 'Datos de Ruta'
				}}</label>
			</v-flex>

			<v-flex xs6 pr-1 pt-2>
				<v-layout v-if="shouldShowSelect">
					<v-flex xs11 pr-1>
						<app-select
							v-if="isEdit"
							:item="guide.destination"
							item-text="addressLine1"
							item-value="addressLine1"
							:items="customerDestinations"
							:label="labelDestination"
							model="destination"
							return-object
							@input="setValue"
						/>
						<app-input-text
							v-else
							:label="labelDestination"
							model="destination"
							:text="guide.destination"
							@input="setValue"
						/>
					</v-flex>
					<app-tooltip-button
						color="primary"
						icon="edit"
						class="pt-4 pr-1"
						:text="'Editar la direccion de destino'"
						@click-icon="handleClick"
					/>
				</v-layout>

				<app-input-text
					v-else
					:label="labelDestination"
					model="destination"
					:text="guide.destination"
					@input="setValue"
				/>
				<span class="form-group__message" v-if="!$v.guide.destination.required">
					El dirección de destino es requerida
				</span>
			</v-flex>
			<v-flex xs6 pr-1 pt-2>
				<app-select
					item-text="name"
					item-value="id"
					label="Departamento"
					:items="departments"
					:item="guide.departmentId"
					model="departmentId"
					@input="setValueUbigeo"
				/>
				<span class="form-group__message" v-if="!$v.guide.departmentId.required">
					El departamento es requerido
				</span>
			</v-flex>
			<v-flex xs6 pr-1 pt-2>
				<app-select
					item-text="name"
					item-value="id"
					label="Provincia"
					:items="provinces"
					:item="guide.provinceId"
					model="provinceId"
					@input="setValueUbigeo"
				/>
				<span class="form-group__message" v-if="!$v.guide.provinceId.required">
					La provincia es requerida
				</span>
			</v-flex>
			<v-flex xs6 pr-1 pt-2>
				<app-select
					item-text="name"
					item-value="id"
					label="Distrito"
					:items="districs"
					:item="guide.districtId"
					model="districtId"
					@input="setValueUbigeo"
				/>
				<span class="form-group__message" v-if="!$v.guide.districtId.required">
					El distrito es requerido
				</span>
			</v-flex>
		</v-layout>
		<!-- ------------------------------------------------- -->
		<v-layout wrap px-3 mb-3>
			<v-flex xs12>
				<label class="section-label">Datos de Traslado</label>
			</v-flex>
			<v-flex xs6 pl-1 pt-2 v-if="noShowIsCarrier">
				<app-input-text
					:label="labelOrigin"
					model="originAddress"
					:text="guide.originAddress"
					@input="setValue"
				/>
				<span class="form-group__message" v-if="!$v.guide.originAddress.required">
					El dirección de origen es requerida
				</span>
			</v-flex>
			<v-flex xs6 pl-1 pt-2 v-if="isReasonPurchase">
				<app-select
					item-text="name"
					item-value="id"
					label="Departamento"
					:items="departments"
					:item="guide.sender.departmentId"
					model="departmentId"
					@input="setValueUbigeoSender"
				/>
				<span class="form-group__message" v-if="!guide.sender.departmentId">
					El Departamento es requerida
				</span>
			</v-flex>
			<v-flex xs6 pl-1 pt-2 v-if="isReasonPurchase">
				<app-select
					item-text="name"
					item-value="id"
					label="Provincia"
					:items="provincesSender"
					:item="guide.sender.provinceId"
					model="provinceId"
					@input="setValueUbigeoSender"
				/>
				<span class="form-group__message" v-if="!guide.sender.provinceId">
					La Provincia es requerida
				</span>
			</v-flex>
			<v-flex xs6 pl-1 pt-2 v-if="isReasonPurchase">
				<app-select
					item-text="name"
					item-value="id"
					label="Distrito"
					:items="districsSender"
					:item="guide.sender.districtId"
					model="districtId"
					@input="setValueUbigeoSender"
				/>
				<span class="form-group__message" v-if="!guide.sender.districtId">
					El Distrito es requerida
				</span>
			</v-flex>
			<v-flex xs6 pl-1 pt-2 v-if="noShowIsCarrier">
				<app-input-text
					label="Ruta"
					model="route"
					:text="guide.route"
					@input="setValue"
				/>
			</v-flex>
			<v-flex xs6 pl-1 pt-2>
				<app-input-text
					label="Cod. Establecimiento"
					model="establishmentCode"
					:text="guide.establishmentCode"
					@input="setValue"
				/>
			</v-flex>
			<v-flex xs6 pl-1 pt-2>
				<app-input-text
					label="Orden de compra"
					model="purchaseOrder"
					:text="guide.purchaseOrder"
					@input="setValue"
				/>
			</v-flex>
			<template>
				<v-flex xs12 pl-1 pt-2>
					<app-input-text
						label="Observación"
						model="reason"
						:text="guide.reason"
						textarea
						textarea-class
						:max-length="250"
						@input="setValue"
					/>
					<span class="form-group__message" v-if="!$v.guide.reason.required">
						El motivo es requerido
					</span>
				</v-flex>
			</template>
			<template>
				<v-flex xs12 pl-1 pt-2>
					<v-checkbox
						class="section-label"
						color="accent"
						label="Agregar información de traslado"
						hide-details
						v-model="showTransferInfo"
						@change="onTransferInfo"
					></v-checkbox>
				</v-flex>
				<v-flex xs12 pl-1 pt-1 v-if="showTransferInfo">
					<app-input-text
						label="Información de traslado"
						model="descriptionTransfer"
						:text="guide.descriptionTransfer"
						textarea
						textarea-class
						@input="setValue"
					/>
				</v-flex>
			</template>
		</v-layout>
		<v-layout wrap px-3 mb-3 v-if="showIsCarrier">
			<v-flex xs12>
				<v-checkbox
					class="section-label"
					color="accent"
					label="Agregar pagador del flete"
					hide-details
					v-model="showFreightCust"
					@change="onFreightCustChange"
				></v-checkbox>
			</v-flex>
			<template v-if="showFreightCust">
				<v-flex xs6 mt-2 pr-1>
					<app-select
						:item="guide.freight.freightType"
						item-text="name"
						item-value="code"
						:items="typesFreight"
						label="Pagador del Flete"
						model="freightType"
						return-object
						@input="setCustomer"
					/>
					<span class="form-group__message" v-if="!guide.freight.freightType">
						El Pagador del Flete es requerida
					</span>
				</v-flex>
				<v-flex xs6 mt-2 pr-1>
					<label class="caption">Nombre y/o Razón Social</label>
					<autocomplete-component
						customer
						return-object
						custom-search
						append-icon="search"
						class="custom-autocomplete custom-autocomplete-search"
						http-code="$httpSales"
						id="search-supplier"
						:item="customerFreight"
						item-text="autocomplete"
						item-value="id"
						:items="customers"
						placeholder-value="Cliente"
						resource-url="customers"
						@return-data="setCustomer"
					/>
					<span class="form-group__message" v-if="!guide.freight.customerId">
						El Nombre y/o Razón Social es requerida
					</span>
				</v-flex>
			</template>
		</v-layout>
		<v-layout wrap px-3 mb-3>
			<v-flex xs12>
				<label class="section-label">Datos de Bienes por Transportar</label>
			</v-flex>
			<v-flex xs6 pl-1 pt-2>
				<app-input-text
					label="Peso (Kg)"
					model="weight"
					type="number"
					:text="guide.weight"
					@input="setValue"
				/>
				<span class="form-group__message" v-if="!isValidWeight">
					El peso es requerido
				</span>
			</v-flex>
			<template>
				<v-flex xs6 pl-1 pt-2>
					<app-input-text
						label="Nro. de Cajas"
						model="numberBoxs"
						:text="guide.numberBoxs"
						@input="setValue"
					/>
				</v-flex>
			</template>
		</v-layout>
		<template v-if="showIsCarrier">
			<v-layout wrap px-3>
				<v-flex xs12>
					<label class="section-label">Documentos relacionados</label>
				</v-flex>
			</v-layout>

			<additional-data
				is-related-docs
				:data-added="guide.additionalInformation"
				:info="info"
				@add-data="addData"
				@remove-data="removeData"
				@set-data="setValue"
			/>
		</template>
		<template
			v-else-if="guide.additionalInformation && guide.additionalInformation.length"
		>
			<v-layout wrap px-3>
				<v-flex xs12>
					<label class="section-label">Documentos relacionados</label>
				</v-flex>
			</v-layout>

			<v-flex
				xs11
				px-3
				v-for="(additionalInfo, index) in guide.additionalInformation"
				:key="index"
			>
				<additional-data-field
					:additional-data="additionalInfo"
					@remove-data="removeData(index)"
				/>
			</v-flex>
		</template>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="
					disabled ||
					isLoading ||
					showValidNumber ||
					showAlert ||
					!isValidWeight ||
					isCarrierDetail ||
					isFreight
				"
				@cancel-button-clicked="close"
				@accept-button-clicked="save"
			/>
		</section>
		<app-show-dialog
			:text-content="notification.text"
			:title-header="notification.title"
			:color-hex="notification.colorHex"
			:color-dialog="notification.colorDialog"
			:show-modal-init="notification.show"
			@close-dialog="closeNotification"
		/>
	</div>
</template>

<script>
import { format, isAfter } from 'date-fns';
import TypeGuides from '@/shared/type-guides';
import appShowDialog from '@/components/shared/app-show-dialog';
import { requiredIf } from 'vuelidate/lib/validators';
import additionalData from './additional-data/additional-data';
import autocompleteComponent from './../shared/autocomplete/autocomplete-component';
import modalSidebarButton from './../shared/utils/modal-sidebar-button';
import additionalDataField from './additional-data/additional-data-field';

async function created() {
	await this.loadDepartament();
	this.showIsCarrier = this.$route.name === 'reference-guide-carrier-detail';
	this.noShowIsCarrier = this.$route.name !== 'reference-guide-carrier-detail';
	await this.loadData();
	if (!this.id) {
		if (!this.serieIdPoint) {
			this.loadGuideNumber();
		}
		this.valueDepartureDate = format(this.$today(), 'DD-MM-YYYY');
		this.valueArrivalDate = format(this.$today(), 'DD-MM-YYYY');
	}
	if (!this.id) {
		this.guide.rzSocialAddressee =
			this.customer && this.customer.typePerson
				? this.customer.typePerson.fullName
				: null;
	}
	if (!this.guide.recipientDocument) {
		this.guide.recipientDocument =
			this.customer && this.customer.typePerson
				? this.customer.typePerson.documentNumber
				: null;
	}

	if (
		this.guideData.additionalData.freight &&
		this.guideData.additionalData.freight.customerId
	) {
		this.guide.freight = this.guideData.additionalData.freight;
		this.loadCustomerFreight(this.guideData.additionalData.freight);
		this.showFreightCust = true;
	}
	//	this.showGuideBilling =
	//	this.$userInfo.company.settings.flagElectronicGuide || false;
	if (!this.id) {
		this.guide.typeTransportName =
			this.guide.typeDistribution === 1
				? this.typeTransports[1].name
				: this.typeTransports[0].name;
		this.guide.typeTransport =
			this.guide.typeDistribution === 1
				? this.typeTransports[1].id
				: this.typeTransports[0].id;
	}
	if (!this.id && !this.$route.params.saleId) {
		this.guide.originAddress = this.$userInfo.subsidiary.address;
	}
	this.isEditPlate = this.vehicles.some((v) => v.plate === this.guide.driverLicensePlate);
	this.isEditPlateSecondary = this.vehicles.some(
		(v) => v.plate === this.guide.driverLicensePlateSecondary
	);
	this.isEdit = this.customerDestinations.some(
		(v) => v.addressLine1 === this.guide.destination
	);
}

async function loadDepartament() {
	try {
		({ data: this.departments } = await this.$httpSales.get('province'));
		if (this.guide.departmentId) {
			this.loadProvince(this.guide.departmentId);
		}

		if (this.guide.sender && this.guide.sender.departmentId) {
			this.loadProvinceSender(this.guide.sender.departmentId);
		}
	} catch (e) {
		this.showGenericError();
	}
}

async function loadProvince(id) {
	try {
		const response = await this.$httpSales(`cities/${id}`);
		this.provinces = [...response.data];
		if (this.guide.provinceId) {
			this.guide.provinceName = this.findNameById(this.provinces, this.guide.provinceId);
			await this.loadDistrict(this.guide.provinceId);
		}

		if (this.guide.sender.provinceId) {
			this.guide.sender.provinceName = this.findNameById(
				this.provincesSender,
				this.guide.sender.provinceId
			);
		}
		if (!this.guide.sender.provinceName) {
			this.guide.sender.provinceName = this.findNameById(
				this.provinces,
				this.guide.sender.provinceId
			);
		}
	} catch (error) {
		this.showGenericError();
	}
}

async function loadDistrict(id) {
	try {
		const response = await this.$httpSales(`parish/${id}`);
		this.districs = [...response.data];
		if (this.guide.districtId) {
			const district = this.districs.find((d) => d.id === this.guide.districtId);
			this.guide.ubigeoStart = district && district.code;
			this.guide.districtName = this.findNameById(this.districs, this.guide.districtId);
			if (this.noShowIsCarrier) {
				this.guide.sender.ubigeo = district && district.code;
				this.guide.ubigeoEnd = district && district.code;
			}
		}
		if (this.guide.sender.districtId) {
			this.guide.sender.districtName = this.findNameById(
				this.districsSender,
				this.guide.sender.districtId
			);
		}
		if (!this.guide.sender.districtName) {
			this.guide.sender.districtName = this.findNameById(
				this.districs,
				this.guide.sender.districtId
			);
		}
	} catch (error) {
		this.showGenericError();
	} finally {
		this.showNotificationK = false;
	}
}

function addData() {
	if (this.info) {
		if (this.guide.additionalInformation.length < 15) {
			this.guide.additionalInformation.push(this.info);
			this.info = '';
		} else {
			this.showGenericError('Solo se pueden agregar 15 documentos relacionados.');
		}
	}
}

function setValueUbigeo({ model, value }) {
	if (value) {
		if (model === 'departmentId' && value.id) {
			this.guide[model] = value.id;
			this.guide.departmentName = value.name;
			this.guide.provinceId = null;
			this.guide.provinceName = null;
			this.guide.districtId = null;
			this.guide.districtName = null;
			this.guide.districtCode = null;
			// this.setValueUbigeoSender({ model, value }, false);
			if (this.noShowIsCarrier) {
				this.guide.sender.departmentId = value.id;
				this.guide.sender.departmentName = value.name;
			}
			this.loadProvince(value.id);
		} else if (model === 'provinceId' && value.id) {
			this.guide[model] = value.id;
			this.guide.provinceName = value.name;
			this.guide.districtId = null;
			this.guide.districtName = null;
			this.guide.districtCode = null;
			// this.setValueUbigeoSender({ model, value }, false);
			if (this.noShowIsCarrier) {
				this.guide.sender.provinceId = value.id;
				this.guide.sender.provinceName = value.name;
			}
			this.loadDistrict(value.id);
		} else if (model === 'districtId') {
			this.guide[model] = value.id;
			this.guide.districtName = value.name;
			this.guide.districtCode = value.code;
			//this.guide.ubigeoStart = value.code;
			this.guide.ubigeoEnd = value.code;
			if (this.noShowIsCarrier) {
				this.guide.sender.districtId = value.id;
				this.guide.sender.districtName = value.name;
				this.guide.sender.ubigeo = value.code;
			}
			// if (this.noShowIsCarrier) {
			// this.setValueUbigeoSender({ model, value }, false);
			// }
		}
	}
}

function cleanForm() {
	this.guide = {
		additionalInformation: [],
		arrivalDate: null,
		courierId: 0,
		departureDate: null,
		destination: '',
		department: null,
		district: null,
		province: null,
		details: [],
		driverCelphone: '',
		driverLicensePlate: null,
		driverLicensePlateSecondary: null,
		driverName: '',
		establishmentCode: '',
		number: null,
		numberBoxs: 0,
		observation: '',
		originAddress: '',
		reason: '',
		descriptionTransfer: '',
		reasonTran: null,
		recipientDocument: '',
		route: '',
		rzSocialAddressee: '',
		typeTransport: null,
		weight: 0,
	};
}

function close() {
	this.$emit('close');
	this.cleanForm();
}

function disabled() {
	return this.$v.guide.$invalid;
}

function disabledBilling() {
	if (this.typeBilling === 1) {
		if (!this.courier || !this.transportAgency) {
			return false;
		}
	}
	return false;
}

async function loadData() {
	try {
		const { guideData, courier, transportAgency, customerDestinations, noShowIsCarrier } =
			this;
		if (!guideData) return;
		// 1. Initial configuration
		this.plates = courier && courier.plates ? [...courier.plates] : [];
		this.guide.additionalInformation = [...(guideData.additionalInformation || [])];
		this.guide.details = [...(guideData.details || [])];
		this.guide.typeDocument = guideData.typeDocument || this.guide.typeDocument;
		this.showSecondaryVehicle =
			guideData.additionalData.driverLicensePlateSecondary &&
			guideData.additionalData.driverLicensePlateSecondary !== 'undefined';

		this.isReasonPurchase = guideData.additionalData.reasonsTransfer === '02';
		this.labelOrigin = this.isReasonPurchase
			? 'Dirección de Llegada'
			: 'Dirección Origen';
		this.labelDestination = this.isReasonPurchase
			? 'Dirección de Partida'
			: 'Dirección Destino';

		Object.assign(this.guide, {
			arrivalDate: guideData.arrivalDate,
			courierId: guideData.courierId,
			departureDate: guideData.departureDate,
			establishmentCode: guideData.establishmentCode,
			purchaseOrder: guideData.purchaseOrder || (guideData.externalData && guideData.externalData.purchaseOrder) || (guideData.additionalData && guideData.additionalData.purchaseDocument) || '',
			number: guideData.number || this.guide.number,
			serie: guideData.serie || this.guide.serie,
			observation: guideData.observation,
			originAddress: guideData.originAddress,
			reason: guideData.reason,
			route: guideData.route,
			numberBoxs: guideData.numberBoxs || 0,
			numberMtc: guideData.numberMtc,
			groupUbigeoName: guideData.groupUbigeoName,
		});

		// 2. Client & Destination Data
		const dataClient = guideData.dataClient || {};
		const clientGuideData = dataClient.guideData || {};
		const deliveryAddr =
			dataClient.deliveryAddress || (clientGuideData && clientGuideData.deliveryAddress);

		const initialDestination =
			deliveryAddr && deliveryAddr.value ? deliveryAddr.value : guideData.destination;
		this.guide.destination = initialDestination;
		this.initialDestination = initialDestination;

		if (noShowIsCarrier && this.guide.sender) {
			this.guide.sender.destination = this.guide.destination;
		}
		// 3. Address Lookup
		let matchedAddress = customerDestinations.find(
			(v) => v.addressLine1 === this.guide.destination
		);
		if (!matchedAddress) {
			const sender =
				(guideData.additionalData && guideData.additionalData.sender) ||
				(this.guide.sender && this.guide.sender.provinceId && this.guide.sender) ||
				guideData.additionalData;
			if (sender.departmentId || sender.provinceId || sender.districtId) {
				matchedAddress = {
					addressLine1: this.guide.destination,
					provinceId: sender.departmentId,
					cityId: sender.provinceId,
					parishId: sender.districtId,
					province: { name: sender.departmentName },
					city: { name: sender.provinceName },
					parish: { name: sender.districtName },
				};
			}
		}
		if (matchedAddress) {
			this.setValue({ model: 'destination', value: matchedAddress });
		}

		// 4. Sender Information Logic
		if (this.customerSender) {
			const tp = this.customerSender.typePerson || {};
			Object.assign(this.guide.sender, {
				documentName: tp.documentName || null,
				senderName: tp.fullName || null,
				senderDocument: tp.documentNumber || null,
			});
		} else if (guideData.additionalData && guideData.additionalData.sender) {
			this.guide.sender = { ...guideData.additionalData.sender };
			if (!noShowIsCarrier || this.isReasonPurchase) {
				this.loadProvinceSender(this.guide.sender.departmentId);
			}
		}
		const defaultCustomerDestinationSender =
			this.customDestinationsSender.length && this.customDestinationsSender[0];
		if (defaultCustomerDestinationSender) {
			this.setValueSender({
				model: 'destination',
				value: defaultCustomerDestinationSender,
			});
		}

		// 5. Driver & Agency Information
		this.guide.driverCelphone = courier ? courier.phone : null;
		const courierLicense = courier ? courier.licence : null;
		this.guide.driverLicense = guideData.driverLicense || courierLicense;
		this.guide.driverLicensePlate =
			courier && courier.vehicle ? courier.vehicle.plate : guideData.driverLicensePlate;
		this.guide.driverLicensePlateSecondary =
			courier && courier.vehicleSecondary
				? courier.vehicleSecondary.plate
				: guideData.additionalData.driverLicensePlateSecondary;
		const agencyInfo = transportAgency?.additionalInformation || {};
		const addressAgency =
			(transportAgency && transportAgency.mainAddress) ||
			(transportAgency &&
				transportAgency.addresses[0] &&
				transportAgency.addresses[0].direction);

		const numberMtc = agencyInfo?.numberMtc || this.guide.numberMtc || null;
		Object.assign(this.guide, {
			driverName: courier ? courier.name : guideData.driverName || null,
			nameAgency: transportAgency ? transportAgency.name : null,
			phoneAgency: transportAgency ? transportAgency.phone : null,
			addressAgency,
			contactAgency: transportAgency ? transportAgency.contact : null,
			numberMtc,
			numberLicenceAgency: agencyInfo.numberMtc || '',
		});

		// 6. Ubigeo & Transfer Details
		const addInfo = guideData.additionalData || {};
		this.showTransferInfo = !!addInfo.descriptionTransfer;
		this.guide.descriptionTransfer = addInfo.descriptionTransfer;
		this.guide.districtCode = addInfo.ubigeoEnd;
		this.flagUseVehicleTransfer = this.flagVehicTrans;

		const fallbackDept =
			(clientGuideData.departament && clientGuideData.departament.value) || {};
		const fallbackProv =
			(clientGuideData.province && clientGuideData.province.value) || {};
		const fallbackDist =
			(clientGuideData.district && clientGuideData.district.value) || {};

		this.guide.departmentId =
			this.guide.departmentId ||
			guideData.departmentId ||
			guideData.department ||
			fallbackDept.id ||
			null;
		this.guide.departmentName =
			this.guide.departmentName || guideData.departmentName || fallbackDept.name || null;

		this.guide.provinceId =
			this.guide.provinceId ||
			guideData.provinceId ||
			guideData.province ||
			fallbackProv.id ||
			null;
		this.guide.provinceName =
			this.guide.provinceName || guideData.provinceName || fallbackProv.name || null;

		this.guide.districtId =
			this.guide.districtId ||
			guideData.districtId ||
			guideData.district ||
			fallbackDist.id ||
			null;
		this.guide.districtName =
			this.guide.districtName || guideData.districtName || fallbackDist.name || null;

		// 7. Attention & Contact Details
		const attenPhone =
			(clientGuideData.attentionPhone && clientGuideData.attentionPhone.value) || null;
		const attenName =
			(clientGuideData.attentionName && clientGuideData.attentionName.value) || null;
		const attenDni =
			(clientGuideData.attentionDni && clientGuideData.attentionDni.value) || null;

		Object.assign(this.guide, {
			phoneAttention: guideData.phoneAttention || attenPhone || null,
			nameAttention: guideData.nameAttention || attenName || null,
			documentAttention: guideData.documentAttention || attenDni || null,
		});

		// 8. Billing & Transport Subsidiary
		this.typeBilling = this.validatedBilling(guideData);
		this.guide.typeDistribution = this.typeDistribution;

		Object.assign(this.guide, {
			typeTransportName: addInfo.transferModalityName || '',
			reasonTranName: addInfo.reasonsTransferName || '',
			typeTransport: addInfo.transferModality || '',
			reasonTran: addInfo.reasonsTransfer || '',
		});

		const subsidiary =
			this.subsidiaries.find((s) => s.id === this.$userInfo.comSubsidiariesId) || {};
		this.guide.numberMtc =
			addInfo.numberMtc ||
			(subsidiary.settings && subsidiary.settings.numberMtc) ||
			this.guide.numberMtc;

		// 9. Weight & Recipient Data
		this.guide.weight =
			addInfo.weight || (guideData.weigth ? parseFloat(guideData.weigth.toFixed(2)) : 0);

		const dataFac = dataClient.dataFac || {};
		this.guide.recipientDocument =
			(dataFac.documentNumber && dataFac.documentNumber.value) ||
			guideData.recipientDocument;
		this.guide.rzSocialAddressee =
			(dataFac.rzSocial && dataFac.rzSocial.value) || guideData.rzSocialAddressee;

		// 10. Dates & Final logic
		const depDate = new Date(guideData.departureDate);
		this.valueDepartureDate = guideData.departureDate
			? `${String(depDate.getUTCDate()).padStart(2, '0')}/${String(
					depDate.getUTCMonth() + 1
			  ).padStart(2, '0')}/${depDate.getUTCFullYear()}`
			: '';

		const arrDate = new Date(guideData.arrivalDate);
		this.valueArrivalDate = `${String(arrDate.getUTCDate()).padStart(2, '0')}/${String(
			arrDate.getUTCMonth() + 1
		).padStart(2, '0')}/${arrDate.getUTCFullYear()}`;

		this.showModalDistribution =
			this.typeBilling === 1
				? !(
						(courier && courier.id) ||
						(transportAgency && transportAgency.id) ||
						this.flagUseVehicleTransfer
				  )
				: false;

		if (this.id) {
			this.guide.number = guideData.number;
			this.guide.ubigeoStart = addInfo.ubigeoStart;
		}
		
		// Forzar la descarga de provincias y distritos para que los combos no salgan vacíos
		if (this.guide.departmentId) {
			this.loadProvince(this.guide.departmentId);
		}
		if (this.guide.sender && this.guide.sender.departmentId) {
			this.loadProvinceSender(this.guide.sender.departmentId);
		}
	} catch (error) {
		console.error(error);
		this.showGenericError();
	}
}

function validatedBilling(guide) {
	if (this.$route.params.saleId) {
		return guide.salSerie.typeBilling;
	} else if (this.$route.params.id) {
		return guide.salSerie && guide.salSerie.typeBilling;
	}
	return 0;
}

function removeData(dataIndex) {
	this.guide.additionalInformation.splice(dataIndex, 1);
}

function save() {
	let createdDate = null;

	if (this.id) {
		createdDate = this.guideData.createdAt?.substr(0, 10);
	}

	const arrival = this.guide.arrivalDate?.substr(0, 10);

	if (this.id && createdDate > arrival) {
		this.showGenericError(
			`La fecha de traslado no puede ser anterior a la fecha de creación (${format(
				this.guideData.createdAt,
				'DD-MM-YYYY'
			)})`
		);
		return;
	}

	if (
		!this.id &&
		isAfter(
			new Date(format(this.guide.departureDate, 'YYYY-MM-DD')),
			new Date(format(this.guide.arrivalDate, 'YYYY-MM-DD'))
		)
	) {
		this.showGenericError(
			`La fecha de traslado no puede ser anterior a la fecha de emisión(${format(
				this.guide.departureDate,
				'DD-MM-YYYY'
			)})`
		);
		return;
	}
	if (this.guide.reasonTran !== '18' && 
		(this.guide.originAddress.replace(/\s+/g, '') ===
		this.guide.destination.replace(/\s+/g, ''))
	) {
		this.showGenericError(
			`La ${this.labelOrigin} y ${this.labelDestination} no pueden ser las mismas direcciones.`
		);
		return;
	}
	this.$emit('save', this.guide, this.isReasonPurchase);
}

async function setValue({ model, value }) {
	if (model === 'info') {
		this[model] = value;
	} else if (model === 'driverLicensePlate') {
		if (this.guide.typeDistribution === 2) {
			if (value) {
				this.guide.driverLicensePlate = value.plate || value;
			}
		} else {
			this.guide[model] = value.plate || value;
			// const showValid = /^[0-9A-Z]+$/gi.test(value);
			// this.showValidNumber = !showValid;
			// if (this.showValidNumber) {
			// 	this.showGenericError('Solamente se permite digitos alfanumericos');
			// }
		}
	} else if (model === 'driverLicensePlateSecondary') {
		this.guide[model] = value.plate || value;
	} else if (model === 'typeTransport') {
		this.showAlert = this.typeDistribution !== value.number;
		this.guide[model] = value ? value.id : '';
		this.guide.typeTransportName = value ? value.name : '';
	} else if (model === 'reasonTran') {
		this.guide[model] = value ? value.id : '';
		this.guide.reasonTranName = value ? value.name : '';
		this.isReasonPurchase = value && value.id === '02';
		this.labelOrigin = this.isReasonPurchase
			? 'Dirección de Llegada'
			: 'Dirección Origen';
		this.labelDestination = this.isReasonPurchase
			? 'Dirección de Partida'
			: 'Dirección Destino';
		if (this.isReasonPurchase && this.guide.sender && this.guide.sender.departmentId) {
			this.loadProvinceSender(this.guide.sender.departmentId);
		}
	} else if (model === 'destination') {
		this.guide[model] = value && value.addressLine1 ? value.addressLine1 : value;
		if (this.noShowIsCarrier) {
			const {
				province = {},
				city = {},
				parish = {},
				provinceId,
				cityId,
				parishId,
			} = value;
			if (!this.isReasonPurchase) {
				this.guide.sender.destination =
					value && value.addressLine1 ? value.addressLine1 : value;
				this.guide.sender.departmentId = province?.id || provinceId;
				this.guide.sender.departmentName = province?.name;
				this.guide.sender.provinceId = city?.id || cityId;
				this.guide.sender.provinceName = city?.name;
				this.guide.sender.districtId = parish?.id || parishId;
				this.guide.sender.districtName = parish?.name;
			}
			this.guide.departmentId = province?.id || provinceId;
			this.guide.departmentName = province?.name;
			this.guide.provinceId = city?.id || cityId;
			this.guide.provinceName = city?.name;
			this.guide.districtId = parish?.id || parishId;
			this.guide.districtName = parish?.name;

			if ((province && province.id) || provinceId) {
				await this.loadProvince((province && province.id) || provinceId);
			}
			if ((city && city.id) || cityId) {
				await this.loadDistrict((city && city.id) || cityId);
			}

			if (!this.guide.sender.departmentName || this.isReasonPurchase) {
				this.guide.sender.departmentName = this.findNameById(
					this.departments,
					this.guide.sender.departmentId
				);
			}
			if (!this.guide.departmentName) {
				this.guide.departmentName = this.findNameById(
					this.departments,
					this.guide.departmentId
				);
			}
		} else {
			const {
				province = {},
				city = {},
				parish = {},
				provinceId,
				cityId,
				parishId,
			} = value;
			this.guide.departmentId = province?.id || provinceId;
			this.guide.departmentName = province?.name;
			this.guide.provinceId = city?.id || cityId;
			this.guide.provinceName = city?.name;
			this.guide.districtId = parish?.id || parishId;
			this.guide.districtName = parish?.name;
			if (province?.id || provinceId) {
				await this.loadProvince(province?.id || provinceId);
			}
			if (city?.id || cityId) {
				await this.loadDistrict(city?.id || cityId);
			}

			if (!this.guide.departmentName) {
				this.guide.departmentName = this.findNameById(
					this.departments,
					this.guide.departmentId
				);
			}
		}
	} else if (model === 'courierId') {
		this.guide.courierId = value ? value.id : '';
		this.guide.driverLicense = value ? value.license : '';
		this.guide.driverName = value ? value.name : '';
		// } else if (model === 'driverLicensePlate') {
		// 	this.guide.driverLicensePlate = value ? value.id : '';
	} else {
		this.guide[model] = value;
	}
}

function preventSpecialChars(event) {
	if (event.key.length > 1) return;
	const regex = /^[a-zA-Z0-9]+$/;
	if (!regex.test(event.key)) {
		event.preventDefault();
	}
}
function validations() {
	return {
		guide: {
			number: {
				required: requiredIf(() => this.numberRequired),
			},
			recipientDocument: {
				required: requiredIf(() => this.isEcuador || this.typeBilling === 1),
			},
			rzSocialAddressee: {
				required: requiredIf(() => this.isEcuador || this.typeBilling === 1),
			},
			originAddress: {
				required: requiredIf(() => this.isEcuador || this.typeBilling === 1),
			},
			destination: {
				required: requiredIf(() => this.isEcuador || this.typeBilling === 1),
			},
			reason: {
				required: requiredIf(() => this.isEcuador),
			},
			driverLicensePlate: {
				required: requiredIf(() => this.isEcuador || this.courier),
			},
			driverLicensePlateSecondary: {
				required: requiredIf(
					() => this.showSecondaryVehicle && (this.isEcuador || this.courier)
				),
			},
			reasonTran: {
				required: requiredIf(() => this.$route.name !== 'reference-guide-carrier-detail'),
			},
			departmentId: {
				required: requiredIf(() => this.noShowIsCarrier),
			},
			provinceId: {
				required: requiredIf(() => this.noShowIsCarrier),
			},
			districtId: {
				required: requiredIf(() => this.noShowIsCarrier),
			},
		},
	};
}

async function loadGuideNumber() {
	const params = {
		terminalId: this.$route.params.saleId ? this.guideData.terminalId : undefined,
		comSubsidiaryId: this.$route.params.saleId
			? this.guideData.comSubsidiaryId
			: undefined,
		documentTypeCode:
			this.guide.typeDocument && this.guideData.typeDocument.code === 'NTV'
				? this.guideData.typeDocument.code
				: undefined,
		type: this.isCarrier ? TypeGuides.Carrier : TypeGuides.Sender,
	};
	try {
		const { data: response } = await this.$httpSales.get(
			'remission-guides/config-serie',
			{ params }
		);
		this.guide.number = response.number;
		this.guide.serie = response.serie;
		this.numberRequired = response.numberRequired;
		this.typeBilling = response.typeBilling || 0;
	} catch (error) {
		if (error.status === 400) {
			if (error.data.message === 'SERIE_NOT_CORRESPOND_DOCUMENT_TYPE') {
				this.showGenericError(error.data.messageError);
			}
		} else {
			this.showGenericError();
		}
	}
}

function closeNotification() {
	this.notification.show = false;
	this.notification.colorDialog = '';
	this.notification.colorText = '';
	this.notification.text = '';
	this.notification.title = '';
}

function data() {
	const [primaryVehicles, secondaryVehicles] = this.vehicles.reduce(
		(acc, v) => {
			const type = v?.typeTransport?.code;
			if (!type) return acc;
			else if (type === 'REMOLQUE' || type === 'SEMIREMOLQUE') {
				acc[1].push(v);
			} else {
				acc[0].push(v);
			}
			return acc;
		},
		[[], []]
	);

	return {
		showFreightCust: false,
		districs: [],
		showSecondaryVehicle: false,
		guide: {
			ubigeoEnd: null,
			ubigeoStart: null,
			numberMtc: null,
			additionalInformation: [],
			arrivalDate: null,
			courierId: 0,
			departureDate: null,
			destination: '',
			phoneAttention: null,
			details: [],
			nameAttention: null,
			documentAttention: null,
			driverCelphone: '',
			driverLicensePlate: null,
			driverLicensePlateSecondary: null,
			numberLicenceAgency: null,
			driverName: '',
			departmentName: null,
			establishmentCode: '',
			districtName: null,
			number: null,
			numberBoxs: 0,
			provinceName: null,
			observation: '',
			originAddress: '',
			reason: '',
			descriptionTransfer: null,
			recipientDocument: '',
			route: '',
			rzSocialAddressee: '',
			reasonTran: null,
			reasonTranName: null,
			typeTransportName: null,
			typeDocument: null,
			weight: 0,
			sender: {
				destination: '',
				departmentId: null,
				departmentName: null,
				provinceId: null,
				provinceName: null,
				districtId: null,
				districtName: null,
			},
			freight: {
				freightType: null,
				customerId: null,
			},
			departmentId: null,
			provinceId: null,
			districtId: null,
			purchaseOrder: '',
		},
		departments: [],
		provinces: [],
		showModalDistribution: true,
		labelDestination: 'Dirección Destino',
		labelOrigin: 'Dirección Origen',
		isReasonPurchase: false,
		reasonTrans: [
			{
				id: '01',
				name: 'Venta',
			},
			{
				id: '02',
				name: 'Compra',
			},
			/* {
				id: '03',
				name: 'Venta con entrega a terceros',
			}, */
			{
				id: '04',
				name: 'Translado entre establecimientos de la misma empresa',
			},
			{
				id: '05',
				name: 'Consignación',
			},
			/* {
				id: '07',
				name: 'Traslado para transformación',
			}, */
			{
				id: '06',
				name: 'Devolución',
			},
			/* {
				id: '08',
				name: 'Importación',
			},
			{
				id: '09',
				name: 'Exportación',
			}, */
			{
				id: '13',
				name: 'Otros no comprendido en ningun código del presente catálogo',
			},
			{
				id: '14',
				name: 'Venta sujeta a confirmacion del comprador',
			},
			{
				id: '17',
				name: 'Translado de bienes para transformación',
			},
			{
				id: '18',
				name: 'Traslado emisor itinerante CP',
			},
			/* {
				id: '19',
				name: 'Translado a zona primaria',
			}, */
			{
				id: '13',
				name: 'Otros',
			},
		],
		typeTransports: [
			{
				number: 2,
				id: '01',
				name: 'Transporte Publico',
			},
			{
				number: 1,
				id: '02',
				name: 'Transporte Privado',
			},
		],
		info: '',
		showValidNumber: false,
		showAlert: false,
		numberRequired: false,
		notification: {
			colorDialog: 'error',
			colorText: 'error',
			show: false,
			text: '',
			title: '',
		},
		plates: [],
		typeBilling: null,
		valueDepartureDate: null,
		valueArrivalDate: null,
		isCarrier: this.$route.meta.isCarrier || false,
		isEdit: true,
		isEditSender: true,
		isEditPlate: true,
		isEditPlateSecondary: true,
		provincesSender: [],
		districsSender: [],
		typesFreight: [
			{
				id: 1,
				name: 'Subcontratado',
				code: 'subcontratado',
			},
			{
				id: 2,
				name: 'Remitente',
				code: 'remitente',
			},
			{
				id: 3,
				name: 'Tercero',
				code: 'tercero',
			},
		],
		showIsCarrier: false,
		noShowIsCarrier: false,
		customerFreight: null,
		customers: [],
		showTransferInfo: false,
		flagUseVehicleTransfer: false,
		initialDestination: null,
		anable: [],
		primaryVehicles,
		secondaryVehicles,
	};
}

export default {
	name: 'reference-guides-form',
	components: {
		additionalData,
		autocompleteComponent,
		appShowDialog,
		modalSidebarButton,
		additionalDataField,
	},
	computed: {
		disabled,
		disabledBilling,
		platesOfTransport() {
			if (this.transportAgency.additionalInformation) {
				return this.transportAgency.additionalInformation.plates || [];
			}
			return [];
		},
		viewCourrierAndVehicle() {
			return (
				this.typeDistribution === 2 &&
				this.$userInfo.company.settings.flagRelateVehicleFloat
			);
		},
		shouldShowSelect() {
			return this.customerDestinations && this.customerDestinations.length > 0;
		},
		isValidWeight() {
			const parsedWeight = Number(this.guide.weight);
			return !isNaN(parsedWeight) && parsedWeight > 0;
		},
		isCarrierDetail() {
			const { destination, departmentId, provinceId, districtId } = this.guide.sender;
			return (
				this.showIsCarrier && !(destination && departmentId && provinceId && districtId)
			);
		},
		isFreight() {
			return (
				this.showIsCarrier &&
				this.showFreightCust &&
				this.guide.freight &&
				!(this.guide.freight.freightType && this.guide.freight.customerId)
			);
		},
	},
	created,
	data,
	methods: {
		preventSpecialChars,
		addData,
		closeNotification,
		cleanForm,
		close,
		loadData,
		loadDepartament,
		loadDistrict,
		loadProvince,
		loadGuideNumber,
		removeData,
		save,
		setValue,
		setValueUbigeo,
		validatedBilling,
		onTransferInfo(val) {
			this.showTransferInfo = val;
			if (!val) {
				this.guide.descriptionTransfer = null;
			}
		},
		onFreightCustChange(val) {
			if (val) {
				this.guide.freight = {
					freightType: null,
					customerId: null,
				};
			} else {
				this.guide.freight = null;
			}
		},
		setCustomer(value) {
			if (value.model === 'freightType') {
				this.guide.freight.freightType = value.value.code;
			} else if (value) {
				this.customerFreight = value;
				this.guide.freight.customerId = value.id;
				this.guide.freight.freightName = value.typePerson.fullName;
				this.guide.freight.freightDocument = value.dni || value.ruc;
				this.guide.freight.documentName = value.typePerson.documentName;
			}
		},
		handleClick() {
			if (!this.isEdit) {
				this.guide.destination = this.initialDestination || null;
			}
			this.isEdit = !this.isEdit;
		},
		handleClickSender() {
			if (!this.isEditSender) {
				this.guide.destination = null;
			}
			this.isEditSender = !this.isEditSender;
		},
		async setValueSender({ model, value }) {
			this.$set(
				this.guide.sender,
				model,
				value && value.addressLine1 ? value.addressLine1 : value
			);
			if (value.provinceId) {
				this.guide.sender.departmentId = value.provinceId;
				this.guide.sender.provinceId = value.cityId;
				this.guide.sender.districtId = value.parishId;
				this.guide.sender.departmentName = this.departments.find(
					(d) => d.id === value.provinceId
				).name;
				await this.loadProvinceSender(value.provinceId);
			} else {
				this.guide.sender.departmentId = null;
				this.guide.sender.departmentName = null;
				this.guide.sender.provinceId = null;
				this.guide.sender.provinceName = null;
				this.guide.sender.districtId = null;
				this.guide.sender.districtName = null;
			}
		},
		setValueUbigeoSender({ model, value }, execute = true) {
			if (value) {
				if (model === 'departmentId' && value.id) {
					this.guide.sender[model] = value.id;
					this.guide.sender.departmentName = value.name;
					this.guide.sender.provinceId = null;
					this.guide.sender.provinceName = null;
					this.guide.sender.districtId = null;
					this.guide.sender.districtName = null;
					if (execute) {
						this.loadProvinceSender(value.id);
					}
				} else if (model === 'provinceId' && value.id) {
					this.guide.sender[model] = value.id;
					this.guide.sender.provinceName = value.name;
					this.guide.sender.districtId = null;
					this.guide.sender.districtName = null;
					if (execute) {
						this.loadDistrictSender(value.id);
					}
				} else if (model === 'districtId') {
					this.guide.sender.districtName = value.name;
					this.guide.sender[model] = value.id;
					this.guide.sender.ubigeo = value.code;
					//this.guide.ubigeoEnd = value.code;
					this.guide.ubigeoStart = value.code;
				}
			}
		},
		async loadProvinceSender(id) {
			try {
				const response = await this.$httpSales(`cities/${id}`);
				this.provincesSender = [...response.data];
				if (this.guide.sender.provinceId) {
					this.guide.sender.provinceName = response.data.find(
						(d) => d.id === this.guide.sender.provinceId
					).name;
					await this.loadDistrictSender(this.guide.sender.provinceId);
				}
			} catch (error) {
				console.error(error);
				this.showGenericError();
			}
		},
		async loadDistrictSender(id) {
			try {
				const response = await this.$httpSales(`parish/${id}`);
				this.districsSender = [...response.data];
				if (this.guide.sender.districtId) {
					const district = response.data.find(
						(d) => d.id === this.guide.sender.districtId
					);
					this.guide.sender.districtName = district.name;
					this.guide.sender.ubigeo = district.code;
					this.guide.ubigeoEnd = district.code;
				}
			} catch (error) {
				this.showGenericError();
			} finally {
				this.showNotificationK = false;
			}
		},
		changePlate() {
			if (!this.isEditPlate) {
				this.guide.driverLicensePlate = null;
			}
			this.isEditPlate = !this.isEditPlate;
		},
		changePlateSecondary() {
			if (!this.isEditPlateSecondary) {
				this.guide.driverLicensePlateSecondary = null;
			}
			this.isEditPlateSecondary = !this.isEditPlateSecondary;
		},
		async loadCustomerFreight({ freightName, customerId }) {
			const searchTrim = freightName ? freightName.trim() : '';
			const defaultCustomer = {
				autocomplete: '',
				typePerson: {},
			};
			const response = await this.customerSelections(searchTrim);
			this.customers = [...response.data];
			if (this.customers.length === 1) {
				this.customerFreight = this.customers[0];
				this.search = null;
			} else if (this.customers.length) {
				this.customerFreight = this.customers.find((c) => c.id === customerId) || {
					...defaultCustomer,
				};
				this.search = null;
			} else {
				this.customerFreight = { ...defaultCustomer };
			}
		},
		findNameById(list, id) {
			const item = list.find((i) => i.id === id);
			return item ? item.name : null;
		},
	},
	props: {
		courier: {
			default: () => {},
			type: Object,
		},
		transportAgency: {
			default: () => {},
			type: Object,
		},
		guideData: {
			default: () => {},
			type: Object,
		},
		customerDestinations: {
			default: () => [],
			type: Array,
		},
		id: [Number, String],
		typeDistribution: [Number, String],
		isLoading: {
			type: Boolean,
			default: false,
		},
		customer: {
			default: () => {},
			type: Object,
		},
		serieIdPoint: [Number, String],
		vehicles: {
			default: () => [],
			type: Array,
		},
		customerSender: {
			default: () => {},
			type: Object,
		},
		customDestinationsSender: {
			default: () => [],
			type: Array,
		},
		subsidiaries: {
			default: () => [],
			type: Array,
		},
		flagVehicTrans: {
			type: Boolean,
		},
	},
	validations,
};
</script>

<style lang="scss" scoped>
.section-label {
	color: map-get($colors, blue-card);
	font-family: map-get($fonts, lato-bold);
	font-size: map-get($sizes, medium);
}

.info-label {
	color: map-get($colors, paginationText);
	font-family: map-get($fonts, open-regular);
	font-size: map-get($sizes, medium);
}
</style>
