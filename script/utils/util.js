/** @typedef {Partial<Omit<g.DynamicFontParameterObject, "game">> & { size: number }} CreateFontParam */

const { Label } = require("@akashic-extension/akashic-label");

/**
 * 簡易的にフォントを作成する
 * @param {CreateFontParam} param `fontFamily`は未指定時は`sans-serif`になる
 */
exports.createFont = param => {
  return new g.DynamicFont({
    game: g.game,
    fontFamily: param.fontFamily ?? "sans-serif",
    ...param,
  });
};

/**
 * ラベルを生成します
 * {@link https://akashic-games.github.io/akashic-label/api/index.html 利用方法とAPI}\
 * {@link https://akashic-contents.github.io/samples/basic/akashic-label.html 公式サンプル}
 * @param {g.Scene} scene
 * @param {string} text
 * @param {number} x
 * @param {number} y
 * @param {string} textColor
 */
exports.createLabel = (scene, text, x, y, textColor = "black") => {
  // 標準のラベル (g.Label) でなく、akashic extension のラベルを利用している
  // g.Label よりも高機能で、改行やルビの利用ができる
  return new g.Label({
    scene,
    parent: scene,
    font: exports.createFont({ size: 30 }),
    text,
    textColor,
    x,
    y
  });
};

/**
 * ラベルを生成します (g.Label ではなく拡張ラベル)
 * {@link https://akashic-games.github.io/akashic-label/api/index.html 利用方法とAPI}\
 * {@link https://akashic-contents.github.io/samples/basic/akashic-label.html 公式サンプル}
 * @param {g.Scene} scene
 * @param {string} text
 * @param {number} x
 * @param {number} y
 * @param {string} textColor
 */
exports.createExLabel = (scene, text, x, y, textColor = "black") => {
  // 標準のラベル (g.Label) でなく、akashic extension のラベルを利用している
  // g.Label よりも高機能で、改行やルビの利用ができる
  return new Label({
    scene,
    parent: scene,
    font: exports.createFont({ size: 30 }),
    text,
    textColor,
    width: 1500,
    x,
    y,
    local: true
  });
};


/**
 * ランダムなCSS COLORを生成します
 * @param {number} [alpha=0] 透明度. 0~1
 * @returns {string} 
 */
exports.randomColor = (alpha = 1) => {
  return `rgb(${exports.randomInt(255)},${exports.randomInt(255)},${exports.randomInt(255)},${alpha})`;
};

/**
 * 0 以上、range 以下の整数の乱数を生成します
 * @param {number} max 乱数の最大値
 * @param {number} [min=0] 乱数の最小値
 */
exports.randomInt = (max, min = 0) => {
  // この乱数はランキング/マルチプレイどちらも、プレイヤー毎に別の乱数

  return min + Math.ceil(g.game.localRandom.generate() * max + min);
};
