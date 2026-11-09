<template>
	<div class="convert-sale">
		<div class="loading" v-if="loadingDetailSale">
			<div class="loading-message">
				La carga terminará en un momento y podrás ver toda la información del detalle de
				la venta.
			</div>
		</div>
		<header-page
			name="sales"
			sale
			dispatch-by-group
			:columns="columnsComputed"
			:rows="rowsToExport"
			:title="$route.meta.title"
			:showExcel="true"
			:to-show="true"
			:show-clean="false"
			@download-dispatch="downloadSale"
			@show-modal-send="showModalSend"
		>
			<v-flex pr-3 text-xs-right>
				Cantidad de Productos Vendidos: {{ sale.totalQuantitySold }}
			</v-flex>
		</header-page>
		<app-actions
			class="hide-and-print"
			:value-disabled="valuesDisabled"
			:resource-uri="$route.name"
			@run-action="runAction"
			@open-help="openHelp"
		/>
		<section mt-5>
			<v-layout wrap px-4 py-2 align-center class="border-title">
				<v-flex xs6 class="sale-document-info">
					<span class="detail-type-document">#{{ sale.typeDocumentName }}</span>
					<span class="detail-type-document">{{ sale.documentNumberComplete }}</span>
				</v-flex>
				<v-flex xs6>
					<v-layout row>
						<v-flex>
							<v-layout column>
								<v-flex class="primary--text detail-title-row">
									Código de Asiento:
								</v-flex>
								<v-flex class="detail-accouting primary--text">
									<span
										v-if="sale.accountingAccount"
										class="border-bottom"
										@click="showDetail"
									>
										{{ sale.accountingAccount.code }}
									</span>
									<span v-else class="input--text"> La venta aún no se contabiliza </span>
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex ml-3>
							<v-layout column>
								<v-flex class="primary--text detail-title-row mb-1">
									Estado de entidad:
								</v-flex>
								<v-flex class="detail-description-row">
									{{ sale.entityStateName }}
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex ml-3 v-if="sale.employee">
							<v-layout column>
								<v-flex class="primary--text detail-title-row mb-1"> Vendedor: </v-flex>
								<v-flex class="detail-description-row">
									{{ sale.employee.name }} {{ sale.employee.lastname }}
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex ml-3 v-if="sale.orderId">
							<v-layout column>
								<v-flex class="primary--text detail-title-row mb-1">
									Pedido Rel.:
								</v-flex>
								<v-flex>
									<router-link
										:to="{
											name: 'page-detail-order',
											params: { orderId: sale.orderId },
										}"
										target="_blank"
									>
										{{ sale.order.documentNumber }}
									</router-link>
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex
							ml-3
							v-if="sale.documentRelated && sale.documentRelated.documentNumber"
						>
							<v-layout column>
								<v-flex class="primary--text detail-title-row">
									Documento Relacionado:
								</v-flex>
								<v-flex>
									<a :href="`/sales/convert/${sale.documentRelated.id}`" target="_blank">
										<span v-if="sale.documentRelated.typeDocument">
											{{ sale.documentRelated.typeDocument.name }}
										</span>
										{{ sale.documentRelated.documentNumber }}
									</a>
								</v-flex>
							</v-layout>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
			<v-layout row wrap align-center px-4 mt-1>
				<v-flex xs3>
					<v-layout row wrap align-center px-2>
						<v-flex d-flex align-center pl-2 class="column-label"> Cliente: </v-flex>
						<v-flex d-flex align-center class="column-value">
							{{ saleCustomer }}
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs3>
					<v-layout row wrap align-center px-2>
						<v-flex d-flex align-center pl-2 class="column-label"> M. de Pago: </v-flex>
						<v-flex d-flex align-center class="column-value">
							{{ sale.typePaymentName }}
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs6>
					<v-layout row wrap align-center px-2>
						<v-flex d-flex align-center pl-2 class="column-label"> Dirección: </v-flex>
						<v-flex d-flex align-center class="column-value">
							{{ sale.addressCustomer || sale.customer.address }}
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
			<v-layout row wrap align-center px-4 mt-1>
				<v-flex xs3>
					<v-layout row wrap align-center px-2>
						<v-flex d-flex align-center pl-2 class="column-label"> DNI/RUC: </v-flex>
						<v-flex d-flex align-center class="column-value">
							{{ sale.customer.typePerson.documentNumber }}
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs3>
					<v-layout row wrap align-center px-2>
						<v-flex d-flex align-center pl-2 class="column-label"> T. Doc: </v-flex>
						<v-flex d-flex align-center class="column-value">
							{{ sale.typeDocumentName }}
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs3>
					<v-layout row wrap align-center px-2>
						<v-flex d-flex align-center pl-2 class="column-label"> Fecha </v-flex>
						<v-flex d-flex align-center class="column-value">
							{{ sale.localDate.date | formatDate }}
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs3>
					<v-layout row wrap align-center px-2>
						<v-flex d-flex align-center pl-2 class="column-label">
							F. Actualización:
						</v-flex>
						<v-flex d-flex align-center class="column-value">
							{{ sale.updatedAt | formatDate }}
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
			<v-layout row wrap align-center px-4 mt-1>
				<v-flex xs3>
					<v-layout row wrap align-center px-2>
						<v-flex d-flex align-center pl-2 class="column-label"> Estado </v-flex>
						<v-flex d-flex align-center class="column-value">
							{{ labelsByCountry.taxAgency }}: {{ sale.statusTaxName.name }}
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs3 v-if="sale.employee">
					<v-layout row wrap align-center px-2>
						<v-flex d-flex align-center pl-2 class="column-label"> Vendedor </v-flex>
						<v-flex d-flex align-center class="column-value">
							{{ sale.employee.name }} {{ sale.employee.lastname }}
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs3>
					<v-layout row wrap align-center px-2>
						<v-flex d-flex align-center pl-2 class="column-label"> Origen </v-flex>
						<v-flex d-flex align-center class="column-value">
							{{ sale.originPlatformName || '' }}
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs3>
					<v-layout row wrap align-center px-2>
						<v-flex d-flex align-center pl-2 class="column-label"> Peso Total </v-flex>
						<v-flex d-flex align-center class="column-value">
							{{ totalWeigth | round }}
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs3 v-if="sale.currency !== 'PEN'">
					<v-layout row wrap align-center px-2>
						<v-flex d-flex align-center pl-2 class="column-label"> T. de Cambio </v-flex>
						<v-flex
							d-flex
							align-center
							class="column-value"
							v-if="
								sale.totalTaxesAmount.detraction &&
								sale.totalTaxesAmount.detraction.exchangeRate
							"
						>
							{{ sale.totalTaxesAmount.detraction.exchangeRate || 0 }}
						</v-flex>
						<v-flex d-flex align-center class="column-value" v-else>
							{{ sale.exchangeRate || 0 }}
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
			<v-layout row wrap align-center px-4 mt-1>
				<v-flex xs3>
					<v-layout row wrap align-center px-2>
						<v-flex d-flex align-center pl-2 class="column-label"> E. de venta: </v-flex>
						<v-flex d-flex align-center class="column-value">
							{{ sale.state.name }}
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs3 v-if="showCostBenefit">
					<v-layout row wrap align-center px-2>
						<v-flex d-flex align-center pl-2 class="column-label"> Beneficio </v-flex>
						<v-flex d-flex align-center class="column-value">
							{{ (sale.amount - totalAdvanceInvoice - sale.totalCost) | round }}
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
			<v-layout row wrap align-center px-4 mt-1 v-if="sale.typeCatalogSunat">
				<v-flex xs3>
					<v-layout row wrap align-center px-2>
						<v-flex d-flex align-center pl-2 class="column-label">
							T. Nota de Credito:
						</v-flex>
						<v-flex d-flex align-center class="column-value">
							{{ getCreditNoteLabel() }}
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
		</section>
		<v-layout ml-4 mt-3 v-if="sale.totalTaxesAmount.detraction">
			<v-flex xs7 class="product-list">Información de la Detracción</v-flex>
		</v-layout>
		<v-layout wrap px-4 mt-2 mb-3 v-if="sale.totalTaxesAmount.detraction">
			<v-flex xs3>
				<v-layout row wrap align-center px-2>
					<v-flex d-flex align-center pl-2 class="column-label"> Monto </v-flex>
					<v-flex d-flex align-center class="column-value">
						{{ sale.totalTaxesAmount.detraction.currencySymbol || 'S/' }}
						{{ sale.totalTaxesAmount.detraction.amount | round }}
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs3>
				<v-layout row wrap align-center px-2>
					<v-flex d-flex align-center pl-2 class="column-label"> Porcentaje </v-flex>
					<v-flex d-flex align-center class="column-value">
						{{ sale.totalTaxesAmount.detraction.percentage }} %
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs3>
				<v-layout row wrap align-center px-2>
					<v-flex d-flex align-center pl-2 class="column-label">
						Tipo de Detracción
					</v-flex>
					<v-flex d-flex align-center class="column-value">
						<v-tooltip top>
							<span slot="activator">
								{{ sale.totalTaxesAmount.detraction.detractionTypeName | limitTo(15) }}
							</span>
							<span>
								{{ sale.totalTaxesAmount.detraction.detractionTypeName }}
							</span>
						</v-tooltip>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<v-layout ml-4 mt-3 v-if="sale.withholdingTaxes && sale.withholdingTaxes.amount">
			<v-flex xs7 class="product-list">Información de la Retención</v-flex>
		</v-layout>
		<v-layout
			wrap
			px-4
			mt-2
			mb-3
			v-if="sale.withholdingTaxes && sale.withholdingTaxes.amount"
		>
			<v-flex xs3>
				<v-layout row wrap align-center px-2>
					<v-flex d-flex align-center pl-2 class="column-label"> Base Imponible </v-flex>
					<v-flex d-flex align-center class="column-value">
						{{ sale.withholdingTaxes.base }}
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs3>
				<v-layout row wrap align-center px-2>
					<v-flex d-flex align-center pl-2 class="column-label"> Monto </v-flex>
					<v-flex d-flex align-center class="column-value">
						{{ sale.withholdingTaxes.amount }}
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs3>
				<v-layout row wrap align-center px-2>
					<v-flex d-flex align-center pl-2 class="column-label"> Porcentaje </v-flex>
					<v-flex d-flex align-center class="column-value">
						{{ sale.percentageWithholding }} %
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs7 mt-2 class="product-list">Listado de Productos</v-flex>
			<v-flex xs class="carrillo-advance-invoice" v-if="totalAdvanceInvoice">
				<div>
					<h5>Total anticipado:</h5>
					<output class="mx-2"
						>{{ sale.currencySymbol }} {{ totalAdvanceInvoice | round }}</output
					>
				</div>
			</v-flex>
		</v-layout>
		<app-table
			selectable
			name="sale-details"
			:columns="columnsComputed"
			:rows="data"
			:include-filter="false"
			:input-search="false"
			:check-all="checkAll"
			:caption-quantity="false"
			@row-is-selected="rowIsSelected"
			@on-selected-all="selectedAll"
			class="mb-0 mt-3"
		>
			<template slot="rows" slot-scope="props">
				<td v-show="showRow(columns, 1)">
					{{ props.row.product ? props.row.product.code : props.row.productCode }}
				</td>
				<td v-show="showRow(columns, 2)">{{ props.row.warehouseName }}</td>
				<td v-show="showRow(columns, 3)">{{ props.row.description }}</td>
				<td v-show="showRow(columns, 4)">
					{{
						props.row.product
							? props.row.product.inlineFeatures
							: props.row.inlineFeatures
					}}
				</td>
				<td v-show="showRow(columns, 5)">{{ props.row.brandName }}</td>
				<td v-show="showRow(columns, 6)">{{ props.row.parts }}</td>
				<td v-show="showRow(columns, 7)">{{ props.row.meterage }}</td>
				<td v-show="showRow(columns, 8)">{{ props.row.quantity }}</td>
				<td v-show="showRow(columns, 9)">{{ props.row.unitName }}</td>
				<td v-show="showRow(columns, 10)" class="width-attribute">
					{{
						props.row.aditionalInformation && props.row.aditionalInformation.attributes
							? props.row.aditionalInformation.attributes
							: null
					}}
				</td>
				<td v-show="showRow(columns, 11)">{{ props.row.unitPrice | round }}</td>
				<td v-show="showRow(columns, 12)">
					{{ getPriceSale(props.row) | round }}
				</td>
				<td v-show="showRow(columns, 13)">
					{{ props.row.discountPercentage }}
				</td>
				<td v-show="showRow(columns, 14)">{{ props.row.tax }}</td>
				<td v-show="showRow(columns, 15)">
					{{ (props.row.unitQuantity * props.row.totalCost) | round }}
				</td>
				<td v-show="showRow(columns, 16)">
					{{ getTotalPrice(props.row) | round }}
				</td>
				<td v-show="showRow(columns, 17)">{{ props.row.locationProduct }}</td>
				<td v-show="showRow(columns, 18)">{{ props.row.weightProduct }}</td>
				<td v-show="showRow(columns, 19)">{{ props.row.commentary }}</td>
				<td v-show="showRow(columns, 20)">{{ props.row.productSeries }}</td>
				<td v-show="showRow(columns, 21)">
					<app-tooltip-button
						size="18"
						color="primary"
						icon="comment"
						text="Agregar comentario"
						@click-icon="makeProductCommentary(props.row)"
					/>
					<app-tooltip-button
						v-if="props.row.product.flagControlSerie"
						img="/static/img/icons/barcode.svg"
						:height="25"
						text="Control de series"
						@click-icon="openSeries(props.row)"
					/>
				</td>
			</template>
		</app-table>
		<v-layout wrap mb-3 px-4>
			<v-flex xs5>
				<v-card class="white--text card-grey pt-2" height="61">
					<v-layout row wrap justify-space-around mb-2 class="row-text row-text-title">
						<v-flex xs3 text-xs-center class="title-footer"> Subtotal </v-flex>
						<v-flex xs1 text-xs-center> + </v-flex>
						<v-flex xs3 text-xs-center class="title-footer">
							{{ getTaxByCountry($userInfo) }}:
						</v-flex>
						<v-flex xs1 text-xs-center v-if="isPeru"> + </v-flex>
						<v-flex xs3 text-xs-center v-if="isPeru" class="title-footer">
							ICBPER
						</v-flex>
					</v-layout>
					<v-layout row wrap justify-space-around class="row-text row-text-price">
						<v-flex xs3 text-xs-center class="total-green">
							{{ (sale.subtotal + sale.discount) | round }}
						</v-flex>
						<v-flex xs1></v-flex>
						<v-flex xs3 text-xs-center class="total-green">
							{{ sale.taxes | round }}
						</v-flex>
						<v-flex xs1 v-if="isPeru"></v-flex>
						<v-flex xs3 text-xs-center v-if="isPeru" class="total-green">
							{{ getPlasticTaxes | round }}
						</v-flex>
					</v-layout>
				</v-card>
			</v-flex>
			<v-flex
				:class="totalAmountCoupon || !$userInfo.flagNotShowCostPrice ? 'xs2' : 'xs3'"
			>
				<v-card class="text-xs-center card-green pt-2" height="61">
					<v-layout column wrap class="row-text">
						<v-flex xs12 text-xs-center mb-2 class="row-text-title title-footer">
							Dsct
						</v-flex>
						<v-flex xs12 text-xs-center class="row-text-price primary--text">
							{{ (sale.discount + totalAdvanceInvoice) | round }}
						</v-flex>
					</v-layout>
				</v-card>
			</v-flex>
			<v-flex xs1>
				<v-card class="text-xs-center card-green pt-2" height="61">
					<v-layout column wrap class="row-text">
						<v-flex xs12 text-xs-center mb-2 class="row-text-title title-footer">
							Gratuito:
						</v-flex>
						<v-flex xs12 text-xs-center class="row-text-price">
							{{ sale.currencySymbol }} {{ totalFree }}
						</v-flex>
					</v-layout>
				</v-card>
			</v-flex>
			<v-flex
				:class="totalAmountCoupon ? 'xs1' : 'xs2'"
				v-if="
					Boolean(this.$userInfo.flagAdmin) &&
					this.$userInfo.roleCode === 'ADMIN' &&
					!this.$userInfo.flagNotShowCostPrice
				"
			>
				<v-card class="text-xs-center card-green pt-2" height="61">
					<v-layout column wrap class="row-text">
						<v-flex xs12 text-xs-center mb-2 class="row-text-title title-footer">
							Costo Total
						</v-flex>
						<v-flex xs12 text-xs-center class="row-text-price primary--text">
							{{ sale.totalCost | round }}
						</v-flex>
					</v-layout>
				</v-card>
			</v-flex>
			<v-flex xs2 v-if="totalAmountCoupon">
				<v-card class="text-xs-center card-blue pt-2" height="61">
					<v-layout column wrap class="row-text">
						<v-flex xs12 text-xs-center mb-2 class="row-text-title white--text">
							Dsct Global:
						</v-flex>
						<v-flex xs12 text-xs-center class="row-text-price white--text">
							{{ totalAmountCoupon | round }}
						</v-flex>
					</v-layout>
				</v-card>
			</v-flex>
			<v-flex
				:class="totalAmountCoupon || !$userInfo.flagNotShowCostPrice ? 'xs2' : 'xs3'"
			>
				<v-card class="text-xs-center card-green pt-2" height="61">
					<v-layout column wrap class="row-text">
						<v-flex xs12 text-xs-center mb-2 class="title-footer"> Total </v-flex>
						<v-flex xs12 text-xs-center class="row-text-price">
							{{ sale.currencySymbol }}
							{{ (sale.amount - totalAdvanceInvoice) | round }}
						</v-flex>
					</v-layout>
				</v-card>
			</v-flex>
		</v-layout>
		<v-layout wrap mb-3 v-if="sale.commentary && sale.commentary.length">
			<v-flex xs12 pl-5 py-2 class="content-semi-green">
				<p class="my-0">Comentario</p>
			</v-flex>
			<v-flex xs12 pl-5 mt-3 class="commentary-text">
				{{ sale.commentary }}
			</v-flex>
		</v-layout>
		<section v-if="sale.urlImages && sale.urlImages.length">
			<v-flex xs12 pl-5 py-2 mb-3 class="content-semi-green">
				<p class="my-0">Archivos Adjuntos</p>
			</v-flex>
			<v-layout column wrap>
				<v-flex pl-5 xs6>
					<a
						v-for="(url, indexUrl) in sale.urlImages"
						:key="indexUrl"
						:href="url"
						target="_blank"
						class="block mb-2"
					>
						{{ url }}
					</a>
				</v-flex>
			</v-layout>
		</section>
		<section class="px-4" v-if="sale.tip">
			<span>Recargo al consumo:</span>
			<span>{{ sale.currencySymbol }} {{ sale.tip }}</span>
		</section>
		<section class="modal-filter-footer hide-and-print">
			<v-layout wrap justify-center py-1>
				<v-flex xs1 mr-2 :class="{ 'text-xs-center': !showCancelButton }">
					<v-btn
						class="btn-action back-to"
						color="info"
						type="button"
						@click.native="goBack"
					>
						Ir al Listado
					</v-btn>
				</v-flex>
				<v-flex xs1 :class="{ 'text-xs-center': !showCancelButton }">
					<v-btn
						class="btn-action back-to"
						color="primary"
						type="button"
						@click.native="goNewSale"
					>
						Nueva Venta
					</v-btn>
				</v-flex>
			</v-layout>
		</section>
		<v-flex>
			<v-btn
				flat
				@click="runAction('DC', 'Datos de Cotización')"
				v-if="$route.query.showQuotation"
			>
				<span>Datos de Cotización</span>
			</v-btn>
		</v-flex>
		<v-flex
			xs12
			pl-5
			py-2
			mb-3
			class="content-semi-green"
			v-if="!$route.query.showQuotation"
		>
			<p class="my-0" v-if="sale.typePaymentName === 'CONTADO'">Transacciones</p>
			<v-layout v-else pt-2>
				<p class="my-0 mr-2">Cuotas -</p>
				<p>Ver Transacciones</p>
				<v-icon
					color="primary"
					class="ml-2"
					size="19"
					@click="runAction({ code: 'transaction', name: 'Transacciones' })"
				>
					remove_red_eye
				</v-icon>
			</v-layout>
		</v-flex>
		<v-layout wrap class="transactions-container" pl-5 v-if="!$route.query.showQuotation">
			<v-flex xs12>
				<v-layout>
					<v-flex xs12 v-if="sale.typePaymentName === 'CONTADO'">
						<v-simple-table>
							<thead>
								<tr>
									<th class="text-xs-center text-transaction px-3 py-2">#Trans</th>
									<th class="text-xs-center text-transaction px-4 py-2">Monto</th>
									<th class="text-xs-center text-transaction px-4 py-2">Met. Pago</th>
									<th class="text-xs-center text-transaction px-4 py-2">T. Pago</th>
									<th
										class="text-xs-center text-transaction px-4 py-2"
										v-if="hasBankAccount"
									>
										Cuenta Bancaria
									</th>
									<th class="text-xs-center text-transaction px-4 py-2">Empleado</th>
									<th class="text-xs-center text-transaction px-4 py-2">Fecha Pago</th>
									<th class="text-xs-center text-transaction px-4 py-2">Img</th>
								</tr>
							</thead>

							<tbody>
								<tr
									v-for="(transaction, transactionIndex) in transactions"
									:key="transactionIndex"
								>
									<td class="text-xs-center px-4 py-2">
										{{ transaction.documentNumber }}
									</td>

									<td class="text-xs-center px-4 py-2">
										{{ transaction.amount }}
									</td>

									<td class="text-xs-center px-4 py-2">
										{{ transaction.paymentMethod ? transaction.paymentMethod.name : '-' }}
									</td>

									<td class="text-xs-center px-4 py-2">
										{{ transaction.typePayment.name }}
									</td>

									<td class="text-xs-center px-4 py-2" v-if="hasBankAccount">
										{{ transaction.bankAccountName }}
									</td>

									<td class="text-xs-center px-4 py-2" v-if="sale.employee">
										{{ sale.employee.name }} {{ sale.employee.lastname }}
									</td>

									<td class="text-xs-center px-4 py-2 d-flex align-center justify-center">
										<span v-if="!showModalChangeDate" class="mr-1">
											{{ transaction.paymentDate }}
										</span>

										<div v-else-if="!flagOutbox" class="d-flex align-center mr-1">
											<div style="max-width: 220px">
												<date-component
													:date="transaction.paymentDate"
													@on-input="onDateInput(transaction.id, $event)"
												/>
											</div>
										</div>

										<span v-else class="mr-1"> N/A </span>

										<app-tooltip-button
											v-if="Boolean($userInfo.flagAdmin) && !flagOutbox"
											size="15"
											class="ml-1"
											color="primary"
											icon="update"
											text="Cambiar Fecha de Pago"
											@click-icon="changeDate()"
										/>
									</td>

									<td class="text-xs-center px-4 py-2">
										<upload-img
											:id="transaction.id"
											:url="
												transaction.urlImage ||
												(transaction.voucher && transaction.voucher.urlLink)
											"
											:show-update="
												!(flagOutbox && $userInfo.company.settings.flagWorkingWithAI)
											"
											@getUrlFile="
												updateTransaction(
													transaction.id,
													transaction.typeTransactionBankId,
													$event
												)
											"
										/>
									</td>
								</tr>
							</tbody>
						</v-simple-table>
					</v-flex>

					<v-flex xs9 v-else>
						<v-layout wrap>
							<v-flex xs12 mb-2>
								<v-layout>
									<v-flex xs2 class="detail-title-row primary--text text-center"
										>Cuota
									</v-flex>
									<v-flex xs2 class="detail-title-row primary--text text-center"
										>Monto total(PEN)
									</v-flex>
									<v-flex xs2 class="detail-title-row primary--text text-center"
										>Monto pagado</v-flex
									>
									<v-flex xs2 class="detail-title-row primary--text"
										>Fecha de Vencimiento
									</v-flex>
									<v-flex xs2 class="detail-title-row primary--text">Estado</v-flex>
								</v-layout>
							</v-flex>
							<template v-if="sale.caDocument">
								<v-flex
									xs12
									v-for="(caDocumentDetails, caDocumentDetailsIndex) in sale.caDocument
										.details"
									:key="caDocumentDetailsIndex"
								>
									<v-layout>
										<v-flex xs2 class="text-transaction text-center">{{
											caDocumentDetails.number
										}}</v-flex>
										<v-flex xs2 class="text-transaction text-center">{{
											caDocumentDetails.amount.toFixed(2)
										}}</v-flex>
										<v-flex xs2 class="text-transaction text-center">{{
											caDocumentDetails.amountPayment.toFixed(2)
										}}</v-flex>
										<v-flex xs2 class="text-transaction">{{
											caDocumentDetails.localDate.expirationDate
										}}</v-flex>
										<v-flex xs2 class="text-transaction">{{
											caDocumentDetails.statusName
										}}</v-flex>
									</v-layout>
								</v-flex>
							</template>
						</v-layout>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<action-sidebar
			:active="action.active"
			:code-action="action.code"
			:title="action.title"
			:width="action.width"
			:help-actions="actionsToHelp"
			:back-btn="!isRetention"
			v-model="action.open"
			@close-modal="closeModal"
		>
			<template v-if="isCommentary && product.flagLotsEnabled !== 1">
				<v-flex xs12 px-3 pt-3>
					<app-input-text
						textarea
						no-resize
						label="Comentario"
						model="commentary"
						v-bind="$attrs"
						:text="product.commentary"
						@input="setModalCommentary"
					/>
				</v-flex>
				<v-flex xs5 v-if="dataOldLot" mt-2 px-3>
					<app-date-select
						:date-formatted="dataOldLot.expirationDate"
						label="Fecha de vencimiento"
						model="expirationDate"
						readonly
					/>
				</v-flex>
				<v-flex xs6 v-if="dataOldLot" mt-2 px-3>
					<app-input-text label="Lote" :text="dataOldLot.lot" readonly model="lot" />
				</v-flex>
				<v-flex xs12 mt-2 px-3>
					<app-input-text
						textarea
						no-resize
						label="Ubicación"
						v-bind="$attrs"
						model="location"
						:text="product.location"
						@input="setModalCommentary"
					/>
				</v-flex>
				<section class="modal-filter-footer">
					<modal-sidebar-button
						@accept-button-clicked="editComentarySale"
						@cancel-button-clicked="closeModal"
					/>
				</section>
			</template>
			<app-commentaries-lotes
				show-additional
				v-if="isCommentary && product.flagLotsEnabled === 1"
				:product="product"
				:disabledEdit="true"
				:disabledEditCommentary="false"
				@set-add="editComentarySaleLot"
				@close-modal="closeModal"
			/>
			<template v-if="isRetention">
				<div slot="right" class="pt-1 pr-4">
					<p class="caption ma-0">Total</p>
					<p class="primary--text total-slide mx-0 mt-0 mb-1">
						{{ sale.currency }}{{ totalRetention | round }}
					</p>
				</div>
			</template>
			<refund-sale
				v-if="isARefund"
				:customer-name="sale.customer.typePerson.fullName"
				:details="details"
				@validate-data="validateData"
				@refund="convertDocument"
				@cancel-button="closeModal"
			/>
			<debit-component
				v-if="isANote"
				:data="dataSelected"
				:sale="sale"
				@update-data-selected="updateDataSelected"
				@note-was-registered="loadData"
				@close-modal="closeModal"
			/>
			<credit-note
				v-if="isCreditNoteAction"
				:data="hasAdvancePayment ? dataServiceForAdvancePayment : data"
				:hasAdvancePayment="totalAdvanceInvoice > 0"
				:totalAdvanceInvoice="totalAdvanceInvoice"
				:disabled="isLoading"
				:sale="sale"
				@generate-credit-note="convertDocument"
				@cancel-button="closeModal"
			/>
			<credit-note
				v-if="isReturnSalesAction"
				:show-return="showReturn"
				:data="data"
				:disabled="isLoading"
				:sale="sale"
				@generate-credit-note="convertDocument"
				@cancel-button="closeModal"
			/>
			<!-- <sales-cancel
            v-if="isCancel"
            :sale-id="id"
            :date="sale.createdAt"
            :amount="sale.amount"
            :currency="sale.currency"
            :is-credit-note="isCreditNote"
            :valid-sale="validSale.validated"
            @sales-canceled="salesCanceled"
            @cancel-button-clicked="closeModal"
            /> -->
			<documents-update
				v-if="isDocumentUpdate"
				@cancel="closeModal"
				@update-document="updateDocument"
				:url-images="sale.urlImages"
			/>
			<!-- <app-commentaries
            readonly
            v-if="isCommentary"
            :product="currentProduct"
            @set-add="setCommentarySlide"
            @input="setComentary"
            @close-modal="closeModal"
            /> -->
			<edit-comentary
				v-if="isEditComentary"
				:data="sale"
				:origins="typeOrigins"
				:disabled="disabledComentary"
				:additional-sales="additionalSales"
				@cancel-button-clicked="closeModal"
				@edit-comentary="editComentarySale"
			/>
			<view-series
				v-if="action.code === 'view-series'"
				:product="saleSeriesProduct"
				:serie="saleSeries"
				@close="closeModal"
			/>
			<sale-retention
				v-if="isRetention"
				:retention-id="sale.withholdingTaxId"
				:details="retention.details"
				:is-loading="loading"
				:rent-items-validate="rentItemsValidate"
				:retention="retention"
				@add-item="onAddItem"
				@delete-item="onDeleteItem"
				@detail-input="detailInput"
				@on-input="onInput"
				@close="closeModal"
				@save="createRetention"
			></sale-retention>
			<!-- Transacciones -->
			<sale-transactions v-if="isSaleTransactions" :saleId="Number(id)" />
			<app-data-quote
				v-if="action.code === 'information-quotation'"
				:data-form="dataForm"
				:data-payment="dataPayment"
				:data-fac="dataFac"
				:url-voucher="urlVoucher"
				@close-modal="closeModal"
			/>
		</action-sidebar>
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
		<app-show-dialog
			title-header="ANULAR DOCUMENTO"
			text-content="Este documento no puede ser anulado, por que aún esta activo en la SRI"
			:show-modal-init="showModalInit"
			max-width-dialog="571px"
			@close-dialog="closeDialogInit"
		/>
		<v-dialog v-model="dialogDetail" persistent max-width="660">
			<accounting-seat-detail
				v-if="dialogDetail"
				:detail="sale.accountingSeat"
				@close="closeDetail"
			/>
		</v-dialog>
		<v-dialog v-model="showSaleCancelForm" persistent max-width="500">
			<sales-cancel-new
				v-if="showSaleCancelForm"
				:title-modal="action.title"
				:sale-id="sale.id"
				:amount="sale.amount"
				:currency="sale.currency"
				:status="sale.state.code"
				:valid-sale="validSale.validated"
				:date="validSale.createdAt"
				:sale="validSale"
				is-list-sale
				@sales-canceled="salesCanceled"
				@cancel-button-clicked="closeModal"
			/>
		</v-dialog>
		<v-dialog v-model="dialogSend" persistent max-width="450">
			<modal-items
				v-if="dialogSend"
				title="Enviar Comprobante"
				name-action="Enviar"
				:disabled="phone.length === 0"
				show-slot
				@close-modal="closeModalSend"
				@action-modal="sendRecords"
			>
				<v-flex class="pt-2 px-4">
					<label class="info--text bold"
						>Si desea enviarlo por Whatsapp, escribir el número y presione enviar.</label
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
			</modal-items>
		</v-dialog>
	</div>
