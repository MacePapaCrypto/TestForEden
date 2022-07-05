
import JSON5 from 'json5';
import ThemeModel from './theme';
import Model, { Type } from '../base/model';

/**
 * export model
 */
@Type('themeInstall')
export default class ThemeInstallModel extends Model {

  /**
   * get theme
   */
  getTheme() {
    // return
    return ThemeModel.findById(this.get('theme'));
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
    return ThemeInstallModel.findByRef(`desktop:${desktop}`, ...args);
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
    return ThemeInstallModel.findByRef(`account:${account}`.toLowerCase(), ...args);
  }

  /**
   * find by segment
   *
   * @param segment
   * @param args
   *
   * @returns 
   */
  static async findByAccountTheme(account, theme) {
    // find by ref
    return (await ThemeInstallModel.findByRef(`theme:${account}:${theme}`.toLowerCase(), 1))[0];
  }

  /**
   * sanitise
   *
   * @param cache 
   */
  async toJSON() {
    // install
    const install = await this.getTheme();

    // sanitise
    const sanitised = await install.toJSON();
    
    // check theme
    try {
      sanitised.theme = JSON5.parse(sanitised.theme);
    } catch (e) {
      sanitised.theme = {};
    }

    // set values
    sanitised.chosenAt    = this.get('chosenAt');
    sanitised.installedAt = this.get('createdAt');
    
    // return sanitised
    return sanitised;
  }

}