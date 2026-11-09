<template>
	<div>
		<div>
			<app-loading
				:show-loading="showLoading"
				label="La carga terminará en un momento y podrás ver
            	toda la información del listado de ventas"
			/>
		</div>
		<header-page
			class="sales-list-header"
			:clean-disabled="onLoadData"
			:columns="columns"
			export-to-pdf
			name="sales"
			:btns-column="'xs12 mb-3'"
			:options="options"
			:rows="dataSelected"
			:title="salesTitle"
			to-show
			:show-excel="false"
			show-excel-menu
			@clean-product-filter="onCleanData"
			@download-dispatch="downloadSaleList"
			@emit-excel="emitExcel"
			@click-menu="clickMenu"
			:open-on-click="isSelectWarehouses"
			:track-filters="params"
		>
			<app-tooltip-button
				class="mr-1"
				:color="showGetTotal ? 'primary' : 'baseText'"
				icon="visibility"
				text="Mostrar Total de las Ventas"
				height="30"
				@click-icon="getTotalSale"
			/>
			<span class="primary--text bold mr-3" v-if="!showGetTotal"> Ver total </span>
			<div class="mr-4" v-else>
				<div v-if="totalByCoins.length === 0" style="font-size: 13px; color: #666">
					0.00
				</div>
				<template v-else>
					<div
						v-for="(coin, index) in totalByCoins"
						:key="index"
						style="font-size: 13px; color: #666"
					>
						<span class="bold"> {{ coin.label }}: </span>
						<span class="mr-3">
							{{ coin.value | round }}
						</span>
					</div>
				</template>
			</div>
		</header-page>
		<app-actions
			v-if="!ballotSummaryId && !summaryUnsubscribeId"
			:value-disabled="actionsDisabled"
			:resource-uri="$route.name"
			@run-action="runAction"
			@open-help="openHelp"
		/>
		<general-filter class="layout wrap py-3">
			<v-flex xs12 sm6 md2 pr-2 mb-2 v-show="!isResponsive">
				<autocomplete-component
					chips
					item-text="name"
					item-value="id"
					:items="typeDocuments"
					label-value="T. Documento"
					multiple
					:readonly="ballotSummaryId || !!summaryUnsubscribeId"
					:object-data="'documentType'"
					resource-url="/type-documents?flagType=1"
					:return-object="false"
					:http-code="'$httpSales'"
					:item="typeDocumentIds"
					@return-data="setData($event, 'typeDocumentIds')"
				></autocomplete-component>
			</v-flex>
			<v-flex xs12 sm6 md2 mb-2 v-show="!isResponsive">
				<autocomplete-component
					chips
					item-text="name"
					item-value="id"
					:items="typePayments"
					label-value="T. Pago"
					multiple
					object-data="paymentType"
					resource-url="/type-payments?flagType=1"
					:return-object="false"
					:http-code="'$httpSales'"
					:item="typePaymentParams"
					@return-data="setData($event, 'typePaymentParams')"
				></autocomplete-component>
			</v-flex>
			<v-flex xs12 sm6 md3 px-2 mb-2>
				<v-layout wrap align-center>
					<v-flex xs6 pr-2 v-show="!isResponsive">
						<autocomplete-component
							item-text="name"
							item-value="id"
							:items="paymentStates"
							label-value="E. Pago"
							resource-url="/payment-states"
							return-object
							:http-code="'$httpSales'"
							:item="params.paymentState"
							@return-data="setData($event, 'paymentState')"
						></autocomplete-component>
					</v-flex>
					<v-flex xs6 v-show="!isResponsive">
						<autocomplete-component
							item-text="name"
							item-value="id"
							:items="sunatStates"
							:label-value="`E. ${labelsByCountry.taxAgency}`"
							resource-url="/taxes/status"
							return-object
							:http-code="'$httpSales'"
							:item="params.statusTaxSri"
							@return-data="setData($event, 'statusTaxSri')"
						></autocomplete-component>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex
				xs12
				sm6
				md2
				pr-2
				mb-2
				v-if="isPeru && currencies.length > 1"
				v-show="!isResponsive"
			>
				<app-select
					chips
					:item="params.currencies"
					item-text="name"
					item-value="code"
					:items="currencies"
					label="Tipos de Moneda"
					model="currencies"
					multiple
					@input="getData"
				/>
			</v-flex>
			<v-flex
				xs12
				sm6
				md1
				pr-2
				mb-2
				v-show="!isResponsive"
				v-if="$userInfo.company.settings.flagTypeOriginOrder"
			>
				<app-select
					label="Origen"
					item-text="name"
					item-value="id"
					model="originPlatform"
					:item="params.originPlatform"
					:items="originConfig"
					@input="setData($event, 'originPlatform')"
				></app-select>
			</v-flex>
			<v-flex xs12 sm6 md1 mb-2 v-show="!isResponsive">
				<autocomplete-component
					item-text="name"
					item-value="code"
					:items="status"
					label-value="E. Despacho"
					resource-url="/sales/states"
					return-object
					:http-code="'$httpSales'"
					:item="params.status"
					@return-data="setData($event, 'status')"
				></autocomplete-component>
			</v-flex>
			<v-flex xs12 sm6 md2 mb-2 ml-2>
				<person-search-input
					:search-value="selectedCustomer"
					:flagInputEvent="true"
					@search="openSearchCustomer"
				/>
			</v-flex>
			<v-flex xs12 sm6 md2 ml-2>
				<app-select
					label="Sucursal"
					item-text="rzSocial"
					item-value="id"
					model="subsidiaryId"
					:items="listSubsidiaries"
					:item="params.subsidiaryId"
					@input="setData($event, 'subsidiaryId')"
				></app-select>
			</v-flex>
			<v-flex xs12 sm6 md2 ml-2>
				<autocomplete-component
					chips
					item-text="name"
					item-value="id"
					:items="warehouses"
					:label-value="labelWarehouse()"
					multiple
					resource-url="/warehouses"
					:return-object="false"
					:http-code="'$httpProducts'"
					:item="warehouseIds"
					@return-data="setWarehouseIds"
				></autocomplete-component>
			</v-flex>
			<v-flex xs12 sm6 md2 ml-2 v-if="isAdmin">
				<label class="caption">Empleado</label>
				<autocomplete-component
					chips
					multiple
					placeholder-value="Empleado"
					item-text="fullname"
					item-value="id"
					:items="employees"
					local-search
					:return-object="false"
					:item="employeeIds"
					@return-data="setData($event, 'employeeIds')"
				></autocomplete-component>
			</v-flex>
			<v-flex xs12 sm6 md2 ml-2 mb-2 v-if="showStateEntity">
				<app-select
					item-text="name"
					item-value="id"
					:item="params.entityStateId"
					label="Estado de Entidad"
					:items="statesEntity"
					model="entityStateId"
					:return-object="false"
					@input="getData"
				/>
			</v-flex>
			<v-flex xs12 sm6 md3 ml-2 v-if="!ballotSummaryId && !summaryUnsubscribeId">
				<v-layout wrap align-center>
					<v-flex xs6 pr-2>
						<label class="caption">Fecha Inicial</label>
						<date-component
							:date="params.startDate"
							icon="/static/img/calendar.svg"
							@on-input="setDate({ model: 'startDate', value: $event })"
						></date-component>
					</v-flex>
					<v-flex xs6>
						<label class="caption">Fecha Final</label>
						<date-component
							:date="params.endDate"
							icon="/static/img/calendar.svg"
							@on-input="setDate({ model: 'endDate', value: $event })"
						></date-component>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12 sm6 md2 ml-2 v-show="!isResponsive">
				<app-select
					item-text="name"
					item-value="id"
					:item="params.statusWithholding"
					label="Est. de Retención"
					:items="statesWithholding"
					model="statusWithholding"
					:return-object="false"
					@input="getData"
				/>
			</v-flex>
			<v-flex xs12 sm6 md1 ml-2>
				<v-layout wrap align-center>
					<v-flex xs12 pr-1 pt-3>
						<v-btn
							:disabled="onLoadData"
							type="button"
							color="primary"
							class="btn-action btn-action-block"
							@click="searchDataFiltered"
						>
							Buscar
							<v-icon color="white" size="16"> check_circle_outline </v-icon>
						</v-btn>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12 sm6 md1 pl-2 pt-3 v-if="Number($route.query.statusTaxSri) === 4">
				<v-layout wrap align-center>
					<v-flex xs12 pr-1>
						<v-btn
							:disabled="onLoadData || !dataSelected.length"
							type="button"
							color="primary"
							class="btn-action btn-action-block"
							@click="unLinkDocuments"
						>
							Desvincular
						</v-btn>
					</v-flex>
				</v-layout>
			</v-flex>
		</general-filter>
		<div class="layout wrap align-start justify-center">
			<v-flex :class="toShow ? 'xs8 active' : 'xs12'">
				<app-table
					:indexes-cancel="indexesCancel"
					include-filter
					local-storage
					selectable
					name="sales"
					:isResponsive="true"
					:check-all="checkAll"
					:clean-search="isTableClean"
					:columns="columns"
					:current-page="currentPage"
					:key-value="keyValue"
					:last-page="lastPage"
					:rows="data"
					:items-quantity="data.length"
					:disabled-search="disabledSearch"
					:items-total-quantity="itemsTotalQuantity"
					@on-page="changePage"
					@on-search-event="callServiceAndSearch"
					@on-selected-all="selectedAll"
					@set-search-text="setSearch"
					@on-toggle-columns="toggleColumns"
					@row-is-selected="rowIsSelected"
					@table-option-event="openModal"
				>
					<template slot="rows" slot-scope="props">
						<td v-show="showRow(columns, 1)">
							{{ props.row.subsidiary.sucursalName }}
						</td>
						<td v-show="showRow(columns, 2)">
							{{ showTerminal(props.row.terminal) }}
						</td>
						<td v-show="showRow(columns, 3)">{{ props.row.warehouseName }}</td>
						<td v-show="showRow(columns, 4)">{{ props.row.customerData }}</td>
						<td v-show="showRow(columns, 5)">
							{{
								props.row.customer
									? props.row.customer.dni || props.row.customer.ruc
									: '-'
							}}
						</td>
						<td v-show="showRow(columns, 6)">
							{{ props.row.customer ? props.row.customer.phone || '-' : '-' }}
						</td>
						<td class="document-column" v-show="showRow(columns, 7)">
							<app-tooltip-button
								v-if="!!props.row.flagOldSale"
								class="icon-container"
								:height="16"
								icon="history"
								text="Venta Histórica"
							></app-tooltip-button>
							<!-- <div
								v-if="props.row.originalRelatedDocument"
								@click="openRelatedModal(props.row)"
								class="related-document"
								:class="getCancelClass(props.row)"
							>
								{{ props.row.docNumber }}
							</div> -->
							<span :class="getCancelClass(props.row)">
								{{ props.row.docNumber }}
							</span>
						</td>
						<td v-show="showRow(columns, 8)">
							{{ props.row.employee ? props.row.employee.fullname : null }}
						</td>
						<td v-show="showRow(columns, 9)">
							<v-tooltip top>
								<span slot="activator">{{ props.row.createdAt }}</span>
								<span>{{ props.row.createdAtOrigin }}</span>
							</v-tooltip>
						</td>
						<td
							class="pos-relative"
							:class="{ 'pos-relative-responsive': isResponsive }"
							v-show="showRow(columns, 10)"
						>
							<template
								v-if="props.row.typeDocument && props.row.typeDocument.code === 'NTC'"
							>
								<v-tooltip top>
									<span slot="activator">
										{{ props.row.typeDocumentName }}
									</span>
									<span
										v-if="
											props.row.documentRelated &&
											props.row.documentRelated.documentNumber
										"
									>
										{{ props.row.documentRelated.documentNumber }}
									</span>
								</v-tooltip>
							</template>
							<template v-else>
								{{ props.row.typeDocumentName }}
							</template>
							<v-btn
								type="button"
								:ripple="false"
								class="change-document-btn"
								:class="{ 'change-document-btn-responsive': isResponsive }"
								v-if="
									props.row.typeDocument.code === 'NTV' ||
									props.row.typeDocument.code === 'COT'
								"
								@click.stop="convertCot(props.row)"
							>
								<img
									src="/static/img/note-sale.svg"
									alt=""
									class="align-img"
									height="17"
								/>
							</v-btn>
						</td>
						<td v-show="showRow(columns, 11) && !isResponsive">
							{{
								$userInfo.company.settings.flagTypeOriginOrder
									? props.row.referenceExternal || '-'
									: props.row.originPlatformName || '-'
							}}
						</td>
						<td v-show="showRow(columns, 12)">
							{{ props.row.typePaymentName }}
						</td>
						<td v-show="showRow(columns, 13)">
							{{
								props.row.typePaymentNames ||
								props.row.typePaymentCodesString.toUpperCase() ||
								'-'
							}}
						</td>
						<td v-show="showRow(columns, 14)">
							{{ props.row.currencySymbol }} {{ props.row.amount | round }}
						</td>
						<td v-show="showRow(columns, 15)">
							{{ props.row.currencySymbol }} {{ props.row.debtAmount | round }}
						</td>
						<td v-show="showRow(columns, 16)">
							{{ isResponsive ? 'SUNAT: ' : '' }}
							<document-state
								:color="props.row.statusTaxName.color"
								:tooltip="props.row.statusTaxName && props.row.statusTaxName.name"
								@click-state="openSunatDetails(props.row)"
							/>
						</td>
						<td v-show="showRow(columns, 17)">
							{{ isResponsive ? 'Estado:' : '' }}
							<document-state
								:color="props.row.state.color"
								:tooltip="props.row.state.name"
							/>
						</td>
						<td v-show="showRow(columns, 18)">
							{{ isResponsive ? 'Estado de pago: ' : '' }}
							<document-state
								:color="props.row.paymentStateColor"
								:tooltip="props.row.paymentStateName"
								@click-state="showTransactions(props.row)"
							/>
						</td>
						<td v-show="showRow(columns, 19)">
							<document-state
								:color="getKardexStatus(props.row).color"
								:tooltip="getKardexStatus(props.row).tooltip"
							/>
						</td>
						<td v-show="showRow(columns, 20)" v-if="showStateEntity">
							<v-tooltip top>
								<span
									slot="activator"
									:style="
										props.row.entityStateId === 4
											? 'background-color: #2abca4'
											: 'background-color: #f40029'
									"
									class="state-entity"
								>
									{{ props.row.entityStateId === 4 ? 'C' : 'SC' }}
								</span>
								<span>
									{{
										props.row.entityStateId === 4 ? 'Contabilizado' : 'Sin Contabilizar'
									}}</span
								>
							</v-tooltip>
						</td>
						<td v-show="showRow(columns, 21)">
							<document-state
								:color="colorSyncFirebase(props.row)"
								:tooltip="syncFirebase(props.row)"
							/>
						</td>
						<td v-show="showRow(columns, 22)">
							<template v-if="props.row.order">
								<a :href="`/detalle-pedido/${props.row.order.id}`" target="_blank">
									PED {{ props.row.order.documentNumber }}
								</a>
							</template>
							<template v-if="props.row.documentRelated">
								<a
									:href="`/sales/convert/${props.row.documentRelated.id}`"
									target="_blank"
								>
									<span v-if="props.row.documentRelated.typeDocument">
										{{ props.row.documentRelated.typeDocument.code }}
									</span>
									{{ props.row.documentRelated.documentNumber }}
								</a>
							</template>
							<template v-else-if="!props.row.order && !props.row.documentRelated">
								-
							</template>
						</td>
						<td v-show="showRow(columns, 23)">
							<app-input-text
								:text="
									props.row.externalData
										? props.row.externalData.extCompanyCode || ''
										: ''
								"
								@input="updateExtCompanyCode($event, props.row.id)"
							/>
						</td>
						<td v-show="showRow(columns, 24)" @click.stop="stopClick">
							<v-tooltip top>
								<a
									slot="activator"
									@click.stop.prevent="downloadSale(props.row)"
									class="table-icon"
								>
									<v-icon v-if="$userInfo.company.settings.downloadSale" color="primary"
										>save_alt</v-icon
									>
									<v-icon v-else color="primary">picture_as_pdf</v-icon>
								</a>
								<span>
									{{ labelConfigSale }}
								</span>
							</v-tooltip>
							<app-tooltip-button
								icon="send_to_mobile"
								text="Ver Detalle En Tabla"
								color="primary"
								size="14"
								@click-icon="setSale(props.row)"
							/>
							<app-tooltip-button
								icon="remove_red_eye"
								text="Ver Detalle"
								color="primary"
								size="16"
								@click-icon="preGoTo(props.row)"
							/>

							<v-menu
								offset-x
								left
								:nudge-left="10"
								attach
								content-class="options-menu-content"
								class="options-menu"
							>
								<v-btn color="transparent" slot="activator">
									<v-icon size="16" color="primary" text="Ver más"> more_vert </v-icon>
								</v-btn>
								<v-list>
									<v-list-tile
										v-if="props.row.hasProducts"
										@click.stop="showDetails(props.row)"
									>
										<v-list-tile-title>
											<v-tooltip top>
												<v-icon slot="activator" small color="primary"> preview </v-icon>
												<span>Visualizar Productos</span>
											</v-tooltip>
										</v-list-tile-title>
									</v-list-tile>
									<v-list-tile
										v-if="
											props.row.typeDocument.code === 'COT' &&
											props.row.convertStatus.id !== 3
										"
										:to="{
											name: 'edit-quotation',
											params: { id: props.row.id },
										}"
									>
										<v-list-tile-title>
											<v-icon color="primary" size="16"> edit </v-icon>
										</v-list-tile-title>
									</v-list-tile>
									<v-list-tile @click="duplicateSale(props.row)">
										<v-list-tile-title>
											<v-tooltip top>
												<v-icon slot="activator" small color="warning">
													control_point_duplicate
												</v-icon>
												<span>Clonar Venta</span>
											</v-tooltip>
										</v-list-tile-title>
									</v-list-tile>
									<v-list-tile @click="openRelatedModal(props.row)">
										<v-list-tile-title>
											<v-tooltip top>
												<v-icon slot="activator" small color="primary">
													summarize
												</v-icon>
												<span>Visualizar Doc. Relacionados</span>
											</v-tooltip>
										</v-list-tile-title>
									</v-list-tile>
									<v-list-tile v-if="isPeruvianAdmin" @click="showTaxesState(props.row)">
										<v-list-tile-title>
											<v-tooltip top>
												<v-icon slot="activator" small color="blue">
													radio_button_checked
												</v-icon>
												<span>Ver Estado de {{ labelsByCountry.taxAgency }}</span>
											</v-tooltip>
										</v-list-tile-title>
									</v-list-tile>
									<v-list-tile
										@click="regularizeSale(props.row)"
										v-if="props.row.statusTax === 4 && $userInfo.roleCode === 'SUPPORT'"
									>
										<v-list-tile-title>
											<v-tooltip top>
												<v-icon slot="activator" small color="orange">
													real_estate_agent
												</v-icon>
												<span>Regularizar Venta</span>
											</v-tooltip>
										</v-list-tile-title>
									</v-list-tile>
								</v-list>
							</v-menu>
						</td>
					</template>
				</app-table>
			</v-flex>
			<transition name="fade-left" mode="out-in">
				<v-flex xs4 :class="{ active: toShow }" v-show="toShow">
					<sales-details-in-table
						:customer="sale.customer.typePerson"
						:date="sale.localDate.date"
						:inline-products="inlineProducts"
						:sale="sale"
						@close-detail="closeDetail"
						@open-debt-modal="loadAmortization"
						@show-transactions="showTransactions"
						@show-modal-send="showModalSend"
					/>
				</v-flex>
			</transition>
		</div>
		<action-sidebar
			:width="action.width"
			v-model="action.open"
			:code-action="action.code"
			:title="action.title"
			:active="action.active"
			:img-src="action.imgSrc"
			:is-loading="loading"
			:header-color="action.color"
			:help-actions="actionsToHelp"
			@close-modal="cancelModal"
		>
			<fast-products-action
				v-if="action.code === 'CR' || action.code === 'VR'"
				:col-type-document="colTypeDocument"
				:data-selected="saleSelected"
				:page-code="action.code"
				:sale-data="saleData"
				@finish-action="loadData"
				@cancel-modal="cancelModal"
			/>
			<document-convert
				v-if="isDocumentConvert"
				:sale="saleData"
				:products="saleSelected"
				@cancel-modal="cancelModal"
				@convert="convert"
			/>
			<sales-sunat
				v-if="action.code === 'electronic-billing'"
				:rows="dataSelected"
				@cancel-modal="cancelModal"
				@remove-sales-sunat="removeSalesSunat"
				@reload-sales-sunat="reloadSalesSunat"
			></sales-sunat>
			<sales-sunat-details
				:summary-code="$route.query.summaryCode"
				:sale="sunatSaleDetail"
				:typeDocuments="typeDocuments"
				v-if="action.code === 'FED'"
			></sales-sunat-details>
			<!-- <sales-cancel
				v-if="showSaleCancelForm"
				:sale-id="rowSelected.id"
				:amount="rowSelected.amount"
				:currency="rowSelected.currency"
				:valid-sale="validSale.validated"
				:date="validSale.createdAt"
				:status="rowSelected.state.code"
				:sale="validSale"
				:document-select="documentSelect"
				is-list-sale
				@sales-canceled="salesCanceled"
				@cancel-button-clicked="cancelModal(false)"
			>
			</sales-cancel> -->
			<transactions-detail
				:customer-generic="customerGeneric"
				class="pa-4"
				v-if="showTransactionsDetails"
				:transactions="transactions"
			>
				<section class="modal-filter-footer">
					<modal-sidebar-button
						:img="false"
						cancel-color="primary"
						cancel-text="Cerrar"
						success-color="primary"
						success-text="Estado de Cuenta"
						@cancel-button-clicked="cancelModal(false)"
						@accept-button-clicked="goToMovement"
					/>
				</section>
			</transactions-detail>
			<amortizations-form
				v-if="showDebts"
				:bank-accounts="bankAccounts"
				:currency="sale.currency"
				:currency-symbol="sale.currencySymbol"
				:sale-data="amortization"
				:total-to-pay="sale.debtAmount"
				:type-payments="typePayments"
				is-sale
				@amortization-paid="onAmortizationPaid"
				@close-modal="cancelModal(false)"
			/>
			<sunat-status-admin
				v-if="isSunatStatusAdmin"
				:id="currentSaleId"
				@close="cancelModal(false)"
			/>
			<related-documents
				v-if="isRelatedDocuments"
				:sale="originalDocument"
				@close="cancelModal(false)"
			/>
			<select-filters
				v-if="isFilter"
				:group-clients="groupClients"
				:flag-group="groupClient"
				:flag-kardex="flagKardex"
				:flag="params.flagNotDocumentRelated"
				:flag-cancel="params.flagNotCancel"
				:flag-ntc="params.flagNotNtc"
				:flag-ntd="params.flagNotNtd"
				:group-id="params.groupId"
				:state-kardex-id="params.statusKardex"
				:states-withholding="statesWithholding"
				:state-with="params.statusWithholding"
				@on-action="onAction"
			/>
			<summary-unsubscribe
				v-if="action.code === 'summary-unsubscribe'"
				@close="cancelModal(false)"
				@send-summary="unsubscribeSales"
			/>
			<sales-unlink
				v-if="action.code === 'unlink'"
				:documents="dataSelected"
				:id="ballotSummaryId"
				@close-modal="cancelModal(false)"
				@update="updateDocuments"
			/>
			<collect-from-sale
				v-if="action.code === 'collect-from-sale'"
				:payments-type="typePayments"
				:sale="sale"
				:bank-accounts="bankAccounts"
				@close-modal="cancelModal(false)"
				@update-list="onAmortizationPaid"
			/>
			<person-search-form
				v-if="action.code === 'customer-searcher'"
				:search-value="searchValCustomer"
				@add-person="setCustomer"
			/>
		</action-sidebar>
		<v-dialog v-model="showModalGuie" persistent max-width="515">
			<v-card>
				<v-card-title class="headline">{{ dialogText }}</v-card-title>
				<v-card-text class="subtext">
					{{ dialogSubtext }}
				</v-card-text>
				<v-card-text class="subtext bold mt-2" v-if="saleSelectedRow.flagDispatch === 0">
					˜˜ No puede realizar una guía de remisión rapida , porque al realizar la venta
					fue despachada
				</v-card-text>
				<v-card-text
					class="error--text bold mt-2 error-dispatch"
					v-if="textErrorDispatch"
				>
					{{ textErrorDispatch }}
				</v-card-text>
				<v-card-actions class="btn-block">
					<v-layout row justify-center wrap>
						<v-flex xs3 pr-1 text-xs-right>
							<v-btn
								color="error"
								class="btn-action btn-auto white--text pa-2"
								@click.native="cancelDialogGuie"
							>
								Cancelar
							</v-btn>
						</v-flex>
						<v-flex xs3 pr-1 text-xs-right>
							<v-btn
								color="info"
								class="btn-action btn-auto white--text pa-2"
								@click.native="actionCancel"
							>
								Ir a Guia de Remisión
							</v-btn>
						</v-flex>
						<v-flex xs3 pl-1 text-xs-left>
							<v-btn
								:disabled="saleSelectedRow.flagDispatch === 0"
								color="primary"
								class="btn-action btn-auto py-2 px-4 white--text"
								@click.native="createdGuie"
							>
								Aceptar
							</v-btn>
						</v-flex>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-dialog v-model="dialogDetails" max-width="800">
			<v-card>
				<v-card-title v-if="rowSelected" class="headline justify-center"
					>Lista de productos de la venta {{ rowSelected.docNumber }}
				</v-card-title>
				<div class="pb-4">
					<app-table
						name="saleDetail"
						:columns="saleDetailsColumns"
						:rows="rowDetails"
						:key-value="saleDetailsKeyValue"
						local-storage
						local-search
						:main-list="false"
						:clean-search="isClean"
						@on-toggle-columns="toggleColumns"
					>
						<template slot="rows" slot-scope="props">
							<td class="is-not-selectable" v-show="showRow(saleDetailsColumns, 1)">
								{{ props.row.product.code }}
							</td>
							<td v-show="showRow(saleDetailsColumns, 2)">
								{{ props.row.product.autoBarcode }}
							</td>
							<td v-show="showRow(saleDetailsColumns, 3)">
								{{ props.row.product.name }}
							</td>
							<td v-show="showRow(saleDetailsColumns, 4)">
								{{ props.row.product.inlineFeatures }}
							</td>
							<td v-show="showRow(saleDetailsColumns, 5)">
								{{ props.row.product.description }}
							</td>
							<td v-show="showRow(saleDetailsColumns, 6)">
								{{ props.row.product.location }}
							</td>
							<td v-show="showRow(saleDetailsColumns, 7)">
								{{ props.row.product.brandName }}
							</td>
							<td v-show="showRow(saleDetailsColumns, 8)">
								{{ props.row.price | round }}
							</td>
							<td v-show="showRow(saleDetailsColumns, 9)">
								{{ props.row.quantity }}
							</td>
							<td v-show="showRow(saleDetailsColumns, 10)">
								{{ props.row.product.stock }}
							</td>
							<td v-show="showRow(saleDetailsColumns, 11)">
								{{ props.row.product.weigth }}
							</td>
						</template>
					</app-table>
					<v-divider></v-divider>
				</div>
				<v-card-actions>
					<v-flex xs12 text-xs-center>
						<v-btn
							type="button"
							color="pink"
							class="btn-action btn-auto mr-1 py-2 px-4"
							@click.native="closeDialog"
						>
							Cerrar
						</v-btn>
					</v-flex>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<app-show-dialog
			:color-dialog="notification.colorDialog"
			:color-hex="notification.colorHex"
			:show-modal-init="notification.show"
			:text-content="notification.text"
			:title-header="notification.title"
			@close-dialog="closeNotification"
		></app-show-dialog>
		<v-dialog v-model="modal.open" persistent max-width="425">
			<v-card>
				<v-card-title class="headline justify-center">
					{{ modal.message }}
				</v-card-title>
				<v-card-actions class="btn-block">
					<v-layout row wrap justify-center>
						<v-btn
							color="primary"
							class="btn-action white--text"
							@click.native="closeModalError"
						>
							{{ modal.btnText }}
						</v-btn>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-dialog v-model="dialogSend" persistent max-width="450">
			<modal-items
				v-if="dialogSend"
				title="Enviar Comprobante"
				name-action="Enviar"
				:disabled="emails.length === 0 && phone == ''"
				show-slot
				@close-modal="closeModalSend"
				@action-modal="sendRecords"
			>
				<template v-if="sendTypeRecord === 'email'">
					<v-flex class="pt-2 px-4">
						<label class="info--text bold"
							>Si desea enviar más de un correo, presione la tecla enter luego de escribir
							el primer email.</label
						>
					</v-flex>
					<div class="pa-4">
						<label class="caption">Correo Electrónico</label>
						<v-select
							class="filter-select shadow-inset tag-select"
							chips
							clearable
							label="Correo Electrónico"
							single-line
							tabindex="7"
							tags
							v-model="emails"
						>
							<template slot="selection" slot-scope="data">
								<v-chip class="tag-chip" close @input="removeEmail(data.item)">
									{{ data.item }}
								</v-chip>
							</template>
						</v-select>
						<span class="form-group__message" v-if="this.emails.length === 0">
							Se debe agregar al menos un correo electrónico
						</span>
					</div>
				</template>
				<template v-if="sendTypeRecord === 'phone'">
					<v-flex class="pt-2 px-4">
						<label class="info--text bold"
							>Si desea enviarlo por Whatsapp, escribir el número y presione
							enviar.</label
						>
					</v-flex>
					<div class="pa-4">
						<label class="grey--text">Número de celular</label>
						<v-text-field
							type="number"
							class="filter-select shadow-inset"
							placeholder="Ingresa tu número de celular"
							v-model="phone"
							maxlength="9"
							minlength="9"
							inputmode="numeric"
						></v-text-field>
						<span class="form-group__message" v-if="phone === ''">
							Se debe agregar el número
						</span>
					</div>
				</template>
			</modal-items>
		</v-dialog>
		<v-dialog v-model="showSaleCancelForm" persistent max-width="500">
			<sales-cancel-new
				v-if="showSaleCancelForm"
				:sale-id="rowSelected.id"
				:amount="rowSelected.amount"
				:currency="rowSelected.currency"
				:valid-sale="validSale.validated"
				:date="validSale.dateEmission"
				:status="rowSelected.state.code"
				:sale="validSale"
				:document-select="documentSelect"
				:title-modal="action.title"
				is-list-sale
				:regularize-sale="saleRegularize"
				@set-regularize-sale="setRegularizeSale"
				@sales-canceled="salesCanceled"
				@cancel-button-clicked="cancelModal(false)"
			/>
		</v-dialog>
	</div>
