import Header from '@/components/Header'
import TabBar from '@/components/TabBar'
import Editor from '@/components/Editor'
import Output from '@/components/Output'
import FileDrawer from '@/components/FileDrawer'
import MobileKeys from '@/components/MobileKeys'

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
  )
}
