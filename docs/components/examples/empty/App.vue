<script setup>
import { Panel, VueFlow, useVueFlow } from '@vue-flow/core'
import { Background, BackgroundVariant } from '@vue-flow/background'
import { MiniMap } from '@vue-flow/minimap'

const { nodes, addNodes, addEdges, onConnect, dimensions } = useVueFlow()

onConnect((params) => addEdges(params))

function addRandomNode() {
  const nodeId = (nodes.value.length + 1).toString()

  const newNode = {
    id: nodeId,
    label: `Node: ${nodeId}`,
    position: { x: Math.random() * dimensions.value.width, y: Math.random() * dimensions.value.height },
  }

  addNodes([newNode])
}
</script>

<template>
  <VueFlow>
    <MiniMap />

    <Background :variant="BackgroundVariant.Lines" />

    <Panel position="top-right">
      <button type="button" @click="addRandomNode">add node</button>
    </Panel>
  </VueFlow>
</template>