</template>

<script>
import { differenceInDays, format, subDays, differenceInCalendarDays } from 'date-fns';
import {
	LIST_SALES,
	LIST_SALES_DETAILS,
	LIST_SALES_PLE,
	SELLERS_SOLES_BOXES_XLSX,
} from '@/shared/reports';
import actionSidebar from '@/components/shared/action-sidebar';
import amortizationsForm from '@/components/amortizations/amortizations-form';
import appActions from '@/components/shared/app-actions';
import appSelect from '@/components/shared/app-select';
import appTable from '@/components/shared/table/app-table';
import appTooltipButton from '@/components/shared/app-tooltip-button';
import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
import dateComponent from '@/components/shared/date-component';
import documentConvert from '@/components/sales/subcomponents/document-convert';
import documentState from '@/components/shared/document-state';
import fastProductsAction from '@/components/shared/product/fast-products-action';
import generalFilter from '@/components/shared/general-filter';
import headerPage from '@/components/shared/header-page';
import helper from '@/shared/helper';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import salesDetailsInTable from '@/components/sales/sales-details-in-table';
import salesSunat from '@/components/sales/sales-sunat';
import salesSunatDetails from '@/components/sales/sales-sunat-details';
import salesCancel from '@/components/sales/sales-cancel';
import selectFilters from '@/components/sales/select-filters';
import sunatStatusAdmin from '@/components/sales/sunat-status-admin';
import relatedDocuments from '@/components/sales/related-documents';
import transactionsDetail from '@/components/sales/subcomponents/transactions-detail';
import summaryUnsubscribe from '@/components/sales/summary-unsubscribe';
import personSearchForm from '@/components/shared/searcher/person-search-form';
import personSearchInput from '@/components/shared/searcher/person-search-input';
import salesUnlink from '@/components/sales/sales-unlink';
import modalItems from '@/components/shared/modal-items';
import appShowDialog from '@/components/shared/app-show-dialog';
import salesCancelNew from '@/components/sales/sales-cancel-new';
import typeStatusKardex from '@/shared/type-status-kardex';
import collectFromSale from '@/components/sales/subcomponents/collect-from-sale';
import lib from '@/shared/lib';

