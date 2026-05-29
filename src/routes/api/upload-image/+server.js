// Images are now uploaded directly to Firebase Storage from the browser.
// This endpoint is no longer used.
export async function POST() {
  return new Response(JSON.stringify({ error: 'Use Firebase Storage client upload instead' }), {
    status: 410,
    headers: { 'Content-Type': 'application/json' }
  });
}
