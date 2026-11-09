import format from 'date-fns/format';
import isValid from 'date-fns/is_valid';
import lib from '@/shared/lib';

const { round } = lib;
const twoDecimals = round(2);

function convertDate(date) {
	if (!date) {
		return '';
	}
	if (typeof date === 'string' && date.indexOf('/') > -1) {
		const [day, month, year] = date.split('/');
		return `${year}-${month}-${day}`;
	}
	return date;
}

function convertYear(date) {
	if (!date) {
		return '';
	}
	const [day, month, year] = date.split('/');
	const newyear = year.substring(year.length - 2);
	const result = `${day}-${month}-${newyear}`;
	const validDate = new Date(year, month, day);
	if (validDate.toString() === 'Invalid Date') {
		return '';
	}
	return result;
}

function validatedOrder(row) {
	return !row.orderId;
}

function getEndPointDynamic(value) {
	const urls =
		JSON.parse(localStorage.getItem(`${process.env.STORAGE_USER_KEY}::domains`)) || [];
	const keyFind = urls.find((p) => p.code === value);
	return keyFind ? keyFind.endPoint : undefined || undefined;
}

function formatDate(date, formatter = 'DD-MM-YYYY') {
	const newDate = format(new Date(date), formatter);
	return newDate;
}

function formatPaymentDate(date) {
	const currentDate = new Date();
	const hours = currentDate.getHours();
	const minutes = currentDate.getMinutes();
	const seconds = currentDate.getSeconds();
	const formatedDate = date
		? `${date} ${hours}:${minutes}:${seconds}`
		: format(new Date(), 'YYYY-MM-DD-HH-mm-ss');
	return formatedDate;
}

function formattedToLocalDate(time) {
	const now = new Date(time);
	const offset = -5 * 60;
	now.setMinutes(now.getMinutes() + offset);
	return now.toISOString();
}

function generateBlob(data, contentType = 'application/pdf') {
	return new Blob([data], { type: contentType });
}

function getLocalData(key) {
	return JSON.parse(localStorage.getItem(`${process.env.STORAGE_USER_KEY}::${key}`));
}

function getLocalUser() {
	return JSON.parse(localStorage.getItem('admin'));
}

function getLocalToken() {
	return localStorage.getItem(`${process.env.STORAGE_USER_KEY}::token`);
}

function getLocalAdminUser() {
	return JSON.parse(localStorage.getItem(`${process.env.STORAGE_USER_KEY}::admin-user`));
}

function removeLocalData(key) {
	return localStorage.removeItem(`${process.env.STORAGE_USER_KEY}::${key}`);
}

function setLocalData(key, data) {
	return localStorage.setItem(`${process.env.STORAGE_USER_KEY}::${key}`,
		JSON.stringify(data)
	);
}

function showDownloadDialog(blob, name, extension, download = true) {
	const currentDate = format(new Date(), 'YYYY-MM-DD');
	const link = document.createElement('a');
	if (download) {
		link.download = `${name}_${currentDate}.${extension}`;
	}
	link.href = window.URL.createObjectURL(blob);
	window.open(link.href);
}

/* eslint-disable */
function debounce(func, wait = 800, immediate) {
	var timeout;
	return function () {
		var context = this,
			args = arguments;
		var later = function () {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
}

function isValidDate(date) {
	return isValid(new Date(convertDate(date)));
}

function exactDate(date, formatter = 'DD-MM-YYYY', time, splitBy = 'T') {
	if (date) {
		const dateSplit = date.split(splitBy);
		const dateComplete = dateSplit[0].split('-');
		const timeComplete = dateSplit[1] ? dateSplit[1].split(':') : null;
		const year = dateComplete[0];
		const month = dateComplete[1] - 1;
		const day = dateComplete[2];
		const hour = timeComplete ? timeComplete[0] : null;
		const minutes = timeComplete ? timeComplete[1] : null;
		const seconds = timeComplete ? timeComplete[2].split('.')[0] : null;
		const newDate =
			time || timeComplete
				? format(new Date(year, month, day, hour, minutes, seconds), formatter)
				: format(new Date(year, month, day), formatter);
		return newDate;
	}
	return '';
}

function quotesDistribution(amount, quotes) {
	let acc = 0;
	const quotesArr = [];
	for (let i = 0; i < quotes; i += 1) {
		const dif = amount - acc;
		const q = dif / (quotes - i);
		const qR = Math.ceil(q);
		acc += qR;
		quotesArr.push(qR);
	}
	if (acc > amount) {
		const lastQuote = quotesArr[quotes - 1];
		const excess = acc - amount;
		quotesArr[quotes - 1] = twoDecimals(lastQuote - excess);
	}
	return quotesArr;
}

function updateLocalStorage(key, data) {
	localStorage.removeItem(key);
	localStorage.setItem(key, JSON.stringify(data));
}

function getCompanyTaxesFlat() {
	// METODO PARA OBTENER LOS IMPUESTOS A UN SOLO NIVEL (IDEAL SI LOS IMPUESTOS SE ACTUALIZAN)
	const taxesArray = getLocalData('other-taxes');
	const newTaxArray = [];
	const flagTaxesIgvTemporary = getLocalData('admin-user').company.settings.flagTaxesIgvTemporary || false;

	taxesArray.forEach((tax) => {
		const baseTax = { ...tax, percentage: tax.percentage || 0, idCodeReference: `${tax.code}${tax.percentage || 0}` };
		const percentages = baseTax?.additionalInformation?.typeTaxesPercentage || [];

		if (percentages.length && flagTaxesIgvTemporary) {
			newTaxArray.push(baseTax);

			percentages
				.filter(p => p !== baseTax.percentage) //  evita duplicados
				.forEach((percentage) => {
					newTaxArray.push({
						...baseTax,
						percentage,
						idCodeReference: `${baseTax.code}${percentage}`,
					});
				});
		} else {
			newTaxArray.push(baseTax);
		}
	});

	return newTaxArray;
}

function dateOnly(date) {
	const d = new Date(date);
	d.setHours(0, 0, 0, 0);
	return d;
}

function isLaterDate(date1, date2) {
	return dateOnly(date1) > dateOnly(date2);
}

const methods = {
	convertDate,
	convertYear,
	debounce,
	exactDate,
	formatDate,
	formatPaymentDate,
	formattedToLocalDate,
	getEndPointDynamic,
	generateBlob,
	getLocalData,
	getLocalUser,
	getLocalToken,
	getLocalAdminUser,
	isValidDate,
	removeLocalData,
	quotesDistribution,
	setLocalData,
	showDownloadDialog,
	updateLocalStorage,
	validatedOrder,
	getCompanyTaxesFlat,
	isLaterDate
};

export default methods;
