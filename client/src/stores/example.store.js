import { defineStore } from "pinia";

export const useExampleStore = defineStore("example", {
  state: () => ({
    message: "Hello from Pinia",
  }),
  actions: {
    setMessage(msg) {
      this.message = msg;
    },
  },
});
