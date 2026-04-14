import { test, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MainContent } from "@/app/main-content";

// Mock providers - they just pass children through
vi.mock("@/lib/contexts/file-system-context", () => ({
  FileSystemProvider: ({ children }: any) => <>{children}</>,
  useFileSystem: vi.fn(() => ({
    fileSystem: {
      serialize: () => ({}),
      getAllFiles: () => new Map(),
      reset: vi.fn(),
    },
    getAllFiles: () => new Map(),
    refreshTrigger: 0,
    handleToolCall: vi.fn(),
    selectedFile: null,
    setSelectedFile: vi.fn(),
    createFile: vi.fn(),
    updateFile: vi.fn(),
    deleteFile: vi.fn(),
    renameFile: vi.fn(),
    getFileContent: vi.fn(),
    reset: vi.fn(),
  })),
}));

vi.mock("@/lib/contexts/chat-context", () => ({
  ChatProvider: ({ children }: any) => <>{children}</>,
  useChat: vi.fn(() => ({
    messages: [],
    input: "",
    handleInputChange: vi.fn(),
    handleSubmit: vi.fn(),
    status: "idle",
  })),
}));

vi.mock("@/components/chat/ChatInterface", () => ({
  ChatInterface: () => <div data-testid="chat-interface">Chat</div>,
}));

vi.mock("@/components/preview/PreviewFrame", () => ({
  PreviewFrame: () => <div data-testid="preview-frame">Preview Content</div>,
}));

vi.mock("@/components/editor/FileTree", () => ({
  FileTree: () => <div data-testid="file-tree">File Tree</div>,
}));

vi.mock("@/components/editor/CodeEditor", () => ({
  CodeEditor: () => <div data-testid="code-editor">Code Editor</div>,
}));

vi.mock("@/components/HeaderActions", () => ({
  HeaderActions: () => <div data-testid="header-actions">Header Actions</div>,
}));

// Mock resizable panels with simple pass-through divs
vi.mock("@/components/ui/resizable", () => ({
  ResizablePanelGroup: ({ children, className }: any) => (
    <div data-testid="resizable-group" className={className}>
      {children}
    </div>
  ),
  ResizablePanel: ({ children }: any) => (
    <div data-testid="resizable-panel">{children}</div>
  ),
  ResizableHandle: () => <div data-testid="resizable-handle" />,
}));

afterEach(() => {
  cleanup();
});

test("shows preview view by default", () => {
  render(<MainContent />);

  // PreviewFrame is always mounted; in preview mode it should be visible (no "hidden" class)
  const previewFrame = screen.getByTestId("preview-frame");
  expect(previewFrame).toBeDefined();
  expect(previewFrame.closest(".hidden")).toBeNull();

  // Code editor should not be rendered at all in preview mode
  expect(screen.queryByTestId("code-editor")).toBeNull();
  expect(screen.queryByTestId("file-tree")).toBeNull();
});

test("clicking Code tab switches to code view", async () => {
  const user = userEvent.setup();
  render(<MainContent />);

  // Click the Code tab
  const codeTab = screen.getByRole("tab", { name: "Code" });
  await user.click(codeTab);

  // Code editor should now be visible
  expect(screen.getByTestId("code-editor")).toBeDefined();
  expect(screen.getByTestId("file-tree")).toBeDefined();

  // PreviewFrame stays mounted but its wrapper gets the "hidden" class
  const previewFrame = screen.getByTestId("preview-frame");
  expect(previewFrame.closest(".hidden")).not.toBeNull();
});

test("clicking Preview tab switches back to preview view", async () => {
  const user = userEvent.setup();
  render(<MainContent />);

  // Switch to code view first
  const codeTab = screen.getByRole("tab", { name: "Code" });
  await user.click(codeTab);
  expect(screen.getByTestId("code-editor")).toBeDefined();

  // Click the Preview tab
  const previewTab = screen.getByRole("tab", { name: "Preview" });
  await user.click(previewTab);

  // Preview is visible again (no "hidden" class on wrapper)
  const previewFrame = screen.getByTestId("preview-frame");
  expect(previewFrame.closest(".hidden")).toBeNull();

  // Code editor is unmounted
  expect(screen.queryByTestId("code-editor")).toBeNull();
});

test("PreviewFrame stays mounted when switching to code view", async () => {
  const user = userEvent.setup();
  render(<MainContent />);

  // PreviewFrame is visible in preview mode
  expect(screen.getByTestId("preview-frame")).toBeDefined();

  // Switch to code view
  await user.click(screen.getByRole("tab", { name: "Code" }));

  // PreviewFrame remains in the DOM (always mounted for iframe state preservation)
  expect(screen.getByTestId("preview-frame")).toBeDefined();
});

test("toggle can be repeated multiple times", async () => {
  const user = userEvent.setup();
  render(<MainContent />);

  const codeTab = screen.getByRole("tab", { name: "Code" });
  const previewTab = screen.getByRole("tab", { name: "Preview" });

  // Toggle preview -> code
  await user.click(codeTab);
  expect(screen.getByTestId("code-editor")).toBeDefined();

  // Toggle code -> preview
  await user.click(previewTab);
  expect(screen.queryByTestId("code-editor")).toBeNull();
  expect(screen.getByTestId("preview-frame").closest(".hidden")).toBeNull();

  // Toggle preview -> code again
  await user.click(codeTab);
  expect(screen.getByTestId("code-editor")).toBeDefined();

  // Toggle code -> preview again
  await user.click(previewTab);
  expect(screen.queryByTestId("code-editor")).toBeNull();
});

test("Preview tab is active by default", () => {
  render(<MainContent />);

  const previewTab = screen.getByRole("tab", { name: "Preview" });
  const codeTab = screen.getByRole("tab", { name: "Code" });

  expect(previewTab.getAttribute("data-state")).toBe("active");
  expect(codeTab.getAttribute("data-state")).toBe("inactive");
});

test("Code tab becomes active after clicking", async () => {
  const user = userEvent.setup();
  render(<MainContent />);

  const previewTab = screen.getByRole("tab", { name: "Preview" });
  const codeTab = screen.getByRole("tab", { name: "Code" });

  await user.click(codeTab);

  expect(codeTab.getAttribute("data-state")).toBe("active");
  expect(previewTab.getAttribute("data-state")).toBe("inactive");
});
