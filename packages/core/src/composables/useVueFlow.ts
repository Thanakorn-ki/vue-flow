import { tryOnScopeDispose } from '@vueuse/core'
import type { EffectScope } from 'vue'
import { getCurrentScope, inject, provide } from 'vue'
import type { FlowProps, VueFlowStore } from '~/types'
import { createVueFlow, warn } from '~/utils'
import { VueFlow } from '~/context'

type Injection = VueFlowStore | null | undefined
type Scope = (EffectScope & { vueFlowId: string }) | undefined

// todo: maybe replace the storage with a context based solution; This would break calling useVueFlow outside a setup function though, which should be fine
export function useVueFlow(options?: FlowProps) {
  const storage = createVueFlow()

  const scope = getCurrentScope() as Scope

  const id = options?.id
  const vueFlowId = scope?.vueFlowId || id

  let vueFlow: Injection

  let isParentScope = false

  /**
   * check if we can get a store instance through injections
   * this should be the regular way after initialization
   */
  if (scope) {
    const injection = inject(VueFlow, null)
    if (typeof injection !== 'undefined' && injection !== null) {
      vueFlow = injection
    }
  }

  /**
   * check if we can get a store instance through storage
   * this requires options id or an id on the current scope
   */
  if (!vueFlow) {
    if (vueFlowId) {
      vueFlow = storage.get(vueFlowId)
    }
  }

  /**
   * If we cannot find any store instance in the previous steps
   * _or_ if the store instance we found does not match up with provided ids
   * create a new store instance and register it in storage
   */
  if (!vueFlow || (vueFlow && id && id !== vueFlow.id)) {
    const name = id ?? storage.getId()

    vueFlow = storage.create(name, options)

    if (scope) {
      isParentScope = true
    }
  } else {
    // if composable was called with additional options after initialization, overwrite state with the options values
    if (options) {
      vueFlow.setState(options)
    }
  }

  // always provide a fresh instance into context on call
  if (scope) {
    provide(VueFlow, vueFlow)

    scope.vueFlowId = vueFlow.id

    if (isParentScope) {
      // dispose of state values and storage entry
      tryOnScopeDispose(() => {
        if (vueFlow) {
          const storedInstance = storage.get(vueFlow.id)

          if (storedInstance) {
            storedInstance.$destroy()
          } else {
            warn(`No store instance found for id ${vueFlow.id} in storage.`)
          }
        }
      })
    }
  }

  return vueFlow
}
