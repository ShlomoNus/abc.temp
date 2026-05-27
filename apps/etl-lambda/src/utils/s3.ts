export type BuildS3ObjectKeyParams = {
  name: string
  folderPrefix: string
};

export function buildS3ObjectKey({ name, folderPrefix }: BuildS3ObjectKeyParams): string {
  const prefix = folderPrefix.endsWith("/") ? folderPrefix : `${folderPrefix}/`;

  return `${prefix}${name}.docs`;
}
