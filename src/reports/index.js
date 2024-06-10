import { readFileSync, writeFileSync } from 'node:fs';
import axios from "axios";
import docxtemplater from "docxtemplater";
import expressionParser from "docxtemplater/expressions.js";
import PizZip from "pizzip";


async function exportDocx(tempDocxPath, data) {
	let content = readFileSync(tempDocxPath)
	const zip = new PizZip(content);
	const docx = new docxtemplater(zip, { parser: expressionParser });
	docx.setData(data);
	docx.render();
	const out = docx.getZip().generate({
		type: 'blob',
		mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
	})
	return out;
}

export default {
	id: 'reports',
	handler: async (router, context) => {
		console.log("*** Enter reporst route ***");

		router.post('/', async (req, res) => {
			if (req.accountability.permissions.find(x => x.collection == "reports")) {
				const { database } = context;
				const { ItemsService } = context.services;
				const schema = await context.getSchema();
				const reportsDir = context.env["DB_FASTBS_BUNDLE_SETTINGS_REPORTS_DIR"] ?? "";

				const reportsService = new ItemsService("reports", { schema, database });
				const report = await reportsService.readByQuery({
					fields: ['*'],
					filter: {
						name: {
							_eq: req.body.name,
						}
					},
				});

				if (report.length) {
					let out;
					try {
						switch (req.body.format) {
							case "docx":
								out = await exportDocx(reportsDir + report[0].template_file_name, req.body.data);
								break;
							case "pdf":
								const docx = await exportDocx(reportsDir + report[0].template_file_name, req.body.data);
								const formData = new FormData();
								formData.append("file", docx, "report.docx");
								const gotenberg = () => { return axios.create({ baseURL: "http://localhost:3100" }); }
								const pdf = await gotenberg().post("forms/libreoffice/convert", formData, { headers: { 'Content-Type': 'multipart/form-data' }, responseType: "arraybuffer" });
								out = new Blob([pdf.data]);
								break;
							default:
								res.status(400).end();
								return;
						}
						const fileName = req.body.fileName + "." + req.body.format;
						const arrayBuffer = await out.arrayBuffer();
						const buffer = Buffer.from(arrayBuffer);
						writeFileSync(reportsDir + fileName, buffer);
						res.attachment(fileName).send(buffer);
						return;
					}
					catch (err) {
						console.log("err:", err)
						res.status(500).end();
						return;
					}
				} else {
					res.status(404).end();
					return;
				}
			} else {
				res.status(403).send();
				return;
			}
		});

		router.all("*", async (req, res) => {
			res.status(500).end();
		});
	},
};