</template>

<script>
import { format } from 'date-fns';
import actionSidebar from '@/components/shared/action-sidebar';
import appDataQuote from '@/components/shared/sales/app-data-quote';
import appCommentaries from '@/components/sales/subcomponents/commentaries';
import appTable from '@/components/shared/table/app-table';
import appActions from '@/components/shared/app-actions';
import BasePrice from '@/shared/basePrice';
import creditNote from '@/components/sales/subcomponents/credit-note';
import debitComponent from '@/components/sales/subcomponents/debit-note';
import documentsUpdate from '@/components/sales/subcomponents/documents-update';
import editComentary from '@/components/sales/subcomponents/edit-comentary';
import headerPage from '@/components/shared/header-page';
import helper from '@/shared/helper';
import dateComponent from '@/components/shared/date-component';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import uploadImg from '@/components/shared/upload-img';
import lib from '@/shared/lib';
import typeCreditNote from '@/shared/type-credit-note';
import refundSale from '@/components/sales/subcomponents/refund-sale';
import salesCancelNew from '@/components/sales/sales-cancel-new';
import saleRetention from '@/components/sales/sale-retention';
import salesCancel from '@/components/sales/sales-cancel';
import saleTransactions from '@/components/sales/subcomponents/sale-transactions';
import transactionsDetail from '@/components/sales/subcomponents/transactions-detail';
import appShowDialog from '@/components/shared/app-show-dialog';
import typePaymentForm from '@/shared/type-payment-form';
import accountingSeatDetail from '@/components/sales/accounting-seat-detail';
import modalItems from '@/components/shared/modal-items';
import appCommentariesLotes from '@/components/sales/subcomponents/commentaries-lotes';
import viewSeries from '@/components/transfers/view-series';
// import VueSixFour from 'vue-six-four';
const CODE_PRODUCT_ADVANCE_PAYMENT = 'ANTICIPO_01';

