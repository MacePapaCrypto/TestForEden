
import Model, { Type } from '../base/model';

/**
 * export model
 */
@Type('shortcut')
export default class ShortcutModel extends Model {

  /**
   * find by segment
   *
   * @param segment
   * @param args
   *
   * @returns 
   */
  static findByDesktop(desktop, ...args) {
    // find by ref
    return ShortcutModel.findByRef(`desktop:${desktop}`, ...args);
  }

}