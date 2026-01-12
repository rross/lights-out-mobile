const levelConfigs = {};

const moves_1_15 = [3, 5, 8, 10, 13, 15, 18, 20, 23, 25, 28, 30, 33, 35, 38];
for (let i = 0; i < 15; i++) {
  levelConfigs[i + 1] = { moves: moves_1_15[i], states: 2 };
}

levelConfigs[16] = { moves: 40, states: 2 };

const moves_17_25 = [15, 18, 20, 23, 25, 28, 30, 33, 35];
for (let i = 0; i < 9; i++) {
  levelConfigs[17 + i] = { moves: moves_17_25[i], states: 3 };
}

const moves_26_31 = [38, 40, 43, 45, 48, 50];
for (let i = 0; i < 6; i++) {
  levelConfigs[26 + i] = { moves: moves_26_31[i], states: 3 };
}

const moves_32_50 = [15, 18, 20, 23, 25, 28, 30, 33, 35, 38, 40, 43, 45, 48, 50, 53, 55, 58, 60];
for (let i = 0; i < 19; i++) {
  levelConfigs[32 + i] = { moves: moves_32_50[i], states: 4 };
}

const moves_51_73 = [25, 28, 30, 33, 35, 38, 40, 43, 45, 48, 50, 53, 55, 58, 60, 63, 65, 68, 70, 73, 75, 78, 80];
for (let i = 0; i < 23; i++) {
  levelConfigs[51 + i] = { moves: moves_51_73[i], states: 5 };
}

const moves_74_80 = [25, 28, 30, 33, 35, 38, 40];
for (let i = 0; i < 7; i++) {
  levelConfigs[74 + i] = { moves: moves_74_80[i], states: 6 };
}

const moves_81_100 = [43, 45, 48, 50, 53, 55, 58, 60, 63, 65, 68, 70, 73, 75, 78, 80, 83, 85, 88, 90];
for (let i = 0; i < 20; i++) {
  levelConfigs[81 + i] = { moves: moves_81_100[i], states: 6 };
}

const moves_101_105 = [25, 28, 30, 33, 35];
for (let i = 0; i < 5; i++) {
  levelConfigs[101 + i] = { moves: moves_101_105[i], states: 7 };
}

const moves_106_127 = [38, 40, 43, 45, 48, 50, 53, 55, 58, 60, 63, 65, 68, 70, 73, 75, 78, 80, 83, 85, 88, 90];
for (let i = 0; i < 22; i++) {
  levelConfigs[106 + i] = { moves: moves_106_127[i], states: 7 };
}

const moves_128_154 = [35, 38, 40, 43, 45, 48, 50, 53, 55, 58, 60, 63, 65, 68, 70, 73, 75, 78, 80, 83, 85, 88, 90, 93, 95, 98, 100];
for (let i = 0; i < 27; i++) {
  levelConfigs[128 + i] = { moves: moves_128_154[i], states: 8 };
}

export default levelConfigs;