const { round } = lib;
const twoDecimals = round(2);
const fourDecimals = round(4);

const {
	compose,
	equality,
	find,
	getDeeper,
	map,
	setNewProperty,
	updateAllItemInCollection,
	updateItemInCollection,
} = lib;

function created() {
	this.loadingDetailSale = true;
	this.columns = this.updateColumns(this.$userInfo, this.columns);
	this.loadData();
	this.loadResources();
	if (helper.getLocalData('banks-account')) {
		this.banksAccount = helper.getLocalData('banks-account');
	} else {
		this.loadBanksAccount();
	}

	this.columns[5].flagVisible = !this.showColumnsDocuments;
	this.columns[6].flagVisible = !this.showColumnsDocuments;
	this.columns[4].visible = this.$userInfo.company.settings.flagImport;
	this.columns[4].checked = this.$userInfo.company.settings.flagImport;

	const showCostAdmin =
		Boolean(this.$userInfo.flagAdmin) &&
		this.$userInfo.roleCode === 'ADMIN' &&
		!this.$userInfo.flagNotShowCostPrice;

	this.columns[14].visible = showCostAdmin;
	this.columns[14].checked = showCostAdmin;
	this.columns[14].flagVisible = !showCostAdmin;
	this.showCostBenefit = showCostAdmin;
}

function updateColumns(user, columns) {
	const taxLabel =
		user.company && user.company.country ? user.company.country.taxName : null;
	if (taxLabel) {
		const item = find(equality('value', 'taxes'), columns);
		return map(updateItemInCollection(item, 'value', 'name', `% ${taxLabel}`), columns);
	}
	return columns;
}

function columnsComputed() {
	const indexToShow = this.columns.findIndex(
		(col) => col.basePrice === this.sale.flagBasePrice
	);
	if (indexToShow > -1) {
		delete this.columns[indexToShow].basePrice;
		this.$set(this.columns[indexToShow], 'visible', true);
	}
	const columns = JSON.parse(JSON.stringify(this.columns));
	return columns
		.filter((col) => !col.flagVisible)
		.map((col) => {
			const { flagVisible, ...rest } = col;
			return rest;
		});
}

