export type TiptapContentOptions = {
  paragraphIndent: number;
  paragraphSpacing: number;
};

export type TiptapRendererOptions = TiptapContentOptions & {
  protectContent: boolean;
};
