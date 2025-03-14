import { useCallback } from "react"
import { TMolstarPlugin } from "./interface/utils"

export default function useHandleZoom({
  molstarPlugin,
}: {
  molstarPlugin: TMolstarPlugin
}) {

  const zoomIn = useCallback(() => {

  }, [molstarPlugin])
  const zoomOut = useCallback(() => {

  }, [molstarPlugin])

  return {
    zoomIn,
    zoomOut,
  }
}