async function loadData() {
	try {
		({ data: this.sale } = await this.$httpSales.get(`sale-documents/${this.id}`));
		this.totalAdvanceInvoice = this.calculateAdvanceInvoice(
			this.sale.downPaymentDocuments
		);
		this.sale.totalCost = this.sale.details.reduce(
			(total, item) => total + item.totalCost * item.unitQuantity,
			0
		);
		this.totalAmountCoupon = this.sale.discountGlobal;
		this.totalFree = this.sale.formatNumbers.taxesAmount.free;
		this.hasAdvancePayment = this.totalAdvanceInvoice > 0;
		const { sales } = !!this.sale.dataClient;
		this.sale.addressCustomer = sales ? sales.customer.address : '';
		this.sale.documentRelated = this.sale.documentRelated || {};
		this.sale.typeDocumentName = this.sale.typeDocument
			? this.sale.typeDocument.name
			: '';
		this.sale.typeDocumentCode = this.sale.typeDocument
			? this.sale.typeDocument.code
			: '';
		this.sale.typePaymentName = this.sale.payment ? this.sale.payment.name : '';
		this.sale.urlImages = this.sale.urlImages ? this.sale.urlImages : [];
		this.sale.percentageWithholding = this.sale.withholdingTaxes
			? this.sale.withholdingTaxes.percentage * 100
			: 0;
		const sourceTransactions = this.sale.accTransactions?.length
			? this.sale.accTransactions
			: (this.sale.transactions || []).concat(this.sale.transactionsBank || []);
		this.transactions = sourceTransactions.map((transaction) => {
			const newTransaction = { ...transaction };
			newTransaction.additionalInformation = newTransaction.additionalInformation || {};
			newTransaction.additionalInformation.dateReference =
				newTransaction.additionalInformation.dateReference ||
				format(transaction.createdAt, 'YYYY-MM-DD');
			newTransaction.amount = Math.abs(transaction.amount);
			newTransaction.paymentAmount = Math.abs(transaction.paymentAmount);
			const bankAccount = this.banksAccount.find(
				(bank) => bank.id === newTransaction.bankAccountId
			);
			newTransaction.paymentDate = new Date(transaction.paymentDate)
				.toISOString()
				.split('T')[0];
			newTransaction.bankAccountName = bankAccount && bankAccount.name;
			return newTransaction;
		});
		this.hasBankAccount = this.transactions.some((t) => t.bankAccountName);

		this.data = this.adapterDetails(this.sale.details || []);
		this.checkAll = this.data.every((d) => d.isSelected);
		this.dataSelected = [...this.data.filter((d) => d.isSelected)];
		this.validateRetentions();
		if (this.sale.dataClient && this.sale.dataClient.saleData) {
			this.additionalSales = {
				departament:
					this.sale.dataClient.saleData &&
					this.sale.dataClient.saleData.departament &&
					this.sale.dataClient.saleData.departament.value
						? this.sale.dataClient.saleData.departament.value.name
						: null,
				province:
					this.sale.dataClient.saleData &&
					this.sale.dataClient.saleData.province &&
					this.sale.dataClient.saleData.province.value
						? this.sale.dataClient.saleData.province.value
						: null,
				district:
					this.sale.dataClient.saleData.district &&
					this.sale.dataClient.saleData.district.value
						? this.sale.dataClient.saleData.district.value.name
						: null,
				destination:
					this.sale.dataClient.saleData.deliveryAddress &&
					this.sale.dataClient.saleData.deliveryAddress.value
						? this.sale.dataClient.saleData.deliveryAddress.value
						: null,
				nameAgency: this.sale.dataClient.saleData.companyName
					? this.sale.dataClient.saleData.companyName.valueName
					: null,
				addressAgency: this.sale.dataClient.saleData.companyAddress
					? this.sale.dataClient.saleData.companyAddress.value
					: null,
				numberAtention: this.sale.dataClient.saleData.attentionDni
					? this.sale.dataClient.saleData.attentionDni.value
					: null,
				nameAtention: this.sale.dataClient.saleData.attentionName
					? this.sale.dataClient.saleData.attentionName.value
					: null,
				phoneAtention: this.sale.dataClient.saleData.attentionPhone
					? this.sale.dataClient.saleData.attentionPhone.value
					: null,
			};
		}
		if (this.sale.order && this.sale.order.details) {
			this.totalWeigth = this.sale.order.details.reduce((acc, obj) => {
				const weight = obj.quantity * (obj.weight || 0);
				return acc + weight;
			}, 0);
		} else {
			this.totalWeigth = this.data.reduce(
				(acc, obj) =>
					acc +
					obj.quantity *
						((obj.aditionalInformation && obj.aditionalInformation.weight) ||
							obj.product.weigth ||
							0),
				0
			);
		}
		const validated =
			this.sale.dataClient &&
			this.sale.dataClient.quotation &&
			this.sale.dataClient.quotation.guideData
				? !this.sale.dataClient.quotation.guideData
				: true;
		this.disabledAditionalQuotation =
			this.sale.dataClient && this.sale.dataClient.guideData
				? !this.sale.dataClient.guideData
				: validated;
		if (!this.sale.totalTaxesAmount) {
			this.sale.totalTaxesAmount = {
				detraction: null,
			};
		}
	} catch (err) {
		console.error(err);
		this.loadingDetailSale = false;
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'SALE_NOT_FOUND') {
				this.showGenericError(
					'No se ha encontrado una venta con el id referenciado en la ruta.'
				);
			}
		}
	} finally {
		this.loadingDetailSale = false;
	}
}

function removeProducts(row) {
	const newRow = { ...row };
	newRow.isSelected = false;
	this.rowIsSelected(newRow);
}

function goBack() {
	helper.removeLocalData('sales-data');
	const showQuotation = this.$route.query.showQuotation;
	if (showQuotation) {
		this.goTo('quotations-list');
	} else {
		this.goTo('list-of-sales');
	}
}

function goNewSale() {
	helper.removeLocalData('sales-data');
	this.goTo('new-sale');
}

function productDetails(products) {
	return products.map((product) => {
		const newProduct = {};
		const isFree = !!product.flagFree;
		const price = this.getPrice(product);
		const seriesValue =
			product.aditionalInformation && product.aditionalInformation.seriesSelect
				? product.aditionalInformation.seriesSelect || product.aditionalInformation.series
				: null;
		const newPriceSale =
			this.creditType === typeCreditNote.ItemDisc
				? product.total / product.quantity
				: product.priceUnitary;
		// Cuando un producto es gratuito, `product.price` puede no reflejar su valor de venta original y no debe usarse como referencia directa para los cálculos.
		const priceUnitWithDiscountPrice = isFree
			? product.unitPrice
			: fourDecimals(product.price / `1.${product.taxes}`);
		const newPriceUnitary = newPriceSale / `1.${product.tax}`;
		const newTaxAmount = newPriceSale - newPriceUnitary;
		newProduct.discount = 0;
		const subtotalWithoutTax =
			(product.priceUnitary - product.discount) * product.quantity;
		const subtotalWithoutTaxDiscount =
			(newPriceUnitary - newProduct.discount) * product.quantity;
		newProduct.brandSpId = product.brandSpId || undefined;
		newProduct.brandName = product.brandName;
		newProduct.groupType = product.groupType;

		newProduct.freeAmount = isFree ? product.salePrice : undefined;
		newProduct.categoryName = product.categoryName;
		newProduct.categoryId = product.categoryId;
		newProduct.description =
			this.creditType === typeCreditNote.DescFix
				? `Decia: ${product.oldDescription} - Debe decir: ${product.description}`
				: product.description;
		newProduct.productCode = product.productCode;
		newProduct.productCubsoCode = product.productCubsoCode;
		newProduct.unitCode = product.unitCode;
		newProduct.unitName = product.unitName;
		newProduct.aditionalInformation = {
			descriptionProducts: product.description || product.product.name || undefined,
			autoBarcode: product.aditionalInformation
				? product.aditionalInformation.autoBarcode
				: null,
			referenceDetailId: product.id,
			salPriceListId: product.aditionalInformation
				? product.aditionalInformation.salPriceListId
				: null,
			series: this.isTypeCN(typeCreditNote.ItemReturn, typeCreditNote.FullReturn)
				? seriesValue
				: null,
			productLotId: product.aditionalInformation
				? product.aditionalInformation.productLotId
				: null,
		};

		if (newProduct.aditionalInformation.productLotId) {
			// If creditType === TypeCreditNote.ItemReturn && lot exist
			newProduct.aditionalInformation.lot = product.aditionalInformation.lot;
		}
		newProduct.discount = 0;
		newProduct.codeTaxes = product.codeTaxes;
		newProduct.discountPercentage = 0;
		newProduct.flagFree = isFree;
		newProduct.warehouseName = product.warehouseName;
		newProduct.brandId = product.brandId;
		newProduct.quantity = product.quantity;
		newProduct.price = this.isTypeCN(1, 6, 7, 3) ? product.price : newProduct.price;
		if (isFree) {
			newProduct.price = 0;
		}
		if (this.creditType === typeCreditNote.ItemDisc) {
			newProduct.price = this.roundInNumber(newPriceSale);
		}
		newProduct.productType = product.product.typeId;
		if (this.isTypeCN(typeCreditNote.CancelOp, typeCreditNote.FullReturn)) {
			newProduct.salePrice = product.pricePerSale;
		} else if (this.creditType === typeCreditNote.ItemReturn) {
			newProduct.salePrice = product.price;
		} else {
			newProduct.salePrice =
				this.creditType === typeCreditNote.ItemDisc
					? this.roundInNumber(newPriceSale)
					: this.roundInNumber(price);
		}
		newProduct.stockQuantity = product.stockQuantity;
		if (this.creditType === typeCreditNote.FullReturn) {
			newProduct.subtotalWithoutTax = fourDecimals(product.subtotalWithoutTax);
		} else if (
			this.creditType === typeCreditNote.ItemReturn ||
			this.creditType === typeCreditNote.CancelOp
		) {
			newProduct.subtotalWithoutTax =
				this.creditType === typeCreditNote.ItemReturn
					? subtotalWithoutTax
					: fourDecimals(subtotalWithoutTax);
		} else {
			newProduct.subtotalWithoutTax =
				this.creditType === typeCreditNote.ItemDisc
					? fourDecimals(subtotalWithoutTaxDiscount)
					: subtotalWithoutTax;
		}
		newProduct.tax =
			this.creditType === typeCreditNote.DescFix ? 0 : product.tax || product.taxes;
		if (this.creditType === typeCreditNote.DescFix) {
			newProduct.taxAmount = 0;
		} else {
			newProduct.taxAmount =
				this.creditType === typeCreditNote.ItemDisc
					? fourDecimals(newTaxAmount * product.quantity)
					: product.taxAmount;
		}
		newProduct.priceCost =
			product.product && product.product.cost ? product.product.cost : 0;
		newProduct.unitCode = product.unitCode;
		newProduct.unitConversion = product.unitConversion;
		newProduct.unitId = product.unitId;
		newProduct.unitName = product.unitName;
		if (
			this.creditType === typeCreditNote.FullReturn ||
			this.creditType === typeCreditNote.DescFix
		) {
			// newProduct.unitPrice = product.unitPrice;
			newProduct.unitPrice = product.priceUnitary;
		} else if (
			this.creditType === typeCreditNote.ItemReturn ||
			this.creditType === typeCreditNote.CancelOp
		) {
			newProduct.unitPrice = priceUnitWithDiscountPrice;
		} else {
			newProduct.unitPrice =
				this.creditType === typeCreditNote.ItemDisc
					? newPriceUnitary
					: this.roundInNumber(product.priceUnitary);
		}
		newProduct.unitQuantity =
			this.creditType === typeCreditNote.FullReturn ||
			this.creditType === typeCreditNote.CancelOp
				? product.unitQuantity
				: product.quantity * product.unitConversion;
		newProduct.warProductsId = product.warProductsId;
		newProduct.warWarehousesId = product.warWarehousesId;
		if (this.isEcuador) {
			newProduct.codeTaxes = product.codeTaxes;
		}
		const subTotalDevItem = product.total / `1.${product.taxes}`;
		const subAmountDevItem = product.total - subTotalDevItem;

		const productTaxes = product.product.taxes;
		// Si no se esta aplicando como gratuito no es necesario enviarlo en el taxes
		const taxes = isFree ? productTaxes : productTaxes.filter((t) => t.code !== '05');
		newProduct.taxes = taxes.map((t) => {
			const isTaxFree = t.code === '05';

			const taxFix = {
				code: t.code,
				taxSchemeName: t.name,
				percentage: t.percentage,
				codePercentage: t.codePercentage,
				amount: 0,
				subtotal: 0,
			};

			// El unico que envia amount y subtotal como 0 es Correccion por error en la descripcion
			if (this.creditType === typeCreditNote.DescFix) {
				return taxFix;
			}
			// Si es gratuito el amount es 0 y subtotal deberia ser igual al total
			if (isTaxFree) {
				taxFix.amount = 0;
				taxFix.subtotal = fourDecimals(product.total);
				return taxFix;
			}

			if (isFree && this.creditType === typeCreditNote.ItemReturn) {
				taxFix.amount = product.taxAmount;
				taxFix.subtotal = fourDecimals(product.total / (1 + product.taxes / 100));
				return taxFix;
			}

			taxFix.amount =
				this.creditType === typeCreditNote.ItemDisc
					? newProduct.taxAmount
					: product.taxAmount || subAmountDevItem;
			const subTotal =
				this.creditType === typeCreditNote.ItemDisc
					? newPriceUnitary * product.quantity
					: product.unitPrice;
			taxFix.subtotal = this.isTypeCN(
				typeCreditNote.ItemReturn,
				typeCreditNote.CancelOp,
				typeCreditNote.FullReturn
			)
				? subTotalDevItem
				: subTotal;
			taxFix.amount = fourDecimals(taxFix.amount);
			taxFix.subtotal = fourDecimals(taxFix.subtotal);

			return taxFix;
		});
		// newProduct.taxes = taxes.reduce((a, p) => {
		// 	const isTaxFree = p.code === '05';
		// 	const newRow = {
		// 		code: p.code,
		// 		taxSchemeName: p.name,
		// 		percentage: p.percentage,
		// 		codePercentage: p.codePercentage,
		// 		amount: 0,
		// 		subtotal: 0,
		// 	};
		// 	if (isTaxFree) {
		// 		// Es como si product.tax fuera 0
		// 		newRow.amount = 0;
		// 		newRow.subtotal = product.total;
		// 	} else if (this.creditType === typeCreditNote.DescFix) {
		// 		newRow.amount = 0;
		// 		newRow.subtotal = 0;
		// 	} else {
		// 		newRow.amount =
		// 			this.creditType === typeCreditNote.ItemDisc
		// 				? newProduct.taxAmount
		// 				: product.taxAmount;
		// 		const subTotal =
		// 			this.creditType === typeCreditNote.ItemDisc
		// 				? newPriceUnitary
		// 				: product.unitPrice;
		// 		newRow.subtotal = this.isTypeCN(
		// 			typeCreditNote.ItemReturn,
		// 			typeCreditNote.CancelOp,
		// 			typeCreditNote.FullReturn
		// 		)
		// 			? subTotalDevItem
		// 			: subTotal;
		// 	}

		// 	newRow.amount = fourDecimals(newRow.amount);
		// 	newRow.subtotal = fourDecimals(newRow.subtotal);

		// 	return a;
		// }, []);
		return newProduct;
	});
}

