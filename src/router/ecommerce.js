const route = {
	name: 'ecommerce',
	path: '/ecommerce',
	component: () => import('@/pages/ecommerce/page-ecommerce'),
	children: [
		{
			name: 'orders',
			path: 'orders',
			meta: {
				title: 'Pedidos Delivery',
			},
			component: () => import('@/pages/ecommerce/pages-ecommerce-order'),
		},
		{
			name: 'banner',
			path: 'banner/:id?',
			meta: {
				title: 'Banners',
				navigation: true,
				navigationText: 'Volver a Lista de Comercios',
				navigationRoute: '/ecommerce/commerce',
				navigationChange: true,
			},
			component: () => import('@/pages/ecommerce/page-banners'),
			props: true,
		},
		{
			name: 'new-banner',
			path: 'new-banner/:commerceId?',
			meta: {
				title: 'Crear Banners',
				navigation: true,
				navigationText: 'Volver a Lista de Banners',
				navigationChange: true,
			},
			component: () => import('@/pages/ecommerce/page-create-banner'),
			props: true,
		},
		{
			name: 'edit-banner',
			path: ':id/edit-banner',
			meta: {
				title: 'Editar Banners',
				navigation: true,
				navigationText: 'Volver a Lista de Banners',
				navigationChange: true,
			},
			props: true,
			component: () => import('@/pages/ecommerce/page-create-banner'),
		},
		{
			name: 'products-ecommerce',
			path: 'products',
			meta: {
				title: 'Productos Ecommerce',
			},
			component: () => import('@/pages/ecommerce/product-ecommerce'),
		},
		{
			name: 'create-product',
			path: 'products/new',
			meta: {
				title: 'Nuevo Producto',
			},
			component: () => import('@/pages/ecommerce/page-create-product'),
		},
		{
			name: 'edit-product-ecommerce',
			path: 'products/:id/edit',
			meta: {
				title: 'Editar Producto',
			},
			component: () => import('@/pages/ecommerce/page-create-product'),
			props: true,
		},
		{
			name: 'filters',
			path: 'filters',
			meta: {
				title: 'Filtros',
			},
			component: () => import('@/pages/ecommerce/page-filters-ecommerce'),
		},
		{
			name: 'product-sections',
			path: 'products-sections',
			meta: {
				title: 'SECCIONES DE PRODUCTOS',
			},
			component: () => import('@/pages/ecommerce/page-products-sections'),
		},
		{
			name: 'categories-ecommerce',
			path: ':id?/categories',
			meta: {
				title: 'Categorías',
				navigationText: 'Volver a Comercios',
				navigationChange: true,
				navigation: true,
			},
			component: () => import('@/pages/ecommerce/page-categories'),
			props: true,
		},
		{
			name: 'edit-order',
			path: 'order/:id/edit',
			meta: {
				title: 'Editar pedido',
			},
			props: true,
			component: () => import('@/pages/ecommerce/page-edit-order'),
		},
		{
			name: 'loading-products',
			path: 'loading-products',
			meta: {
				title: 'Carga de Productos',
			},
			props: true,
			component: () => import('@/pages/ecommerce/page-loading-products'),
		},
		{
			name: 'configuration',
			path: 'configuration/:id',
			meta: {
				title: 'Configuración',
			},
			props: true,
			component: () => import('@/pages/ecommerce/page-configuration'),
		},
		{
			name: 'page-configuration-desktop',
			path: ':id/configuration/desktop',
			meta: {
				title: 'Configuración Desktop',
			},
			props: true,
			component: () => import('@/pages/ecommerce/page-configuration-desktop'),
		},
		{
			name: 'page-configuration-mobile',
			path: ':id/configuration/mobile',
			meta: {
				title: 'Configuración Móvil',
			},
			props: true,
			component: () => import('@/pages/ecommerce/page-configuration-mobile'),
		},
		{
			name: 'cost-of-shipping',
			path: 'cost-of-shipping',
			meta: {
				title: 'Costo de Envío',
			},
			component: () => import('@/pages/ecommerce/page-cost-shipping'),
		},
		{
			name: 'commerce',
			path: 'commerce',
			meta: {
				title: 'Comercio',
			},
			component: () => import('@/pages/ecommerce/page-commerce-ecommerce'),
		},
		{
			name: 'commerce-table',
			path: 'commerce-table',
			meta: {
				title: 'Comercio',
			},
			component: () => import('@/pages/ecommerce/page-commerce-ecommerce-table'),
		},
		{
			name: 'page-help-center',
			path: ':commerceId/help-center',
			meta: {
				navigation: true,
				navigationText: 'Volver a Comercios',
				navigationRoute: '/ecommerce/commerce',
				title: 'Centro de Ayuda',
				navigationChange: true,
			},
			props: true,
			component: () => import('@/pages/ecommerce/page-help-center'),
		},
		{
			name: 'heading',
			path: 'heading',
			meta: {
				title: 'Rubro',
			},
			component: () => import('@/pages/ecommerce/page-heading'),
		},
		{
			name: 'fair',
			path: 'fair',
			meta: {
				title: 'Feria',
			},
			component: () => import('@/pages/ecommerce/page-fair'),
		},
		{
			name: 'courier',
			path: 'courier',
			meta: {
				title: 'Pedidos Courier',
			},
			component: () => import('@/pages/ecommerce/pages-ecommerce-courier'),
		},
		{
			name: 'courier-detail',
			path: 'courier-detail/:id',
			meta: {
				title: 'Detalle de Pedido Courier',
				navigation: true,
				navigationText: 'Volver a pedidos courier',
				navigationRoute: '/ecommerce/courier',
			},
			props: true,
			component: () => import('@/pages/ecommerce/pages-ecommerce-courier-detail'),
		},
		{
			name: 'free-orders',
			path: 'free',
			meta: {
				title: 'Pedidos Libres',
			},
			component: () => import('@/pages/ecommerce/pages-ecommerce-free'),
		},
		{
			name: 'courier-detail-free',
			path: 'courier-detail-free/:id',
			meta: {
				title: 'Detalle de Pedido Libre',
				navigation: true,
				navigationText: 'Volver a pedidos libre',
				navigationRoute: '/ecommerce/free',
			},
			props: true,
			component: () => import('@/pages/ecommerce/pages-ecommerce-courier-detail'),
		},
	],
};

export default route;
