import { seedDemoData } from "../../actions/authActions";

export async function GET() {
  try {
    const result = await seedDemoData();
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Seeding error:", error);
    return new Response(JSON.stringify({ success: false, error: "Seeding failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