function getPrice(product) {
	const { priceUnitaryReal, priceUnitary, discount, tax, total } = product;
	const finalPriceUnitary =
		this.creditType === typeCreditNote.ItemDisc
			? total
			: priceUnitaryReal || priceUnitary;
	const newTax = tax || 0;
	return ((finalPriceUnitary - discount) * (1 + newTax / 100) * 100) / 100;
}

function buildBody(obj) {
	const {
		dataSelected,
		flagTransfer,
		selectedCardsFn,
		creditType,
		detailsPayments,
		total,
		cashPay,
		cardPay,
		commentary,
		subTotal,
		tax,
		discountAmount,
		totalTaxesAmount,
		taxesAmount,
		paymentMethodId,
		exchangeRate,
		tip,
	} = obj;
	this.creditType = creditType;

	let subTotalSale = twoDecimals(subTotal);
	let amountValid = total;
	let amountCashValid = cashPay;
	let taxValid = tax;

	if (
		this.isTypeCN(typeCreditNote.CancelOp, typeCreditNote.FullReturn) &&
		!this.hasAdvancePayment
	) {
		subTotalSale = this.sale.subtotal;
		amountValid = this.sale.amount;
		amountCashValid = this.sale.amountCash;
		taxValid = this.sale.taxes;
	}

	const isItemDisc = this.isTypeCN(typeCreditNote.ItemDisc);
	const taxesAmountCN = { ...taxesAmount };
	if (this.isTypeCN(typeCreditNote.DescFix)) {
		taxesAmountCN.free = 0;
		taxesAmountCN.recorded = 0;
	}

	return compose(
		setNewProperty('tip', tip),
		setNewProperty('amount', amountValid),
		setNewProperty('amountCash', amountCashValid),
		setNewProperty('amountCredit', cardPay),
		setNewProperty('commentary', commentary),
		setNewProperty('currency', this.sale.currency),
		setNewProperty('details', this.productDetails(dataSelected)),
		setNewProperty('discount', isItemDisc ? 0 : discountAmount || 0),
		setNewProperty('exchangeRate', this.sale.exchangeRate || exchangeRate),
		setNewProperty('flagTransfer', flagTransfer),
		setNewProperty('paymentMethodId', paymentMethodId),
		setNewProperty('salDocumentsId', this.sale.id),
		setNewProperty(
			'subtotal',
			isItemDisc ? this.roundInNumber(total - tax) : subTotalSale
		),
		setNewProperty('taxes', taxValid || 0),
		setNewProperty('taxesAmount', taxesAmountCN),
		setNewProperty('detailsPayments', detailsPayments),
		setNewProperty('totalTaxesAmount', totalTaxesAmount),
		setNewProperty(
			'transactions',
			this.getTransactions(selectedCardsFn, detailsPayments)
		),
		setNewProperty(
			'transactionId',
			this.getTransactionId(selectedCardsFn, detailsPayments)
		),
		setNewProperty('typeCatalogSunatId', creditType)
	)({});
}

function getTransactionId(typePayments, valid) {
	if (valid.length === 0) {
		return typePayments.map((st) => st.id);
	}
	return [];
}

function getTransactions(typePayments, valid) {
	const self = this;
	if (valid.length === 0) {
		return typePayments.map((st) => {
			const flag = st.flagForm;
			const newSt = {
				amount: -st.paid,
				currency: self.sale.currency,
				paymentAmount: -st.paid,
				paymentDate: format(new Date(), 'YYYY-MM-DD HH:mm:ss'),
				typePaymentId: st.id,
			};
			if (Number(flag) === typePaymentForm.Card) {
				newSt.documentNumber = st.card.documentNumber;
			} else if (Number(flag) === typePaymentForm.Check) {
				newSt.additionalInformation = {
					dateReference: st.check.additionalInformation.dateReference,
				};
				newSt.bankAccountId = st.check.bankAccountId || null;
				newSt.reference = st.check.reference || null;
				newSt.documentNumber = st.check.documentNumber || null;
			} else if (Number(flag) === typePaymentForm.Deposit) {
				newSt.additionalInformation = {
					dateReference: st.deposit.additionalInformation.dateReference,
				};
				newSt.bankAccountId = st.deposit.bankAccountId || null;
				newSt.urlImage = st.deposit.urlImage || null;
				newSt.documentNumber = st.deposit.documentNumber || null;
			}
			return newSt;
		});
	}
	return [];
}

async function convertDocument(dataInfo) {
	if (this.action.code !== 'refund') {
		const code = this.isReturnSalesAction ? 'NDD' : this.action.code;
		const url = `sale-documents/${code}/type-note`;
		const typeNote = this.isCreditNoteAction ? 'CRÉDITO' : 'DÉBITO';
		const newType = this.isReturnSalesAction ? 'DEVOLUCIÓN' : typeNote;
		const message = `Venta convertida a nota de ${newType}`;
		const body = this.buildBody(dataInfo);
		body.dateOnline = this.dateOnline;
		body.warehouseCodeTaxes = this.currentWarehouseData.warehouseCodeTaxes;
		body.warehouseName = this.sale.warehouseName;
		if (dataInfo.saleNumber) {
			body.number = dataInfo.saleNumber;
		}
		this.isLoading = true;
		try {
			await this.$httpSales.post(url, body);
			this.showNotification(message);
			this.closeModal();
			this.loadData();
		} catch (error) {
			if (error.status === 500) {
				this.showGenericError();
			} else if (error.status === 400) {
				if (error.data.message === 'SALE_DUPLICATE_ERROR') {
					this.showGenericError('La venta ya ha sido registrada.');
				} else {
					this.showGenericError(error.data.messageError);
				}
			}
		} finally {
			this.isLoading = false;
		}
	} else {
		this.showNotification('Devolución realizada.');
		this.closeModal();
	}
}

function closeModal() {
	if (this.action.code === 'sale-retention') {
		this.retention = {
			authorizationNumber: '',
			code: '',
			dateAccouting: null,
			dateDocument: null,
			dateExpiration: null,
			details: [],
			flagSale: true,
			number: '',
			serie: '',
		};
		this.retentionDetails = [
			{
				amountTax: null,
				baseIva: null,
				codeAccounting: null,
				codePercentageTax: '',
				codeTax: null,
				description: 'BIENES',
				namePercentageTax: null,
				numberOrder: 1,
				percentageTax: null,
			},
			{
				amountTax: null,
				baseIva: null,
				codeAccounting: null,
				codePercentageTax: '',
				codeTax: null,
				description: 'SERVICIOS',
				namePercentageTax: null,
				numberOrder: 2,
				percentageTax: null,
			},
			{
				amountTax: null,
				baseExempt: null,
				baseRecorded: null,
				baseZero: null,
				codeAccounting: null,
				codePercentageTax: null,
				codeTax: null,
				description: 'RENTA',
				namePercentageTax: null,
				numberOrder: 3,
				percentageTax: null,
			},
		];
		this.validateRetentions();
	}
	this.product = {
		commentary: null,
		location: null,
	};
	this.idRow = null;
	this.action = { ...this.actionDefault };
	this.disabled = true;
	this.creditType = null;
}

function rowIsSelected(row) {
	const { id, isSelected } = row;
	if (!isSelected) {
		const index = this.dataSelected.findIndex((ds) => ds.id === id);
		if (index > -1) {
			this.dataSelected.splice(index, 1);
		}
	} else {
		this.dataSelected.push(row);
	}
	this.checkAll = this.data.every((d) => d.isSelected);
}

function selectedAll(value) {
	this.checkAll = value;
	this.data = this.data.map((d) => {
		const newD = { ...d };
		newD.isSelected = value;
		return newD;
	});
	this.dataSelected = [...this.data.filter((d) => d.isSelected)];
}

function showCancelButton() {
	const allowedDocs = ['BOL', 'NTV', 'FAC'];
	return !this.isSaleCancel && allowedDocs.includes(this.sale.typeDocumentCode);
}

function updateDataSelected(index, status) {
	this.dataSelected[index].isSelected = status;
}

function addConcepts() {
	this.newItem.subTotal = this.newItem.quantity * this.newItem.price;
	this.ntcProducts.unshift(this.newItem);
	this.newItem = {
		showInputText: true,
		isSelected: true,
		product: {
			code: '',
		},
		quantity: 0,
		price: 0,
		subTotal: 0,
	};
}

function customDetails({ code }) {
	this.details = this.dataSelected.map((detail) => {
		const newDetail = { ...detail };
		newDetail.brandId = detail.brandId;
		newDetail.code = detail.product.code;
		newDetail.devolution = detail.devolution || 0;
		newDetail.name = detail.product.name;
		newDetail.quantity = detail.quantity;
		newDetail.readonly = detail.devolution <= 0 || detail.devolution > detail.quantity;
		newDetail.reason = detail.reason || '';
		return newDetail;
	});
	const newName = `Devolución - ${this.sale.typeDocumentName} #${this.sale.serie}-${this.sale.number}`;
	this.openSidebar({ code, name: newName, width: 500 });
}

function isCreditNoteAction() {
	return this.action.code === 'NTC';
}

function isReturnSalesAction() {
	return this.action.code === 'return-sales-note';
}