const { compose, getDeeper, reduce, setNewProperty, setNewPropertyByFunction } = lib;
const isResponsive = window.innerWidth < 800;
const { debounce } = helper;

function actionsDisabled() {
	const disabledGuie = this.dataSelected.length !== 1;
	const disabled = this.dataSelected.length === 0;
	const disabledSaleDelete = this.dataSelected.length !== 1;
	return [
		{ code: 'electronic-billing', disabled },
		{ code: 'override', disabled: disabledSaleDelete },
		{ code: 'referral-guide', disabled: disabledGuie },
		{ code: 'un-subscribe', disabled: disabledSaleDelete },
		{ code: 'send-to-kardex', disabled },
		{ code: 'generate-massive-sales' },
	];
}

function allIsSelected() {
	this.checkAll = this.data.every((check) => check.isSelected);
}

function callServiceAndSearch(search) {
	this.searchData = search;
	if (search) {
		this.params.search = search;
	} else {
		this.params.search = null;
	}
	this.currentPage = 1;
	this.loadData();
}

function cancelModal(value) {
	this.action.code = null;
	this.action.open = value;
	this.showTransactionsDetails = false;
	this.showDebts = false;
	this.validSale = {};
	this.dataSelected = [];
	this.saleRegularize = false;
}

function cancelSale() {
	const sale = this.dataSelected[0];
	const allowedDocCodes = this.isEcuador
		? ['BOL', 'NTV', 'FAC', 'NTC']
		: ['BOL', 'NTV', 'FAC'];
	const allowedDocs = allowedDocCodes.map((docCode) => {
		const item = this.typeDocuments.find((td) => td.code === docCode) || {};
		return item.name;
	});
	const message = this.documentSelect === 'NTC' ? 'Nota de Crédito' : 'Venta';
	if (allowedDocCodes.includes(sale.typeDocumentCode)) {
		const isSaleRegularize = this.saleRegularize ? 'Regularizar' : 'Anular';
		this.rowSelected = sale;
		this.action.code = 'CANCEL-SALE';
		const text = this.saleRegularize ? 'Regularizar' : 'Anular';
		this.action.title =
			this.validSale.validated.flagCancel && this.isPeru
				? `${text} ${message} #${this.rowSelected.documentNumber} POR NOTA DE CRÉDITO`
				: `${isSaleRegularize} ${message} #${this.rowSelected.documentNumber}`;
	} else {
		this.showNotification(`Solo se puede anular una ${allowedDocs.join(', ')}`, 'info');
	}
}

function changePage(page) {
	this.currentPage = page;
	this.allIsSelected();
	this.loadData(page);
}

function closeDialog() {
	this.dialog = false;
	this.dialogDetails = false;
	this.saleId = 0;
	this.rowSelected = null;
}

async function convert({ body, url }) {
	const newBody = { ...body };
	newBody.warehouseCodeTaxes = this.currentWarehouseData.warehouseCodeTaxes;
	newBody.warehouseName = this.currentWarehouseData.warehouseName;
	try {
		await this.$httpSales.post(url, newBody);
		this.showNotification(
			'Uno o más productos de los seleccionados ya ha sido usado al convertir documento.'
		);
		this.cancelModal(false);
		this.loadData();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'SERIE_INVALID') {
				this.showNotification('La serie no corresponde al tipo de documento.', 'error');
			}
			if (err.data.message === 'SALE_DETAILS_FLAG_USE_INVALID') {
				this.showNotification('El documento ya ha sido convertido.', 'error');
			}
			if (err.data.message === 'SALE_DUPLICATE_ERROR') {
				this.showGenericError('La venta ya ha sido registrada');
			}
		}
	}
}

async function created() {
	const indexTerminal = this.columns.findIndex((u) => u.value === 'terminalId');
	this.columns[indexTerminal].name = this.labelTerminal();
	this.columns[indexTerminal].tooltip = `Nombre de ${this.labelTerminal()}`;
	const indexWarehouse = this.columns.findIndex((k) => k.value === 'sucursalName');
	this.columns[indexWarehouse].name = this.labelSucursal();
	this.columns[indexWarehouse].tooltip = `Nombre de ${this.labelSucursal()}`;
	this.showLoading = true;
	this.typeDocumentIds = [52, 3, 5, 1, 2];
	if (this.ballotSummaryId || this.summaryUnsubscribeId) {
		const { ballotSummaryDate, summaryUnsubscribeDate } = this.$route.query;
		const dateToSplit = ballotSummaryDate || summaryUnsubscribeDate;
		const newBallotDate = dateToSplit.split('-');
		const day = newBallotDate[0];
		const month = newBallotDate[1];
		const year = newBallotDate[2];
		this.params.startDate = `${year}-${month}-${day}`;
		this.params.endDate = `${year}-${month}-${day}`;
	} else {
		const endDate = format(new Date(), 'YYYY-MM-DD');
		this.params.startDate = format(subDays(endDate, 7), 'YYYY-MM-DD');
		this.params.endDate = endDate;
	}
	const column = this.columns.find((c) => c.value === 'statusTaxInfo');
	if (column) {
		this.$set(column, 'name', this.labelsByCountry.taxAgency);
		this.$set(column, 'tooltip', `Estado de ${this.labelsByCountry.taxAgency}`);
	}
	await this.filterData();
	if (this.$route.query.customerId) {
		this.loadCustomers(this.$route.query.customerId);
	} else if (!this.ballotSummaryId && !this.summaryUnsubscribeId) {
		this.loadData();
	}
	const { subsidiary: subsidiaryUser } = this.$userInfo;
	const { configIntegrations } = subsidiaryUser;
	this.showStateEntity =
		configIntegrations &&
		((configIntegrations.accountingPlan &&
			configIntegrations.accountingPlan.flagConfig) ||
			(configIntegrations.accountingConfiguration &&
				configIntegrations.accountingConfiguration.flagConfig));
	this.columns[19].visible = this.showStateEntity || false;
	this.columns[19].checked = this.showStateEntity || false;
	this.columns[19].flagVisible = !this.showStateEntity || false;
	if (this.$userInfo.company.settings.flagTypeOriginOrder) {
		this.listOrigin();
		this.columns[8].visible = true;
		this.columns[8].checked = true;
		this.columns[8].flagVisible = false;
	}
	this.loadSubsidiaries();
	this.loadGroupClients();
}

async function loadGroupClients() {
	try {
		const response = await this.$httpSales.get('group', {
			params: { typeEntityId: 2 },
		});
		this.groupClients = response.data;
		if (this.groupClients.length === 1) {
			this.paramsGroupClient = this.groupClients[0].id;
		}
	} catch (error) {
		this.showGenericError();
	}
}

async function listOrigin() {
	try {
		const response = await this.$httpSales.get('type-origins');
		this.originConfig = response.data;
	} catch (error) {
		this.showGenericError();
	}
}

