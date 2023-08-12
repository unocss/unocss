export type AnnotationEventParams = {
  uri: string
  underline: boolean
  annotations: [number, number, string][]
} | {
  uri: null
  reason?: string
}
