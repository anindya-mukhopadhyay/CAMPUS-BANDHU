export function apiOk<T>(data: T) {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString()
  };
}
