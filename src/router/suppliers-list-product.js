const route = {
	name: 'suppliers-list-product',
	path: '/suppliers/:id/list-product',
	meta: {
		title: 'Lista de Producto de Compra',
        navigation: true,
	    navigationText: 'Volver a Lista de Proveedores',
		navigationRoute: '/suppliers',
	},
	component: () => import('@/pages/purchases/pages-suppliers-list-product'),
    props: true,
};

export default route;
