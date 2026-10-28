import { useEffect } from "react"

const DEFAULT_TITLE = "PlantID - AI-Powered Plant Identification & Care"

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | PlantID` : DEFAULT_TITLE
  }, [title])
}