async function downloadSale({ id, serie, number }) {
	try {
		const url = `sale-documents/${id}/pdf`;
		const downloadDialog = this.$userInfo.company.settings.downloadSale;
		const params = { html: downloadDialog || null };
		const model = { code: 'pdf' };
		const responseType = 'blob';
		const contentType = downloadDialog ? 'application/pdf' : 'text/html';
		if (this.$route.name === 'quotations-list' && this.showConfigurationQuotation) {
			model.code = 'pdf-quotitation';
		}
		const response = await this.$httpSales.post(url, model, {
			params,
			responseType,
		});
		const blob = helper.generateBlob(response.data, contentType);
		helper.showDownloadDialog(blob, `${serie}-${number}`, 'pdf', downloadDialog);
	} catch (error) {
		this.showGenericError();
	}
}

function duplicateSale({ id }) {
	this.goTo('new-sale', { query: { cloneId: id, cloneSale: true } });
}

function generateExportParams(codeReport, prefixName) {
	let salTypeDocumentId;
	let salStatesId;
	if (this.params.typeDocumentCode) {
		salTypeDocumentId = this.typeDocuments.find(
			(td) => td.code === this.params.typeDocumentCode
		).id;
	}
	if (this.params.status) {
		salStatesId = this.status.find((td) => td.code === this.params.status).id;
	}
	const params = {
		countryCode: this.labelsByCountry.code,
		endDate: this.params.endDate,
		employeeId: this.params.employeeId || undefined,
		paymentState: this.params.paymentState || undefined,
		salStatesId,
		salTypeDocumentId,
		search: this.params.search || undefined,
		startDate: this.params.startDate,
		statusTaxSri: this.params.statusTaxSri || undefined,
		currencies: this.params.currencies.reduce((a, c) => {
			const newA = { ...a };
			newA[c.code] = { typeSymbol: c.symbol, typeCurrency: c.code };
			return newA;
		}, {}),
		taxName: this.$userInfo.company.country.taxName,
	};
	if (this.warehouseIds.length > 0) {
		params.warehouseIds = this.warehouseIds;
	}
	if (this.saleIds.length > 0) {
		params.saleIds = this.saleIds;
	}
	if (this.employeeIds.length > 0) {
		params.employeeIds = this.employeeIds;
	}
	if (this.typeDocumentIds.length > 0) {
		params.typeDocumentIds = this.typeDocumentIds;
	}
	params.typePaymentIds =
		codeReport === 'list-sales' || codeReport === 'sellers-soles-boxes-xlsx'
			? this.typePaymentParams
			: undefined;
	if (codeReport === 'list-sales') {
		params.documentTypesNot = this.params.documentTypesNot || undefined;
		// params.typePaymentIds = this.params.typePaymentIds || undefined;
		params.status = this.params.status || undefined;
		params.customerId = this.params.customerId || undefined;
		if (this.isPeru) {
			params.statusTax = params.statusTaxSri || undefined;
			params.statusTaxSri = undefined;
		}
	}
	if (codeReport === 'list-sales-details') {
		params.customerId = this.params.customerId || undefined;
	}
	if (codeReport === 'sellers-soles-boxes-xlsx') {
		params.documentTypesNot = this.params.documentTypesNot || undefined;
		// params.typePaymentIds = this.params.typePaymentIds || undefined;
		params.status = this.params.status || undefined;
		params.customerId = this.params.customerId || undefined;
		params.saleIds = this.params.saleIds || undefined;
		if (this.isPeru) {
			params.statusTax = params.statusTaxSri || undefined;
			params.statusTaxSri = undefined;
		}
	}
	if (this.$userInfo.company.settings.flagTypeOriginOrder) {
		params.referenceExternal = this.params.referenceExternal || undefined;
	}
	this.onEmitExcel(codeReport, prefixName, params);
}

async function downloadSaleList() {
	const params = {
		countryCode:
			this.$userInfo.company && this.$userInfo.company.country
				? this.$userInfo.company.country.countryCode
				: null,
		customerId: this.params.customerId || undefined,
		typeDocumentIds: [...this.typeDocumentIds],
		companyId: this.$userInfo.companyId,
		typePaymentParams: [...this.typePaymentParams],
		aclFilters: this.$userInfo ? this.$userInfo.configFilters : null,
		warehouseIds:
			this.params.warehouseIds &&
			this.params.warehouseIds.split(',').map((x) => Number(x)),
		startDate: this.params.startDate,
		endDate: this.params.endDate,
		employeeIds: this.employeeIds || undefined,
		paymentState: this.params.paymentState || undefined,
		search: this.params.search || undefined,
		statusTaxSri: this.params.statusTaxSri || undefined,
		currencies: this.params.currencies.reduce((a, c) => {
			const newA = { ...a };
			newA[c.code] = { typeSymbol: c.symbol, typeCurrency: c.code };
			return newA;
		}, {}),
	};
	if (this.$userInfo.company.settings.flagTypeOriginOrder) {
		params.referenceExternal = this.params.referenceExternal || undefined;
	}
	this.onReportSale(params);
}

function emitExcel(code) {
	if (code === 'heading') {
		this.generateExportParams(LIST_SALES, 'listado_de_ventas_');
	} else if (code === 'detail') {
		this.generateExportParams(LIST_SALES_DETAILS, 'detalle_de_ventas_');
	} else if (code === 'sellers') {
		this.generateExportParams(SELLERS_SOLES_BOXES_XLSX, 'sellers_soles_boxes_xlsx_');
	} else {
		this.generateExportParams(LIST_SALES_PLE, 'PLE_');
	}
}

function electronicBillingActive() {
	const validCountry = this.isPeru
		? this.dataSelected.some((p) => p.statusTax !== 2)
		: this.dataSelected.every((s) => s.statusTaxSri !== 3);
	return this.dataSelected.every(
		(c) =>
			(c.typeDocument.code === 'FAC' ||
				c.typeDocument.code === 'NTC' ||
				c.typeDocument.code === 'NTD') &&
			validCountry
	);
}

function enableActions() {
	return this.dataSelected.length > 0;
}

async function filterData() {
	const request = [
		this.getTypeDocuments('sales'),
		this.$httpSales.get('sales/states'),
		this.$httpSales.get('taxes/status'),
		this.$httpSales.get('payment-states'),
		this.globalEmployees(),
		this.getTypePayments('sales'),
		this.getBankAccount(),
		this.getCurrencies(),
	];
	try {
		[
			{ data: this.typeDocuments },
			{ data: this.status },
			{ data: this.sunatStates },
			{ data: this.paymentStates },
			{ data: this.employees },
			{ data: this.typePayments },
			{ data: this.bankAccounts },
			{ data: this.currencies },
		] = await Promise.all(request);
		this.typeDocuments = this.typeDocuments.map((typeDocument) => {
			const newTypeDocument = Object.assign({}, typeDocument);
			newTypeDocument.documentType.type = 'typeDocumentCode';
			return newTypeDocument.documentType;
		});
		if (this.$route.name === 'list-of-sales') {
			this.typeDocuments = this.typeDocuments.filter((t) => t.code !== 'COT');
		}
		this.typeDocumentIds = this.typeDocuments
			.filter((td) => td.flagIncludeNotes)
			.map((d) => d.id);
		const warehouseList = this.globalList();
		this.warehouses = warehouseList.map((warehouse) => {
			const newWarehouse = Object.assign({}, warehouse);
			newWarehouse.type = 'warehouseId';
			return newWarehouse;
		});
		this.warehouses.unshift({ id: 0, name: 'Seleccionar Todos' });
		this.status = this.status.map((state) => {
			const newState = Object.assign({}, state);
			newState.type = 'status';
			return newState;
		});
		this.typePayments = this.typePayments.map((tp) => tp.paymentType);
		this.employees = this.employees.map((emp) => {
			const newEmp = { ...emp };
			newEmp.fullname = emp.fullname || `${emp.name} ${emp.lastname}`;
			return newEmp;
		});
		if (this.ballotSummaryId) {
			this.sunatStates = this.sunatStates.filter(
				(ss) => ss.id === 1 || ss.id === 5 || ss.id === 3 || ss.id === 4
			);
			const documentBol = this.typeDocuments.find((td) => td.code === 'BOL') || {};
			const documentNtc = this.typeDocuments.find((td) => td.code === 'NTC') || {};
			if (documentBol.id) {
				this.typeDocumentIds.push(documentBol.id);
			}
			if (documentNtc.id) {
				this.typeDocumentIds.push(documentNtc.id);
			}
			this.loadData();
		} else if (this.summaryUnsubscribeId) {
			this.sunatStates = this.sunatStates.filter(
				(ss) => ss.id === 1 || ss.id === 5 || ss.id === 3 || ss.id === 4
			);
			const documentBol = this.typeDocuments.find((td) => td.code === 'BOL') || {};
			const documentFac = this.typeDocuments.find((td) => td.code === 'FAC') || {};
			const documentNtc = this.typeDocuments.find((td) => td.code === 'NTC') || {};
			if (documentBol.id) {
				this.typeDocumentIds.push(documentBol.id);
			}
			if (documentFac.id) {
				this.typeDocumentIds.push(documentFac.id);
			}
			if (documentNtc.id) {
				this.typeDocumentIds.push(documentNtc.id);
			}
			this.loadData();
		}
	} catch (err) {
		this.showGenericError();
	}
}

function generateSunatColor(statusTaxSri = 1) {
	if (statusTaxSri === 1) {
		return 'black';
	} else if (statusTaxSri === 2) {
		return 'yellow darken-2';
	} else if (statusTaxSri === 3) {
		return 'green';
	} else if (statusTaxSri === 5) {
		return 'purple';
	}
	return 'red';
}

function isAdmin() {
	return this.$userInfo.flagAdmin;
}

function isDocumentConvert() {
	return this.action.code === 'TNV';
}

function isPeruvianAdmin() {
	return this.isAdmin && this.isPeru;
}

function isSunatStatusAdmin() {
	return this.isPeruvianAdmin && this.action.code === 'sunat-status-admin';
}

async function loadCustomers(customerId) {
	({ data: this.customer } = await this.$httpSales.get(`customers/${customerId}`));
	this.customers = [{ ...this.customer }];
	this.loadData();
}

async function loadAmortization() {
	if (this.sale.amount > this.sale.dueAmount) {
		try {
			// ({ data: this.amortization } = await this.$httpSales(
			// 	`checking-accounts/${this.sale.id}/payments`));
			// this.openDebtModal();
			const response = await this.$httpSales(
				`checking-accounts/${this.sale.id}/payments`
			);
			if (response.data) {
				this.amortization = response.data;
				this.openDebtModal();
			} else {
				this.action.active = true;
				this.action.code = 'collect-from-sale';
				this.action.open = true;
				this.action.title = 'Nueva transacción de cobro';
				this.action.width = 500;
			}
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		}
	} else {
		this.showGenericError(
			'El pago ha sido al contado por lo que no quedan cuotas pendientes de pago.'
		);
	}
}

async function loadData(page = 1, showDetail) {
	this.disabledSearch = true;
	this.onLoadData = true;
	this.showLoading = true;
	this.params.page = page;
	this.currentPage = page;
	this.params.cashDeskClosingId = this.$route.query.cashDeskClosingId;
	this.params.typePaymentIds =
		this.typePaymentParams.length > 0 ? this.typePaymentParams.join(',') : null;
	this.params.warehouseIds =
		this.warehouseIds.length > 0 ? this.warehouseIds.join(',') : null;
	this.params.employeeIds =
		this.employeeIds && this.employeeIds.length > 0 ? this.employeeIds.join() : null;
	this.params.typeDocumentIds =
		this.typeDocumentIds.length > 0 ? this.typeDocumentIds.join() : null;
	this.params.saleIds = this.saleIds.length > 0 ? this.saleIds.join() : null;
	this.params.ballotSummaryId = this.ballotSummaryId || null;
	this.params.summaryUnsubscribeId = this.summaryUnsubscribeId || null;
	try {
		this.params.customerId = this.$route.query.customerId || this.params.customerId;
		const filterP = { ...this.params };
		filterP.currencies = this.params.currencies.map((c) => c.code).join(',');
		if (this.isPeru) {
			filterP.statusTax = filterP.statusTaxSri;
			filterP.statusTaxSri = null;
		}
		filterP.entityStateId = this.params.entityStateId;
		filterP.relationAdd =
			'state,customer,typeDocument,employee,paymentMethod,subsidiary,terminal,payment,transactions,transactionsBank,orderDetails,documentRelated';
		const sales = await this.$httpSalesRead.get('sale-documents', {
			params: filterP,
		});
		if (this.showGetTotal) {
			await this.loadTotalByCoinsNet(filterP);
		}
		// const [sales] = await Promise.all(request);
		this.setUpData(sales);
		this.dataSelected = this.data.filter((d) => d.isSelected);
		this.lastPage = Number(sales.headers['x-last-page']);
		this.itemsTotalQuantity = Number(sales.headers['x-quantity']);
		if (showDetail) {
			this.rowDetailSelected = {};
			const newSaleRow = this.data.find((d) => d.id === this.sale.id);
			this.setSale({ ...newSaleRow });
		}
	} catch (err) {
		this.showLoading = false;
		this.showGenericError();
	} finally {
		this.showLoading = false;
		this.isClean = false;
		this.isTableClean = false;
		this.onLoadData = false;
		this.disabledSearch = false;
		this.totalByCoins = [];
		this.showGetTotal = false;
	}
}

