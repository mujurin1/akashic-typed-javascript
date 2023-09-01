/**
 * ※ 実行してみる前に、まず README.md の最初の項目を読んで下さい
 * ※ 実行してみる前に、まず README.md の最初の項目を読んで下さい
 * ※ 実行してみる前に、まず README.md の最初の項目を読んで下さい
 * ※ 実行してみる前に、まず README.md の最初の項目を読んで下さい
 * ※ 実行してみる前に、まず README.md の最初の項目を読んで下さい
 */

const { init_js_min } = require("./1-init_js_min");
const { childEntity } = require("./2-child_entity");
const { sprite_image } = require("./3-sprite_image");
const { entity_show_props } = require("./4-entity_show_props");

const { omakeTrigger } = require("./omake-trigger");
const { createLabel } = require("./utils/util");

/**
 * @param {g.GameMainParameterObject} param
 */
module.exports = function main(param) {
  const scene = new g.Scene({ game: g.game });
  g.game.pushScene(scene);

  const labelX = 10;
  let labelY = 10;


  // childEntity(param);

  // 数字-***.js
  const js1 = createLabel(scene, "akashic init javascript-minimal で生成される main.js と同じ内容", labelX, labelY, "red");
  js1.touchable = true;
  js1.onPointDown.add(() => init_js_min(param));
  const js2 = createLabel(scene, "エンティティの入れ子のサンプル", labelX, (labelY += 50), "red");
  js2.touchable = true;
  js2.onPointDown.add(() => childEntity(param));
  const js3 = createLabel(scene, "画像 (g.Sprite) の扱い方", labelX, (labelY += 50), "red");
  js3.touchable = true;
  js3.onPointDown.add(() => sprite_image(param));
  const js4 = createLabel(scene, "エンティティの見た目に関するプロパティ. angle/scale/anchor", labelX, (labelY += 50), "red");
  js4.touchable = true;
  js4.onPointDown.add(() => entity_show_props(param));


  // multi-***.js マルチプレイ用


  // omake-***.js おまけ
  if (false) omakeTrigger(param); // g.Trigger の解説
};


/* メモ
 *
 * VSCode を使っていると、`g` を参照している部分では `'g' は UMD グローバルを参照していますが、...` という案内が表示されます
 * これは、Akashic Engine を利用する場合必ず表示されるが、無視しなければいけない
 * もし案内に従った場合 g がインポートされてしまう. g はインポートしてはいけない
 * (g をインポートした場合ファイルの先頭に次の記述が追加される `const {default: g} = require(...)`)
 *
 * また `不足している全てのインポートを追加する` を実行した場合など、不意にインポートしてしまう場合がある
 * その場合実行時に `g._require: can not find module` というエラーが出る
 * このエラーが出た場合はいずれかのファイルで g をインポートしているので、該当行を探して削除しなければならない
 */
