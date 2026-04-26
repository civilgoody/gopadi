import Header from "@/components/header";
import TabBar from "@/components/tab-bar";
import Editor from "@/components/editor";
import Output from "@/components/output";
import FileDrawer from "@/components/file-drawer";
import MobileKeys from "@/components/mobile-keys";

export default function App() {
  return (
    <div className="flex flex-col h-dvh overflow-hidden bg-[#0a0e14]">
      <Header />
      <TabBar />
      <FileDrawer />
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <Editor />
        <Output />
      </div>
      <MobileKeys />
    </div>
  );
}
