// @ts-nocheck: This file is used to render Contentful rich text documents in a React component.
import {
  documentToReactComponents,
  Options,
} from "@contentful/rich-text-react-renderer";
import {
  BLOCKS,
  INLINES,
  MARKS,
  Document,
  Block,
  Inline,
} from "@contentful/rich-text-types";
import Image from "next/image";

interface ContentfulRichTextProps {
  richTextDocument: Document;
}

const ContentfulRichText: React.FC<ContentfulRichTextProps> = ({
  richTextDocument,
}) => {
  if (!richTextDocument || !richTextDocument.content) {
    return null;
  }

  const options: Options = {
    renderMark: {
      [MARKS.BOLD]: (text: string) => (
        <strong className="font-bold">{text}</strong>
      ),
      [MARKS.ITALIC]: (text: string) => <em className="italic">{text}</em>,
      [MARKS.UNDERLINE]: (text: string) => <u className="underline">{text}</u>,
    },
    renderNode: {
      [BLOCKS.PARAGRAPH]: (_: Block, children: React.ReactNode) => (
        <p className="mt-2 text-2xl">{children}</p>
      ),
      [BLOCKS.HEADING_1]: (_: Block, children: React.ReactNode) => (
        <h1 className="text-5xl font-bold text-green-700 tracking-wide mt-6">
          {children}
        </h1>
      ),
      [BLOCKS.HEADING_2]: (_: Block, children: React.ReactNode) => (
        <h2 className="text-4xl font-bold text-green-700 tracking-wide mt-5">
          {children}
        </h2>
      ),
      [BLOCKS.HEADING_3]: (_: Block, children: React.ReactNode) => (
        <h3 className="text-3xl font-bold text-green-700 tracking-wide mt-4">
          {children}
        </h3>
      ),
      [BLOCKS.HEADING_4]: (_: Block, children: React.ReactNode) => (
        <h4 className="text-2xl font-bold text-green-700 tracking-wide mt-3">
          {children}
        </h4>
      ),
      [BLOCKS.HEADING_5]: (_: Block, children: React.ReactNode) => (
        <h5 className="text-xl font-bold text-green-700 tracking-wide mt-2">
          {children}
        </h5>
      ),
      [BLOCKS.HEADING_6]: (_: Block, children: React.ReactNode) => (
        <h6 className="text-lg font-bold text-green-700 tracking-wide mt-1">
          {children}
        </h6>
      ),
      [BLOCKS.UL_LIST]: (_: Block, children: React.ReactNode) => (
        <ul className="list-disc ml-6 mt-2">{children}</ul>
      ),
      [BLOCKS.OL_LIST]: (_: Block, children: React.ReactNode) => (
        <ol className="list-decimal ml-6 mt-2">{children}</ol>
      ),
      [BLOCKS.LIST_ITEM]: (_: Block, children: React.ReactNode) => (
        <li className="mb-1">{children}</li>
      ),
      [BLOCKS.QUOTE]: (_: Block, children: React.ReactNode) => (
        <blockquote className="border-l-4 border-gray-300 pl-4 italic mt-2">
          {children}
        </blockquote>
      ),
      [BLOCKS.HR]: () => <hr className="my-4 border-t border-gray-300" />,
      [INLINES.HYPERLINK]: (node: Inline, children: React.ReactNode) => (
        <a
          href={node.data.uri}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          {children}
        </a>
      ),
      [INLINES.ENTRY_HYPERLINK]: (node: Inline, children: React.ReactNode) => (
        <a
          href={`/your-dynamic-link/${node.data.target.sys.id}`}
          className="text-blue-600 underline"
        >
          {children}
        </a>
      ),
      [INLINES.ASSET_HYPERLINK]: (node: Inline, children: React.ReactNode) => (
        <a
          href={node.data.target.fields.file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          {children}
        </a>
      ),
      [BLOCKS.EMBEDDED_ASSET]: (node: Block) => {
        const { title, url, height, width } = node.data.target.fields.file;
        return (
          <div className="mt-4">
            <Image
              src={`https:${url}`}
              alt={title || "Embedded Asset"}
              width={width || 600}
              height={height || 400}
              className="rounded-lg"
            />
            {title && <p className="text-sm text-gray-500 mt-1">{title}</p>}
          </div>
        );
      },
      [BLOCKS.EMBEDDED_ENTRY]: () => {
        return (
          <p className="text-sm text-gray-500 italic">
            Embedded content not rendered.
          </p>
        );
      },
    },
  };

  return <>{documentToReactComponents(richTextDocument, options)}</>;
};

export default ContentfulRichText;