function setUpData(sales) {
	this.data = reduce(this.setUpNewProperties, sales.data);
	this.data = reduce(this.documentLinked, this.data);
	this.data = this.data.map((d) => {
		const newData = { ...d };
		const { typeDocument: rowTypeDocument, order, documentRelated } = d;
		const codeTypeDocument = rowTypeDocument ? rowTypeDocument.code : '';
		newData.documentNumberOrder = order ? order.documentNumber : undefined;
		newData.documentNumberRelated = documentRelated
			? documentRelated.documentNumber
			: undefined;
		newData.flagUse = !!d.flagUse && codeTypeDocument !== 'NTC';
		newData.flagUseNTC = !!d.flagUse && codeTypeDocument === 'NTC';
		newData.statusTaxName = d.statusTaxName || this.statusTaxName;
		return newData;
	});
	this.indexesCancel = [];
	this.data.forEach((s, i) => {
		if (s.state.code === 'ANUSUNAT' || s.state.code === 'ANU') {
			if (this.indexesCancel.every((ic) => ic !== i)) {
				this.indexesCancel.push(i);
			}
		}
	});
}

function documentLinked(list, doc) {
	const exist = this.documentsWhithRelated.has(doc.documentNumber);
	if (exist && (doc.typeDocument.code === 'BOL' || doc.typeDocument.code === 'FAC')) {
		return [...list, setNewProperty('originalRelatedDocument', true)(doc)];
	}
	return [...list, doc];
}

function setUpNewProperties(list, doc) {
	const newDoc = compose(
		setNewPropertyByFunction('isRelatedDocument', this.setIsRelatedDocument),
		setNewProperty('iconArrow', 'arrow_forward'),
		setNewPropertyByFunction('hasProducts', this.setHasProducts),
		setNewPropertyByFunction('typePaymentName', getDeeper('payment', 'name')),
		setNewPropertyByFunction('statusName', getDeeper('state', 'name')),
		setNewPropertyByFunction('typeDocumentCode', getDeeper('typeDocument', 'code')),
		setNewPropertyByFunction('typeDocumentName', getDeeper('typeDocument', 'name')),
		setNewPropertyByFunction('docNumber', this.setDocNumber),
		setNewPropertyByFunction('debtAmount', this.setDebtAmount),
		setNewPropertyByFunction('createdAt', this.setCreatedAt),
		setNewPropertyByFunction('typeDocument', getDeeper('typeDocument')),
		setNewPropertyByFunction('statusTaxName', getDeeper('statusTaxName')),
		setNewPropertyByFunction('state', getDeeper('state')),
		setNewPropertyByFunction(
			'customerData',
			getDeeper('customer', 'typePerson', 'fullName')
		),
		setNewPropertyByFunction('isSelected', this.setIsSelected),
		setNewPropertyByFunction('createdAtOrigin', this.setCreatedAtHour)
	)(doc);
	return [...list, newDoc];
}

function setCreatedAt(rowData) {
	return format(new Date(rowData.createdAt), 'DD-MM-YYYY');
}

function setDebtAmount(rowData) {
	return rowData.debtAmount || Number(rowData.amount) - Number(rowData.dueAmount);
}

function setDocNumber(rowData) {
	return `${rowData.serie}-${rowData.number}`;
}

function setHasProducts({ details }) {
	return details ? details.every((detail) => detail.product) : false;
}

function setIsSelected(rowData) {
	const { id } = rowData;
	return this.dataSelected.some((d) => d.id === id);
}

function setIsRelatedDocument(rowData) {
	const number = getDeeper('documentRelated', 'documentNumber')(rowData);
	if (number) {
		this.documentsWhithRelated.add(number);
	}
	return !!number;
}

async function loadTransactions(row) {
	if (row) {
		this.setSale(row);
	}
	if (this.sale.typePaymentName === 'CREDITO') {
		try {
			({ data: this.transactions } = await this.$httpSales.get(
				`transactions-related/${this.sale.id}/module/1`
			));
			this.transactions = this.transactions.map((transaction) => {
				const newTransaction = { ...transaction };
				newTransaction.additionalInformation = transaction.additionalInformation || {};
				newTransaction.typePayment = transaction.typeTransactionBank
					? transaction.typeTransactionBank || {}
					: transaction.typePayment || {};
				return newTransaction;
			});
		} catch (err) {
			this.showGenericError();
		}
	} else {
		this.transactions = [
			...(this.sale.transactions || []).concat(this.sale.transactionsBank || []),
		];
	}
}

function onCleanData() {
	const { ballotSummaryDate, summaryUnsubscribeDate } = this.$route.query;
	const summaryDate = ballotSummaryDate || summaryUnsubscribeDate;
	this.groupClient = false;
	this.flagKardex = false;
	this.selectedCustomer = null;
	this.showGetTotal = false;
	this.params = {
		groupId: null,
		statusKardex: null,
		statusWithholding: null,
		originPlatform: null,
		customerId: null,
		endDate:
			this.ballotSummaryId || this.summaryUnsubscribeId
				? format(summaryDate, 'YYYY-DD-MM')
				: this.$today(),
		flagNotDocumentRelated: null,
		flagNotCancel: null,
		flagNotNtc: null,
		flagNotNtd: null,
		entityStateId: null,
		limit: 20,
		page: 1,
		paymentState: null,
		search: null,
		sortField: 'created_at',
		startDate:
			this.ballotSummaryId || this.summaryUnsubscribeId
				? format(summaryDate, 'YYYY-DD-MM')
				: format(subDays(this.$today(), 7), 'YYYY-MM-DD'),
		status: null,
		warehouseIds: null,
		saleIds: null,
		employeeIds: [],
		currencies: [this.$userInfo.company.currencyDefault],
		documentTypesNot: 'COT',
		subsidiaryId: null,
	};
	if (this.ballotSummaryId) {
		const documentBol = this.typeDocuments.find((td) => td.code === 'BOL') || {};
		const documentNtc = this.typeDocuments.find((td) => td.code === 'NTC') || {};
		this.params.ballotSummaryId = this.ballotSummaryId;
		this.params.typeDocumentIds = `${documentBol.id}, ${documentNtc.id}`;
		this.typeDocumentIds = [documentBol.id, documentNtc.id];
		this.params.saleIds = this.saleIds;
	} else if (this.summaryUnsubscribeId) {
		const documentBol = this.typeDocuments.find((td) => td.code === 'BOL') || {};
		const documentFac = this.typeDocuments.find((td) => td.code === 'FAC') || {};
		const documentNtc = this.typeDocuments.find((td) => td.code === 'NTC') || {};
		this.params.summaryUnsubscribeId = this.summaryUnsubscribeId;
		this.params.typeDocumentIds = `${documentBol.id}, ${documentFac.id}, ${documentNtc.id}`;
		this.typeDocumentIds = [documentBol.id, documentFac.id, documentNtc.id];
		this.params.saleIds = this.saleIds;
	} else {
		this.typeDocumentIds = [52, 3, 5, 1, 2];
		this.params.typeDocumentIds =
			this.typeDocumentIds.length > 0 ? this.typeDocumentIds.join() : null;
		this.params.saleIds = this.saleIds;
	}
	this.$route.query.cashDeskClosingId = null;
	this.typePaymentParams = [];
	this.warehouseIds = [];
	this.saleIds = [];
	this.employeeIds = [];
	this.searchData = null;
	this.localSearch = '';
	this.isClean = true;
	this.isTableClean = true;
	helper.removeLocalData('sales::search');
	helper.removeLocalData('saleDetail::search');
	this.callServiceAndSearch();
}

function openDebtModal() {
	this.showDebts = true;
	this.action.active = true;
	this.action.code = 'debts-details';
	this.action.open = true;
	this.action.title = 'Estado de Cobro';
	this.action.width = 500;
}

function openModal(value, rows, row) {
	this.loading = true;
	if (value === 'TNV' && rows.length > 0) {
		this.action = { ...this.actionSale };
		this.action.title =
			row.typeDocument.code === 'NTV'
				? 'Transformar Nota de Venta'
				: 'Transformar Cotización';
		this.saleSelected = rows;
		this.saleData = row;
		this.loading = false;
		this.action.width = 649;
	} else if (value.code === 'filter-by') {
		const newAction = { ...value };
		newAction.title = 'Filtro';
		newAction.width = 400;
		this.action = { ...newAction };
		this.loading = false;
	}
}

function openDrawer(sale) {
	this.sunatSaleDetail = sale;
	this.action.code = 'FED';
	this.action.title = `Venta #${sale.documentNumber}`;
	this.action.open = true;
	this.action.width = 500;
}

async function loadSunatInvoicing(row) {
	try {
		const { data: sunatData } = await this.$httpSales.get(
			`facturacion-sunat/${row.id}/document`,
			{
				params: { documentTypeCode: 'sale' }
			}
		);
		return sunatData;
	} catch (err) {
		this.showGenericError('No se pudo obtener la información de SUNAT.');
		return null;
	}
}

async function openSunatDetails(sale) {
	if (
		(sale.statusTaxName && sale.statusTaxName.showDetails) ||
		this.$userInfo.company.comCountryId === 1
	) {
		if (sale.statusTax !== 3) {
			this.openDrawer(sale);
			return;
		}
		const { dataResponseTaxes } = sale;
		const xmlUrl = dataResponseTaxes && dataResponseTaxes.xmlUrl;
		const cdrUrl = dataResponseTaxes && dataResponseTaxes.cdrUrl;
		console.log({ sale: this.data });

		if (xmlUrl && cdrUrl) {
			this.openDrawer(sale);
		} else {
			const sunatData = await this.loadSunatInvoicing(sale);
			await this.loadData(this.params.page);
			if (sunatData && sunatData.message) {
				this.showGenericError(sunatData.message);
			}
			const rowUpdate = this.data.find((r) => r.id === sale.id);
			this.openDrawer(rowUpdate);
		}
	}
}

function preGoTo(document) {
	const routeData = this.$router.resolve({
		name: 'convert',
		params: { id: document.id },
	});
	window.open(routeData.href, '_blank');
}

function removeSalesSunat({ id }) {
	const saleIndex = this.dataSelected.findIndex((s) => s.id === id);
	const saleIndexTable = this.data.findIndex((s) => s.id === id);
	this.dataSelected.splice(saleIndex, 1);
	if (saleIndexTable > -1) {
		this.data[saleIndexTable].isSelected = false;
	}
}

function reloadSalesSunat() {
	const ids = this.dataSelected.map((c) => c.id);
	ids.forEach((id) => {
		const wasSelected = this.data.findIndex((s) => s.id === id);
		if (wasSelected > -1) {
			this.data[wasSelected].statusTaxSri = 2;
		}
	});
	this.dataSelected = [];
	this.action.open = false;
	this.loadData();
}

function rowIsSelected(row) {
	if (row.isSelected) {
		this.dataSelected.push(row);
	} else {
		const index = this.dataSelected.findIndex((ds) => ds.id === row.id);
		if (index > -1) {
			this.dataSelected.splice(index, 1);
		}
	}
}

function runAction({ code }) {
	if (code === 'override') {
		this.loadValidate('override');
	} else if (code === 'send-to-kardex') {
		const notNTC = this.dataSelected.every((d) => d.typeDocumentCode !== 'NTC');
		const allNTC = this.dataSelected.every((d) => d.typeDocumentCode === 'NTC');
		if (notNTC) {
			const statusPending = this.dataSelected.every(
				(d) =>
					d.sendKardexStatus === typeStatusKardex.Error ||
					d.sendKardexStatus === typeStatusKardex.Returned ||
					d.sendKardexStatus === typeStatusKardex.Pending
			);
			if (statusPending) {
				this.sendToKardex(typeStatusKardex.Inprocesses);
			} else {
				this.showNotification(
					'Solo se puede enviar al kardex los documentos con status Error',
					'info'
				);
			}
		} else if (allNTC) {
			this.sendToKardex(typeStatusKardex.Pending);
		} else {
			this.showNotification('Solo seleccionar los documentos que son NTC', 'info');
		}
	}
	const options = {
		'generate-massive-sales': this.generateMassive.bind(null),
		'referral-guide': this.referralGuideAction.bind(null, this.dataSelected[0], code),
		'electronic-billing': this.electronicBilling.bind(null, code),
		'un-subscribe': this.unsubscribe,
	};
	if (options[code]) {
		options[code].call();
	}
}

async function generateMassive() {
	const validated = differenceInCalendarDays(this.params.startDate, this.params.endDate);
	if (validated < -7) {
		this.notification.title = 'GENERAR REPORTE DE VENTAS MASIVO';
		this.notification.text =
			'Para generar un reporte de ventas masivo, el rango de fechas debe tener un maximo de 7 DÍAS.';
		this.notification.show = true;
	} else {
		const params = {
			startDate: this.params.startDate,
			endDate: this.params.endDate,
			typeDocumentIds: this.typeDocumentIds.length > 0 ? this.typeDocumentIds : null,
			salDocumentsId: this.dataSelected.length
				? this.dataSelected.map((p) => p.id)
				: undefined,
		};
		const { name, lastname } = this.$userInfo;
		const body = {
			filename: `reporte masiva de ventas - Fecha: ${this.params.startDate} - ${this.params.endDate}`,
			extension: 'pdf',
			comment: `reporte_masiva_ de_venta_por_${name}_${lastname}`,
			params,
		};
		try {
			await this.$httpReports.post('documents/documents-massive-tickets-pdf', body);
			this.showNotification('Se genero el reporte de ventas masiva.');
		} catch (error) {
			this.showGenericError();
		}
	}
}

function referralGuideAction(dataSelected, code) {
	this.saleSelectedRow = { ...dataSelected };
	this.actionDialog = code;
	this.showModalGuie = true;
	this.dialogText = '¿Desea relizar un despacho por guía de remisión rapida?';
	this.dialogSubtext =
		'La ventas seleccionada se despachara con todos los productos seleccionados, de manera automática';
}

