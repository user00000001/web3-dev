import React from "react";
import remarkPrism from "remark-prism";
import MdxLayout from "./_components/mdx-layout";
import { serialize } from "next-mdx-remote/serialize";
import mdxText from "../_docs/this-is-md.md";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import "prismjs/plugins/line-numbers/prism-line-numbers.css";

interface Props {
  mdxSource: MDXRemoteSerializeResult;
}

const options = {
  mdxOptions: {
    remarkPlugins: [
      [
        remarkPrism,
        {
          plugins: [
            "autolinker",
            "command-line",
            "data-uri-highlight",
            "diff-highlight",
            "inline-color",
            "keep-markup",
            "line-numbers",
            "show-invisibles",
            "treeview",
          ],
        },
      ],
    ],
  },
};

function ThisIsMD({ mdxSource }: Props) {
  return (
    <MdxLayout>
      <MDXRemote {...mdxSource} />
    </MdxLayout>
  );
}

export default ThisIsMD;

export async function getStaticProps() {
  // @ts-ignore // remark-prism not maintained right now, plugins not availiable.
  const mdxSource = await serialize(mdxText, { ...options });
  return { props: { mdxSource } };
}