function isANote() {
	return this.action.code === 'NTD';
}

function isARefund() {
	return this.action.code === 'refund';
}

function isSaleCancel() {
	return this.sale.state && this.sale.state.code === 'ANU';
}

function openSidebar({ code, name, width }) {
	this.action.active = true;
	this.action.code = code;
	this.action.open = code !== 'override';
	this.action.title = name;
	this.action.width = width;
}

async function runAction({ code, name }) {
	if (code === 'refund') {
		this.customDetails({ code });
	} else if (code === 'override') {
		this.loadValidate(code, name);
	} else if (code === 'transaction') {
		this.openSidebar({ code, name, width: 650 });
	} else if (code === 'return-sales-note') {
		this.showReturn = true;
		this.disabledNdd = true;
		const newDate = new Date();
		this.dateOnline = newDate.getTime().toString();
		this.openSidebar({ code, name, width: 850 });
	} else if (code === 'information-quotation') {
		if (this.sale.dataClient.guideData) {
			const template = { ...this.sale.dataClient.guideData };
			const arrayTemplate = Object.entries(template).sort(
				([, a], [, b]) => b.order - a.order
			);
			const arrayTemplateReverse = arrayTemplate.reverse();
			const objectOrder = Object.fromEntries(arrayTemplateReverse);
			this.dataForm = objectOrder;
			const templatePayment = { ...this.sale.dataClient.payment };
			const arrayPayment = Object.entries(templatePayment).sort(
				([, a], [, b]) => b.order - a.order
			);
			const arrayPaymentReverse = arrayPayment.reverse();
			const objectPayment = Object.fromEntries(arrayPaymentReverse);
			this.dataPayment = objectPayment;
			const templateFac = { ...this.sale.dataClient.dataFac };
			const arrayFac = Object.entries(templateFac).sort(
				([, a], [, b]) => b.order - a.order
			);
			const arrayFacReverse = arrayFac.reverse();
			const objectFac = Object.fromEntries(arrayFacReverse);
			this.dataFac = objectFac;
			this.urlVoucher = this.sale.dataClient ? this.sale.dataClient.urlVoucher : null;
		} else if (this.sale.dataClient.quotation.guideData) {
			const template = { ...this.sale.dataClient.quotation.guideData };
			const arrayTemplate = Object.entries(template).sort(
				([, a], [, b]) => b.order - a.order
			);
			const arrayTemplateReverse = arrayTemplate.reverse();
			const objectOrder = Object.fromEntries(arrayTemplateReverse);
			this.dataForm = objectOrder;
			const templatePayment = { ...this.sale.dataClient.quotation.payment };
			const arrayPayment = Object.entries(templatePayment).sort(
				([, a], [, b]) => b.order - a.order
			);
			const arrayPaymentReverse = arrayPayment.reverse();
			const objectPayment = Object.fromEntries(arrayPaymentReverse);
			this.dataPayment = objectPayment;
			const templateFac = { ...this.sale.dataClient.quotation.dataFac };
			const arrayFac = Object.entries(templateFac).sort(
				([, a], [, b]) => b.order - a.order
			);
			const arrayFacReverse = arrayFac.reverse();
			const objectFac = Object.fromEntries(arrayFacReverse);
			this.dataFac = objectFac;
			this.urlVoucher = this.sale.dataClient
				? this.sale.dataClient.quotation.urlVoucher
				: null;
		}
		this.openSidebar({ code, name, width: 600 });
	} else {
		const isNTC = code === 'NTC';

		this.disabled = false;
		const retentionCode = code === 'sale-retention';
		const retentionWidth = retentionCode ? 921 : 600;
		const customerData = this.sale.customer ? this.sale.customer.typePerson : {};
		const obj = {
			code,
			name: retentionCode
				? `${customerData.documentNumber} - ${customerData.fullName}`
				: name,
			width: isNTC ? 970 : retentionWidth,
		};
		const newDate = new Date();
		this.dateOnline = newDate.getTime().toString();
		if (isNTC && this.hasAdvancePayment) {
			const errorMessage = this.getErrorNTCAdvancePayment();
			if (errorMessage) {
				this.showGenericError(errorMessage);
				return;
			}
			await this.getAdvanceProduct();
		}
		this.openSidebar(obj);
	}
}

function salesCanceled() {
	this.closeModal();
	this.loadData();
}

function validateData({ id, details, disabled }) {
	this.disabled = disabled;
	this.details = details.map((det) => {
		const newDetail = { ...det };
		if (id === det.id) {
			newDetail.readonly = det.devolution > det.quantity || det.devolution <= 0;
		}
		return newDetail;
	});
}

function setModalCommentary({ model, value }) {
	this.product[model] = value;
}

function valuesDisabled() {
	const dataSelectedEmpty = this.dataSelected.length === 0;
	const disabledByType =
		this.sale.typeDocument.code !== 'BOL' && this.sale.typeDocument.code !== 'FAC';
	const disabled = dataSelectedEmpty || disabledByType || !!this.sale.flagUse;
	const disabledRetention = this.sale.typeDocument.code !== 'FAC';
	const disabledQuotation = this.sale.typeDocument.code === 'COT';
	return [
		{ code: 'refund', disabled },
		{ code: 'NTD', disabled },
		{ code: 'NTC', disabled: disabledByType },
		{ code: 'sale-retention', disabled: disabledRetention },
		{ code: 'override', disabled: disabledQuotation },
		{
			code: 'return-sales-note',
			disabled: this.sale.typeDocument.code !== 'NTV',
		},
		{
			code: 'information-quotation',
			disabled: this.disabledAditionalQuotation,
		},
	];
}

async function downloadSale(flag) {
	const saleId = this.id;
	try {
		const download = this.$userInfo.company.settings.downloadSale;
		const params = { html: download || null };
		const model = flag ? { code: 'pdf-categories' } : { code: 'pdf' };
		const responseType = 'blob';
		const response = await this.$httpSales.post(`sale-documents/${saleId}/pdf`, model, {
			params,
			responseType,
		});
		const contentType = download ? 'application/pdf' : 'text/html';
		const blob = helper.generateBlob(response.data, contentType);
		helper.showDownloadDialog(blob, `${this.sale.documentNumber}`, 'pdf', download);
	} catch (err) {
		if (err.status === 400) {
			if (err.data.message === 'SALE_NOT_FOUND') {
				this.showNotification('La venta no existe.', 'error');
			}
		} else if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function getTotalPrice(product) {
	const { quantity, price, freeAmount, salePrice, flagFree } = product;
	return (flagFree ? price || freeAmount || salePrice : price) * quantity;
}

function getTaxByCountry(user) {
	return getDeeper('company', 'country', 'taxName')(user);
}

function isUpdate() {
	return this.action.code === 'file-upload';
}

async function updateDocument(urlImages) {
	const send = urlImages.length > 0 ? urlImages : null;
	this.closeModal();
	try {
		await this.$httpSales.patch(`sale-documents-update-images/${this.id}`, {
			urlImages: send,
		});
		this.showNotification('Se actualizó correctamente');
		this.loadData();
	} catch (error) {
		this.showGenericError();
	}
}

function makeProductCommentary(row) {
	this.product.commentary = row ? row.commentary : '';
	this.product.location =
		row && row.aditionalInformation ? row.aditionalInformation.location : '';
	this.product.flagLotsEnabled = row && row.product ? row.product.flagLotsEnabled : 0;
	if (this.product.flagLotsEnabled === 1) {
		this.product.productLots = {
			lot: row.aditionalInformation.lot,
			location: row.aditionalInformation.location,
			expirationDate: row.aditionalInformation.expirationDate,
		};
	} else {
		this.product.aditionalInformation = {
			lot: row.aditionalInformation.lot,
			expirationDate: row.aditionalInformation.expirationDate,
		};
	}
	this.idRow = row.id;
	// if (!row.commentary) {
	// 	this.currentProduct.commentary = '';
	// }
	this.action = {
		active: true,
		code: 'COMME',
		open: true,
		title: row.description,
		width: 450,
	};
}

function setComentary(commentary) {
	this.currentProduct.commentary = commentary;
	this.data = updateAllItemInCollection('warProductsId', this.currentProduct, this.data);
	this.action = this.actionDefault;
}

function isCommentary() {
	return this.action.code === 'COMME';
}

function isDocumentUpdate() {
	return this.action.code === 'file-upload';
}

function isEditComentary() {
	return this.action.code === 'ED';
}

async function editComentarySaleLot(newData, commentary) {
	const newBody = {
		commentary,
		arrayDetails: [{ commentary }],
	};
	try {
		this.disabledComentary = true;
		await this.$httpSales.patch(`/sale-documents-update-information/${this.id}`, newBody);
		this.showNotification('Se actualizó correctamente');
		this.closeModal();
		this.loadData();
	} catch (error) {
		this.showGenericError();
	} finally {
		this.disabledComentary = false;
	}
}

async function editComentarySale(body, isGeneral = true) {
	const arrayDetails = [
		{
			commentary: this.product.commentary || ' ',
			aditionalInformation: {
				location: this.product.location,
			},
			id: this.idRow,
		},
	];
	const bodyCommentary = body ? body.commentary : '';
	const referenceExternal =
		body && body.referenceExternalId
			? this.typeOrigins.find((t) => t.id === body.referenceExternalId).code
			: undefined;
	const newBody = {
		commentary: body ? bodyCommentary : this.sale.commentary || '',
		considerations: body ? body.considerations : this.sale.considerations,
		workToDo: body ? body.workToDo : this.sale.workToDo,
		details: isGeneral ? arrayDetails : undefined,
		referenceExternal,
	};
	try {
		this.disabledComentary = true;
		await this.$httpSales.patch(`/sale-documents-update-information/${this.id}`, newBody);
		this.showNotification('Se actualizó correctamente');
		this.closeModal();
		this.loadData();
	} catch (error) {
		this.showGenericError();
	} finally {
		this.disabledComentary = false;
	}
}

function getPlasticTaxes() {
	return getDeeper('taxesAmount', 'icbper')(this.sale);
}

function isRetention() {
	return this.action.code === 'sale-retention';
}

function isSaleTransactions() {
	return this.action.code === 'transaction';
}

function onInput({ model, value }) {
	this.retention[model] = value;
}

function detailInput(row, { model, value }) {
	if (model === 'codePercentageTax') {
		if (value) {
			this.$set(row, model, value.code);
			this.$set(row, 'percentageTax', value.percentage);
			this.$set(row, 'namePercentageTax', value.description);
			if (row.baseZero) {
				const amountTax = row.baseZero * (value.percentage / 100);
				this.$set(row, 'amountTax', amountTax);
			} else if (row.baseIva) {
				const amountTax = row.baseIva * (value.percentage / 100);
				this.$set(row, 'amountTax', amountTax);
			}
		}
	} else if (model === 'baseZero') {
		this.$set(row, model, value);
		if (row.percentageTax) {
			const amountTax = row.baseZero * (row.percentageTax / 100);
			this.$set(row, 'amountTax', amountTax);
		}
	} else if (model === 'baseIva') {
		this.$set(row, model, value);
		if (row.percentageTax) {
			const amountTax = row.baseIva * (row.percentageTax / 100);
			this.$set(row, 'amountTax', amountTax);
		}
	} else {
		this.$set(row, model, value);
	}
	this.validTotalRetention();
}

function validateRetentions() {
	if (!this.sale.withholdingTax) {
		this.retention.details = [...this.retentionDetails];
	} else {
		const goods =
			this.sale.withholdingTax.details.find((d) => d.description === 'BIENES') ||
			this.retentionDetails.find((rd) => rd.description === 'BIENES');
		const services =
			this.sale.withholdingTax.details.find((d) => d.description === 'SERVICIOS') ||
			this.retentionDetails.find((rd) => rd.description === 'SERVICIOS');
		const rent = this.sale.withholdingTax.details.filter(
			(d) => d.description === 'RENTA'
		);
		const ivaDetails = [goods, services];
		const newRetentionDetails = ivaDetails.concat(rent);
		this.sale.withholdingTax.details = [...newRetentionDetails];
		this.retention = { ...this.sale.withholdingTax };
	}
}

function onAddItem() {
	const retentionItem = {
		amountTax: null,
		baseExempt: null,
		baseRecorded: null,
		baseZero: null,
		codeAccounting: null,
		codePercentageTax: null,
		codeTax: null,
		description: 'RENTA',
		namePercentageTax: null,
		numberOrder: this.retentionDetails.length + 1,
		percentageTax: null,
	};
	this.retentionDetails.push(retentionItem);
	const rentItems = this.retentionDetails.filter((d) => d.description === 'RENTA');
	this.rentItemsValidate = rentItems.length > 1;
	this.validateRetentions();
}

function onDeleteItem(index) {
	this.retentionDetails.splice(index, 1);
	const rentItems = this.retentionDetails.filter((d) => d.description === 'RENTA');
	this.rentItemsValidate = rentItems.length > 1;
	this.validateRetentions();
}

function totalRetention() {
	return this.retention.details.reduce((acum, d) => acum + d.amountTax, 0);
}

async function createRetention() {
	this.loading = true;
	const body = { ...this.retention };
	const newDetails = this.retention.details.reduce((acum, d) => {
		if (d.codePercentageTax) {
			acum.push(d);
		}
		return acum;
	}, []);
	body.details = [...newDetails];
	try {
		await this.$httpSales.post(`withholding-tax/${this.sale.id}/purchase`, body);
		this.showNotification('La retención ha sido creada correctamente.');
		this.closeModal();
		this.loadData();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'SALE_WITHHOLDING_EXIST') {
				this.showGenericError('Ya existe un comprobante de retención para la venta.');
			}
		}
	} finally {
		this.loading = false;
	}
}