function actionCancel() {
	const options = {
		'referral-guide': this.referralGuide,
	};
	options[this.actionDialog].call();
}

function cancelDialogGuie() {
	this.showModalGuie = false;
	this.textErrorDispatch = '';
	this.saleSelectedRow = {};
}

async function createdGuie() {
	const { id, customer, employee, terminal, subsidiary } = this.dataSelected[0];
	const body = {
		flagGuieFast: true,
		salSaleDocumentsId: id,
		customerId: customer.id,
		dataClient: {
			sales: {
				customer: {
					customerId: customer.id,
					fullName: customer.typePerson ? customer.typePerson.fullName : '',
					documentName: customer.typePerson ? customer.typePerson.documentName : '',
					documentCode: customer.typePerson ? customer.typePerson.documentName : '',
					documentNumber: customer.typePerson ? customer.typePerson.documentNumber : '',
				},
				employee: {
					fullname: employee.fullname,
					employeeId: employee.id,
				},
				subsidiary: {
					sucursalName: subsidiary.sucursalName,
				},
				terminal: {
					id: terminal.id,
					name: terminal.name,
				},
			},
		},
	};
	try {
		await this.$httpSales.post('remission-guides-free ', body);
		this.showNotification('Se creo una guía de remisión rapida correctamente.');
		this.cancelDialogGuie();
		this.loadData();
	} catch (error) {
		if (error.status === 400) {
			if (error.data.message === 'FLAG_DISPATCH_TRUE_ERROR') {
				this.textErrorDispatch = error.data.messageError;
			}
		} else {
			this.showGenericError();
		}
	}
}

function electronicBilling(code) {
	const numBol = this.dataSelected.filter((d) => d.typeDocument.code === 'BOL');
	const validateBol = this.dataSelected.every((d) => d.typeDocument.code === 'BOL');
	if (this.electronicBillingActive) {
		if (this.isPeru && numBol.length) {
			if (this.electronicDailySummary) {
				this.openElectronic(code);
			} else {
				this.showNotification(
					'Solo se pueden enviar BOLETAS no asociadas a un resumen diario',
					'warning'
				);
			}
		} else {
			this.openElectronic(code);
		}
	} else if (validateBol) {
		this.showNotification(
			'Las BOLETAS Y NOTAS DE CREDITOS asociadas a BOLETAS se deben enviar por resumen diario.',
			'warning'
		);
	} else {
		this.showNotification(
			'Solo se pueden enviar FACTURAS, BOLETAS, NOTAS DE DÉBITO o NOTAS DE CRÉDITO no validadas',
			'warning'
		);
	}
}

async function getTotalSale() {
	if (!this.showGetTotal) {
		this.params.customerId = this.$route.query.customerId || this.params.customerId;
		const filterP = { ...this.params };
		filterP.currencies = this.params.currencies.map((c) => c.code).join(',');
		if (this.isPeru) {
			filterP.statusTax = filterP.statusTaxSri;
			filterP.statusTaxSri = null;
		}
		filterP.entityStateId = this.params.entityStateId;
		this.showGetTotal = true;

		await this.loadTotalByCoinsNet(filterP);
	} else {
		this.showGetTotal = false;
	}
}

function salesCanceled(saleId) {
	const sale = this.data.find((s) => s.id === saleId);
	const statusCancel = this.status.find((state) => state.code === 'ANU');
	this.$set(sale, 'state', statusCancel);
	this.$set(sale, 'statusName', statusCancel.name);
	this.cancelModal(false);
}

function salesTitle() {
	let title = this.$route.meta.title;
	const {
		ballotSummaryCode,
		ballotSummaryDate,
		customerName,
		cashDeskClosingId,
		closedAt,
		summaryUnsubscribeCode,
		summaryUnsubscribeDate,
	} = this.$route.query;
	if (this.ballotSummaryId) {
		title += ` - Resumen Diario ${ballotSummaryCode} - ${ballotSummaryDate}`;
	} else if (this.summaryUnsubscribeId) {
		title += ` - Resumen de Anulaciones ${summaryUnsubscribeCode} - ${summaryUnsubscribeDate}`;
	} else if (customerName) {
		title += ` - ${customerName}`;
	} else if (cashDeskClosingId) {
		title += ` - Cierre de caja del ${closedAt}`;
	}
	return title;
}

function searchDataFiltered(close) {
	const datesValid = differenceInDays(this.params.endDate, this.params.startDate) >= 0;
	if (datesValid) {
		this.currentPage = 1;
		if (close) {
			this.cancelModal(false);
			this.loadData();
		} else {
			this.loadData();
		}
	} else {
		this.showNotification('La fecha inicial no debe ser mayor a la final', 'info');
	}
}

function selectedAll(value) {
	this.checkAll = value;
	this.data = this.data.map((dataSingle) => {
		const newData = Object.assign({}, dataSingle);
		newData.isSelected = value;
		if (newData.isSelected) {
			if (this.dataSelected.length > 0) {
				const dataToAdd = this.dataSelected.find(
					(rowSelected) => rowSelected.id === newData.id
				);
				if (!dataToAdd) {
					this.dataSelected.push(newData);
				}
			} else {
				this.dataSelected.push(newData);
			}
		} else {
			const index = this.dataSelected.findIndex((ds) => ds.id === newData.id);
			this.dataSelected.splice(index, 1);
		}
		return newData;
	});
}

function setData(value, model) {
	if (value) {
		if (
			model === 'typePaymentParams' ||
			model === 'typeDocumentIds' ||
			model === 'employeeIds'
		) {
			this[model] = value;
		} else if (model === 'statusTaxSri') {
			this.params[model] = value.id;
			this.params.statusTaxIds = null;
		} else if (model === 'originPlatform') {
			this.params.referenceExternal = value.value ? value.value.code : null;
		} else if (model === 'subsidiaryId') {
			this.params[model] = value.value.id;
		} else {
			this.params[model] =
				model === 'status' || model === 'typeDocumentCode' ? value.code : value.id;
		}
	}
}

function setWarehouseIds(value) {
	if (value.includes(0)) {
		this.warehouseIds =
			this.warehouseIds.length === this.warehouses.length - 1
				? []
				: this.warehouses.filter((w) => w.id).map((w) => w.id);
	} else {
		this.warehouseIds = value;
	}
}

function setDataCustomer({ model, value }) {
	if (value && value.id) {
		this.params[model] = value.id;
	}
}

function setDate({ model, value }) {
	if (value) {
		this.params[model] = format(value, 'YYYY-MM-DD');
	} else if (model === 'startDate' && !value) {
		this.params.startDate = format(subDays(this.$today(), 7), 'YYYY-MM-DD');
	} else {
		this.params.endDate = this.$today();
	}
}

function setSearch(value) {
	this.searchData = value || null;
	this.params.search = value || null;
	this.isTableClean = !value;
	if (this.isTableClean) {
		helper.removeLocalData('sales::search');
	}
}

function setSale(row) {
	const newRow = { ...row };
	newRow.debtAmount = row.debtAmount || Number(row.amount) - Number(row.dueAmount);
	const sourceTransactions = row.accTransactions?.length
		? row.accTransactions
		: row.transactions || [];
	newRow.transactions =
		sourceTransactions.map((transaction) => {
			const newTransaction = { ...transaction };
			newTransaction.additionalInformation = transaction.additionalInformation || {};
			newTransaction.typePayment = transaction.typePayment || {};
			return newTransaction;
		}) || [];
	console.log('newRow.transactions', newRow.transactions);
	this.sale = { ...newRow };
	const saleDetails = this.sale.details;
	const products = saleDetails
		? saleDetails.map((detail) => detail.product || detail.description)
		: [];
	const nameProducts = products.map((p) => p.name || p);
	this.inlineProducts = nameProducts.join(', ');
	this.rowDetailSelected = this.rowDetailSelected.id === row.id ? {} : { ...row };
	this.toShow = !!this.rowDetailSelected.id;
	this.data = this.data.map((d) => {
		const newD = { ...d };
		newD.iconArrow = d.id === row.id && this.toShow ? 'arrow_back' : 'arrow_forward';
		return newD;
	});
}

function showDetails(row) {
	this.rowSelected = { ...row };
	this.rowDetails = [...this.rowSelected.details];
	this.dialogDetails = true;
}

function showSaleCancelForm() {
	return this.rowSelected && this.action.code === 'CANCEL-SALE';
}

function showTaxesState({ documentNumber, id }) {
	const { taxAgency } = this.labelsByCountry;
	this.currentSaleId = id;
	this.action.code = 'sunat-status-admin';
	this.action.title = `Venta #${documentNumber} - Estado de ${taxAgency}`;
	this.action.open = true;
}

function showTerminal(terminal) {
	return terminal ? terminal.name : '';
}

function showTransactions(row) {
	if (isResponsive) {
		return;
	}
	this.transactionCustomer = row.customer;
	if (row) {
		this.loadTransactions(row);
	} else {
		this.loadTransactions();
	}
	this.showTransactionsDetails = true;
	this.action.active = true;
	this.action.code = 'transaction-details';
	this.action.open = true;
	this.action.title = 'Detalle de Transacciones';
	this.action.width = 500;
}

function stopClick() {
	return false;
}

function openRelatedModal(sale) {
	this.originalDocument = { ...sale };
	this.action = {
		active: true,
		code: 'history-related',
		open: true,
		title: 'Documentos Relacionados',
		width: 450,
	};
}

function isRelatedDocuments() {
	return this.action.code === 'history-related';
}

function isFilter() {
	return this.action.code === 'filter-by';
}

function onAction(actionName, values) {
	if (actionName === 'accept') {
		const {
			flagNotDocumentRelated,
			flagNotCancel,
			flagNotNtc,
			flagNotNtd,
			paramsGroupClient,
			groupClient,
			paramsStateKardex,
			stateShippingKardex,
			paramsStatusWithholding,
		} = values;
		this.params.flagNotDocumentRelated = flagNotDocumentRelated || null;
		this.params.flagNotCancel = flagNotCancel || null;
		this.params.flagNotNtc = flagNotNtc || null;
		this.params.flagNotNtd = flagNotNtd || null;
		this.groupClient = groupClient || null;
		this.flagKardex = stateShippingKardex || null;
		this.params.groupId = paramsGroupClient || null;
		this.params.statusKardex = paramsStateKardex || null;
		this.params.statusWithholding = paramsStatusWithholding || null;
		this.searchDataFiltered(true);
	} else if (actionName === 'cancel') {
		this.cancelModal(false);
	}
}

function referralGuide() {
	const idTransportRow =
		this.dataSelected[0].dataClient &&
		this.dataSelected[0].dataClient.quotation &&
		this.dataSelected[0].dataClient.quotation.guideData &&
		this.dataSelected[0].dataClient.quotation.guideData.companyName
			? this.dataSelected[0].dataClient.quotation.guideData.companyName.value
			: null;
	this.goTo('reference-guide-detail', {
		params: { saleId: this.dataSelected[0].id, transportId: idTransportRow },
		query: { listSale: true },
	});
}

function unsubscribe() {
	const taxeSunat = this.isPeru ? 'statusTax' : 'statusTaxSri';
	const validation = this.dataSelected.filter(
		(d) =>
			d.typeDocument.code === 'BOL' ||
			(d.typeDocument.code === 'FAC' && d[taxeSunat] === 3)
	);
	if (validation.length === this.dataSelected.length) {
		if (this.isPeru) {
			this.loadValidate();
		} else {
			this.action.active = true;
			this.action.code = 'summary-unsubscribe';
			this.action.open = true;
			this.action.title = 'Dar de Baja a Documentos de Venta';
			this.action.width = 459;
		}
	} else {
		this.showNotification(
			'Los documentos solo pueden ser Factura y/o Boletas, y las facturas deben estar validado por la sunat',
			'info'
		);
	}
}

async function unsubscribeSales(commentary) {
	const body = {
		documentsRelated: this.dataSelected.map((d) => d.id),
		date: this.$today(),
		commentary,
	};
	try {
		await this.$httpSales.post('summary-unsubscribe', body);
		this.cancelModal(false);
	} catch (error) {
		this.showGenericError();
	}
}

function onAmortizationPaid() {
	this.action.open = false;
	this.action.code = null;
	this.toShow = true;
	this.cancelModal(false);
	this.loadData(this.currentPage, true);
}

function electronicDailySummary() {
	return this.dataSelected.every(
		(c) => c.typeDocument.code === 'BOL' && !c.ballotSummaryId
	);
}

function openElectronic(code) {
	this.action.active = true;
	this.action.code = code;
	this.action.open = true;
	this.action.title = 'Facturación Electrónica';
	this.action.width = 800;
	this.loading = false;
}

function clickMenu() {
	if (!this.isSelectWarehouses) {
		this.showNotification(
			'Debe seleccionar al menos una tienda para generar un reporte',
			'warning'
		);
	}
}

function isSelectWarehouses() {
	return Boolean(this.warehouseIds.length);
}

function getData({ model, value }) {
	if (model === 'entityStateId' || model === 'statusWithholding') {
		this.params[model] = value;
	} else {
		this.params[model] = model === 'currencies' ? [...value] : value.code;
	}
}

