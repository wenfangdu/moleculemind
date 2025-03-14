import { Button, Spin, message } from "antd";
import { ChangeEvent, useContext, useRef, useState } from "react";
import styles from './index.less'
import { workflowPipe } from "@/molstar/data-resolver";
import { MolstarContext } from "@/molstar/context";
import { TMolstarPlugin } from "@/molstar/interface/utils";

type Props = {
  handleClose: () => void
}

export function getInitOptions({
  handleTaskStateChange,
  plugin,
  otherOptions,
}: {
  handleTaskStateChange: (v:any, d:any) => void,
  plugin: TMolstarPlugin | undefined
  otherOptions?: any
}) {
  const options = {
    handleStateChange: (state:any) => handleTaskStateChange(options, state),
    plugin,
    ...(otherOptions || {})
  }
  return options;
}

export default function EntryAddModal ({
  handleClose
}:Props) {
  const [tasks, setTasks] = useState<any>([]);
  const [loading, setLoading] = useState(false)

  const tasksLatest = useRef(tasks)
  const uploadEleRef = useRef<HTMLLabelElement>(null)

  const {
    molstarPlugin,
  } = useContext(MolstarContext)!;

  function handleTaskStateChange(options: any, state: any) {
    let index = options.index
    if (index === undefined) {
      index = options.index = tasksLatest.current.length
    }
    const task = tasksLatest.current[index] || {id: index, state: {}}
    task.state = {
      ...task.state,
      ...state
    };
    tasksLatest.current[index] = {...task}
    setTasks([...tasksLatest.current])
  }


  async function handleUploadFile(e:ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) {
      return 
    }
    const files = [...e.target.files];
    if (files.length === 0) {
      return
    }
    await workflowPipe(
      files, 
      'handleFilesDrop', 
      getInitOptions({handleTaskStateChange, plugin: molstarPlugin})
    )
    message.success('加载成功')
    handleClose()
  }

  const handleDragEnter = () => { }
  const handleDragLeave = () => { }

  const handleDragOver = (e: any) => {
    e.preventDefault()
    e.stopPropagation();
  }

  const handleDrop = async (e: any) => {
    e.preventDefault()
    e.stopPropagation();
    const files = [...e.dataTransfer.files];
    if (files.length === 0) {
      return
    }
    const result = await workflowPipe(
      files, 
      'handleFilesDrop', 
      getInitOptions({handleTaskStateChange, plugin: molstarPlugin})
    )
    message.success('加载成功')
    handleClose()

    // const formData = new FormData();
    // formData.append("file", files[0]);
    // const result2 = await fetchUploadFile(formData);
  }

  return <div className={styles.root}>
      {loading && <Spin size="large" className={styles.loading} />}
      <div className={styles.dragFile}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p>点击
          <Button onClick={() => uploadEleRef.current?.click?.()}>
            <label htmlFor="file" className="sr-only" ref={uploadEleRef} onClick={e => {e.stopPropagation()}}>
              加载本地PDB文件
            </label>
          </Button>
          <input id="file" type="file" onChange={handleUploadFile} className={styles.fileInput} multiple accept=".pdb,.json,.molj" />
        </p>
        <p>或拖拽PDB文件至此区域</p>
      </div>
    </div>
}