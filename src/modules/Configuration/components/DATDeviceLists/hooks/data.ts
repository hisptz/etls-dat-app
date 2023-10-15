import { read, write, utils } from "xlsx";

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