async function loadValidate(code) {
	const id = this.dataSelected[0].id;
	this.documentSelect = this.dataSelected[0].typeDocumentCode;
	try {
		({ data: this.validSale } = await this.$httpSales.get(
			`sale-documents-validate/${id}`
		));
		this.validAction(code);
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'WAS_ALREADY_CANCELED_SALE') {
				this.showGenericError(
					`La ${
						this.documentSelect === 'NTC' ? 'nota de crédito' : 'venta'
					} ya ha sido anulada anteriormente.`
				);
			} else if (err.data.message === 'DOCUMENTS_MUST_NOT_BE_CANCELED') {
				this.showGenericError('El documento ya se encuentra en proceso de anulación.');
			} else if (err.data.message === 'COUNTRY_DEFAULT_NOT_FOUND') {
				this.showGenericError('El documento no se encuentra configurado por país.');
			} else if (err.data.message === 'TYPE_DOCUMENT_NOT_FOUND') {
				this.showGenericError('Tipo de documento no encontrado.');
			} else if (err.data.message === 'PAYMENTS_RELATED_TO_SALE') {
				this.showGenericError(
					'No se puede anular el documento, hasta que sea cancelada completamente.'
				);
			} else if (err.data.message === 'DOCUMENTS_INFORMED_IN_COMMUNICATION') {
				this.showGenericError(
					'El documento ya ha sido informado en una comunicación anterior'
				);
			} else if (err.data.message === 'CONFIG_COUNTRY_NOT_FOUND') {
				this.showGenericError(
					'La configuración por país no fue encontrada, contacte con su proovedor.'
				);
			} else if (err.data.message === 'DOCUMENTS_MUST_BE_SENT') {
				this.showGenericError('Para poder anular, se debe relacionas el documento.');
			} else if (err.data.message === 'DOCUMENT_DELIVERY_TIME_EXCEEDED') {
				this.showGenericError('El tiempo de envío para el documento ha sido excedido.');
			}
		}
	}
}

function unLinkDocuments() {
	this.action.width = 400;
	this.action.code = 'unlink';
	this.action.active = true;
	this.action.open = true;
	this.action.title = 'Desvincular Documentos';
}

function updateDocuments() {
	this.cancelModal(false);
	this.loadData();
}

function toggleColumns() {
	return true;
}

function closeDetail() {
	this.sale = { customer: { typePerson: {} }, localDate: {} };
	this.inlineProducts = '';
	this.rowDetailSelected = {};
	this.toShow = false;
	this.data = this.data.map((d) => {
		const newD = { ...d };
		newD.iconArrow = 'arrow_forward';
		return newD;
	});
}

function validAction(code) {
	if (this.isPeru) {
		if (this.validSale.validated.errorCode) {
			if (
				this.validSale.validated.errorCode === 'DOCUMENT_WAS_NOT_INFORMED' &&
				!this.dataSelected[0].flagOldSale &&
				code !== 'regularize'
			) {
				this.openModalError();
			} else if (this.validSale.validated.errorCode === 'PAYMENTS_RELATED_TO_SALE') {
				this.openModalErrorSale();
			} else {
				this.cancelSale();
			}
		} else {
			this.cancelSale();
		}
	} else if (this.isEcuador && code === 'override') {
		if (this.validSale.validated) {
			if (this.validSale.validated.flagCancel) {
				this.cancelSale();
			} else {
				this.notification.title = 'ANULAR DOCUMENTO';
				this.notification.text =
					'Este documento no puede ser anulado, por que aún esta activo en la SRI.';
				this.notification.show = true;
				this.showModalInit = true;
			}
		} else {
			this.cancelSale();
		}
	}
}

function openModalError() {
	this.modal.btnText = 'Entendido';
	this.modal.message =
		'Para poder realizar la anulación del documento, este debe haber sido informado a la SUNAT previamente.';
	this.modal.open = true;
}

function openModalErrorSale() {
	this.modal.btnText = 'Entendido';
	this.modal.message =
		'El documento tiene pagos relacionados y no se puede realizar la acción.';
	this.modal.open = true;
}

function closeModalError() {
	this.modal.open = false;
	this.modal.btnText = '';
	this.modal.message = '';
}

function convertCot({ id, typeDocumentCode }) {
	const queryConvert = typeDocumentCode === 'NTV' ? 'ntv' : 'cot';
	this.goTo('new-sale', { query: { cloneId: id, convert: queryConvert } });
}

function setCreatedAtHour(rowData) {
	return format(new Date(rowData.createdAt), 'DD-MM-YYYY HH:mm:ss');
}

function getCancelClass({ state }) {
	return state.code === 'ANU' || state.code === 'ANUSUNAT' ? 'cancel-style-text' : '';
}

function showModalSend({ id }, type) {
	const sendType = type || 'email';
	this.saleSend = this.data.find((d) => d.id === id);
	if (sendType === 'email') {
		if (this.saleSend.customer) {
			if (this.saleSend.customer.email) {
				this.emails.push(this.saleSend.customer.email);
			}
		}
	} else if (sendType === 'phone') {
		if (this.saleSend.customer) {
			if (this.saleSend.customer.phone) {
				this.phone = this.saleSend.customer.phone;
			}
		}
	}
	this.sendTypeRecord = sendType;
	this.dialogSend = true;
}

function closeModalSend() {
	this.emails.splice(0);
	this.phone = '';
	this.sendTypeRecord = null;
	this.dialogSend = false;
}

async function sendRecords() {
	if (this.sendTypeRecord === 'phone') {
		try {
			const {
				data: { details },
			} = await this.$httpSales.get(`sale-documents/${this.sale.id}`);
			const paisNumero = '+51';
			const numero = `${paisNumero}${this.phone}`;
			const {
				amount,
				typeDocumentName,
				currencySymbol,
				typeDocumentCode,
				documentNumber,
			} = this.sale;
			const { fullName, documentNumber: documentNumberCustomer } =
				this.sale.customer.typePerson;
			const companyName = this.sale.subsidiary.sucursalName || '';
			const detailsProducts = details.map(
				(d) => `\t- ${d.quantity} ${d.description} ${currencySymbol} ${d.subTotal}`
			);
			let linkDocument = false;

			if (this.sale.dataResponseTaxes) {
				if (this.sale.dataResponseTaxes.documentUrl) {
					linkDocument = this.sale.dataResponseTaxes.documentUrl;
				}
			}

			const dataMessage = {
				salutation: `Hola!\n\nHemos generado tu ${typeDocumentName} desde ${companyName}`,
				document: `*DOCUMENTO:*\n\t${typeDocumentCode}-${documentNumber}`,
				customer: `*CLIENTE:*\n\t${fullName.toUpperCase()} (${documentNumberCustomer})`,
				products: `*PRODUCTOS:*\n${detailsProducts.join('\n')}`,
				total: `*TOTAL:*\n\t${currencySymbol} ${amount}`,
				download: linkDocument ? `*DESCARGAR DOCUMENTO DESDE:* ${linkDocument}` : '',
			};

			const message =
				`${dataMessage.salutation}\n\n${dataMessage.document}` +
				`\n\n${dataMessage.customer}\n${dataMessage.products}` +
				`\n\n${dataMessage.total}\n\n${dataMessage.download}`;
			const mensajeEscapado = encodeURIComponent(message);
			const enlaceWhatsApp = `https://api.whatsapp.com/send?phone=${numero}&text=${mensajeEscapado}`;
			window.open(enlaceWhatsApp);
			this.closeModalSend();
		} catch (error) {
			console.error(error);
		}
	} else if (this.sendTypeRecord === 'email') {
		const body = {
			code: 'pdf',
			email: [...this.emails],
		};
		try {
			await this.$httpSales.post(`/sale-documents/${this.saleSend.id}/email`, body);
			this.showNotification('El comprobante se envió correctamente');
			this.closeModalSend();
		} catch (error) {
			this.showGenericError();
		}
	}
}

function removeEmail(item) {
	const index = this.emails.indexOf(item);
	if (index > -1) {
		this.emails.splice(index, 1);
	}
}

function removePhone() {
	this.phone = '';
}

function getKardexStatus(row) {
	let color = 'red';
	let tooltip = 'Pendiente de envió';
	if (row.sendKardexMessage) {
		color = row.sendKardexMessage.color;
		tooltip = row.sendKardexMessage.name;
	}
	// if (row.sendKardexStatus === typeStatusKardex.Inprocesses) {
	// 	color = 'warning';
	// 	tooltip = 'En proceso';
	// } else if (row.sendKardexStatus === typeStatusKardex.Send) {
	// 	color = 'success';
	// 	tooltip = 'Enviado al kardex';
	// } else if (row.sendKardexStatus === typeStatusKardex.NotSend) {
	// 	color = 'gray';
	// 	tooltip = 'Venta no despachable';
	// } else if (row.sendKardexStatus === typeStatusKardex.Pending) {
	// 	color = 'warning';
	// 	tooltip = 'En Proceso de Envio';
	// }
	return {
		color,
		tooltip,
	};
}

async function sendToKardex(typeOperation) {
	const body = {
		ids: this.dataSelected.map((d) => d.id),
		typeOperation,
	};
	try {
		this.$httpSales.post('kardex-movement-insert', body);
		this.showNotification('La acción se realizó correctamente');
		this.searchDataFiltered();
	} catch (error) {
		if (error.status === 400) {
			if (error.data.message === 'NOT_DISPATCHABLE_SALES_ERROR') {
				this.showGenericError(error.data.messageError);
			}
		} else {
			this.showGenericError();
		}
	}
}

function syncFirebase(row) {
	if (row.flagSyncFb === 1) {
		return 'Registrada/Pendiente';
	} else if (row.flagSyncFb === 2) {
		return 'Procesada/Finalizada';
	} else if (row.flagSyncFb === 3) {
		return 'No Registrada';
	} else if (row.flagSyncFb === 4) {
		return 'Pendiente';
	}
	return 'No Aplica';
}

function colorSyncFirebase(row) {
	if (row.flagSyncFb === 1) {
		return 'primary';
	} else if (row.flagSyncFb === 2) {
		return 'primary';
	} else if (row.flagSyncFb === 3) {
		return 'error';
	} else if (row.flagSyncFb === 4) {
		return 'warning';
	}
	return 'black';
}

function labelConfigSale() {
	return this.$userInfo.company.settings.downloadSale
		? 'Descargar Documento'
		: 'Vista Previa del Documento';
}

function openSearchCustomer(value) {
	this.searchValCustomer = value ? value.trim() : '';
	this.action.code = 'customer-searcher';
	this.action.title = 'Clientes';
	this.action.width = 739;
	this.action.open = true;
}

function setCustomer(customer) {
	const { id, typePerson } = customer;
	this.params.customerId = id;
	this.selectedCustomer = `${typePerson.fullName} - ${typePerson.documentNumber}` || '';
	this.cancelModal(false);
}

function closeNotification() {
	this.notification = {
		show: false,
		colorDialog: '',
		colorHex: '',
		text: '',
		title: '',
	};
}

function goToMovement() {
	if (this.transactionCustomer.flagGeneric !== 1) {
		const routeData = this.$router.resolve({
			name: 'accounts-receivable',
			params: { customerId: this.transactionCustomer.id },
		});
		window.open(routeData.href, '_blank');
	} else {
		this.customerGeneric = true;
	}
}

async function updateExtCompanyCode({ value = '' }, id) {
	try {
		if (!value || !id || value.length < 3) {
			this.showGenericError('Introduzca un valor valido');
			return;
		}
		await this.$httpSales.patch(`/sale-documents-update-information/${id}`, {
			externalData: { extCompanyCode: value },
		});
		this.showNotification('Codigo externo actualizado correctamente');
		this.loadData();
	} catch (error) {
		console.error(error);
		this.showGenericError('Error al actualizar codigo externo');
	}
}

