import { useAlert } from "@dhis2/app-runtime";
import { useSetting } from "@dhis2/app-service-datastore";
import { Pagination } from "@hisptz/dhis2-utils";
import { isEmpty } from "lodash";
import { useEffect, useState } from "react";
import { read, write, utils } from "xlsx";
import i18n from "@dhis2/d2-i18n";

export function readXLSXFile(file: File) {
	return new Promise((resolve, reject) => {
		try {
			const reader = new FileReader();
			reader.onload = (e) => {
				const data = e.target?.result;
				const workbook = read(data, { type: "array" });
				const sheetName = workbook.SheetNames[0];
				const worksheet = workbook.Sheets[sheetName];
				const jsonData = utils.sheet_to_json(worksheet);
				const imeiNumbers = jsonData.map((row: any) => row);

				resolve({ imeiNumbers });
			};

			reader.onerror = (e) => {
				reject({ error: "Error reading XLSX file" });
			};

			reader.readAsArrayBuffer(file);
		} catch (error) {
			reject({ error: "Error reading XLSX file" });
		}
	});
}

export const useDevicesFromDataStore = () => {
	const [deviceIMEIList] = useSetting("deviceIMEIList", { global: true });

	const [data, setData] = useState<any>();
	const [allDevices, setAllDevices] = useState<any>();
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [currentPageSize, setPageSize] = useState<number>(10);
	const [errorDevice, setError] = useState<any>();
	const [loadingDevice, setLoading] = useState(true);
	const [pagination, setPagination] = useState<Pagination>();

	const { show, hide } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 4000 }),
	);

	async function paginateArray(
		eventArray: any,
		currentPage: number,
		pageSize: number,
	) {
		const startIndex = (currentPage - 1) * pageSize;
		const endIndex = startIndex + pageSize;

		const pageData = eventArray.slice(startIndex, endIndex);

		const pagination = {
			page: currentPage,
			pageSize: pageSize,
			total: eventArray.length,
			pageCount: Math.ceil(eventArray.length / pageSize),
			data: pageData,
		};

		return pagination;
	}

	const fetchData = async (newDeviceList?: any) => {
		setAllDevices(newDeviceList ?? deviceIMEIList);
	};

	const paginateData = async ({
		deviceList,
		page,
		pageSize,
	}: {
		deviceList?: [];
		page?: number;
		pageSize?: number;
	}) => {
		try {
			const paginatedData = await paginateArray(
				deviceList ?? allDevices ?? [],
				page ?? currentPage,
				pageSize ?? currentPageSize,
			);

			const defaultData = await paginateArray(
				allDevices ?? [],
				1,
				pageSize ?? currentPageSize,
			);

			setData(
				!isEmpty(paginatedData.data)
					? paginatedData.data
					: defaultData.data,
			);
			setPagination({
				page: !isEmpty(paginatedData.data)
					? paginatedData.page
					: defaultData.page,
				pageSize: !isEmpty(paginatedData.data)
					? paginatedData.pageSize
					: defaultData.pageSize,
				total: !isEmpty(paginatedData.data)
					? paginatedData.total
					: defaultData.total,
				pageCount: !isEmpty(paginatedData.data)
					? paginatedData.pageCount
					: defaultData.pageCount,
			});

			setLoading(false);
		} catch (error) {
			setError(error);
			setLoading(false);
		}
	};

	useEffect(() => {
		paginateData({});
	}, [allDevices]);

	useEffect(() => {
		fetchData();
	}, []);

	const onPageChange = async (page: number) => {
		setCurrentPage(page);
		await paginateData({ page: page });
	};
	const onPageSizeChange = async (pageSize: number) => {
		setPageSize(pageSize);
		await paginateData({ pageSize: pageSize });
	};

	const search = (device: string) => {
		const filteredData = allDevices.filter((d: any) =>
			d.IMEI.includes(device),
		);

		paginateData({ deviceList: filteredData });

		if (isEmpty(filteredData) && !isEmpty(device)) {
			show({
				type: {
					info: true,
				},
				message: `${i18n.t("No matching devices found")}`,
			});
		}
	};

	return {
		pagination: {
			...pagination,
			onPageSizeChange,
			onPageChange,
		},
		data,
		refetch: async (newDevicesList: any) => {
			await fetchData(newDevicesList).then(() =>
				paginateData({ deviceList: newDevicesList }),
			);
		},
		search,
		errorDevice,
		loadingDevice,
	};
};
