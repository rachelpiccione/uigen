"use client";

import { useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { FileSystemProvider } from "@/lib/contexts/file-system-context";
import { ChatProvider } from "@/lib/contexts/chat-context";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { FileTree } from "@/components/editor/FileTree";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { PreviewFrame } from "@/components/preview/PreviewFrame";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeaderActions } from "@/components/HeaderActions";

interface MainContentProps {
  user?: {
    id: string;
    email: string;
  } | null;
  project?: {
    id: string;
    name: string;
    messages: any[];
    data: any;
    createdAt: Date;
    updatedAt: Date;
  };
}

export function MainContent({ user, project }: MainContentProps) {
  const [activeView, setActiveView] = useState<"preview" | "code">("preview");

  return (
    <FileSystemProvider initialData={project?.data}>
      <ChatProvider projectId={project?.id} initialMessages={project?.messages}>
        <div className="h-screen w-screen overflow-hidden" style={{ background: `
          radial-gradient(circle 8px at 12% 18%, #4A2C11 48%, transparent 50%),
          radial-gradient(circle 10px at 42% 10%, #5C3A1E 48%, transparent 50%),
          radial-gradient(circle 7px at 68% 25%, #3E2210 48%, transparent 50%),
          radial-gradient(circle 9px at 88% 14%, #4A2C11 48%, transparent 50%),
          radial-gradient(circle 11px at 22% 48%, #5C3A1E 48%, transparent 50%),
          radial-gradient(circle 8px at 52% 42%, #3E2210 48%, transparent 50%),
          radial-gradient(circle 10px at 78% 55%, #4A2C11 48%, transparent 50%),
          radial-gradient(circle 7px at 8% 72%, #5C3A1E 48%, transparent 50%),
          radial-gradient(circle 9px at 33% 80%, #3E2210 48%, transparent 50%),
          radial-gradient(circle 11px at 58% 70%, #4A2C11 48%, transparent 50%),
          radial-gradient(circle 8px at 92% 78%, #5C3A1E 48%, transparent 50%),
          radial-gradient(circle 10px at 48% 92%, #3E2210 48%, transparent 50%),
          radial-gradient(circle 6px at 5% 45%, #4A2C11 48%, transparent 50%),
          radial-gradient(circle 9px at 95% 40%, #5C3A1E 48%, transparent 50%),
          radial-gradient(circle 7px at 30% 30%, #3E2210 48%, transparent 50%),
          radial-gradient(circle 8px at 75% 88%, #4A2C11 48%, transparent 50%),
          linear-gradient(160deg, #EDCF8E, #DEBA6E, #D4A650, #C99545)
        `}}>
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Left Panel - Chat */}
            <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
              <div className="h-full flex flex-col bg-white/60 backdrop-blur-sm">
                {/* Chat Header */}
                <div className="h-14 flex items-center px-6 border-b border-neutral-200/60">
                  <h1 className="text-lg font-semibold text-neutral-900 tracking-tight">React Component Generator</h1>
                </div>

                {/* Chat Content */}
                <div className="flex-1 overflow-hidden">
                  <ChatInterface />
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle className="w-[1px] bg-neutral-200 hover:bg-neutral-300 transition-colors" />

            {/* Right Panel - Preview/Code */}
            <ResizablePanel defaultSize={65}>
              <div className="h-full flex flex-col bg-white/60 backdrop-blur-sm">
                {/* Top Bar */}
                <div className="h-14 border-b border-neutral-200/60 px-6 flex items-center justify-between bg-amber-50/50">
                  <Tabs
                    value={activeView}
                    onValueChange={(v) =>
                      setActiveView(v as "preview" | "code")
                    }
                  >
                    <TabsList className="bg-white/60 border border-neutral-200/60 p-0.5 h-9 shadow-sm">
                      <TabsTrigger value="preview" className="data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm text-neutral-600 px-4 py-1.5 text-sm font-medium transition-all">Preview</TabsTrigger>
                      <TabsTrigger value="code" className="data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm text-neutral-600 px-4 py-1.5 text-sm font-medium transition-all">Code</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <HeaderActions user={user} projectId={project?.id} />
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden bg-amber-50/30">
                  {/* Preview - always mounted to preserve iframe state */}
                  <div className={`h-full bg-transparent ${activeView !== "preview" ? "hidden" : ""}`}>
                    <PreviewFrame />
                  </div>

                  {/* Code view */}
                  {activeView === "code" && (
                    <ResizablePanelGroup
                      direction="horizontal"
                      className="h-full"
                    >
                      {/* File Tree */}
                      <ResizablePanel
                        defaultSize={30}
                        minSize={20}
                        maxSize={50}
                      >
                        <div className="h-full bg-neutral-50 border-r border-neutral-200">
                          <FileTree />
                        </div>
                      </ResizablePanel>

                      <ResizableHandle className="w-[1px] bg-neutral-200 hover:bg-neutral-300 transition-colors" />

                      {/* Code Editor */}
                      <ResizablePanel defaultSize={70}>
                        <div className="h-full bg-white">
                          <CodeEditor />
                        </div>
                      </ResizablePanel>
                    </ResizablePanelGroup>
                  )}
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </ChatProvider>
    </FileSystemProvider>
  );
}
