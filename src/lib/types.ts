/**
 * Types for the C2PA Conformance Tool.
 * Extends and composes types from @contentauth/c2pa-web.
 */

import type {
  ManifestStore,
  ValidationStatus,
  Manifest,
  Ingredient,
} from '@contentauth/c2pa-web'

export type { ManifestStore, ValidationStatus, Manifest, Ingredient }

/** Report returned by processFile: manifest store plus conformance-tool metadata */
export interface ConformanceReport extends ManifestStore {
  usedITL?: boolean
  usedTestCerts?: boolean
  _conformanceToolVersion?: {
    commit: string
    shortCommit: string
    date: string
    branch: string
    generatedAt: string
  }
}

/** One validation status row in the report UI */
export interface ValidationStatusItem {
  code: string
  success: boolean
  isInterim?: boolean
  explanation?: string
}

/** Assertion summary row for display */
export interface AssertionSummaryItem {
  key: string
  value: unknown
  digitalSourceType?: string
  isAction?: boolean
  actionName?: string
  description?: string
}
