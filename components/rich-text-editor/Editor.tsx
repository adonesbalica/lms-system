"use client";

import TextAlign from "@tiptap/extension-text-align";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Menubar } from "./Menubar";

export function RichTextEditor({ field }: { field: any }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-[300px] p-4 focus:outline-none prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert w-full! max-w-none!",
      },
    },
    onUpdate: ({ editor }) => {
      field.onChange(JSON.stringify(editor.getJSON()));
    },
    content: (() => {
      if (!field.value) return "<p>Hello World🚀</p>";
      try {
        return JSON.parse(field.value);
      } catch {
        return `<p>${field.value}</p>`;
      }
    })(),
  });

  return (
    <div className="w-full border border-input rounded-lg overflow-hidden dark:bg-input/60">
      <Menubar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