function validTotalRetention() {
	if (this.totalRetention > this.sale.amount) {
		this.loading = true;
		this.showGenericError(
			`El total retenido no puede ser mayor al total de la venta: ${this.sale.currency} ${this.sale.amount}`
		);
	} else {
		this.loading = false;
	}
}

async function loadValidate(code, name) {
	try {
		({ data: this.validSale } = await this.$httpSales.get(
			`sale-documents-validate/${this.id}`
		));
		this.validAction(code, name);
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'WAS_ALREADY_CANCELED_SALE') {
				this.showGenericError('La venta ya ha sido anulada anteriormente.');
			} else if (err.data.message === 'DOCUMENTS_MUST_NOT_BE_CANCELED') {
				this.showGenericError('El documento ya se encuentra en proceso de anulación.');
			}
		}
	}
}

function openModal() {
	this.modal.btnText = 'Entendido';
	this.modal.message =
		'Para poder realizar la anulación del documento, este debe haber sido informado a la SUNAT previamente.';
	this.modal.open = 'true';
}

function validAction(code, name) {
	if (this.isPeru) {
		if (this.validSale.validated.errorCode) {
			if (
				this.validSale.validated.errorCode === 'DOCUMENT_WAS_NOT_INFORMED' &&
				!this.sale.flagOldSale
			) {
				this.openModal();
			} else {
				this.runOpenSidebar(code, name);
			}
		} else {
			this.runOpenSidebar(code, name);
		}
	} else if (this.isEcuador) {
		if (this.validSale.validated) {
			if (this.validSale.validated.flagCancel) {
				this.runOpenSidebar(code, name);
			} else {
				this.showModalInit = true;
			}
		} else {
			this.runOpenSidebar(code, name);
		}
	}
}

function runOpenSidebar(code, name) {
	this.disabled = false;
	const item = { code, name, width: 600 };
	if (this.isPeru && this.validSale.validated.flagCancel) {
		item.name = 'ANULAR VENTA POR NOTA DE CRÉDITO';
	}
	this.openSidebar(item);
}

function closeModalError() {
	this.modal.open = false;
	this.modal.btnText = '';
	this.modal.message = '';
}

function calculateAdvanceInvoice(invoices) {
	return invoices.reduce((acc, sale) => acc + sale.amount, 0);
}

function closeDialogInit() {
	this.showModalInit = false;
}

function showDetail() {
	this.dialogDetail = true;
}

function closeDetail() {
	this.dialogDetail = false;
}

function showSaleCancelForm() {
	return this.sale && this.action.code === 'override';
}

function getPriceSale(row) {
	if (this.$route.query.showQuotation) {
		return row.salePrice;
	}
	return row.flagFree ? row.freeAmount : row.price;
}

function saleCustomer() {
	if (this.sale.typeDocument.code === 'FAC') {
		return this.sale.customer.rzSocial;
	} else if (this.sale.typeDocument.code === 'NTV') {
		return (
			this.sale.customer.rzSocial ||
			`${this.sale.customer.name || ''} ${this.sale.customer.lastname || ''}`
		);
	}
	return `${this.sale.customer.name || ''} ${this.sale.customer.lastname || ''}`;
}

function showModalSend() {
	this.dialogSend = true;
	this.phone = this.sale.customer.phone || '';
}

function closeModalSend() {
	this.phone = '';
	this.dialogSend = false;
}

async function sendRecords() {
	const paisNumero = '+51';
	const numero = `${paisNumero}${this.phone}`;

	const {
		amount,
		typeDocumentName,
		currencySymbol,
		typeDocumentCode,
		details,
		documentNumber,
		subsidiaryName,
	} = this.sale;
	const { fullName, documentNumber: documentNumberCustomer } =
		this.sale.customer.typePerson;
	// const companyName = this.sale.company.companyName;
	const companyName = subsidiaryName;
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
}

function data() {
	return {
		additionalSales: {
			departament: null,
			province: null,
			district: null,
		},
		totalAmountCoupon: 0,
		totalAdvanceInvoice: 0,
		totalFree: 0,
		action: {
			active: false,
			code: null,
			open: false,
			title: '',
			width: 0,
		},
		actionDefault: {
			active: false,
			code: null,
			open: false,
			title: '',
			width: 0,
		},
		checkAll: false,
		columns: [
			{
				id: 1,
				name: 'Código',
				value: 'code',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				name: 'Almacén',
				value: 'name',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Artículo',
				value: 'name',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Características',
				value: 'features',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'Marca',
				value: 'brandName',
				visible: true,
				checked: true,
			},
			{
				id: 6,
				name: 'Pieza',
				value: 'brandName',
				visible: false,
				checked: false,
			},
			{
				id: 7,
				name: 'Medida',
				value: 'brandName',
				visible: false,
				checked: false,
			},
			{
				id: 8,
				name: 'Cantidad',
				value: 'quantity',
				visible: true,
				checked: true,
			},
			{
				id: 9,
				name: 'Unidad',
				value: 'unitName',
				visible: true,
				checked: true,
			},
			{
				id: 10,
				name: 'Atributos',
				value: 'attributes',
				visible: false,
				checked: false,
			},
			{
				id: 11,
				name: 'Precio Unitario',
				value: 'unitPrice',
				visible: false,
				checked: true,
				basePrice: BasePrice.PU,
			},
			{
				id: 12,
				name: 'Precio Venta',
				value: 'price',
				visible: false,
				checked: true,
				basePrice: BasePrice.PV,
			},
			{
				id: 13,
				name: 'Descuento (%)',
				value: 'discountPercentage',
				visible: true,
				checked: true,
			},
			{
				id: 14,
				name: '',
				value: 'taxes',
				visible: true,
				checked: true,
			},
			{
				id: 15,
				name: 'Costo Total',
				value: 'price',
				visible: false,
				checked: false,
			},
			{
				id: 16,
				name: 'Total',
				value: 'total',
				visible: true,
				checked: true,
			},
			{
				id: 17,
				name: 'Ubicación',
				value: 'location',
				visible: false,
				checked: false,
			},
			{
				id: 18,
				name: 'Peso x UND',
				value: 'weightProduct',
				visible: false,
				checked: false,
			},
			{
				id: 19,
				name: 'Comentario',
				value: 'commentary',
				visible: false,
				checked: false,
			},
			{
				id: 20,
				name: 'Con. Serie',
				tooltip: 'Control de Serie',
				value: 'productSeries',
				visible: false,
				checked: false,
			},
			{
				id: 21,
				name: 'Acciones',
				value: 'actions',
				visible: true,
				checked: true,
			},
		],
		currentProduct: {},
		creditNoteData: {},
		data: [],
		dataSelected: [],
		dateOnline: '',
		details: [],
		disabled: true,
		disabledNdd: false,
		disabledComentary: false,
		disabledAditionalQuotation: false,
		flagTransfer: false,
		isLoading: false,
		idRow: null,
		loadingDetailSale: false,
		loading: false,
		modal: {
			btnText: '',
			message: '',
			open: false,
		},
		sale: {
			addressCustomer: null,
			customer: {
				typePerson: {},
			},
			documentRelated: {},
			employee: {},
			localDate: {},
			taxAmount: {},
			percentageWithholding: 0,
			typeDocument: {},
			statusTaxName: {},
			state: {},
			totalTaxesAmount: {},
		},
		product: {
			commentary: null,
			location: null,
		},
		showReturn: false,
		transactions: [],
		rentItemsValidate: false,
		rowsToExport: [],
		retention: {
			authorizationNumber: '',
			code: '',
			dateAccouting: null,
			dateDocument: null,
			dateExpiration: null,
			details: [],
			flagSale: true,
			number: '',
			serie: '',
		},
		retentionDetails: [
			{
				amountTax: null,
				baseIva: null,
				codeAccounting: null,
				codePercentageTax: '',
				codeTax: null,
				description: 'BIENES',
				namePercentageTax: null,
				numberOrder: 1,
				percentageTax: null,
			},
			{
				amountTax: null,
				baseIva: null,
				codeAccounting: null,
				codePercentageTax: '',
				codeTax: null,
				description: 'SERVICIOS',
				namePercentageTax: null,
				numberOrder: 2,
				percentageTax: null,
			},
			{
				amountTax: null,
				baseExempt: null,
				baseRecorded: null,
				baseZero: null,
				codeAccounting: null,
				codePercentageTax: null,
				codeTax: null,
				description: 'RENTA',
				namePercentageTax: null,
				numberOrder: 3,
				percentageTax: null,
			},
		],
		validSale: {},
		showModalInit: false,
		dialogDetail: false,
		phone: '',
		dialogSend: false,
		saleSeriesProduct: {},
		saleSeries: {},
		totalWeigth: 0,
		typeOrigins: [],
		hasAdvancePayment: false,
		dataServiceForAdvancePayment: [],
		banksAccount: [],
		hasBankAccount: false,
		showCostBenefit: false,
		showModalChangeDate: false,
		paymentDateOnly: null, // 'YYYY-MM-DD'
		paymentTime: '00:00', // 'HH:mm'
	};
}

