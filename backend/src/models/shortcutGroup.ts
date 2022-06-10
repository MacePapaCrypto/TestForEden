
import Model, { Type } from '../base/model';

/**
 * export model
 */
@Type('shortcutGroup')
export default class ShortcutGroupModel extends Model {
  
  /**
   * find contexts by account
   *
   * @param desktop 
   */
  static findByDesktop(desktop, ...args) {
    // find by ref
    return ShortcutGroupModel.findByRef(`desktop:${desktop}`, ...args);
  }
}