export const error = (status: number, code: string) => ({
  statusCode: status,
  body: JSON.stringify({ code }),
});
