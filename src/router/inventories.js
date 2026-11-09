const route = {
	name: 'inventories',
	path: 'inventories',
	redirect: '/inventories/list',
	component: () => import('@/components/inventories/inventories'),
	children: [
		{
			name: 'list-kardex-gen',
			path: 'kardex-general/:brandId?/:documentTypeId?/:productId?/:warehouseId?',
			meta: {
				title: 'Listado de Kardex General',
			},
			props: true,
			component: () => import('@/pages/inventories/page-kardex-general'),
		},
		{
			name: 'list-of-inventories',
			path: 'list',
			meta: {
				title: 'INVENTARIOS',
			},
			component: () => import('@/components/inventories/list-of-inventories'),
		},
		{
			name: 'new-inventory',
			path: 'new',
			props: true,
			meta: {
				title: 'INVENTARIADO NUEVO',
			},
			component: () => import('@/components/inventories/new-inventory'),
		},
		{
			name: 'inventory-detail',
			path: ':inventoryId/detail',
			props: true,
			meta: {
				title: 'DETALLE DE INVENTARIO',
			},
			component: () => import('@/components/inventories/inventory-detail'),
		},
		{
			name: 'kardex',
			path: '/:code/:productId/:warehouseId/:brandId/kardex',
			props: true,
			meta: {
				title: 'LISTADO DE KARDEX',
			},
			component: () => import('@/components/inventories/kardex'),
		},
		{
			name: 'master-inventory',
			path: 'list-master',
			props: true,
			meta: {
				title: 'LISTADO DE INVENTARIOS MAESTROS',
			},
			component: () => import('@/pages/inventories/page-master-inventories'),
		},
		{
			name: 'child-inventory',
			path: ':id/list-child',
			props: true,
			meta: {
				title: 'LISTADO DE INVENTARIOS HIJOS',
				navigation: true,
				navigationText: 'Volver a Lista de Inventarios',
				navigationRoute: '/inventories/list-master',
			},
			component: () => import('@/pages/inventories/page-child-inventories'),
		},
		{
			name: 'detail-child-inventory',
			path: ':id/detail-child',
			props: true,
			meta: {
				title: 'DETALLE DE INVENTARIO HIJO',
			},
			component: () => import('@/pages/inventories/page-detail-child-inventory'),
		},
		{
			name: 'detail-child-inventory-fast',
			path: ':id/detail-child-fast',
			props: true,
			meta: {
				title: 'DETALLE DE INVENTARIO RAPIDO',
			},
			component: () => import('@/pages/inventories/page-detail-child-inventory-fast'),
		},
		{
			name: 'detail-master-inventory',
			path: ':id/detail-master/:status?',
			props: true,
			meta: {
				title: 'DETALLE DE INVENTARIO MAESTRO',
			},
			component: () => import('@/pages/inventories/page-detail-master'),
		},
		{
			name: 'summary-inventory-category',
			path: ':id/summary-category',
			props: true,
			meta: {
				title: 'RESUMEN DE INVENTARIO POR CATEGORÍA',
				navigation: true,
				navigationText: 'Volver a Lista de Inventarios',
				navigationRoute: '/inventories/list-master',
			},
			component: () => import('@/pages/inventories/page-category-summary-inventory'),
		},
		{
			name: 'page-new-kardex',
			path: ':productId/:warehouseId/:brandId/new-kardex',
			props: true,
			meta: {
				title: 'LISTADO DE KARDEX',
			},
			component: () => import('@/pages/inventories/page-new-kardex'),
		},
		{
			name: 'group-inventory',
			path: 'list-groups',
			props: true,
			meta: {
				title: 'Grupos',
			},
			component: () => import('@/pages/inventories/page-list-groups'),
		},
		{
			name: 'group-inventory-new',
			path: 'new-group',
			props: true,
			meta: {
				title: 'Nuevo Grupo',
			},
			component: () => import('@/pages/inventories/page-new-group'),
		},
		{
			name: 'new-entry',
			path: ':productIdEdit?/:warehouseId?/:commerceCode?/:commerceId?/:subsidiaryId?/new-entry',
			props: true,
			meta: {
				title: 'Nuevo Ingreso',
			},
			component: () => import('@/pages/inventories/page-new-in-out'),
		},
		{
			name: 'new-discharge',
			path: ':productIdEdit?/:warehouseId?/:commerceCode?/:commerceId?/:subsidiaryId?/new-discharge',
			props: true,
			meta: {
				title: 'Nuevo Egreso',
			},
			component: () => import('@/pages/inventories/page-new-in-out'),
		},
		{
			name: 'group-inventory-edit',
			path: ':id/edit-group',
			props: true,
			meta: {
				title: 'Editar Grupo',
			},
			component: () => import('@/pages/inventories/page-new-group'),
		},
		{
			name: 'types-of-inventory-movements',
			path: 'types-of-inventory-movements',
			props: true,
			meta: {
				title: 'Tipos de Movimiento de Inventario',
			},
			component: () => import('@/pages/inventories/page-types-of-inventory-movements'),
		},
		{
			name: 'head-kardex-movement',
			path: 'kardex-movement',
			props: true,
			meta: {
				title: 'Movimientos Kardex',
			},
			component: () => import('@/pages/inventories/page-head-kardex-movement'),
		},
		{
			name: 'detail-kardex-movement',
			path: ':id/detail-kardex-movement',
			props: true,
			meta: {
				title: 'Detalle de Movimiento Kardex',
			},
			component: () => import('@/pages/inventories/page-detail-movement-kardex'),
		},
		{
			name: 'inventory-synchronization',
			path: 'synchronization',
			meta: {
				title: 'Sincronización Kardex',
			},
			component: () => import('@/pages/inventories/page-synchronization'),
		},
	],
};

export default route;
