import { handleContactPost } from "../lib";

export const runtime = "nodejs";

export async function POST(request) {
  return handleContactPost(request, {
    defaultWorkflow: "Book a Call Popup",
    defaultSource: "Book a Call CTA"
  });
}
