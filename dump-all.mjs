import ExcelJS from "exceljs";
const FILE = "D:/Work/SoftwareWorkSpace/ecommerce-raaspal/docs/PRD-ecommerceRaasPal.xlsx";
const wb = new ExcelJS.Workbook();
await wb.xlsx.readFile(FILE);
const ws = wb.getWorksheet("REQUIREMENTS");
for (let r = 8; r <= ws.rowCount; r++) {
  const row = ws.getRow(r);
  const vals = [];
  row.eachCell({ includeEmpty: false }, (cell) => {
    let v = cell.value;
    if (v && typeof v === "object" && v.richText) v = v.richText.map(t=>t.text).join("");
    vals.push(`${cell.address}=${JSON.stringify(v)}`.slice(0,120));
  });
  if (vals.length) console.log(`R${r}: ${vals.join(" | ")}`);
}