export default {
	name: 'convert-sale',
	components: {
		actionSidebar,
		appDataQuote,
		appCommentaries,
		appTable,
		appActions,
		creditNote,
		debitComponent,
		documentsUpdate,
		editComentary,
		headerPage,
		modalSidebarButton,
		refundSale,
		saleRetention,
		salesCancel,
		salesCancelNew,
		saleTransactions,
		transactionsDetail,
		appShowDialog,
		accountingSeatDetail,
		modalItems,
		appCommentariesLotes,
		viewSeries,
		// VueSixFour,
		uploadImg,
		dateComponent,
	},
	computed: {
		columnsComputed,
		getPlasticTaxes,
		isCreditNoteAction,
		isANote,
		isARefund,
		isCommentary,
		isSaleCancel,
		isUpdate,
		isDocumentUpdate,
		isEditComentary,
		isRetention,
		isSaleTransactions,
		isReturnSalesAction,
		saleCustomer,
		showSaleCancelForm,
		showCancelButton,
		valuesDisabled,
		totalRetention,
		dataOldLot() {
			if (this.product && this.product.aditionalInformation) {
				const { lot, expirationDate } = this.product.aditionalInformation;
				return { expirationDate, lot };
			}
			return false;
		},
	},
	created,
	data,
	methods: {
		addConcepts,
		buildBody,
		calculateAdvanceInvoice,
		closeModal,
		closeModalError,
		convertDocument,
		createRetention,
		customDetails,
		detailInput,
		downloadSale,
		editComentarySale,
		editComentarySaleLot,
		getPrice,
		getPriceSale,
		getTaxByCountry,
		getTotalPrice,
		getTransactionId,
		getTransactions,
		goBack,
		goNewSale,
		loadData,
		loadValidate,
		makeProductCommentary,
		onAddItem,
		onDeleteItem,
		onInput,
		openModal,
		openSidebar,
		productDetails,
		removeProducts,
		rowIsSelected,
		runAction,
		runOpenSidebar,
		salesCanceled,
		selectedAll,
		setComentary,
		setModalCommentary,
		updateColumns,
		updateDataSelected,
		updateDocument,
		validAction,
		validTotalRetention,
		validateData,
		validateRetentions,
		closeDialogInit,
		showDetail,
		closeDetail,
		closeModalSend,
		sendRecords,
		showModalSend,
		changeDate() {
			this.showModalChangeDate = !this.showModalChangeDate;
		},
		onDateInput(id, dateStr) {
			this.paymentDateOnly = dateStr; // el date-component debe emitir 'YYYY-MM-DD'
			this.updateDatePayment(id, `${this.paymentDateOnly} ${this.paymentTime}:00`);
		},
		async updateDatePayment(id, paymentDate) {
			try {
				await this.$httpSales.patch(`transaction-bank/${id}/simple`, { paymentDate });
				this.showNotification('La fecha se actualizo correctamente.');
				this.showModalChangeDate = false;
				this.loadData();
			} catch (error) {
				this.showGenericError('La fecha no pudo ser actualizada');
			}
		},
		async loadBanksAccount() {
			const response = await this.getBankAccount();
			this.banksAccount = response.data;
			helper.setLocalData('banks-account', response.data);
		},
		showImage(flagForm) {
			const showImage =
				flagForm === typePaymentForm.Deposit || flagForm === typePaymentForm.Check;
			return showImage;
		},
		openSeries(row) {
			this.action.code = 'view-series';
			this.action.open = true;
			this.action.title = `${row.product.code}-${row.product.name} - SERIES`;
			this.action.width = 700;
			this.saleSeries = row;
			this.saleSeriesProduct = row.product;
		},
		async loadResources() {
			const request = [this.$httpSales.get('type-origins')];
			try {
				[{ data: this.typeOrigins }] = await Promise.all(request);
			} catch (err) {
				this.showGenericError();
			}
		},
		async updateTransaction(id, type, newUrl) {
			try {
				const url = type ? `transaction-bank/${id}/simple` : `transactions/${id}/simple`;
				await this.$httpSales.patch(url, {
					urlImage: newUrl,
				});
				this.showNotification(
					'La imagen del documento ha sido actualizado correctamente.'
				);
				this.loadData();
			} catch (error) {
				this.showGenericError('La imagen no pudo ser actualizada');
			}
		},
		isTypeCN(...args) {
			return [...args].includes(this.creditType);
		},
		getCreditNoteLabel() {
			const tc = this.sale.typeCatalogSunat;
			return tc ? tc.description : '-';
		},
		getErrorNTCAdvancePayment() {
			if (!this.hasAdvancePayment) {
				return null;
			}
			const taxes = (this.sale.details || []).map((detail) => detail.tax); // obtiene el array de taxes, puede ser vacío
			// El valor está "bien" si queremos verificar si hay algún impuesto diferente al primero:
			// taxes.some(tax => tax !== taxes[0]) será true si algún elemento es distinto del primero,
			// y false si todos son iguales o si el array está vacío.
			const hasDiferentesTaxes =
				taxes.length > 1 && taxes.some((tax) => tax !== taxes[0]);
			if (hasDiferentesTaxes) {
				return 'La venta tiene productos con diferentes tipos de impuesto, no se puede realiza una NTC con anticipo';
			}
			return null;
		},
		adapterDetails(details) {
			return details.map((row, index) => {
				const newRow = { ...row };
				newRow.productDeleted = row.productDeleted || false;
				newRow.parts =
					row && row.aditionalInformation && row.aditionalInformation.dynamicFields
						? row.aditionalInformation.dynamicFields.parts
						: null;
				newRow.meterage =
					row && row.aditionalInformation && row.aditionalInformation.dynamicFields
						? row.aditionalInformation.dynamicFields.meterage
						: null;
				newRow.priceBaseToCalculate = setNewProperty(
					'priceBaseToCalculate',
					this.sale.flagBasePrice
				);
				newRow.locationProduct =
					row && row.aditionalInformation ? row.aditionalInformation.location : null;
				newRow.weightProduct =
					(row && row.aditionalInformation && row.aditionalInformation.weight) ||
					(row && row.product && row.product.weigth) ||
					(this.sale.order &&
						this.sale.order.details[index] &&
						this.sale.order.details[index].weight) ||
					0;
				return newRow;
			});
		},
		async getAdvanceProduct() {
			try {
				this.isLoading = true;
				const { data: list } = await this.$httpProducts.get('products', {
					params: {
						code: CODE_PRODUCT_ADVANCE_PAYMENT,
						page: 1,
						limit: 1,
						flagWarehouseRequired: 1,
						relationAdd: 'productFind,brand,warehouse',
					},
				});

				if (!list.length) {
					this.showGenericError(
						'No se pudo cargar el producto para anticipos, por favor verifique que exista el producto tipo servicio con código ANTICIPO_01'
					);
					return;
				}
				const prod = list[0];
				const firstProductOfSale = this.sale.details[0];
				const taxPercentage = firstProductOfSale.tax;
				const mainTaxSale = (firstProductOfSale.taxes || [])[0];
				const taxesProduct = prod.product.taxes.map((tax) => ({
					...tax,
					code: mainTaxSale.code,
					codePercentage: mainTaxSale.codePercentage,
					percentage: mainTaxSale.percentage,
					name: mainTaxSale.name,
				}));
				const subTotal = this.sale.amount - this.totalAdvanceInvoice;
				// const taxPercentage = prod.product.taxes[0].percentage;
				const priceUnitary = fourDecimals(subTotal / (1 + taxPercentage / 100));
				const taxAmount = fourDecimals(subTotal - priceUnitary);
				const formatItem = {
					...prod,
					taxAmount,
					pricePerSale: subTotal,
					priceSale: subTotal,
					salePrice: subTotal,
					price: subTotal,
					subtotalWithoutTax: priceUnitary,
					total: subTotal,
					priceUnitary,
					subTotal,
					quantity: 1,
					discount: 0,
					discountPercentage: 0,
					taxCostPercentage: taxPercentage,
					product: {
						...prod.product,
						taxes: taxesProduct,
					},
				};
				this.dataServiceForAdvancePayment = this.adapterDetails([formatItem]);
				this.isLoading = false;
			} catch (error) {
				console.error(error);
				this.showGenericError(
					'No se pudo cargar el producto para anticipos, por favor verifique que exista el producto tipo servicio con código ANTICIPO_01',
					10000
				);
			}
		},
	},
	props: {
		id: [Number, String],
	},
	watch: {
		dataSelected(newVal) {
			if (newVal.length > 0) {
				this.rowsToExport = newVal.map((productRow) => {
					const newRow = {
						code: '',
						name: '',
						features: '',
						quantity: productRow.quantity,
						unitName: productRow.unitName,
						unitPrice: productRow.unitPrice,
						price: productRow.price,
						discountPercentage: productRow.discountPercentage,
						taxes: productRow.taxes[0] ? productRow.taxes[0].subtotal : 0,
						total: productRow.price * productRow.quantity,
					};
					const { product } = productRow;
					if (product) {
						newRow.code = product.code;
						newRow.name = product.name;
						newRow.features = product.inlineFeatures;
					}
					return newRow;
				});
			}
		},
	},
};
</script>

<style lang="scss" scoped>
.loading {
	background-color: rgba(0, 0, 0, 0.5);
	height: 100vh;
	left: 0px;
	position: fixed;
	top: 0px;
	width: 100%;
	z-index: 10;

	&-message {
		background-color: color(white);
		border: 2px solid color(primary);
		border-radius: 6px;
		bottom: 0px;
		font-family: font(open-semibold);
		height: fit-content;
		height: -moz-fit-content;
		left: 0px;
		margin: auto;
		max-width: 520px;
		padding: 15px 20px;
		position: absolute;
		right: 0px;
		text-align: center;
		top: 0px;
		width: fit-content;
		width: -moz-fit-content;
	}
}

.convert-sale {
	font-family: font(open-semibold);
	font-size: size(medium);
	position: relative;
}

.sale-document-info {
	font-size: size(large);
}

.border-title {
	border-bottom: 1px solid rgba(2, 151, 155, 0.19);
}

.product-list {
	font-size: size(medium);
}

.back-to {
	background-color: color(info);
}

.card {
	border-radius: 0px;
	box-shadow: none;

	&-blue {
		background-color: map-get($colors, item-select);
	}

	&-grey {
		background-color: map-get($colors, title-green);
	}

	&-pink {
		background-color: map-get($colors, red-dsct);
	}

	.row-text {
		color: map-get($colors, paginationText);
		font-size: map-get($sizes, medium);

		&-title {
			font-family: map-get($fonts, open-bold);
		}

		&-price {
			color: color(sidebar);
			font-family: map-get($fonts, lato-regular);
			font-size: map-get($sizes, medium);
			font-weight: 900;
		}
	}
}

.transactions-container {
	margin-bottom: 90px;
	max-height: 185px;
	overflow: auto;

	@media print {
		max-height: 100%;
	}
}

.block {
	display: block;
}

.pr-40 {
	padding-right: 40%;
}

.total-slide {
	font-family: font(open-bold);
	font-size: size(medium16);
	line-height: 1;
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

.carrillo-advance-invoice {
	align-items: center;
	display: flex;
	font-size: size(medium);
	justify-content: flex-end;

	div {
		align-items: center;
		display: flex;

		output {
			font-family: font(open-bold);
		}
	}
}

.carrillo-advance-invoice {
	align-items: center;
	display: flex;
	font-size: size(medium);
	justify-content: flex-end;

	div {
		align-items: center;
		display: flex;

		output {
			font-family: font(open-bold);
		}
	}
}

.text-link {
	text-decoration: underline;
	cursor: pointer;
}

.detail {
	&-type-document {
		color: color(paginationText);
		font-family: map-get($fonts, open-bold);
		font-size: 16px;
	}

	&-title-row {
		font-size: 12px;
		font-family: map-get($fonts, open-bold);
	}

	&-accouting {
		border: 1px solid color(primary);
		border-radius: 2px;
		font-family: map-get($fonts, open-light);
		font-size: 12px;
		padding: 1px 8px 3px 8px;
		text-align: center;
		width: 195px;
	}

	&-description-row {
		color: #232323;
		font-family: map-get($fonts, open-semibold);
		font-size: 12px;
	}

	&-green-sale {
		background-color: #e0f3f3;
		color: color(sidebar);
		font-family: map-get($fonts, open-bold);
		font-size: 12px;
		padding: 5px 15px;
	}

	&-white-sale {
		background-color: white;
		color: #4a4a4a;
		font-family: map-get($fonts, open-regular);
		font-size: 12px;
		padding: 5px 15px;
	}
}

.border-bottom {
	border-bottom: 1px solid color(primary);
	cursor: pointer;
}

.title-footer {
	color: #14324e;
	font-family: map-get($fonts, open-bold);
	font-size: 11px;
}

.inline-date {
	display: inline-block;
	width: 245px;
}

.inline-customer {
	display: inline-block;
	width: 255px;
}

.total-green {
	color: map-get($colors, background-sidebar);
	font-family: map-get($fonts, lato-regular);
	font-size: 12px;
	font-weight: 900;
}

.card-pink {
	background-color: map-get($colors, red-dsct);
}

.link-transaction {
	color: map-get($colors, header);
	text-decoration: underline;
}

.text-transaction {
	color: map-get($colors, paginationText);
}

.container-payment {
	border-top: 1px solid #e0f3f3;
	padding-top: 21px;
}

.card-green {
	background-color: #eaf5f6;
}

.card-blue {
	background-color: #1578d1;
	color: white;
}

.width-attribute {
	width: 380px;
}

.text-center {
	text-align: center;
}
</style>
