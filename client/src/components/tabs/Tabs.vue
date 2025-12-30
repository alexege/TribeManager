<script>
import {
    defineComponent,
    onMounted,
    onBeforeUnmount,
    ref,
    watch,
    toRefs,
    h,
    computed,
    onBeforeUpdate,
} from "vue";
export default defineComponent({
    name: "Tabs",
    props: {
        defaultIndex: {
            default: 0,
            type: Number,
        },
        resetTabs: {
            type: Boolean,
            default: false,
        },
        direction: {
            type: String,
            default: "horizontal",
            validator(value) {
                return ["horizontal", "vertical"].includes(value);
            },
        },
        position: {
            type: String,
            default: "left",
            validator(value) {
                return ["left", "start", "end", "center"].includes(value);
            },
        },
        reverse: {
            type: Boolean,
            required: false,
            default: false,
        },
        activeTabIndex: {
            type: Number,
            required: false,
            default: 0
        }
    },
    emits: {
        tabChanged(index) {
            return index !== undefined || index !== null;
        },
    },
    setup(props, { emit, slots }) {
        watch(
            () => props.activeTabIndex,
            (newValue, oldValue) => {
                console.log(`prop changed: ${oldValue} to ${newValue}`)
                selectedIndex.value = newValue
            }
        )
        const { defaultIndex, resetTabs, position, direction, reverse } = toRefs(props);
        const selectedIndex = ref(0);
        const tabs = ref([]);
        const _tabItems = ref([]);
        const onTabKeyDown = (e) => {
            if (e.ctrlKey || e.metaKey) {
                const index = parseInt(e.key) - 1;
                if (index in tabs.value) {
                    e.preventDefault();
                    switchTab(e, index, tabs.value[index]);
                }
            }
        };
        const reset = () => {
            selectedIndex.value = 0;
        };
        const switchTab = (_, index, isDisabled) => {
            if (!isDisabled) {
                selectedIndex.value = index;
                emit("tabChanged", index);
            }
        };
        onMounted(() => {
            getTabItems();
            document.addEventListener("keydown", onTabKeyDown);
        });
        onBeforeUnmount(() => {
            document.removeEventListener("keydown", onTabKeyDown);
        });
        watch(defaultIndex, (newValue) => {
            if (newValue !== selectedIndex.value) {
                selectedIndex.value = newValue;
            }
        });
        watch(resetTabs, (newValue) => {
            if (newValue === true) reset();
        });
        onBeforeUpdate(() => {
            getTabItems();
        });
        const getTabItems = () => {
            _tabItems.value.splice(0, _tabItems.value.length);
            slots.default().forEach((component) => {
                if (component.type.name === "Tab") {
                    _tabItems.value.push(component);
                } else {
                    component.children.forEach((cComp) => {
                        if (cComp.type.name === "Tab") {
                            _tabItems.value.push(cComp);
                        }
                    });
                }
            });
        };
        const getTitleSlotContent = (titleSlot) => {
            let slotContent = null;
            let shouldSkip = false;
            slots.default().forEach((item) => {
                if (shouldSkip) return;
                if (item.type === "template" && item.props.name === titleSlot) {
                    slotContent = item.children;
                    shouldSkip = true;
                } else if (item.children.length) {
                    item.children.forEach((cItem) => {
                        if (shouldSkip) return;
                        if (cItem.props.name === titleSlot) {
                            slotContent = cItem.children;
                            shouldSkip = true;
                        }
                    });
                }
            });
            return slotContent === null ? [] : slotContent;
        };
        const tabToDisplay = computed(() => {
            return _tabItems.value.map((item, idx) => {
                return h("div", {
                    class: "tab",
                    style: `display: ${selectedIndex.value == idx ? "block" : "none"}`,
                }, item);
            });
        });
        return () => {
            const tabList = [];
            _tabItems.value.forEach((tab, index) => {
                const _tabProps = tab.props || {};
                const titleContent = _tabProps["title-slot"]
                    ? getTitleSlotContent(_tabProps["title-slot"])
                    : _tabProps.title;
                const isDisabled = _tabProps.disabled === true || _tabProps.disabled === "";
                tabs.value[index] = isDisabled;
                tabList.push(
                    h("li", {
                        class: "tab-list__item",
                        tabIndex: "0",
                        role: "tabItem",
                        "aria-selected": selectedIndex.value === index ? "true" : "false",
                        "aria-disabled": isDisabled ? "true" : "false",
                        onClick: (e) => {
                            switchTab(e, index, isDisabled);
                        },
                    }, titleContent)
                );
            });
            return h(
                "div",
                {
                    class: `tabs ${direction.value} ${reverse.value ? "reverse" : ""}`,
                    role: "tabs",
                },
                [
                    h("ul", { class: `tab-list ${position.value}`, role: "tabList" }, tabList),
                    ...tabToDisplay.value,
                ]
            );
        };
    },
});
</script>
<style>
:root {
    --primary-color: #4313aa;
    --border-color: #e2e2e2;
    --disabled-text-color: #999;
}

.tabs {
    /* display: grid; */
    /* grid-template-columns: 1fr; */
    /* display: flex; */
    /* min-width: 30%; */
    width: 30%;
}

.tabs .tab-list {
    list-style: none;
    display: flex;
    padding-left: 0;
    border-bottom: 1px solid var(--border-color);
}

.tabs .tab-list.center {
    justify-content: center;
}

.tabs .tab-list.end {
    justify-content: flex-end;
}

.tabs .tab-list__item {
    padding: 8px 10px;
    cursor: pointer;
    user-select: none;
    transition: border 0.3s ease-in-out;
    position: relative;
    bottom: -1px;
    text-transform: uppercase;
    font-size: 0.85rem;
    letter-spacing: 0.05rem;
}

.tabs .tab-list__item:not(:first-child) {
    margin-left: 10px;
}

.tabs .tab-list__item[aria-selected="true"] {
    border-bottom: 2px solid var(--primary-color);
    font-weight: 700;
    color: var(--primary-color);
}

.tabs .tab-list__item[aria-disabled="true"] {
    cursor: not-allowed;
    color: var(--disabled-text-color);
}

.tabs.horizontal.reverse .tab-list {
    grid-row: 2;
    border: none;
    border-top: 1px solid var(--border-color);
}

.tabs.vertical {
    grid-template-columns: auto 1fr;
    gap: 1rem;
}

.tabs.vertical .tab-list {
    flex-direction: column;
    border-bottom: none;
    border-right: 1px solid var(--border-color);
}

.tabs.vertical .tab-list__item {
    margin-left: 0;
    border-radius: 0;
}

.tabs.vertical .tab-list__item[aria-selected="true"] {
    border: none;
    border-left: 2px solid var(--primary-color);
}

.tabs.vertical.reverse {
    grid-template-columns: 1fr auto;
}

.tabs.vertical.reverse .tab-list {
    grid-column: 2;
    border: none;
    border-left: 1px solid var(--border-color);
}

.tabs.vertical.reverse .tab {
    grid-row: 1;
    grid-column: 1;
}
</style>
