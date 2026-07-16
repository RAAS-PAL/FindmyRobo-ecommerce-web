import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

/* Seeds the rich detail page for luba-3-awd-3000, modeled on the reference
 * page (docs/productpage-example.png), adapted from the 5000 to the 3000 and
 * from Australia to Thailand. Image/video URLs are left for the admin to add
 * via the page builder — text blocks and the full spec table render now. */

const env = {};
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const L = (en, th) => ({ en, th });

const page = {
  blocks: [
    {
      type: "feature",
      heading: L(
        "Mammotion Tri-Fusion Positioning System",
        "ระบบระบุตำแหน่ง Tri-Fusion จาก Mammotion"
      ),
      body: L(
        "The world's first solution to integrate 360° LiDAR, NetRTK, and Vision for unmatched precision, adaptability, and stability. Using 360° LiDAR for navigation, Vision for rapid object recognition, and NetRTK for corrections, it delivers precision within ±1 cm, intelligent sensor switching, and seamless navigation across any lawn or terrain.",
        "โซลูชันแรกของโลกที่ผสาน LiDAR 360°, NetRTK และกล้อง Vision เข้าด้วยกัน เพื่อความแม่นยำ ความยืดหยุ่น และความเสถียรที่เหนือกว่า ใช้ LiDAR 360° นำทาง กล้อง Vision จดจำวัตถุอย่างรวดเร็ว และ NetRTK ปรับแก้ตำแหน่ง ให้ความแม่นยำระดับ ±1 ซม. สลับเซ็นเซอร์อัจฉริยะ และนำทางได้ลื่นไหลในทุกสนามและทุกภูมิประเทศ"
      ),
    },
    {
      type: "feature",
      heading: L(
        "The perfect mower for Thailand",
        "หุ่นยนต์ตัดหญ้าที่ใช่สำหรับเมืองไทย"
      ),
      body: L(
        "Thai gardens are a tough test for robot mowers — large lawns, steep slopes, and a climate that swings between heavy rainy-season mud and bone-dry heat, all of which cause traction problems for normal robot mowers.\nWith all-wheel drive and car-style suspension, LUBA is built for exactly these conditions.",
        "สวนไทยคือบททดสอบที่โหดสำหรับหุ่นยนต์ตัดหญ้า ทั้งสนามขนาดใหญ่ เนินลาดชัน และสภาพอากาศที่สลับระหว่างโคลนหน้าฝนกับความแห้งแล้งจัด ซึ่งล้วนทำให้หุ่นยนต์ทั่วไปยึดเกาะพื้นได้ยาก\nด้วยระบบขับเคลื่อน 4 ล้อและช่วงล่างแบบรถยนต์ LUBA ถูกสร้างมาเพื่อสภาพแบบนี้โดยเฉพาะ"
      ),
    },
    {
      type: "feature",
      heading: L("Climbs hills you wouldn't", "ปีนเนินที่คุณไม่กล้าปีน"),
      body: L(
        "LUBA's AWD system with car-style wheels and suspension lets it climb hills you wouldn't want to attempt on a ride-on or even a push mower — up to 80% (38°) slope.",
        "ระบบ AWD พร้อมล้อและช่วงล่างสไตล์รถยนต์ ทำให้ LUBA ปีนเนินที่คุณไม่อยากลองแม้กับรถตัดหญ้านั่งขับหรือรถเข็น — ลาดชันได้ถึง 80% (38°)"
      ),
    },
    {
      type: "feature",
      heading: L("Dual-cutting deck", "ชุดใบตัดคู่"),
      body: L(
        "Mammotion's unique dual-cutting deck offers double the cutting power, for better performance in long, tough grass.",
        "ชุดใบตัดคู่เอกลักษณ์ของ Mammotion ให้พลังตัดเป็นสองเท่า เพื่อประสิทธิภาพที่ดีกว่าในหญ้ายาวและเหนียว"
      ),
    },
    {
      type: "feature",
      heading: L("Smart set-up", "ติดตั้งง่าย อัจฉริยะ"),
      body: L(
        "Wire-free and easy, even on complex properties. Simply connect the mower to your phone via Bluetooth, then drive it around the lawn. Easy to update in future, and it can drive across concrete paths.",
        "ไร้สายและง่าย แม้ในพื้นที่ซับซ้อน เพียงเชื่อมต่อหุ่นยนต์กับมือถือผ่านบลูทูธ แล้วขับวนรอบสนาม แก้ไขขอบเขตภายหลังได้ง่าย และวิ่งข้ามทางเดินคอนกรีตได้"
      ),
    },
  ],
  specGroups: [
    {
      title: L("Basic Info", "ข้อมูลพื้นฐาน"),
      rows: [
        { label: L("Max Lawn Mapping Area", "พื้นที่แมปสนามสูงสุด"), value: L("3,000 m²", "3,000 ตร.ม.") },
        { label: L("Positioning & Navigation System", "ระบบระบุตำแหน่งและนำทาง"), value: L("360° LiDAR + NetRTK + Dual-Camera AI Vision", "360° LiDAR + NetRTK + กล้องคู่ AI Vision") },
        { label: L("AI Processing Power", "พลังประมวลผล AI"), value: L("Upgraded AI Chips (10 TOPS)", "ชิป AI รุ่นอัปเกรด (10 TOPS)") },
        { label: L("Maximum LiDAR Range", "ระยะ LiDAR สูงสุด"), value: L("70 m", "70 ม.") },
        { label: L("Max. Multi-zone Management", "จัดการโซนสูงสุด"), value: L("50", "50") },
        { label: L("Max. Climbing Ability", "ความสามารถปีนเนินสูงสุด"), value: L("80% (38°)", "80% (38°)") },
        { label: L("Engine (Drive)", "ระบบขับเคลื่อน"), value: L("AWD", "ขับเคลื่อน 4 ล้อ (AWD)") },
        { label: L("Vertical Passing Ability", "ข้ามสิ่งกีดขวางแนวตั้ง"), value: L("50 mm", "50 มม.") },
        { label: L("Dimensions (L×W×H)", "ขนาด (ยาว×กว้าง×สูง)"), value: L("690 × 533 × 279 mm", "690 × 533 × 279 มม.") },
        { label: L("Net Weight", "น้ำหนักสุทธิ"), value: L("19.35 kg", "19.35 กก.") },
      ],
    },
    {
      title: L("Cutting System", "ระบบตัด"),
      rows: [
        { label: L("Cutting Width", "หน้ากว้างตัด"), value: L("400 mm", "400 มม.") },
        { label: L("Cutting Height", "ความสูงตัด"), value: L("25–70 mm", "25–70 มม.") },
        { label: L("Cutting Disc(s)", "จานใบตัด"), value: L("2", "2") },
        { label: L("Cutting System", "ระบบใบตัด"), value: L("Improved discs with 6 pivoting razor blades each", "จานตัดรุ่นปรับปรุง ใบมีดหมุนอิสระ 6 ใบต่อจาน") },
        { label: L("Cutting Disc Motor Power", "กำลังมอเตอร์จานตัด"), value: L("165 W", "165 วัตต์") },
      ],
    },
    {
      title: L("Battery & Efficiency", "แบตเตอรี่และประสิทธิภาพ"),
      rows: [
        { label: L("Battery Capacity", "ความจุแบตเตอรี่"), value: L("15.0 Ah", "15.0 แอมป์-ชั่วโมง") },
        { label: L("Battery Type", "ชนิดแบตเตอรี่"), value: L("Lithium-Ion", "ลิเธียมไอออน") },
        { label: L("Battery Management", "การจัดการแบตเตอรี่"), value: L("Smart recharging", "ชาร์จอัจฉริยะ") },
        { label: L("Approx. Charging Time (15–100%)", "เวลาชาร์จโดยประมาณ (15–100%)"), value: L("130 min", "130 นาที") },
        { label: L("Approx. Mowing Time per Charge", "เวลาตัดต่อการชาร์จโดยประมาณ"), value: L("215 min", "215 นาที") },
        { label: L("Efficiency", "อัตราการตัด"), value: L("500 m²/h", "500 ตร.ม./ชม.") },
      ],
    },
    {
      title: L("Others", "อื่นๆ"),
      rows: [
        { label: L("Connectivity", "การเชื่อมต่อ"), value: L("Bluetooth, Wi-Fi & 4G (optional)", "บลูทูธ, Wi-Fi และ 4G (อุปกรณ์เสริม)") },
        { label: L("Waterproof Rating", "มาตรฐานกันน้ำ"), value: L("IPX6", "IPX6") },
        { label: L("Warranty", "การรับประกัน"), value: L("3 years", "3 ปี") },
      ],
    },
    {
      title: L("RAAS PAL Specialist Review", "รีวิวจากผู้เชี่ยวชาญ RAAS PAL"),
      rows: [
        { label: L("Best for", "เหมาะที่สุดสำหรับ"), value: L("Large family gardens with slopes, obstacles, or complex layouts.", "สวนครอบครัวขนาดใหญ่ที่มีเนิน สิ่งกีดขวาง หรือผังสนามซับซ้อน") },
      ],
    },
  ],
};

const { data, error } = await supabase
  .from("products")
  .update({ page })
  .eq("id", "luba-3-awd-3000")
  .select("id");

if (error) { console.log("FAIL:", error.message); process.exit(1); }
console.log("PASS  seeded page for:", data.map((r) => r.id).join(", "));
console.log(`  blocks: ${page.blocks.length}, specGroups: ${page.specGroups.length}, rows: ${page.specGroups.reduce((n, g) => n + g.rows.length, 0)}`);
