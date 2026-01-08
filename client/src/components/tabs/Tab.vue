<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
    name: "Tab",
    props: ["title", "titleSlot", "disabled"],
});
</script>
<template>
    <div class="tab-panel" role="tabPanel">
        <div class="tab-content">
            <slot></slot>
        </div>
    </div>
</template>
<style>
.tab-panel {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.tab-panel .tab-content {
  padding: 0.5rem;
  flex: 1;
  min-height: 0;
  overflow: hidden; /* default: NO SCROLL */
}

/* 🔥 ONLY scroll when explicitly allowed */
.tab-panel .tab-content.scrollable {
  overflow-y: auto;
}

</style>