function data() {
	return {
		action: {
			active: false,
			code: null,
			open: false,
			title: 'titulo desde data',
			width: 500,
		},
		actionDialog: null,
		actionSale: {
			active: true,
			code: 'TNV',
			open: true,
			title: 'Transformar Nota de Venta',
			width: 850,
		},
		amortization: {},
		checkAll: false,
		isResponsive,
		columns: [
			{
				id: 1,
				name: 'Empresa',
				value: 'sucursalName',
				visible: !isResponsive,
				checked: !isResponsive,
				tooltip: 'Nombre de la Empresa',
			},
			{
				id: 2,
				name: 'Terminal',
				value: 'terminalId',
				visible: !isResponsive,
				checked: !isResponsive,
				tooltip: 'Nombre de Terminal',
			},
			{
				id: 3,
				name: 'Tienda',
				value: 'warehouseName',
				visible: !isResponsive,
				checked: !isResponsive,
				tooltip: 'Nombre de la Tienda',
			},
			{
				id: 4,
				name: 'Cliente',
				value: 'customerData',
				visible: true,
				checked: true,
				tooltip: 'Nombre de Cliente',
			},
			{
				id: 5,
				name: 'Nro Doc. Cliente',
				visible: false,
				checked: false,
				tooltip: 'Numero de Documento del Cliente',
			},
			{
				id: 6,
				name: 'Telefono',
				visible: false,
				checked: false,
				tooltip: 'Telefono de Documento',
			},
			{
				id: 7,
				name: '# DOC',
				value: 'docNumber',
				visible: true,
				checked: true,
				tooltip: 'Número de Documento',
			},
			{
				id: 8,
				name: 'Empleado',
				visible: true,
				checked: true,
			},
			{
				id: 9,
				name: 'F. Emisión',
				value: 'createdAt',
				visible: true,
				checked: true,
				tooltip: 'Fecha de Emisión',
			},
			{
				id: 10,
				name: 'T. Doc',
				value: 'typeDocumentName',
				visible: true,
				checked: true,
				tooltip: 'Tipo de Documento',
			},
			{
				id: 11,
				name: 'Origen',
				visible: !isResponsive,
				checked: !isResponsive,
			},
			{
				id: 12,
				name: 'M. Pago',
				value: 'typePaymentName',
				visible: true,
				checked: true,
				tooltip: 'Modo de Pago',
			},
			{
				id: 13,
				name: 'T. Pago',
				value: 'typePaymentNames',
				visible: true,
				checked: true,
				tooltip: 'Tipo de Pago',
			},
			{
				id: 14,
				name: 'Total',
				value: 'amount',
				visible: true,
				checked: true,
				tooltip: 'Total de Venta',
			},
			{
				id: 15,
				name: 'T. Deuda',
				value: 'debtAmount',
				visible: !isResponsive,
				checked: !isResponsive,
				tooltip: 'Total de Deuda',
			},
			{
				id: 16,
				name: 'Sunat',
				value: 'statusTaxInfo',
				visible: true,
				checked: true,
				tooltip: 'Estado de Sunat',
			},
			{
				id: 17,
				name: 'Estado',
				value: 'statusName',
				visible: true,
				checked: true,
			},
			{
				id: 18,
				name: 'E. Pago',
				value: 'paymentStateName',
				visible: true,
				checked: true,
				tooltip: 'Estado de Pago',
			},
			{
				id: 19,
				name: 'E. Kardex',
				value: 'sendKardexStatus',
				visible: !isResponsive,
				checked: !isResponsive,
				tooltip: 'Estado de envió al kardex',
			},
			{
				id: 20,
				name: 'Est. de Entidad',
				value: 'stateEntity',
				visible: false,
				checked: false,
				flagVisible: true,
				tooltip: 'Estado de Entidad',
			},
			{
				id: 21,
				name: 'Sinc. con Firebase',
				visible: false,
				checked: false,
				tooltip: 'Sincronización con Firebase',
			},
			{
				id: 22,
				name: 'Doc. Relacionados',
				visible: false,
				checked: false,
				tooltip: 'Documentos Relacionados',
			},
			{
				id: 23,
				name: 'extCompanyCode',
				visible: false,
				checked: false,
				tooltip: 'extCompanyCode',
				flagVisible: !this.$userInfo.company.settings.flagExternalData,
			},
			{
				id: 24,
				name: 'Acciones',
				visible: true,
				checked: true,
			},
		],
		currentPage: 1,
		currentSaleId: 0,
		customers: [],
		customerGeneric: false,
		data: [],
		dataSelected: [],
		dialog: false,
		dialogDetails: false,
		dialogText: null,
		dialogSubtext: null,
		documentsWhithRelated: new Set(),
		employees: [],
		employeeIds: [],
		endDate: null,
		flagKardex: null,
		groupClient: null,
		groupClients: [],
		inlineProducts: '',
		isClean: false,
		isLoading: false,
		isTableClean: false,
		justifySpace: '',
		keyValue: 'warProductId',
		lastPage: 0,
		loading: false,
		loadingGeneral: true,
		localSearch: '',
		menuEnd: false,
		menuStart: false,
		modal: {
			btnText: '',
			message: '',
			open: false,
		},
		notification: {
			colorDialog: 'error',
			colorHex: '#D5331A',
			show: false,
			text: '',
			title: '',
		},
		onLoadData: false,
		disabledSearch: false,
		options: [
			{ id: 1, code: 'heading', name: 'Lista de Ventas' },
			{ id: 2, code: 'detail', name: 'Detalle de Ventas' },
			{ id: 3, code: 'ple', name: 'Descargar PLE' },
			{ id: 4, code: 'sellers', name: 'Lista Vendedores Soles y Caja' },
		],
		originConfig: [],
		originalDocument: {},
		params: {
			customerId: null,
			currencies: [this.$userInfo.company.currencyDefault],
			endDate: null,
			statusKardex: null,
			flagNotDocumentRelated: null,
			flagNotCancel: null,
			flagNotNtc: null,
			flagNotNtd: null,
			employeeIds: null,
			groupId: null,
			limit: 20,
			originPlatform: null,
			page: 1,
			entityStateId: null,
			paymentState: null,
			search: null,
			sortField: 'created_at',
			stateEntity: null,
			startDate: null,
			status: null,
			typeDocumentIds: null,
			saleIds: null,
			statusWithholding: null,
			warehouseIds: null,
			documentTypesNot: 'COT',
			typePaymentIds: null,
			subsidiaryId: null,
		},
		paymentStates: [],
		properties: ['id'],
		rowDetails: [],
		rowDetailSelected: {},
		rowSelected: null,
		saleRegularize: false,
		selectedCustomer: null,
		showLoading: false,
		showGetTotal: false,
		showEntityState: false,
		sale: {
			customer: {
				typePerson: {},
			},
			localDate: {},
		},
		saleData: null,
		saleSelectedRow: {},
		saleDetailsColumns: [
			{ id: 1, name: 'Código', visible: true, checked: true },
			{ id: 2, name: 'Cod. interno', visible: true, checked: true },
			{ id: 3, name: 'Nombre', visible: true, checked: true },
			{ id: 4, name: 'Características', visible: true, checked: true },
			{ id: 5, name: 'Descripción', visible: true, checked: true },
			{ id: 6, name: 'Ubicación', visible: true, checked: true },
			{ id: 7, name: 'Marca', visible: true, checked: true },
			{ id: 8, name: 'P. venta', visible: true, checked: true },
			{ id: 9, name: 'Cantidad', visible: true, checked: true },
			{ id: 10, name: 'Stock', visible: true, checked: true },
			{ id: 11, name: 'Kg', visible: true, checked: true },
		],
		saleDetailsKeyValue: 'warProductsId',
		saleId: null,
		saleSelected: [],
		statesWithholding: [
			{
				id: 1,
				name: 'Pendiente',
			},
			{
				id: 2,
				name: 'Relacionado',
			},
		],
		showDetailsValidate: false,
		sunatSaleDetail: {},
		searchData: '',
		showDebts: false,
		showStateEntity: false,
		showTransactionsDetails: false,
		startDate: null,
		showModalGuie: false,
		status: [],
		sunatStates: [],
		toShow: false,
		totalSalesAmount: 0,
		transactionCustomerId: null,
		transactions: [],
		typeDocumentIds: [],
		searchValCustomer: null,
		saleIds: [],
		textErrorDispatch: '',
		typeDocuments: [],
		typePaymentParams: [],
		typePayments: [],
		warehouseIds: [],
		warehouses: [],
		currencies: [],
		validSale: {},
		itemsTotalQuantity: 0,
		indexesCancel: [],
		dialogSend: false,
		emails: [],
		phone: null,
		sendTypeRecord: null,
		saleSend: null,
		documentSelect: null,
		showModalInit: false,
		listSubsidiaries: [],
		totalByCoins: [],
		statusTaxName: {
			id: 1,
			code: 'un-sent',
			name: 'Sin enviar',
			description: 'El documento aún no ha sido enviado a SUNAT.',
			color: 'grey darken-2',
			showDetails: false,
		},
	};
}

export default {
	name: 'list-of-sales',
	components: {
		actionSidebar,
		amortizationsForm,
		appActions,
		appSelect,
		appTable,
		appTooltipButton,
		autocompleteComponent,
		dateComponent,
		documentConvert,
		documentState,
		fastProductsAction,
		generalFilter,
		headerPage,
		modalSidebarButton,
		relatedDocuments,
		salesSunat,
		salesCancel,
		salesDetailsInTable,
		salesSunatDetails,
		selectFilters,
		sunatStatusAdmin,
		personSearchForm,
		personSearchInput,
		transactionsDetail,
		summaryUnsubscribe,
		salesUnlink,
		modalItems,
		appShowDialog,
		salesCancelNew,
		collectFromSale,
	},
	computed: {
		actionsDisabled,
		electronicBillingActive,
		electronicDailySummary,
		enableActions,
		labelConfigSale,
		isAdmin,
		isDocumentConvert,
		isFilter,
		isPeruvianAdmin,
		isRelatedDocuments,
		isSunatStatusAdmin,
		salesTitle,
		showSaleCancelForm,
		isSelectWarehouses,
	},
	created,
	data,
	methods: {
		actionCancel,
		allIsSelected,
		callServiceAndSearch,
		cancelModal,
		cancelSale,
		cancelDialogGuie,
		changePage,
		clickMenu,
		closeDetail,
		closeDialog,
		closeModalError,
		closeNotification,
		createdGuie,
		convert,
		convertCot,
		documentLinked,
		downloadSale,
		downloadSaleList,
		duplicateSale,
		electronicBilling,
		emitExcel,
		filterData,
		generateExportParams,
		generateSunatColor,
		generateMassive,
		getCancelClass,
		getData,
		getTotalSale,
		goToMovement,
		listOrigin,
		loadAmortization,
		loadCustomers,
		loadData,
		loadGroupClients,
		loadTransactions,
		loadValidate,
		onAction,
		onAmortizationPaid,
		onCleanData,
		openDebtModal,
		openElectronic,
		openModal,
		openModalError,
		openModalErrorSale,
		openSearchCustomer,
		openRelatedModal,
		openSunatDetails,
		loadSunatInvoicing,
		openDrawer,
		preGoTo,
		referralGuideAction,
		referralGuide,
		reloadSalesSunat,
		removeSalesSunat,
		rowIsSelected,
		runAction,
		salesCanceled,
		searchDataFiltered,
		selectedAll,
		setCustomer,
		setCreatedAt,
		setCreatedAtHour,
		setData,
		setDataCustomer,
		setDate,
		setDebtAmount,
		setDocNumber,
		setHasProducts,
		setIsRelatedDocument,
		setIsSelected,
		setSale,
		setSearch,
		setUpData,
		setUpNewProperties,
		showDetails,
		showTaxesState,
		showTerminal,
		showTransactions,
		stopClick,
		syncFirebase,
		colorSyncFirebase,
		toggleColumns,
		unLinkDocuments,
		unsubscribe,
		unsubscribeSales,
		updateDocuments,
		validAction,
		showModalSend,
		sendRecords,
		closeModalSend,
		removeEmail,
		removePhone,
		getKardexStatus,
		regularizeSale(row) {
			const sale = this.data.find((d) => d.id === row.id);
			this.dataSelected.push(sale);
			this.rowSelected = sale;
			this.loadValidate('regularize');
			this.saleRegularize = true;
		},
		async setRegularizeSale(sale) {
			try {
				await this.$httpSales.post(`sale-documents/${this.rowSelected.id}/void`, sale);
				this.showNotification(
					'Esta venta ya ha sido regularizada correctamente',
					'warning'
				);
				this.saleRegularize = false;
				this.cancelModal();
				this.loadData();
			} catch (error) {
				this.showGenericError();
			}
		},
		sendToKardex,
		setWarehouseIds,
		async loadSubsidiaries() {
			const subsidiaries = await this.$httpSales.get('subsidiaries');
			this.listSubsidiaries = subsidiaries.data;
		},
		async loadTotalByCoins(params) {
			try {
				const { data: dataTotals } = await this.$httpSales.get(
					'v2/sale-documents-total',
					{
						params,
					}
				);
				this.totalByCoins =
					(dataTotals &&
						dataTotals.data &&
						dataTotals.data.map((item) => ({
							label: item.currency,
							value: item.totalSales,
						}))) ||
					[];
			} catch (error) {
				this.showGenericError('No se pudieron cargar los totales');
				this.totalByCoins = [];
			}
		},
		async loadTotalByCoinsNet(params) {
			try {
				const { data: dataTotals } = await this.$httpSales.get(
					'sale-documents-total-net',
					{
						params,
					}
				);
				this.totalByCoins =
					(dataTotals &&
						dataTotals.data &&
						Object.keys(dataTotals.data).map((currency) => ({
							label: currency,
							value: dataTotals.data[currency].total,
						}))) ||
					[];
			} catch (error) {
				this.showGenericError('No se pudieron cargar los totales');
				this.totalByCoins = [];
			}
		},
		updateExtCompanyCode: debounce(updateExtCompanyCode, 1600),
	},
	props: {
		ballotSummaryId: [Number, String],
		summaryUnsubscribeId: [Number, String],
	},
};
</script>

<style lang="scss" scoped>
.options-menu {
	button {
		box-shadow: none;
		margin: 0px;
		min-width: auto;

		&:hover {
			background-color: transparent;
		}
	}
}

.align-img {
	vertical-align: middle;
}

.pos-relative {
	position: relative;
}
.pos-relative-responsive {
	display: flex;
	align-items: center;
	justify-content: space-evenly;
}

.change-document-btn {
	background-color: transparent;
	box-shadow: none;
	height: auto;
	margin: 0px;
	min-width: auto;
	position: absolute;
	right: 5px;
	top: 10px;
}
.change-document-btn-responsive {
	position: initial;
}

.icon-centered {
	align-items: center;
	display: flex;
}

.related-document {
	cursor: pointer;
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

.document-column {
	min-width: 60px !important;
	padding: 0px !important;
}

.icon-container {
	display: flex;
	justify-content: flex-end;
	padding-right: 10px;
}

.cancel-style-text {
	text-decoration: line-through;
}

.state-entity {
	border-radius: 4px;
	color: color(white);
	font-family: map-get($fonts, open-bold);
	padding: 3px 6px;
}

.bold {
	font-weight: bold;
}

.sales-list-header {
	padding-top: 10px;
}

.error-dispatch {
	font-size: 14px;
	text-align: center;
}
</style>
