import { TLocation } from "@/interface"
import { useCallback } from "react"

export default function useSetDistance({
  molstarPlugin
}: {
  molstarPlugin: any
}) {
  const setDistance = useCallback((a: TLocation, b: TLocation) => {

  }, [molstarPlugin])

  return {
    setDistance
  }
}