import { defineStore } from 'pinia'

export const useItemStore = defineStore('item', {
  state: () => ({
    items: [],
    item: null,
    artifacts: [
      {
        id: 0,
        name: 'Artifact of the Brute',
        img: '../src/assets/images/artifacts/Artifact_of_the_Brute.png',
        available: true,
        quantity: 0
      },
      {
        id: 1,
        name: 'Artifact of the Chaos',
        img: '../src/assets/images/artifacts/Artifact_of_the_Chaos.png',
        available: true,
        quantity: 0
      },
      {
        id: 2,
        name: 'Artifact of the Clever',
        img: '../src/assets/images/artifacts/Artifact_of_the_Clever.png',
        available: true,
        quantity: 0
      },
      {
        id: 3,
        name: 'Artifact of the Crag',
        img: '../src/assets/images/artifacts/Artifact_of_the_Crag.png',
        available: true,
        quantity: 0
      },
      {
        id: 4,
        name: 'Artifact of the Cunning',
        img: '../src/assets/images/artifacts/Artifact_of_the_Cunning.png',
        available: true,
        quantity: 0
      },
      {
        id: 5,
        name: 'Artifact of the Depths',
        img: '../src/assets/images/artifacts/Artifact_of_the_Depths.png',
        available: true,
        quantity: 0
      },
      {
        id: 6,
        name: 'Artifact of the Destroyer',
        img: '../src/assets/images/artifacts/Artifact_of_the_Destroyer.png',
        available: true,
        quantity: 0
      },
      {
        id: 7,
        name: 'Artifact of the Devious',
        img: '../src/assets/images/artifacts/Artifact_of_the_Devious.png',
        available: true,
        quantity: 0
      },
      {
        id: 8,
        name: 'Artifact of the Devourer',
        img: '../src/assets/images/artifacts/Artifact_of_the_Devourer.png',
        available: true,
        quantity: 0
      },
      {
        id: 9,
        name: 'Artifact of the Gatekeeper',
        img: '../src/assets/images/artifacts/Artifact_of_the_Gatekeeper.png',
        available: true,
        quantity: 0
      },
      {
        id: 10,
        name: 'Artifact of the Growth',
        img: '../src/assets/images/artifacts/Artifact_of_the_Growth.png',
        available: true,
        quantity: 0
      },
      {
        id: 11,
        name: 'Artifact of the Hunter',
        img: '../src/assets/images/artifacts/Artifact_of_the_Hunter.png',
        available: true,
        quantity: 0
      },
      {
        id: 12,
        name: 'Artifact of the Immune',
        img: '../src/assets/images/artifacts/Artifact_of_the_Immune.png',
        available: true,
        quantity: 0
      },
      {
        id: 13,
        name: 'Artifact of the Lost',
        img: '../src/assets/images/artifacts/Artifact_of_the_Lost.png',
        available: true,
        quantity: 0
      },
      {
        id: 14,
        name: 'Artifact of the Massive',
        img: '../src/assets/images/artifacts/Artifact_of_the_Massive.png',
        available: true,
        quantity: 0
      },
      {
        id: 15,
        name: 'Artifact of the Pack',
        img: '../src/assets/images/artifacts/Artifact_of_the_Pack.png',
        available: true,
        quantity: 0
      },
      {
        id: 16,
        name: 'Artifact of the Shadows',
        img: '../src/assets/images/artifacts/Artifact_of_the_Shadows.png',
        available: true,
        quantity: 0
      },
      {
        id: 17,
        name: 'Artifact of the Skylord',
        img: '../src/assets/images/artifacts/Artifact_of_the_Skylord.png',
        available: true,
        quantity: 0
      },
      {
        id: 18,
        name: 'Artifact of the Stalker',
        img: '../src/assets/images/artifacts/Artifact_of_the_Stalker.png',
        available: true,
        quantity: 0
      },
      {
        id: 19,
        name: 'Artifact of the Strong',
        img: '../src/assets/images/artifacts/Artifact_of_the_Strong.png',
        available: true,
        quantity: 0
      },
      {
        id: 20,
        name: 'Artifact of the Void',
        img: '../src/assets/images/artifacts/Artifact_of_the_Void.png',
        available: true,
        quantity: 0
      }
    ],
    trophies: [
      {
        id: 0,
        name: 'Allosaurus Brain',
        img: '../src/assets/images/trophies/Allosaurus_Brain.png',
        quantity: 0
      },
      {
        id: 1,
        name: 'Argentavis Talon',
        img: '../src/assets/images/trophies/Argentavis_Talon.png',
        quantity: 0
      },
      {
        id: 2,
        name: 'Basilosaurus Blubber',
        img: '../src/assets/images/trophies/Basilosaurus_Blubber.png',
        quantity: 0
      },
      {
        id: 3,
        name: 'Giganotosaurus Heart',
        img: '../src/assets/images/trophies/Giganotosaurus_Heart.png',
        quantity: 0
      },
      {
        id: 4,
        name: 'Megalania Toxin',
        img: '../src/assets/images/trophies/Megalania_Toxin.png',
        quantity: 0
      },
      {
        id: 5,
        name: 'Megalodon Tooth',
        img: '../src/assets/images/trophies/Megalodon_Tooth.png',
        quantity: 0
      },
      {
        id: 6,
        name: 'Sauropod Vertebra',
        img: '../src/assets/images/trophies/Sauropod_Vertebra.png',
        quantity: 0
      },
      {
        id: 7,
        name: 'Sarcosuchus Skin',
        img: '../src/assets/images/trophies/Sarcosuchus_Skin.png',
        quantity: 0
      },
      {
        id: 8,
        name: 'Spinosaurus Sail',
        img: '../src/assets/images/trophies/Spinosaurus_Sail.png',
        quantity: 0
      },
      {
        id: 9,
        name: 'Therizino Claws',
        img: '../src/assets/images/trophies/Therizino_Claws.png',
        quantity: 0
      },
      {
        id: 10,
        name: 'Thylacoleo Hook-Claw',
        img: '../src/assets/images/trophies/Thylacoleo_Hook-Claw.png',
        quantity: 0
      },
      {
        id: 11,
        name: 'Titanoboa Venom',
        img: '../src/assets/images/trophies/Titanoboa_Venom.png',
        quantity: 0
      },
      {
        id: 12,
        name: 'Tusoteuthis Tentacle',
        img: '../src/assets/images/trophies/Tusoteuthis_Tentacle.png',
        quantity: 0
      },
      {
        id: 13,
        name: 'Tyrannosaurus Arm',
        img: '../src/assets/images/trophies/Tyrannosaurus_Arm.png',
        quantity: 0
      },
      {
        id: 14,
        name: 'Yutyrannus Lungs',
        img: '../src/assets/images/trophies/Yutyrannus_Lungs.png',
        quantity: 0
      },
      {
        id: 15,
        name: 'Alpha Carnotaurus Arm',
        img: '../src/assets/images/trophies/Alpha_Carnotaurus_Arm.png',
        quantity: 0
      },
      {
        id: 16,
        name: 'Alpha Leedsichthys Blubber',
        img: '../src/assets/images/trophies/Alpha_Leedsichthys_Blubber.png',
        quantity: 0
      },
      {
        id: 17,
        name: 'Alpha Megalodon Fin',
        img: '../src/assets/images/trophies/Alpha_Megalodon_Fin.png',
        quantity: 0
      },
      {
        id: 18,
        name: 'Alpha Mosasaur Tooth',
        img: '../src/assets/images/trophies/Alpha_Mosasaur_Tooth.png',
        quantity: 0
      },
      {
        id: 19,
        name: 'Alpha Raptor Claw',
        img: '../src/assets/images/trophies/Alpha_Raptor_Claw.png',
        quantity: 0
      },
      {
        id: 20,
        name: 'Alpha Tusoteuthis Eye',
        img: '../src/assets/images/trophies/Alpha_Tusoteuthis_Eye.png',
        quantity: 0
      },
      {
        id: 21,
        name: 'Alpha Tyrannosaur Tooth',
        img: '../src/assets/images/trophies/Alpha_Tyrannosaurus_Tooth.png',
        quantity: 0
      },
      {
        id: 22,
        name: 'Fire Talon',
        img: '../src/assets/images/trophies/Fire_Talon.png',
        quantity: 0
      },
      {
        id: 23,
        name: 'Lightning Talon',
        img: '../src/assets/images/trophies/Lightning_Talon.png',
        quantity: 0
      },
      {
        id: 24,
        name: 'Poison Talon',
        img: '../src/assets/images/trophies/Poison_Talon.png',
        quantity: 0
      },
      {
        id: 25,
        name: 'Basilisk Scale',
        img: '../src/assets/images/trophies/Basilisk_Scale.png',
        quantity: 0
      },
      {
        id: 26,
        name: 'Nameless Venom',
        img: '../src/assets/images/trophies/Nameless_Venom.png',
        quantity: 0
      },
      {
        id: 27,
        name: 'Reaper Pheromone Gland',
        img: '../src/assets/images/trophies/Reaper_Pheromone_Gland.png',
        quantity: 0
      },
      {
        id: 28,
        name: 'Rock Drake Feather',
        img: '../src/assets/images/trophies/Rock_Drake_Feather.png',
        quantity: 0
      },
      {
        id: 29,
        name: 'Alpha Basilisk Fang',
        img: '../src/assets/images/trophies/Alpha_Basilisk_Fang.png',
        quantity: 0
      },
      {
        id: 30,
        name: 'Alpha Karkinos Claw',
        img: '../src/assets/images/trophies/Alpha_Karkinos_Claw.png',
        quantity: 0
      },
      {
        id: 31,
        name: 'Alpha Reaper King Barb',
        img: '../src/assets/images/trophies/Alpha_Reaper_King_Barb.png',
        quantity: 0
      },
      {
        id: 32,
        name: 'Corrupt Heart',
        img: '../src/assets/images/trophies/Corrupt_Heart.png',
        quantity: 0
      },
      {
        id: 33,
        name: 'Gasbags Bladder',
        img: '../src/assets/images/trophies/Gasbags_Bladder.png',
        quantity: 0
      },
      {
        id: 34,
        name: 'Alpha Tyrannosaurus Tooth',
        img: '../src/assets/images/trophies/Alpha_Tyrannosaurus_Tooth.png',
        quantity: 0
      },
      {
        id: 35,
        name: 'Ice Titan Trophy',
        img: '../src/assets/images/trophies/Ice_Titan_Trophy.png',
        quantity: 0
      },
      {
        id: 36,
        name: 'Desert Titan Trophy',
        img: '../src/assets/images/trophies/Desert_Titan_Trophy.png',
        quantity: 0
      },
      {
        id: 37,
        name: 'Forest Titan Trophy',
        img: '../src/assets/images/trophies/Forest_Titan_Trophy.png',
        quantity: 0
      },
      {
        id: 38,
        name: 'King Titan Trophy (Gamma)',
        img: '../src/assets/images/trophies/King_Titan_Trophy_(Gamma).png',
        quantity: 0
      },
      {
        id: 39,
        name: 'King Titan Trophy (Beta)',
        img: '../src/assets/images/trophies/King_Titan_Trophy_(Beta).png',
        quantity: 0
      },
      {
        id: 40,
        name: 'King Titan Trophy (Alpha)',
        img: '../src/assets/images/trophies/King_Titan_Trophy_(Alpha).png',
        quantity: 0
      },
      {
        id: 41,
        name: 'Alpha X-Triceratops Skull',
        img: '../src/assets/images/trophies/Alpha_X-Triceratops_Skull.png',
        quantity: 0
      },
      {
        id: 42,
        name: 'Golden Striped Megalodon Tooth',
        img: '../src/assets/images/trophies/Golden_Striped_Megalodon_Tooth.png',
        quantity: 0
      },
      {
        id: 43,
        name: 'Reaper King Pheromone Gland',
        img: '../src/assets/images/trophies/Reaper_King_Pheromone_Gland.png',
        quantity: 0
      },
      {
        id: 44,
        name: 'Alpha Crystal Talon',
        img: '../src/assets/images/trophies/Alpha_Crystal_Talon.png',
        quantity: 0
      },
      {
        id: 45,
        name: 'Crystal Talon',
        img: '../src/assets/images/trophies/Crystal_Talon.png',
        quantity: 0
      },
      {
        id: 46,
        name: 'Primal Crystal',
        img: '../src/assets/images/trophies/Primal_Crystal.png',
        quantity: 0
      }
    ],
    loading: false,
    error: null
  }),

  getters: {
    allItems() {
      return [...this.artifacts, ...this.trophies]
    },
    allArtifacts() {
      return this.artifacts
    },
    allTrophies() {
      return this.trophies
    },
    // Helper to find items by name
    findItemByName: (state) => (name) => {
      return state.artifacts.find(item => item.name === name) ||
             state.trophies.find(item => item.name === name)
    }
  },

  actions: {
    updateItemQuantity(itemName, quantity) {
      const item = this.findItemByName(itemName)
      if (item) {
        item.quantity = Math.max(0, quantity)
      }
    },

    resetAllQuantities() {
      this.artifacts.forEach(item => item.quantity = 0)
      this.trophies.forEach(item => item.quantity = 0)
    }
  }
})