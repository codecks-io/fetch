export const ensureMapValue = <K, V>(map: Map<K, V>, key: K, fallback: () => V): V => {
  const exist = map.get(key);
  if (exist) return exist;
  const newValue = fallback();
  map.set(key, newValue);
  return newValue;
};
