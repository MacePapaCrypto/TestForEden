
import JSON5 from 'json5';
import Model, { Type } from '../base/model';
import DesktopModel from './desktop';

/**
 * export model
 */
@Type('theme')
export default class ThemeModel extends Model {

  /**
   * get app
   *
   * @returns 
   */
  getDesktop() {
    // load app
    return DesktopModel.findById(this.get('desktop'));
  }

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
    return ThemeModel.findByRef(`desktop:${desktop}`, ...args);
  }

  /**
   * find by segment
   *
   * @param segment
   * @param args
   *
   * @returns 
   */
  static findByAccount(account, ...args) {
    // find by ref
    return ThemeModel.findByRef(`account:${account}`.toLowerCase(), ...args);
  }

  /**
   * sanitise
   *
   * @param cache 
   */
  async toJSON() {
    // sanitised
    const sanitised = await super.toJSON();
    
    // check theme
    try {
      sanitised.theme = JSON5.parse(sanitised.theme);
    } catch (e) {
      sanitised.theme = {};
    }
    
    // return sanitised
    return sanitised;
  }

}