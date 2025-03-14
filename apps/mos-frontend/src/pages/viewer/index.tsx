import { useEffect, useRef, useState } from "react"
import { useOutletContext } from "umi"
import styles from './index.less'
import EntryAddModal from "./components/entry-add-modal"
import EntryList from "./components/entry-list"
import StructureList from "./components/structure-list"
import Workspace3D from "./components/workspace-3d"
import SequenceView from "./components/sequence-view"
import { TEventProvider } from "@helper/event-provider"
import { MolstarContext, useGetMolstarContext } from "@molstar/context"
import { Modal } from "antd"
import { useResizable } from "react-resizable-layout"
import classNames from "classnames"
import SampleSplitter from "@/components/sampleSplitter"

type TContext = {
  eventProvider: TEventProvider
}
type TFunctionType = 'data' | 'function' | 'task'

const ViewPageWidth = window.innerWidth - 56;
const ViewPageHeight = window.innerHeight

const Viewer = () => {
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [entryAddModalOpen, setEntryAddModalOpen] = useState(false)
  const [functionModalOpen, setFunctionModalOpen] = useState(false)
  const [functionType, setFunctionType] = useState('')
  const viewContainerRef = useRef<HTMLDivElement>(null)

  const context: TContext = useOutletContext()
  const molstarContext = useGetMolstarContext(viewContainerRef)

  function catchFunctionTrigger({
    type, subType
  }: {
    type: TFunctionType, subType?: string
  }) {
    if (type === 'data') {
      setEntryAddModalOpen(true)
    }
    if (type === 'function' && !!subType) {
      setFunctionType(subType);
      setFunctionModalOpen(true)
    }
    if (type === 'task') {
      setTaskModalOpen(true)
    }
  }

  useEffect(() => {
    context.eventProvider.on(catchFunctionTrigger)
    return () => {
      context.eventProvider.off(catchFunctionTrigger)
    }
  }, [context])

  function handleDataAdd(data: string) {
    // (molstarPlugin as PluginUIContext).managers.dragAndDrop.handle(Tops);
  }

  const {
    isDragging: isMiddlelDragging,
    position: middleH,
    splitterProps: middlelDragBarProps
  } = useResizable({
    axis: "y",
    initial: ViewPageHeight * 0.4,
    min: 50,
    reverse: true
  });
  const {
    isDragging: isTopDragging,
    position: topW,
    splitterProps: topDragBarProps
  } = useResizable({
    axis: "x",
    initial: ViewPageWidth * 0.7,
    min: 50,
    reverse: true
  });
  const {
    isDragging: isButtomDragging,
    position: buttomW,
    splitterProps: buttomDragBarProps
  } = useResizable({
    axis: "x",
    initial: ViewPageWidth * 0.7,
    min: 50,
    reverse: true
  });

  return <div className={styles.root}>
    <MolstarContext.Provider value={molstarContext}>
      <div style={{ display: 'none' }} ref={viewContainerRef}></div>
      <div className={classNames(styles.flex, styles.resizeableContainer)}>
        <div className={classNames(styles.flex, styles.flexGrow1)}>
          <div className={classNames(styles.flexGrow1)}>
            <EntryList className={classNames(styles.entryList, (isTopDragging || isMiddlelDragging) && styles.dragging)} onHandleAddData={() => catchFunctionTrigger({ type: 'data' })} />
          </div>
          <SampleSplitter isDragging={isTopDragging} {...topDragBarProps} />
          <Workspace3D className={classNames(styles.workspace, styles.flexShrink0, (isTopDragging || isMiddlelDragging) && styles.dragging)} style={{ width: topW }} onHandleAddData={() => catchFunctionTrigger({ type: 'data' })} />
        </div>
        <SampleSplitter dir={"horizontal"} isDragging={isMiddlelDragging} {...middlelDragBarProps} />
        <div className={classNames(styles.flex, styles.flexShrink0, isMiddlelDragging && styles.dragging)} style={{ height: middleH }}>
          <div className={classNames(styles.flexGrow1, isMiddlelDragging && styles.dragging)}>
            <StructureList className={classNames(styles.structureList, (isMiddlelDragging || isButtomDragging) && styles.dragging)} />
          </div>
          <SampleSplitter isDragging={isButtomDragging} {...buttomDragBarProps} />
          <SequenceView className={classNames(styles.flexShrink0, (isMiddlelDragging || isButtomDragging) && styles.dragging, styles.sequenceView)} style={{ width: buttomW }} />
        </div>
      </div>
      <Modal
        open={entryAddModalOpen}
        className={styles.entryAllModal}
        footer={null}
        maskClosable={false}
        onCancel={() => setEntryAddModalOpen(false)}
        destroyOnClose>
        <EntryAddModal handleClose={() => setEntryAddModalOpen(false)} />
      </Modal>
    </MolstarContext.Provider>
  </div>
}

export default Viewer