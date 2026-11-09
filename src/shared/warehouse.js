import { productsInstance } from '@/axios';

async function getStockByWarehouse(productIds, warehouseIds) {
	if (!productIds || productIds.length === 0) {
		return {};
	}
	try {
		const response = await productsInstance.post('products/warehouse-stock', {
			productIds,
			warehouseIds: warehouseIds || [],
		});
		const stockMap = {};
		response.data.forEach((item) => {
			(item.warehouseProductDetails || []).forEach((wh) => {
				stockMap[`${item.id}-${wh.id}`] = wh.stockWarehouse;
			});
		});
		return stockMap;
	} catch (error) {
		console.error('Error fetching stock:', error);
		return {};
	}
}

export { getStockByWarehouse };
