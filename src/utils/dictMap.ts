export function getByValue<T>(dictionary: T[], index: string, value: number | null, def: T | any = {}): T {
  const val = dictionary.filter((obj) => {
    return (obj as { [key: string]: any })[index] === value;
  })[0];

  // Returns val if found, else def;
  return val ?? def;
}