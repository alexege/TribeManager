import { defineStore } from 'pinia'

export const useBossStore = defineStore('boss', {
  state: () => ({
    bosses: {
      broodmother: {
        name: 'Broodmother Lysrix',
        img: '../../src/assets/images/bosses/broodmotherlysrix.png',
        playerLevels: { gamma: 30, beta: 30, alpha: 70 },
        requirements: [
          { name: 'Artifact of the Clever', gamma: 1, beta: 1, alpha: 1 },
          { name: 'Artifact of the Hunter', gamma: 1, beta: 1, alpha: 1 },
          { name: 'Artifact of the Massive', gamma: 1, beta: 1, alpha: 1 },
          { name: 'Argentavis Talon', gamma: 0, beta: 5, alpha: 10 },
          { name: 'Sarcosuchus Skin', gamma: 0, beta: 5, alpha: 10 },
          { name: 'Sauropod Vertebra', gamma: 0, beta: 5, alpha: 10 },
          { name: 'Titanoboa Venom', gamma: 0, beta: 5, alpha: 10 }
        ],
        rewards: { gamma: 20, beta: 56, alpha: 148 },
        unlocks: [
          { name: 'Tek Replicator', fileName: 'Tek_Replicator', gamma: true, beta: true, alpha: true },
          { name: 'Tek Foundation', fileName: 'Tek_Foundation', gamma: true, beta: true, alpha: true },
          { name: 'Tek Triangle Foundation', fileName: 'Tek_Triangle_Foundation', gamma: true, beta: true, alpha: true },
          { name: 'Tek Triangle Roof / Corner', fileName: 'Tek_Triangle_Ceiling', gamma: true, beta: true, alpha: true },
          { name: 'Tek Quarter / Triangle Ceiling', fileName: 'Tek_Quarter_Ceiling', gamma: true, beta: true, alpha: true },
          { name: 'Tek Pillar', fileName: 'Tek_Pillar', gamma: false, beta: true, alpha: true },
          { name: 'Tek Wall / Doorway / Window', fileName: 'Tek_Wall', gamma: false, beta: true, alpha: true },
          { name: 'Tek Ceiling / Hatchframe', fileName: 'Tek_Ceiling', gamma: false, beta: true, alpha: true },
          { name: 'Tek Quarter Wall / Railing', fileName: 'Tek_Quarter_Wall', gamma: false, beta: true, alpha: true },
          { name: 'Tek Sloped Wall', fileName: 'Tek_Sloped_Wall_Left', gamma: false, beta: false, alpha: true },
          { name: 'Tek Ladder', fileName: 'Tek_Ladder', gamma: false, beta: false, alpha: true },
          { name: 'Tek Boots', fileName: 'Tek_Boots', gamma: false, beta: false, alpha: true },
          { name: 'Tek Turret', fileName: 'Tek_Turret', gamma: false, beta: false, alpha: true },
          { name: 'Tek Helmet', fileName: 'Tek_Helmet', gamma: false, beta: false, alpha: true }
        ]
      },

      megapithecus: {
        name: 'Megapithecus',
        img: '../../src/assets/images/bosses/Megapithecus.png',
        playerLevels: { gamma: 45, beta: 65, alpha: 85 },
        requirements: [
          { name: 'Artifact of the Brute', gamma: 1, beta: 1, alpha: 1 },
          { name: 'Artifact of the Devourer', gamma: 1, beta: 1, alpha: 1 },
          { name: 'Artifact of the Pack', gamma: 1, beta: 1, alpha: 1 },
          { name: 'Megalania Toxin', gamma: 0, beta: 5, alpha: 10 },
          { name: 'Megalodon Tooth', gamma: 0, beta: 5, alpha: 10 },
          { name: 'Spinosaurus Sail', gamma: 0, beta: 5, alpha: 10 },
          { name: 'Therizino Claws', gamma: 0, beta: 5, alpha: 10 },
          { name: 'Thylacoleo Hook-Claw', gamma: 0, beta: 5, alpha: 10 }
        ],
        rewards: { gamma: 40, beta: 110, alpha: 220 },
        unlocks: [
          { name: 'Tek Replicator', gamma: true, beta: true, alpha: true },
          { name: 'Tek Gauntlets', gamma: true, beta: true, alpha: true },
          { name: 'Tek Generator', gamma: false, beta: true, alpha: true },
          { name: 'Tek Dinosaur Gateway', gamma: false, beta: true, alpha: true },
          { name: 'Tek Dinosaur Gate', gamma: false, beta: true, alpha: true },
          { name: 'Tek Large Cellar Door', gamma: false, beta: true, alpha: true },
          { name: 'Tek Trough', gamma: false, beta: true, alpha: true },
          { name: 'Tek Rifle', gamma: false, beta: true, alpha: true },
          { name: 'Tek Large Wall', gamma: false, beta: false, alpha: true },
          { name: 'Tek Grenade', gamma: false, beta: false, alpha: true },
          { name: 'Tek Rex Saddle', gamma: false, beta: false, alpha: true }
        ]
      },

      dragon: {
        name: 'Dragon',
        img: '../../src/assets/images/bosses/Dragon.png',
        playerLevels: { gamma: 55, beta: 75, alpha: 100 },
        requirements: [
          { name: 'Artifact of the Cunning', gamma: 1, beta: 1, alpha: 1 },
          { name: 'Artifact of the Immune', gamma: 1, beta: 1, alpha: 1 },
          { name: 'Artifact of the Skylord', gamma: 1, beta: 1, alpha: 1 },
          { name: 'Artifact of the Strong', gamma: 1, beta: 1, alpha: 1 },
          { name: 'Allosaurus Brain', gamma: 0, beta: 5, alpha: 10 },
          { name: 'Basilosaurus Blubber', gamma: 0, beta: 5, alpha: 10 },
          { name: 'Giganotosaurus Heart', gamma: 0, beta: 5, alpha: 2 },
          { name: 'Tusoteuthis Tentacle', gamma: 0, beta: 5, alpha: 10 },
          { name: 'Tyrannosaurus Arm', gamma: 0, beta: 5, alpha: 15 },
          { name: 'Yutyrannus Lungs', gamma: 0, beta: 5, alpha: 10 }
        ],
        rewards: { gamma: 80, beta: 220, alpha: 440 },
        unlocks: [
          { name: 'Tek Replicator', gamma: true, beta: true, alpha: true },
          { name: 'Tek Teleporter Small', gamma: true, beta: true, alpha: true },
          { name: 'Tek Megalodon Saddle', gamma: true, beta: true, alpha: true },
          { name: 'Tek Tapejara Saddle', gamma: true, beta: true, alpha: true },
          { name: 'Tek Leggings', gamma: true, beta: true, alpha: true },
          { name: 'Tek Behemoth Gateway', gamma: true, beta: true, alpha: true },
          { name: 'Tek Behemoth Gate', gamma: true, beta: true, alpha: true },
          { name: 'Tek Behemoth Cellar Door', gamma: true, beta: true, alpha: true },
          { name: 'Tek Teleporter Medium', gamma: false, beta: true, alpha: true },
          { name: 'Tek Roof', gamma: false, beta: true, alpha: true },
          { name: 'Tek Door', gamma: false, beta: true, alpha: true },
          { name: 'Tek Fence Foundation', gamma: false, beta: true, alpha: true },
          { name: 'Vacuum Compartment', gamma: false, beta: true, alpha: true },
          { name: 'Tek Forcefield', gamma: false, beta: true, alpha: true },
          { name: 'Tek Transmitter', gamma: false, beta: true, alpha: true },
          { name: 'Tek Dedicated Storage', gamma: false, beta: true, alpha: true },
          { name: 'Tek Teleporter Large', gamma: false, beta: false, alpha: true },
          { name: 'Tek Cloning Chamber', gamma: false, beta: false, alpha: true },
          { name: 'Tek Chestpiece', gamma: false, beta: false, alpha: true }
        ]
      }
    }
  }),

  getters: {
    getBoss: (state) => (bossId) => {
      return state.bosses[bossId]
    }
  }
})