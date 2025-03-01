export function getColStyleDeclaration(cellMinWidth: number, hasWidth?: number): [string, string] {
  if (hasWidth) {
    return ['width', `${hasWidth}px`];
  }
  return ['min-width', `${cellMinWidth}px`];
} 