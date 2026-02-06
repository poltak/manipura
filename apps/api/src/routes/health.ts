export function handleHealth() {
  return {
    status: 200,
    body: {
      ok: true,
      service: "manipura-api"
    }
  };
}
