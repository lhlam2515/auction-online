import { Link } from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extension-placeholder";
import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Undo,
  Redo,
  Heading2,
  Heading3,
  Heading1,
  Underline,
  LinkIcon,
} from "lucide-react";
import { forwardRef, useImperativeHandle } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  content?: string;
  placeholder?: string;
  onChange?: (content: string) => void;
  className?: string;
  disabled?: boolean;
}

export interface RichTextEditorRef {
  getContent: () => string;
  setContent: (content: string) => void;
  focus: () => void;
}

const ToolbarButton = ({
  onClick,
  isActive = false,
  disabled = false,
  children,
  title,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
}) => (
  <Button
    type="button"
    variant="ghost"
    size="sm"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={cn(
      "h-8 w-8 p-0",
      isActive && "bg-muted-foreground text-accent-foreground"
    )}
  >
    {children}
  </Button>
);

export const RichTextEditor = forwardRef<
  RichTextEditorRef,
  RichTextEditorProps
>(
  (
    { content = "", placeholder, onChange, className, disabled = false },
    ref
  ) => {
    const editor = useEditor({
      extensions: [
        Link.configure({
          openOnClick: false, // Completely disable default navigation behavior
          HTMLAttributes: {
            class: "text-blue-500 underline hover:text-blue-700",
          },
        }),
        StarterKit,
        Placeholder.configure({
          placeholder: placeholder || "Nhập nội dung...",
        }),
      ],
      content,
      editorProps: {
        attributes: {
          class: cn(
            "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[120px] max-w-none",
            "prose-headings:font-semibold prose-p:my-2 prose-ul:my-2 prose-ol:my-2",
            "prose-li:my-0",
            disabled && "opacity-50 cursor-not-allowed"
          ),
        },
      },
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        onChange?.(html);
      },
      editable: !disabled,
    });

    useImperativeHandle(ref, () => ({
      getContent: () => editor?.getHTML() || "",
      setContent: (content: string) => {
        editor?.commands.setContent(content);
      },
      focus: () => {
        editor?.commands.focus();
      },
    }));

    if (!editor) {
      return null;
    }

    return (
      <div
        className={cn(
          "border-input bg-background ring-offset-background rounded-md border text-sm",
          "focus-within:border-ring focus-within:ring-ring/50 transition-all focus-within:ring-[3px]",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        {/* Toolbar */}
        <div className="border-border flex flex-wrap items-center gap-1 border-b p-2">
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            isActive={editor.isActive("heading", { level: 1 })}
            disabled={disabled}
            title="Tiêu đề lớn (H1)"
          >
            <Heading1 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            isActive={editor.isActive("heading", { level: 2 })}
            disabled={disabled}
            title="Tiêu đề vừa (H2)"
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            isActive={editor.isActive("heading", { level: 3 })}
            disabled={disabled}
            title="Tiêu đề nhỏ (H3)"
          >
            <Heading3 className="h-4 w-4" />
          </ToolbarButton>

          <div className="bg-border mx-1 h-6 w-px" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            disabled={disabled}
            title="Đậm (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            disabled={disabled}
            title="Nghiêng (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive("underline")}
            disabled={disabled}
            title="Gạch chân (Ctrl+U)"
          >
            <Underline className="h-4 w-4" />
          </ToolbarButton>

          <div className="bg-border mx-1 h-6 w-px" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            disabled={disabled}
            title="Danh sách dấu đầu dòng"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            disabled={disabled}
            title="Danh sách đánh số"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>

          <div className="bg-border mx-1 h-6 w-px" />

          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run() || disabled}
            title="Hoàn tác (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run() || disabled}
            title="Làm lại (Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
          </ToolbarButton>

          <div className="bg-border mx-1 h-6 w-px" />

          <ToolbarButton
            onClick={() => {
              if (editor.isActive("link")) {
                editor.chain().focus().unsetLink().run();
              } else {
                const url = prompt("Nhập URL");
                if (url) {
                  editor.chain().focus().setLink({ href: url }).run();
                }
              }
            }}
            isActive={editor.isActive("link")}
            disabled={disabled}
            title={editor.isActive("link") ? "Hủy liên kết" : "Gắn liên kết"}
          >
            <LinkIcon className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Editor Content */}
        <div className="p-3">
          <EditorContent editor={editor} />
        </div>
      </div>
    );
  }
);

RichTextEditor.displayName = "RichTextEditor";
